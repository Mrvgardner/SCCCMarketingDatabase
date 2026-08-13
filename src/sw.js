import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();

// Shell only — see the globPatterns note in vite.config.js. Registered first so
// precached URLs are served from the precache and never fall through below.
precacheAndRoute(self.__WB_MANIFEST);

// Lazy route chunks: cached the first time a page actually loads them, then
// served from cache while revalidating. Someone who opens the trade show pages
// once has them offline; someone who never does downloads nothing.
registerRoute(
  ({ request, url }) => url.origin === self.location.origin
    && (request.destination === 'script' || request.destination === 'style'),
  new StaleWhileRevalidate({
    cacheName: 'app-chunks',
    plugins: [new CacheableResponsePlugin({ statuses: [200] })],
  }),
);

// Images — venue and booth maps above all. CacheFirst because they are
// content-hashed or static, so a cache hit is always correct.
registerRoute(
  ({ request, url }) => url.origin === self.location.origin && request.destination === 'image',
  new CacheFirst({
    cacheName: 'app-images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30, purgeOnQuotaError: true }),
    ],
  }),
);

// Deliberately no route for /.netlify/functions/* — those responses are
// per-user and sent with `Cache-Control: private, no-store`. Matching only on
// script/style/image destinations keeps fetch() API calls out of the cache.

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data?.json() || {};
  } catch {
    payload = { body: event.data?.text() || '' };
  }

  const urgent = payload.urgent === true;
  event.waitUntil(self.registration.showNotification(payload.title || 'Trade Show Update', {
    body: payload.body || 'A new event update is available.',
    icon: '/pwa-192x192.png',
    badge: '/favicon-32x32.png',
    tag: payload.tag || 'trade-show-update',
    renotify: urgent,
    requireInteraction: urgent,
    data: { url: payload.url || '/events' },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || '/events', self.location.origin).href;

  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if (client.url.startsWith(self.location.origin)) {
        await client.navigate(targetUrl);
        return client.focus();
      }
    }
    return clients.openWindow(targetUrl);
  })());
});
