import { apiUrl } from "./apiBase";

const ENDPOINT = apiUrl("/.netlify/functions/push-notifications");
const EVENT_IDS_KEY = 'scc:push-event-ids';

function subscribedEventIds() {
  try {
    return JSON.parse(localStorage.getItem(EVENT_IDS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveSubscribedEventIds(eventIds) {
  localStorage.setItem(EVENT_IDS_KEY, JSON.stringify([...new Set(eventIds)]));
}

function urlBase64ToUint8Array(value) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

async function authHeaders() {
  const user = window.netlifyIdentity?.currentUser();
  if (!user) throw new Error('Sign in before enabling notifications.');
  return { Authorization: `Bearer ${await user.jwt()}` };
}

async function request(method, body) {
  const headers = await authHeaders();
  const response = await fetch(ENDPOINT, {
    method,
    headers: body === undefined ? headers : { ...headers, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Push notifications are not configured yet.');
  return result;
}

export function supportsPushNotifications() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function currentPushSubscription() {
  if (!supportsPushNotifications()) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function isEventPushEnabled(eventId) {
  const subscription = await currentPushSubscription();
  return Boolean(subscription && subscribedEventIds().includes(eventId));
}

export async function subscribeToEventPush(eventId) {
  if (!supportsPushNotifications()) throw new Error('Push notifications are not supported in this browser.');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notification permission was not granted.');

  const { publicKey } = await request('GET');
  if (!publicKey) throw new Error('Push notifications need server keys before they can be enabled.');

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription() || await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  await request('POST', { action: 'subscribe', eventId, subscription: subscription.toJSON() });
  saveSubscribedEventIds([...subscribedEventIds(), eventId]);
  return subscription;
}

export async function unsubscribeFromEventPush(eventId) {
  const subscription = await currentPushSubscription();
  if (!subscription) {
    saveSubscribedEventIds(subscribedEventIds().filter((id) => id !== eventId));
    return;
  }
  await request('POST', { action: 'unsubscribe', eventId, endpoint: subscription.endpoint });
  const remainingEventIds = subscribedEventIds().filter((id) => id !== eventId);
  saveSubscribedEventIds(remainingEventIds);
  if (!remainingEventIds.length) await subscription.unsubscribe();
}

export function sendEventPush(eventId, update) {
  return request('POST', {
    action: 'send',
    eventId,
    title: update.level === 'Urgent' ? `Urgent: ${update.title}` : update.title,
    body: update.body,
    urgent: update.level === 'Urgent',
    url: `/events/${eventId}#updates`,
    tag: `event-${eventId}-${update.id}`,
  });
}
