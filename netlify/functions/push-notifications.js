import { getStore } from '@netlify/blobs';
import { authenticate } from "../lib/auth.mjs";
import { withCors } from "../lib/http.mjs";
import webpush from 'web-push';
import { configuredVapid } from '../lib/push.js';

const STORE_NAME = 'trade-show-push-subscriptions';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function clean(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function eventKey(eventId) {
  return `events/${eventId}/subscriptions.json`;
}

// Shared with the scheduled reminder function so the two can never validate
// VAPID differently. See netlify/lib/push.js.
const configuredKeys = configuredVapid;

export default withCors(async (request) => {
  const user = await authenticate(request);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const keys = configuredKeys();
  if (!keys) return json({ error: 'Push notifications need VAPID server keys.' }, 503);
  if (request.method === 'GET') return json({ publicKey: keys.publicKey });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const eventId = clean(payload?.eventId, 80);
  if (!eventId || !/^[a-z0-9-]+$/i.test(eventId)) return json({ error: 'Invalid event id' }, 400);

  const store = getStore({ name: STORE_NAME, consistency: 'strong' });
  const key = eventKey(eventId);
  const subscriptions = (await store.get(key, { type: 'json' })) || [];

  if (payload.action === 'subscribe') {
    const subscription = payload.subscription;
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return json({ error: 'Invalid push subscription' }, 400);
    }
    const record = {
      subscription,
      email: clean(user.email, 160),
      createdAt: new Date().toISOString(),
    };
    const next = [...subscriptions.filter((item) => item.subscription?.endpoint !== subscription.endpoint), record];
    await store.setJSON(key, next);
    return json({ subscribed: true });
  }

  if (payload.action === 'unsubscribe') {
    const endpoint = clean(payload.endpoint, 2048);
    // Match the owner too. Filtering on endpoint alone let any signed-in user
    // silently kill someone else's notifications if they learned the URL.
    const ownerEmail = clean(user.email, 160);
    const next = subscriptions.filter(
      (item) => !(item.subscription?.endpoint === endpoint && item.email === ownerEmail),
    );
    await store.setJSON(key, next);
    return json({ subscribed: false });
  }

  if (payload.action !== 'send') return json({ error: 'Invalid action' }, 400);
  const roles = user.roles || user.appMetadata?.roles || user.app_metadata?.roles || [];
  if (!roles.some((role) => role.toLowerCase() === 'admin')) return json({ error: 'Admin role required' }, 403);

  const url = clean(payload.url, 240);
  // Both shapes are valid: /trip/:id is the current experience, /events/:id is
  // kept for notifications already queued or sent against the old hub.
  const targetsThisEvent = url.startsWith(`/trip/${eventId}`) || url.startsWith(`/events/${eventId}`);
  if (!targetsThisEvent) return json({ error: 'Invalid notification URL' }, 400);
  const notification = JSON.stringify({
    title: clean(payload.title, 120),
    body: clean(payload.body, 280),
    urgent: payload.urgent === true,
    url,
    tag: clean(payload.tag, 120),
  });

  try {
    webpush.setVapidDetails(keys.subject, keys.publicKey, keys.privateKey);
  } catch (error) {
    // Malformed key material still reaches here (wrong length, bad base64).
    // Surface it as a clear 503 instead of an opaque 500 on the send button.
    console.error('Invalid VAPID configuration', error.message);
    return json({ error: 'Push notifications are misconfigured on the server.' }, 503);
  }

  const expired = new Set();
  const results = await Promise.allSettled(subscriptions.map(async (record) => {
    try {
      await webpush.sendNotification(record.subscription, notification);
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) expired.add(record.subscription.endpoint);
      throw error;
    }
  }));
  if (expired.size) {
    await store.setJSON(key, subscriptions.filter((item) => !expired.has(item.subscription?.endpoint)));
  }

  return json({
    delivered: results.filter((result) => result.status === 'fulfilled').length,
    failed: results.filter((result) => result.status === 'rejected').length,
  });
});
