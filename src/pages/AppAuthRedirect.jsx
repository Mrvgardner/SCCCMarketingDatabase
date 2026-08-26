import { useEffect } from "react";
import { beginAppAuthRedirect, forwardTokenToAppIfPending } from "../native/appAuthBridge";

// Reached only inside Safari, opened by the native app. Marks this browsing
// context as an app sign-in and hands off to Netlify's Google flow. Rendered
// content is just what shows for the instant before the redirect.
export default function AppAuthRedirect() {
  useEffect(() => {
    // The token comes back HERE, not to the site root. Netlify Identity records
    // the Referer in the state JWT it hands Google — verified in a live flow,
    // the state carried "referrer":"https://switchcommerce.team/app-auth" — and
    // returns the token to that address.
    //
    // So this page has to check for an arriving token BEFORE starting a new
    // sign-in. Without that check it greets its own callback by launching
    // another sign-in, which loops forever and hammers Google's authorize
    // endpoint until it answers 400 invalid_request.
    if (forwardTokenToAppIfPending()) return;
    beginAppAuthRedirect();
  }, []);
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
