import { useEffect, useState } from "react";
import {
  beginAppAuthRedirect,
  pendingAppDeepLink,
  appAuthDiagnostics,
  resetAppAuthGuard,
} from "../native/appAuthBridge";

// Reached only inside Safari, opened by the native app.
//
// Two jobs, and which one depends on whether a token has arrived. Netlify
// Identity returns the token to the REFERRER — verified in a live flow, the
// state JWT it hands Google carries
// "referrer":"https://switchcommerce.team/app-auth" — so this page is both the
// start of the sign-in and its finish line.
export default function AppAuthRedirect() {
  const [deepLink, setDeepLink] = useState(null);
  const [stalled, setStalled] = useState(false);
  const [diagnostics, setDiagnostics] = useState(null);

  useEffect(() => {
    const link = pendingAppDeepLink();
    if (link) {
      setDeepLink(link);
      // Try to hand off without bothering the user. SFSafariViewController
      // often refuses a script-initiated jump to an app scheme — it wants a
      // real tap — so the button below is the reliable path, not a fallback
      // for exotic cases.
      window.location.replace(link);
      return;
    }
    // No token yet: start the sign-in, unless we only just tried, in which case
    // something downstream is failing and looping would only hammer Google.
    if (!beginAppAuthRedirect()) {
      setDiagnostics(appAuthDiagnostics());
      setStalled(true);
    }
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-[#05101f] px-6 text-center">
      <div className="max-w-xs">
        <img
          src="/logos/switch/Logo Icon/SC Logo - White.png"
          alt="Switch Commerce"
          className="mx-auto h-10 w-auto"
        />

        {deepLink && (
          <>
            <p className="mt-5 text-base font-semibold text-white">You're signed in</p>
            <p className="mt-1.5 text-sm leading-relaxed text-[#93a0b4]">
              Tap below to return to Trade Shows.
            </p>
            <a
              href={deepLink}
              className="mt-5 flex min-h-[52px] items-center justify-center rounded-2xl bg-[#0951fa] px-5 text-[15px] font-semibold text-white"
            >
              Open Trade Shows
            </a>
          </>
        )}

        {!deepLink && !stalled && (
          <p className="mt-4 text-sm text-[#93a0b4]">Taking you to Google to sign in…</p>
        )}

        {stalled && (
          <>
            <p className="mt-5 text-base font-semibold text-white">Sign-in didn't complete</p>
            <p className="mt-1.5 text-sm leading-relaxed text-[#93a0b4]">
              Nothing came back from Google. Tap below to try once more.
            </p>
            <button
              type="button"
              onClick={() => { resetAppAuthGuard(); window.location.replace("/app-auth"); }}
              className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-[#0951fa] px-5 text-[15px] font-semibold text-white"
            >
              Try again
            </button>
            {diagnostics && (
              <dl className="mt-6 space-y-1 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left text-[11px] leading-relaxed text-[#75808d]">
                <div>token in fragment: <span className="text-white">{String(diagnostics.hasToken)}</span></div>
                <div>error in fragment: <span className="text-white">{String(diagnostics.hasError)}</span></div>
                <div>fragment: <span className="break-all text-white">{diagnostics.fragment}</span></div>
                <div>flow marker: <span className="text-white">{String(diagnostics.markerPresent)}</span></div>
                <div>last attempt: <span className="text-white">{diagnostics.secondsSinceAttempt === null ? "none" : diagnostics.secondsSinceAttempt + "s ago"}</span></div>
              </dl>
            )}
          </>
        )}
      </div>
    </main>
  );
}
