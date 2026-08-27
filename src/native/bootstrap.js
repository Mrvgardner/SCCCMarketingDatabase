import { isNativeApp } from "../api/apiBase";

// Native-shell startup. Everything here is a no-op on the web, and the plugin
// imports are dynamic so the web bundle never pulls in native code it cannot
// use.
export async function bootstrapNative() {
  if (!isNativeApp()) return;

  try {
    // The splash is held open deliberately (launchAutoHide is false) so the
    // user never sees an empty white webview between launch and first paint.
    // That means something has to close it — this is that something. Without
    // it the app sits on the splash screen forever.
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch (error) {
    console.error("Could not hide the splash screen", error);
  }

  try {
    // The app is dark throughout, so the status bar needs light content to
    // stay legible.
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
  } catch {
    // Not fatal — a wrong status bar tint is cosmetic.
  }
}
