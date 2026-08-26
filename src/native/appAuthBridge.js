// Bridges Netlify Identity's Google sign-in back into the native app.
//
// Why any of this is necessary: Google refuses OAuth inside an app webview
// (403 disallowed_useragent, enforced since 2023), so the sign-in has to happen
// in a real Safari context. Getting the resulting token back into the app is
// the hard half, because GoTrue decides where to send it and will not be told
// otherwise — the `state` JWT it hands Google carries site_url and nothing
// else, and a redirect_to parameter is ignored outright. Verified against the
// live endpoint: the state is byte-identical with and without it.
//
// So the token always lands on the site root. These two functions are what let
// the site recognise that the app started the flow and hand the token onward.

const APP_FLOW_KEY = "sc:app-auth-flow";
export const APP_AUTH_SCHEME = "switchtradeshows://auth";

// Step 1, in Safari: mark this browsing context as an app sign-in, then send it
// to Netlify. sessionStorage is the right store — it is scoped to this tab and
// origin, survives the round trip out to Google and back, and evaporates
// afterwards, so a normal web sign-in in another tab is never affected.
const ATTEMPT_KEY = "sc:app-auth-attempt";
// A completed round trip to Google takes a few seconds. Two starts inside this
// window means something downstream is failing and we are spinning.
const LOOP_WINDOW_MS = 20000;

// Returns false if it refused to start because a sign-in was only just tried.
export function beginAppAuthRedirect() {
  try {
    const lastAttempt = Number(window.sessionStorage.getItem(ATTEMPT_KEY) || 0);
    if (Date.now() - lastAttempt < LOOP_WINDOW_MS) return false;
    window.sessionStorage.setItem(ATTEMPT_KEY, String(Date.now()));
    window.sessionStorage.setItem(APP_FLOW_KEY, String(Date.now()));
  } catch {
    // Private mode. The flow still completes in the browser; it just will not
    // hand back to the app, which is a visible failure rather than a silent one.
  }
  window.location.replace("/.netlify/identity/authorize?provider=google");
  return true;
}

// The deep link this page should hand to the app, or null if there is nothing
// to hand over. Deliberately does NOT navigate and does NOT clear the marker:
// the caller may need to offer it as a tappable link, and clearing it on a
// failed automatic attempt is what made the page start a whole new sign-in.
export function pendingAppDeepLink() {
  const hash = window.location.hash || "";
  if (!hash.includes("access_token=")) return null;
  try {
    if (!window.sessionStorage.getItem(APP_FLOW_KEY)) return null;
  } catch {
    return null;
  }
  return `${APP_AUTH_SCHEME}${hash}`;
}

// Step 2, in Safari: the token has come back in the fragment. If this context
// is the one the app started, forward it to the app and stop.
// Returns true when it has taken over the page.
export function forwardTokenToAppIfPending() {
  const hash = window.location.hash || "";
  if (!hash.includes("access_token=")) return false;

  let isAppFlow = false;
  try {
    isAppFlow = Boolean(window.sessionStorage.getItem(APP_FLOW_KEY));
  } catch {
    return false;
  }
  if (!isAppFlow) return false;

  // The marker is deliberately left in place. It lives in sessionStorage and
  // dies with the tab anyway, and clearing it here meant that a handoff Safari
  // refused to perform left the next page load looking like a brand new
  // sign-in — which is exactly how this turned into an endless loop.

  // Custom scheme rather than a Universal Link: a scheme is just an Info.plist
  // entry and needs no paid Apple account or apple-app-site-association file.
  window.location.replace(`${APP_AUTH_SCHEME}${hash}`);
  return true;
}

// Step 3, in the app: turn the fragment into the token object the identity
// widget expects. Exported separately so it can be tested without a browser.
export function parseAuthFragment(url) {
  const hashIndex = String(url || "").indexOf("#");
  if (hashIndex === -1) return null;
  const params = new URLSearchParams(String(url).slice(hashIndex + 1));
  const accessToken = params.get("access_token");
  if (!accessToken) return null;
  return {
    access_token: accessToken,
    refresh_token: params.get("refresh_token") || "",
    token_type: params.get("token_type") || "bearer",
    expires_in: Number(params.get("expires_in") || 3600),
    expires_at: Date.now() + Number(params.get("expires_in") || 3600) * 1000,
  };
}
