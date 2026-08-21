// CORS for the native shell.
//
// Capacitor serves the bundled app from its own origin, so every call to a
// deployed function is cross-origin and the browser blocks it without these
// headers. Only the handful of origins Capacitor can actually present are
// allowed — this is not a wildcard.
//
// Credentials are deliberately NOT enabled. Auth now travels in the
// Authorization header rather than the nf_jwt cookie, so nothing needs them,
// and leaving them off keeps this from becoming a cookie-forwarding surface.
const NATIVE_ORIGINS = new Set([
  "capacitor://localhost",
  "ionic://localhost",
  "https://localhost",
]);

export function corsHeaders(request) {
  const origin = request?.headers?.get?.("origin") || "";
  if (!NATIVE_ORIGINS.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

// Wraps a v2 handler: answers preflight, and adds the headers to whatever the
// handler returns. A web request carries no matching Origin, so it passes
// through completely untouched.
export function withCors(handler) {
  return async (request, context) => {
    const headers = corsHeaders(request);
    const isNativeOrigin = Object.keys(headers).length > 0;

    if (request.method === "OPTIONS" && isNativeOrigin) {
      return new Response(null, { status: 204, headers });
    }

    const response = await handler(request, context);
    if (!isNativeOrigin) return response;

    const merged = new Headers(response.headers);
    for (const [key, value] of Object.entries(headers)) merged.set(key, value);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: merged,
    });
  };
}
