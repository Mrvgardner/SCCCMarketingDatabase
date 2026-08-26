import { isNativeApp, apiOrigin } from "../api/apiBase";
import { parseAuthFragment } from "./appAuthBridge";

// Native Google sign-in.
//
// The sign-in itself has to happen in a real browser — Google blocks OAuth in
// app webviews — so this opens SFSafariViewController, which Google does
// accept, and waits for the site to hand the token back over the app's custom
// URL scheme. See appAuthBridge.js for the site half.

let listenerAttached = false;

export async function startNativeGoogleSignIn() {
  const { Browser } = await import("@capacitor/browser");
  await Browser.open({
    url: `${apiOrigin}/app-auth`,
    presentationStyle: "popover",
  });
}

// Hands the token to the identity widget the same way the widget hands itself
// one after a web redirect, so everything downstream — currentUser(), jwt(),
// the Authorization header every api/*.js sends — keeps working untouched.
async function adoptSession(tokenResponse) {
  const identity = window.netlifyIdentity;
  if (!identity?.gotrue) throw new Error("Identity widget is not ready");
  const user = await identity.gotrue.createUser(tokenResponse, true);
  // Nudge the widget's own listeners so AuthContext updates without a reload.
  if (typeof identity.emit === "function") identity.emit("login", user);
  return user;
}

// Call once at startup. Safe to call again; it will not double-subscribe.
export async function listenForNativeAuthCallback(onSignedIn) {
  if (!isNativeApp() || listenerAttached) return;
  listenerAttached = true;

  const { App } = await import("@capacitor/app");
  App.addListener("appUrlOpen", async ({ url }) => {
    const token = parseAuthFragment(url);
    if (!token) return;
    try {
      const user = await adoptSession(token);
      onSignedIn?.(user);
    } catch (error) {
      console.error("Could not complete native sign-in", error);
    } finally {
      // Close Safari whether or not the exchange worked — leaving it up over
      // the app with no explanation is worse than returning to a login screen.
      try {
        const { Browser } = await import("@capacitor/browser");
        await Browser.close();
      } catch { /* already dismissed */ }
    }
  });
}
