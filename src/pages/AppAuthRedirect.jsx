import { useEffect, useState } from "react";
import {
  pendingAppDeepLink,
  deepLinkFromIdentitySession,
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
    // The identity widget may already hold the session — it runs before this
    // module and takes the token out of the fragment. Ask it first; the URL is
    // only a fallback for the case where it has not initialised yet.
    const link = deepLinkFromIdentitySession() || pendingAppDeepLink();
    if (link) {
      setDeepLink(link);
      // Deliberately NOT attempted automatically. SFSafariViewController
      // refuses a script-initiated jump to an app scheme, and in refusing it
      // also clears the fragment — which destroyed the token before the user
      // could tap anything. The tap is the only reliable handoff, so it is the
      // only one made.
      return;
    }
    // No token yet. Do NOT start the sign-in from this page: Netlify records
    // the Referer and decides from it where to return the token, and starting
    // here produced an instant bounce with nothing. Hand off to the site root,
    // which sends the same Referer as the web sign-in that works.
    //
    // Bouncing rather than starting also means an app already installed on a
    // phone keeps working without being rebuilt — it opens this page, and the
    // page routes it correctly.
    // The widget initialises asynchronously. If a sign-in is in flight, wait
    // for it to settle rather than declaring failure or starting another.
    const identity = window.netlifyIdentity;
    if (identity?.on) {
      const onReady = () => {
        const fromSession = deepLinkFromIdentitySession();
        if (fromSession) setDeepLink(fromSession);
      };
      identity.on("init", onReady);
      identity.on("login", onReady);
    }

    const diagnostics = appAuthDiagnostics();
    if (diagnostics.secondsSinceAttempt !== null && diagnostics.secondsSinceAttempt < 20) {
      // A sign-in was only just tried; bouncing again would spin.
      setDiagnostics(diagnostics);
      setStalled(true);
      return;
    }
    window.location.replace("/?appauth=1");
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
