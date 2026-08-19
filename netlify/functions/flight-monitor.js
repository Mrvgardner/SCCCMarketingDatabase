import { getStore } from '@netlify/blobs';
import webpush from 'web-push';
import { tradeShows as seedTradeShows } from '../../src/data/tradeShows.js';
import { configuredVapid, SUBSCRIPTION_STORE, subscriptionKey } from '../lib/push.js';
import { describeChange, snapshotOf, legIsDue } from '../lib/flight-status.mjs';
import { mergeSeedConfiguration } from './trade-shows.js';

const EVENT_STORE = 'knowledge-base';
const EVENT_KEY = 'trade-shows.json';
const STATE_STORE = 'flight-monitor';
const RAPID_API_HOST = 'aerodatabox.p.rapidapi.com';

// Only spend calls on flights this close to departure. AeroDataBox is metered
// per request, and a flight three weeks out has nothing to report.
const WINDOW_HOURS = Number(process.env.FLIGHT_MONITOR_WINDOW_HOURS || 18);

// Hard ceiling on billed calls per run, so a bad schedule edit or a sudden pile
// of entered flights can never run up an unbounded bill.
const MAX_LOOKUPS = Number(process.env.FLIGHT_MONITOR_MAX_LOOKUPS || 30);

function legKeyFor(eventId, email, direction, flightNumber, date) {
  return `${eventId}|${email}|${direction}|${flightNumber}|${date}`;
}

async function fetchFlight(apiKey, flightNumber, date) {
  const url = new URL(`https://${RAPID_API_HOST}/flights/number/${encodeURIComponent(flightNumber)}/${date}`);
  url.searchParams.set('dateLocalRole', 'Both');
  url.searchParams.set('withAircraftImage', 'false');
  url.searchParams.set('withLocation', 'false');
  url.searchParams.set('withFlightPlan', 'false');

  let response;
  try {
    response = await fetch(url, {
      headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': RAPID_API_HOST },
    });
  } catch {
    return null;
  }
  if (response.status === 204 || !response.ok) return null;
  try {
    const flights = await response.json();
    return Array.isArray(flights) && flights.length ? flights[0] : null;
  } catch {
    // A 200 with a non-JSON body (provider error page) must not throw the run.
    return null;
  }
}

export default async () => {
  const apiKey = process.env.AERODATABOX_API_KEY;
  if (!apiKey) {
    console.error('Flight monitor skipped: AERODATABOX_API_KEY is not set');
    return new Response('Flight lookup not configured', { status: 503 });
  }
  const vapid = configuredVapid();
  if (!vapid) {
    console.error('Flight monitor skipped: VAPID keys are missing or malformed');
    return new Response('VAPID not configured', { status: 503 });
  }
  try {
    webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);
  } catch (error) {
    console.error('Flight monitor skipped: invalid VAPID configuration', error.message);
    return new Response('Invalid VAPID configuration', { status: 503 });
  }

  const eventStore = getStore({ name: EVENT_STORE, consistency: 'strong' });
  const stored = await eventStore.get(EVENT_KEY, { type: 'json' });
  const events = stored ? mergeSeedConfiguration(stored) : seedTradeShows;

  const now = new Date();
  // Flatten every leg worth checking before spending a single call, so the
  // budget below applies to a known list rather than whatever we hit first.
  const candidates = [];
  for (const event of events || []) {
    for (const entry of event.travel || []) {
      if (!entry?.email) continue;
      for (const direction of ['arrivalFlight', 'departureFlight']) {
        const leg = entry[direction];
        if (!leg || !legIsDue(leg, now, WINDOW_HOURS)) continue;
        candidates.push({
          eventId: event.id,
          email: entry.email,
          person: entry.person || 'A teammate',
          direction: direction === 'arrivalFlight' ? 'arrival' : 'departure',
          flightNumber: String(leg.flightNumber || '').toUpperCase().replace(/[^A-Z0-9]/g, ''),
          date: leg.date,
        });
      }
    }
  }

  if (!candidates.length) return new Response('No flights in window', { status: 200 });
  if (candidates.length > MAX_LOOKUPS) {
    console.warn(`Flight monitor: ${candidates.length} legs due, checking only the first ${MAX_LOOKUPS}`);
  }
  const checking = candidates.slice(0, MAX_LOOKUPS);

  const stateStore = getStore({ name: STATE_STORE, consistency: 'strong' });
  const state = (await stateStore.get('legs.json', { type: 'json' })) || {};
  const subscriptionStore = getStore({ name: SUBSCRIPTION_STORE, consistency: 'strong' });

  let lookups = 0;
  let messages = 0;

  for (const candidate of checking) {
    const flight = await fetchFlight(apiKey, candidate.flightNumber, candidate.date);
    lookups += 1;
    if (!flight) continue;

    const key = legKeyFor(candidate.eventId, candidate.email, candidate.direction, candidate.flightNumber, candidate.date);
    const next = snapshotOf(flight);
    const previous = state[key]?.snapshot || null;
    state[key] = { snapshot: next, checkedAt: now.toISOString() };

    // No previous reading means this is the first sighting — record it, but do
    // not announce a "change" the team never saw the other side of.
    if (!previous) continue;

    const changes = describeChange(previous, next, candidate);
    if (!changes.length) continue;

    const subscriptions = (await subscriptionStore.get(subscriptionKey(candidate.eventId), { type: 'json' })) || [];
    if (!subscriptions.length) continue;

    for (const change of changes) {
      const recipients = change.audience === 'traveler'
        ? subscriptions.filter((record) => String(record.email || '').toLowerCase() === String(candidate.email).toLowerCase())
        : subscriptions;
      if (!recipients.length) continue;

      const notification = JSON.stringify({
        title: change.title,
        body: change.body,
        urgent: change.audience === 'team',
        url: `/events/${candidate.eventId}#travel`,
        tag: `flight-${key}`,
      });

      const expired = new Set();
      await Promise.allSettled(recipients.map(async (record) => {
        try {
          await webpush.sendNotification(record.subscription, notification);
          messages += 1;
        } catch (error) {
          if (error.statusCode === 404 || error.statusCode === 410) {
            expired.add(record.subscription?.endpoint);
          }
          throw error;
        }
      }));

      if (expired.size) {
        await subscriptionStore.setJSON(
          subscriptionKey(candidate.eventId),
          subscriptions.filter((record) => !expired.has(record.subscription?.endpoint)),
        );
      }
    }
  }

  // Drop legs nobody has looked at for a fortnight; their flights have flown.
  const cutoff = now.getTime() - 14 * 24 * 60 * 60 * 1000;
  for (const [key, value] of Object.entries(state)) {
    if (Date.parse(value?.checkedAt || 0) < cutoff) delete state[key];
  }
  await stateStore.setJSON('legs.json', state);

  console.log(`Flight monitor: ${lookups} lookup(s), ${messages} notification(s)`);
  return new Response(`Checked ${lookups} flight(s), sent ${messages} notification(s)`, { status: 200 });
};

export const config = {
  // Hourly. Finer would burn AeroDataBox quota for little gain — the window
  // above already limits which legs cost a call.
  schedule: '0 * * * *',
};
