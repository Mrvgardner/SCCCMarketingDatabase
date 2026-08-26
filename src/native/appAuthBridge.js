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

// The query the app opens the site with. Sign-in must START from the site root,
// not from /app-auth: GoTrue records the Referer in the state JWT it hands
// Google and decides from it where to return the token, and starting from
// /app-auth produced an instant bounce back with no token and no error — a
// round trip measured at one second, which is less than Face ID alone takes.
// The web sign-in that has always worked starts from the root, so this one does
// too.
export const APP_AUTH_START_QUERY = "appauth";

// Call before anything renders. Returns true if it took over the page.
export function startAppAuthFromRoot() {
  let params;
  try {
    params = new URLSearchParams(window.location.search);
  } catch {
    return false;
  }
  if (params.get(APP_AUTH_START_QUERY) !== "1") return false;

  // Strip the query first so the Referer we send is exactly the site root —
  // replaceState changes the document URL without a reload, so the redirect
  // below carries the clean origin.
  try {
    window.history.replaceState(null, "", "/");
  } catch { /* the query would merely appear in the referrer */ }

  return beginAppAuthRedirect();
}

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
const DEEP_LINK_KEY = "sc:app-auth-deeplink";

// The deep link this page should hand to the app, or null if there is nothing
// to hand over.
//
// It persists the link the moment it sees one, and will return a persisted link
// even after the fragment is gone. That is not belt-and-braces: attempting the
// handoff automatically caused Safari to refuse the navigation AND clear the
// fragment, so the token vanished before the user could tap anything. Observed
// directly — the stalled screen reported an empty fragment two seconds after a
// sign-in that had plainly succeeded.
export function pendingAppDeepLink() {
  const hash = window.location.hash || "";

  if (hash.includes("access_token=")) {
    let isAppFlow = false;
    try {
      isAppFlow = Boolean(window.sessionStorage.getItem(APP_FLOW_KEY));
    } catch {
      return null;
    }
    if (!isAppFlow) return null;
    const link = `${APP_AUTH_SCHEME}${hash}`;
    try {
      window.sessionStorage.setItem(DEEP_LINK_KEY, link);
    } catch { /* the in-memory return below still works this once */ }
    return link;
  }

  // No fragment — but a link captured moments ago is still good.
  try {
    return window.sessionStorage.getItem(DEEP_LINK_KEY);
  } catch {
    return null;
  }
}

// Build the deep link from the identity widget's own session.
//
// This is the reliable source, not the URL. The widget script is loaded in
// index.html with defer, so it runs BEFORE our module: it takes the token out
// of the fragment, creates its session, and clears the hash. Every diagnostic
// that reported "token in fragment: false" with an empty fragment and no error
// was seeing the aftermath of that, not a failed sign-in.
export function deepLinkFromIdentitySession() {
  let marker = null;
  try {
    marker = window.sessionStorage.getItem(APP_FLOW_KEY);
  } catch {
    return null;
  }
  // Only ever hand a token to the app during a sign-in the app started.
  if (!marker) return null;

  const user = window.netlifyIdentity?.currentUser?.();
  const token = user?.token;
  if (!token?.access_token) return null;

  // expires_at is a millisecond timestamp; the app wants seconds remaining.
  const secondsLeft = token.expires_at
    ? Math.max(60, Math.round((Number(token.expires_at) - Date.now()) / 1000))
    : 3600;

  const params = new URLSearchParams({
    access_token: token.access_token,
    refresh_token: token.refresh_token || "",
    token_type: token.token_type || "bearer",
    expires_in: String(secondsLeft),
  });
  const link = `${APP_AUTH_SCHEME}#${params.toString()}`;
  try {
    window.sessionStorage.setItem(DEEP_LINK_KEY, link);
  } catch { /* the returned value still works this once */ }
  return link;
}

// Called once the app has actually been handed the token.
export function clearPendingAppDeepLink() {
  try {
    window.sessionStorage.removeItem(DEEP_LINK_KEY);
  } catch { /* nothing to clear */ }
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

  // Do not jump to the scheme from here. Safari refuses a script-initiated
  // app-scheme navigation and clears the fragment as it does, losing the token.
  // Persist the link and hand over to /app-auth, which offers it as a tap.
  try {
    window.sessionStorage.setItem(DEEP_LINK_KEY, `${APP_AUTH_SCHEME}${hash}`);
  } catch { /* the page below will simply show its stalled state */ }
  window.location.replace("/app-auth");
  return true;
}

// What this page can see about the sign-in, for showing on the stalled screen.
// The flow spans Safari, Google and Netlify, and none of those are reachable
// from a terminal — so when it stops short, the page itself has to say why.
export function appAuthDiagnostics() {
  const hash = (typeof window !== "undefined" && window.location.hash) || "";
  let marker = null;
  let attempt = null;
  try {
    marker = window.sessionStorage.getItem(APP_FLOW_KEY);
    attempt = window.sessionStorage.getItem(ATTEMPT_KEY);
  } catch { /* private mode */ }
  return {
    hasToken: hash.includes("access_token="),
    hasError: hash.includes("error"),
    fragment: hash ? hash.slice(0, 80) : "(empty)",
    markerPresent: Boolean(marker),
    secondsSinceAttempt: attempt ? Math.round((Date.now() - Number(attempt)) / 1000) : null,
  };
}

// Clears the guard so the user can retry immediately after a stall.
export function resetAppAuthGuard() {
  try {
    window.sessionStorage.removeItem(ATTEMPT_KEY);
    window.sessionStorage.removeItem(APP_FLOW_KEY);
    window.sessionStorage.removeItem(DEEP_LINK_KEY);
  } catch { /* nothing to clear */ }
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
