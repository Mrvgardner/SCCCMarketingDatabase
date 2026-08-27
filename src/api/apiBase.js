import { Capacitor } from "@capacitor/core";

// Where the Netlify functions live.
//
// On the web the app is served from the same origin as its functions, so a
// relative path is correct and stays correct on deploy previews and branch
// deploys. Inside the native shell the webview origin is Capacitor's own, so a
// relative path would resolve against the app bundle and 404 — those calls have
// to be addressed to the deployed site explicitly.
const NATIVE_API_ORIGIN = "https://switchcommerce.team";

export function isNativeApp() {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export const apiOrigin = isNativeApp() ? NATIVE_API_ORIGIN : "";

export function apiUrl(path) {
  return `${apiOrigin}${path}`;
}
