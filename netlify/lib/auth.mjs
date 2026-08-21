// Origin-independent authentication for v2 (Request/Response) functions.
//
// Why this exists: getUser() from @netlify/identity resolves the caller from
// the nf_jwt COOKIE. That works in a browser on switchcommerce.team, but a
// native WKWebView runs on the capacitor://localhost origin, so no cookie for
// our domain is ever attached and every endpoint 401s.
//
// The clients already send `Authorization: Bearer <jwt>` and always have — the
// functions simply ignored it. So prefer the header, fall back to the cookie,
// and validate the token the same way @netlify/identity does internally: ask
// GoTrue who it belongs to. Same number of network calls as before.
//
// The older v1 Lambda functions (products, field-notes, images) get the same
// identity for free via context.clientContext, which Netlify populates from
// that header. This brings the v2 functions in line without rewriting them.

const IDENTITY_PATH = '/.netlify/identity';
const LOOKUP_TIMEOUT_MS = 5000;

export function bearerToken(request) {
  const header = request?.headers?.get?.('authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : '';
}

export function cookieToken(request) {
  const cookie = request?.headers?.get?.('cookie') || '';
  const match = /(?:^|;\s*)nf_jwt=([^;]+)/.exec(cookie);
  return match ? decodeURIComponent(match[1]) : '';
}

// Header first: it is the only one a native shell can supply, and a stale
// cookie should never win over a token the client just refreshed.
export function tokenFrom(request) {
  return bearerToken(request) || cookieToken(request);
}

export function identityEndpoint(env = process.env, globals = globalThis) {
  const contextUrl = globals?.Netlify?.context?.url;
  if (contextUrl) return new URL(IDENTITY_PATH, contextUrl).href;
  if (env?.URL) return new URL(IDENTITY_PATH, env.URL).href;
  return null;
}

// Shape the GoTrue payload into what the functions already expect, so call
// sites reading user.email / user.app_metadata.roles keep working untouched.
export function normalizeUser(data) {
  if (!data?.email) return null;
  const appMetadata = data.app_metadata || {};
  return {
    id: data.id || '',
    email: data.email,
    app_metadata: appMetadata,
    user_metadata: data.user_metadata || {},
    roles: Array.isArray(appMetadata.roles) ? appMetadata.roles : [],
  };
}

export async function authenticate(request, { fetchImpl = fetch } = {}) {
  const token = tokenFrom(request);
  if (!token) return null;
  const endpoint = identityEndpoint();
  if (!endpoint) {
    console.error('Identity endpoint could not be resolved; is the URL env var set?');
    return null;
  }
  try {
    const response = await fetchImpl(`${endpoint}/user`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    return normalizeUser(await response.json());
  } catch {
    // Network failure or timeout reaching Identity. Failing closed is right:
    // an unverified caller must never be treated as signed in.
    return null;
  }
}
