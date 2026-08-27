import { getStore } from '@netlify/blobs';
import webpush from 'web-push';
import { tradeShows as seedTradeShows } from '../../src/data/tradeShows.js';
import { configuredVapid, SUBSCRIPTION_STORE, subscriptionKey } from '../lib/push.js';
import { dueReminders } from '../lib/reminder-schedule.mjs';
import { mergeSeedConfiguration } from './trade-shows.js';

const EVENT_STORE = 'knowledge-base';
const EVENT_KEY = 'trade-shows.json';
const LEDGER_STORE = 'trade-show-reminders';
const LEDGER_KEY = 'sent.json';

// How late a reminder may still go out. Catching up after a missed or delayed
// cron run is right; firing "10 minutes until" an hour after the fact is worse
// than staying quiet.
const GRACE_MINUTES = 20;

// Anything this old can never come due again, so drop it from the ledger.
const LEDGER_RETENTION_DAYS = 30;

export default async () => {
  const vapid = configuredVapid();
  if (!vapid) {
    console.error('Reminder run skipped: VAPID keys are missing or malformed');
    return new Response('VAPID not configured', { status: 503 });
  }
  try {
    webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);
  } catch (error) {
    console.error('Reminder run skipped: invalid VAPID configuration', error.message);
    return new Response('Invalid VAPID configuration', { status: 503 });
  }

  const eventStore = getStore({ name: EVENT_STORE, consistency: 'strong' });
  const stored = await eventStore.get(EVENT_KEY, { type: 'json' });
  // Read through the same merge the app does. Reading the blob raw meant a
  // schedule change made in seed data never reached reminders until an admin
  // happened to save that event.
  const events = stored ? mergeSeedConfiguration(stored) : seedTradeShows;

  const now = new Date();
  const due = dueReminders(events, now, GRACE_MINUTES * 60_000);
  if (!due.length) return new Response('No reminders due', { status: 200 });

  const ledgerStore = getStore({ name: LEDGER_STORE, consistency: 'strong' });
  const ledger = (await ledgerStore.get(LEDGER_KEY, { type: 'json' })) || {};
  const pending = due.filter((reminder) => !ledger[reminder.key]);
  if (!pending.length) return new Response('Already sent', { status: 200 });

  const subscriptionStore = getStore({ name: SUBSCRIPTION_STORE, consistency: 'strong' });
  let deviceCount = 0;

  for (const reminder of pending) {
    const key = subscriptionKey(reminder.eventId);
    const subscriptions = (await subscriptionStore.get(key, { type: 'json' })) || [];

    if (subscriptions.length) {
      const notification = JSON.stringify({
        title: reminder.title,
        body: reminder.body,
        urgent: reminder.leadMinutes <= 10,
        url: `/trip/${reminder.eventId}/trip`,
        tag: `all-hands-${reminder.key}`,
      });

      const expired = new Set();
      await Promise.allSettled(subscriptions.map(async (record) => {
        try {
          await webpush.sendNotification(record.subscription, notification);
          deviceCount += 1;
        } catch (error) {
          if (error.statusCode === 404 || error.statusCode === 410) {
            expired.add(record.subscription?.endpoint);
          }
          throw error;
        }
      }));

      if (expired.size) {
        await subscriptionStore.setJSON(key, subscriptions.filter(
          (record) => !expired.has(record.subscription?.endpoint),
        ));
      }
    }

    // Mark sent either way. With no subscribers there is nothing to deliver,
    // and leaving it unmarked would just retry a moment that has passed.
    ledger[reminder.key] = now.toISOString();
  }

  const cutoff = now.getTime() - LEDGER_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  for (const [key, sentAt] of Object.entries(ledger)) {
    if (Date.parse(sentAt) < cutoff) delete ledger[key];
  }
  await ledgerStore.setJSON(LEDGER_KEY, ledger);

  console.log(`Sent ${pending.length} reminder(s) to ${deviceCount} device(s)`);
  return new Response(`Sent ${pending.length} reminder(s)`, { status: 200 });
};

export const config = {
  // The 10-minute reminder can only be as precise as this cadence, and Netlify
  // cron drifts, so the grace window above matters as much as the schedule.
  // Scheduled functions run on published production deploys only — they do not
  // fire on deploy previews.
  schedule: '*/5 * * * *',
};
