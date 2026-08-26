import { useEffect } from "react";
import { beginAppAuthRedirect } from "../native/appAuthBridge";

// Reached only inside Safari, opened by the native app. Marks this browsing
// context as an app sign-in and hands off to Netlify's Google flow. Rendered
// content is just what shows for the instant before the redirect.
export default function AppAuthRedirect() {
  useEffect(() => { beginAppAuthRedirect(); }, []);
  return (
    <main className="grid min-h-screen place-items-center bg-[#05101f] px-6 text-center">
      <div>
        <img
          src="/logos/switch/Logo Icon/SC Logo - White.png"
          alt="Switch Commerce"
          className="mx-auto h-10 w-auto"
        />
        <p className="mt-4 text-sm text-[#93a0b4]">Taking you to Google to sign in…</p>
      </div>
    </main>
  );
}
