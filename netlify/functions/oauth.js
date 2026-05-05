// OAuth 2.1 server for the Switch Commerce knowledge-base MCP endpoint.
// Implements the minimal subset needed by Claude.ai custom connectors:
//
//   • /.well-known/oauth-protected-resource (RFC 9728)
//   • /.well-known/oauth-authorization-server (RFC 8414)
//   • POST /oauth/register     — Dynamic Client Registration (RFC 7591), open
//   • GET  /oauth/authorize    — renders a consent form
//   • POST /oauth/consent      — validates AGENT_SERVICE_TOKEN, issues code
//   • POST /oauth/token        — exchanges auth code (with PKCE) for token
//
// Design choices:
//   - Stateless. Auth codes are HMAC-signed JWTs that carry the PKCE challenge
//     and redirect_uri inline; nothing is persisted. They expire after 5 min.
//   - The "consent" step requires the user to paste AGENT_SERVICE_TOKEN as
//     proof of authorization. On success we issue access_token = the same
//     AGENT_SERVICE_TOKEN, which the MCP endpoint already validates. Net
//     effect: Claude.ai stores the service token in its connector vault and
//     uses it as Bearer for /mcp — same security posture as direct bearer
//     auth, just delivered via the OAuth flow Claude.ai requires.
//   - HMAC key is derived from AGENT_SERVICE_TOKEN, so rotating the token
//     also invalidates any outstanding auth codes.

import { createHmac, randomBytes, timingSafeEqual, createHash } from "node:crypto";

const TOKEN_TTL_SECONDS = 300; // auth codes expire after 5 min
const SUPPORTED_RESPONSE_TYPES = ["code"];
const SUPPORTED_CODE_CHALLENGE_METHODS = ["S256", "plain"];
const SUPPORTED_GRANT_TYPES = ["authorization_code"];

function timingSafeEqualStr(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function siteOrigin(event) {
  // Prefer X-Forwarded-Host so we get the public hostname Claude.ai is using.
  const host =
    event.headers?.["x-forwarded-host"] ||
    event.headers?.host ||
    "switchcommerce.team";
  const proto =
    event.headers?.["x-forwarded-proto"] || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function hmacSign(payload) {
  const secret = process.env.AGENT_SERVICE_TOKEN || "";
  const json = JSON.stringify(payload);
  const sig = createHmac("sha256", secret).update(json).digest("base64url");
  return `${Buffer.from(json).toString("base64url")}.${sig}`;
}

function hmacVerify(token) {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [b64, sig] = token.split(".");
  const json = Buffer.from(b64, "base64url").toString();
  const expected = createHmac("sha256", process.env.AGENT_SERVICE_TOKEN || "")
    .update(json)
    .digest("base64url");
  if (!timingSafeEqualStr(sig, expected)) return null;
  let payload;
  try { payload = JSON.parse(json); } catch { return null; }
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

function jsonResponse(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      ...extraHeaders,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  };
}

function htmlResponse(statusCode, html, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
    body: html,
  };
}

function corsResponse() {
  return {
    statusCode: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
    body: "",
  };
}

// ---------- Endpoint handlers ----------

function metadataProtectedResource(event) {
  const origin = siteOrigin(event);
  return jsonResponse(200, {
    resource: `${origin}/mcp`,
    authorization_servers: [origin],
    bearer_methods_supported: ["header"],
    scopes_supported: ["kb:read"],
  });
}

function metadataAuthorizationServer(event) {
  const origin = siteOrigin(event);
  return jsonResponse(200, {
    issuer: origin,
    authorization_endpoint: `${origin}/oauth/authorize`,
    token_endpoint: `${origin}/oauth/token`,
    registration_endpoint: `${origin}/oauth/register`,
    response_types_supported: SUPPORTED_RESPONSE_TYPES,
    grant_types_supported: SUPPORTED_GRANT_TYPES,
    code_challenge_methods_supported: SUPPORTED_CODE_CHALLENGE_METHODS,
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: ["kb:read"],
  });
}

function register(event) {
  // Open dynamic client registration. We don't actually need to track the
  // client_id (auth codes are bound to redirect_uri via the signed code), but
  // Claude.ai expects a registered client. Issue a random one and echo back.
  let body = {};
  try { body = JSON.parse(event.body || "{}"); } catch {
    return jsonResponse(400, { error: "invalid_client_metadata" });
  }
  const clientId = `cma_${randomBytes(16).toString("base64url")}`;
  return jsonResponse(201, {
    client_id: clientId,
    client_id_issued_at: Math.floor(Date.now() / 1000),
    redirect_uris: body.redirect_uris || [],
    grant_types: SUPPORTED_GRANT_TYPES,
    response_types: SUPPORTED_RESPONSE_TYPES,
    token_endpoint_auth_method: "none",
    application_type: body.application_type || "web",
    client_name: body.client_name || "MCP Client",
  });
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function authorizeForm(event) {
  const params = event.queryStringParameters || {};
  const required = ["response_type", "client_id", "redirect_uri", "state"];
  for (const k of required) {
    if (!params[k]) return jsonResponse(400, { error: "invalid_request", error_description: `missing ${k}` });
  }
  if (!SUPPORTED_RESPONSE_TYPES.includes(params.response_type)) {
    return jsonResponse(400, { error: "unsupported_response_type" });
  }
  if (params.code_challenge && params.code_challenge_method &&
      !SUPPORTED_CODE_CHALLENGE_METHODS.includes(params.code_challenge_method)) {
    return jsonResponse(400, { error: "invalid_request", error_description: "unsupported code_challenge_method" });
  }
  // Render a tiny consent page. The form posts back to /oauth/consent with
  // the original query params plus the user-supplied service token.
  const hidden = Object.entries(params)
    .map(([k, v]) => `<input type="hidden" name="${escapeHtml(k)}" value="${escapeHtml(v)}" />`)
    .join("");
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Authorize Switch Commerce KB</title>
<style>
  body { background:#0f172a; color:#e5e7eb; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:1.5rem; }
  .card { background:#111827; border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:2rem; max-width:440px; width:100%; box-shadow:0 20px 60px rgba(0,0,0,0.5); }
  h1 { margin:0 0 0.25rem; font-size:1.25rem; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; }
  p { color:#9ca3af; line-height:1.5; font-size:0.9rem; }
  label { display:block; margin-top:1.25rem; margin-bottom:0.4rem; font-size:0.8rem; font-weight:600; color:#cbd5e1; text-transform:uppercase; letter-spacing:0.05em; }
  input[type=password] { width:100%; padding:0.75rem 0.9rem; background:#1f2937; border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#fff; font-size:0.95rem; box-sizing:border-box; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }
  input[type=password]:focus { outline:none; border-color:#0951fa; box-shadow:0 0 0 3px rgba(9,81,250,0.2); }
  button { margin-top:1.5rem; width:100%; padding:0.85rem; background:#0951fa; color:#fff; font-weight:700; border:none; border-radius:8px; cursor:pointer; font-size:0.95rem; letter-spacing:0.04em; }
  button:hover { background:#0a40d8; }
  .scope { background:rgba(9,81,250,0.1); border:1px solid rgba(9,81,250,0.3); border-radius:8px; padding:0.75rem 1rem; margin-top:1rem; font-size:0.85rem; }
  .scope strong { color:#7ea9ff; }
  .error { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); color:#fca5a5; border-radius:8px; padding:0.75rem 1rem; margin-top:1rem; font-size:0.85rem; }
</style></head>
<body><div class="card">
  <h1>Authorize MCP Connector</h1>
  <p>An MCP client is requesting <strong>read-only</strong> access to the Switch Commerce knowledge base.</p>
  <div class="scope"><strong>Client:</strong> ${escapeHtml(params.client_id)}<br/><strong>Scope:</strong> kb:read</div>
  ${params.error ? `<div class="error">${escapeHtml(params.error)}</div>` : ""}
  <form method="POST" action="/oauth/consent" autocomplete="off">
    ${hidden}
    <label for="token">Service token</label>
    <input id="token" type="password" name="service_token" required autofocus />
    <button type="submit">Authorize</button>
  </form>
</div></body></html>`;
  return htmlResponse(200, html);
}

function parseFormBody(event) {
  const ct = event.headers?.["content-type"] || event.headers?.["Content-Type"] || "";
  let raw = event.body || "";
  if (event.isBase64Encoded) raw = Buffer.from(raw, "base64").toString("utf8");
  if (ct.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(raw));
  }
  if (ct.includes("application/json")) {
    try { return JSON.parse(raw || "{}"); } catch { return {}; }
  }
  return {};
}

function consent(event) {
  const params = parseFormBody(event);
  const required = ["response_type", "client_id", "redirect_uri", "state", "service_token"];
  for (const k of required) {
    if (!params[k]) return jsonResponse(400, { error: "invalid_request", error_description: `missing ${k}` });
  }
  const expected = process.env.AGENT_SERVICE_TOKEN || "";
  if (!expected) return jsonResponse(503, { error: "server_error", error_description: "AGENT_SERVICE_TOKEN not configured" });

  if (!timingSafeEqualStr(params.service_token, expected)) {
    // Re-render the form with an error.
    const requery = new URLSearchParams();
    for (const k of ["response_type", "client_id", "redirect_uri", "state",
                      "code_challenge", "code_challenge_method", "scope"]) {
      if (params[k]) requery.set(k, params[k]);
    }
    requery.set("error", "Invalid service token. Please try again.");
    const fakeEvent = { ...event, queryStringParameters: Object.fromEntries(requery) };
    return authorizeForm(fakeEvent);
  }

  // Issue a signed authorization code.
  const code = hmacSign({
    typ: "auth_code",
    redirect_uri: params.redirect_uri,
    client_id: params.client_id,
    code_challenge: params.code_challenge || null,
    code_challenge_method: params.code_challenge_method || null,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  });

  const redirect = new URL(params.redirect_uri);
  redirect.searchParams.set("code", code);
  redirect.searchParams.set("state", params.state);
  return {
    statusCode: 302,
    headers: { Location: redirect.toString(), "Cache-Control": "no-store" },
    body: "",
  };
}

function verifyPkce(method, verifier, challenge) {
  if (!challenge) return true; // server didn't require PKCE
  if (!verifier) return false;
  if (method === "plain" || !method) return verifier === challenge;
  if (method === "S256") {
    const hash = createHash("sha256").update(verifier).digest("base64url");
    return hash === challenge;
  }
  return false;
}

function token(event) {
  const params = parseFormBody(event);
  if (params.grant_type !== "authorization_code") {
    return jsonResponse(400, { error: "unsupported_grant_type" });
  }
  if (!params.code || !params.redirect_uri) {
    return jsonResponse(400, { error: "invalid_request" });
  }
  const payload = hmacVerify(params.code);
  if (!payload || payload.typ !== "auth_code") {
    return jsonResponse(400, { error: "invalid_grant", error_description: "code invalid or expired" });
  }
  if (payload.redirect_uri !== params.redirect_uri) {
    return jsonResponse(400, { error: "invalid_grant", error_description: "redirect_uri mismatch" });
  }
  if (!verifyPkce(payload.code_challenge_method, params.code_verifier, payload.code_challenge)) {
    return jsonResponse(400, { error: "invalid_grant", error_description: "PKCE verification failed" });
  }

  // Hand over the actual MCP bearer token. The MCP endpoint validates it
  // against AGENT_SERVICE_TOKEN — same value, just delivered via OAuth.
  const accessToken = process.env.AGENT_SERVICE_TOKEN || "";
  if (!accessToken) {
    return jsonResponse(503, { error: "server_error", error_description: "AGENT_SERVICE_TOKEN not configured" });
  }
  return jsonResponse(200, {
    access_token: accessToken,
    token_type: "Bearer",
    scope: "kb:read",
    // No expiry: the token is effectively long-lived (rotated only by the
    // admin updating AGENT_SERVICE_TOKEN in Netlify env vars).
  });
}

// ---------- Top-level handler ----------

export async function handler(event /*, context */) {
  if (event.httpMethod === "OPTIONS") return corsResponse();

  // We dispatch by `path` query param (set by the netlify.toml redirect).
  const path = event.queryStringParameters?.path || "";

  if (path === "metadata-resource" && event.httpMethod === "GET") return metadataProtectedResource(event);
  if (path === "metadata-as" && event.httpMethod === "GET") return metadataAuthorizationServer(event);
  if (path === "register" && event.httpMethod === "POST") return register(event);
  if (path === "authorize" && event.httpMethod === "GET") return authorizeForm(event);
  if (path === "consent" && event.httpMethod === "POST") return consent(event);
  if (path === "token" && event.httpMethod === "POST") return token(event);

  return jsonResponse(404, { error: "not_found", path, method: event.httpMethod });
}
