// Shared push helpers. Lives outside netlify/functions so Netlify does not
// treat it as its own endpoint; esbuild bundles it into each function.

function clean(value, maxLength = 240) {
  return String(value || '').trim().slice(0, maxLength);
}

// Single source of truth for VAPID config. web-push validates the *format* of
// these and throws, so normalize and check here rather than letting
// setVapidDetails blow up mid-request. A bare email is the likeliest value
// someone sets, so accept it and add the scheme.
export function configuredVapid() {
  const publicKey = clean(process.env.VAPID_PUBLIC_KEY, 200);
  const privateKey = clean(process.env.VAPID_PRIVATE_KEY, 200);
  const rawSubject = clean(process.env.VAPID_SUBJECT, 240);
  if (!publicKey || !privateKey || !rawSubject) return null;

  const subject = /^(mailto:|https?:\/\/)/i.test(rawSubject) ? rawSubject : `mailto:${rawSubject}`;
  const validSubject = /^mailto:[^@\s]+@[^@\s]+$/i.test(subject) || /^https?:\/\/\S+$/i.test(subject);
  if (!validSubject) {
    console.error('VAPID_SUBJECT must be a mailto: address or an https: URL');
    return null;
  }
  return { publicKey, privateKey, subject };
}

export const SUBSCRIPTION_STORE = 'trade-show-push-subscriptions';

export function subscriptionKey(eventId) {
  return `events/${eventId}/subscriptions.json`;
}
