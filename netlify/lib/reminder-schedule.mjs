// Pure scheduling logic for all-hands reminders. No I/O and no side-effecting
// imports, so it can be exercised directly with node. Named .mjs so bare node
// treats it as ESM; esbuild bundles it into the function all the same.

// Minutes before an all-hands item to send a reminder.
export const LEAD_TIMES = [60, 10];

// Fallback only. Every event should carry its own IANA zone — both current
// events are in Las Vegas, and getting this wrong sends reminders an hour off
// rather than failing loudly.
export const DEFAULT_TIMEZONE = 'America/Los_Angeles';

// How far a zone sits from UTC at a given instant, via the formatted-parts
// trick — no date library needed, and Node ships full ICU.
function zoneOffsetMs(instant, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(instant).reduce((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});
  const asUtc = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour) % 24, Number(parts.minute), Number(parts.second),
  );
  return asUtc - instant.getTime();
}

// "2026-10-08" plus a local clock time in a zone -> the real UTC instant.
export function zonedToUtc(date, hour, minute, timeZone) {
  const naive = new Date(`${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00Z`);
  if (Number.isNaN(naive.getTime())) return null;
  // One correction pass is enough away from a DST boundary; a second settles
  // the ambiguous hour when a show straddles a changeover.
  const first = new Date(naive.getTime() - zoneOffsetMs(naive, timeZone));
  return new Date(naive.getTime() - zoneOffsetMs(first, timeZone));
}

// Schedule times are free text an admin typed: "4:00 PM", "9:30 AM",
// "11:30 AM - 5:30 PM". Take the first clock time, which is the start.
export function parseStartTime(text) {
  const match = String(text || '').match(/(\d{1,2})\s*:\s*(\d{2})\s*([AaPp])\.?\s*[Mm]\.?/);
  if (!match) return null;
  const hour12 = Number(match[1]);
  const minute = Number(match[2]);
  if (hour12 < 1 || hour12 > 12 || minute > 59) return null;
  let hour = hour12 % 12;
  if (/p/i.test(match[3])) hour += 12;
  return { hour, minute };
}

// "All hands" is free text an admin types, so match tolerantly: "All hands",
// "all-hands" and "ALL HANDS" all count.
export function isAllHands(item) {
  return /all[\s-]*hands/i.test(`${item?.owner || ''} ${item?.title || ''}`);
}

export function ledgerKeyFor(eventId, date, time, leadMinutes) {
  return `${eventId}|${date}|${time}|${leadMinutes}`;
}

// Every all-hands reminder that is due right now, across all events. `graceMs`
// bounds how late a reminder may still go out: catching up after a missed cron
// run is right, but firing "10 minutes until" an hour late is worse than
// staying quiet.
export function dueReminders(events, now, graceMs) {
  const due = [];
  for (const event of events || []) {
    const timeZone = event.timezone || DEFAULT_TIMEZONE;
    for (const day of event.schedule || []) {
      if (!day?.date) continue;
      for (const item of day.items || []) {
        if (!isAllHands(item)) continue;
        const start = parseStartTime(item.time);
        if (!start) continue;
        const startsAt = zonedToUtc(day.date, start.hour, start.minute, timeZone);
        if (!startsAt) continue;
        for (const leadMinutes of LEAD_TIMES) {
          const dueAt = startsAt.getTime() - leadMinutes * 60_000;
          const lateBy = now.getTime() - dueAt;
          if (lateBy < 0 || lateBy > graceMs) continue;
          due.push({
            key: ledgerKeyFor(event.id, day.date, item.time, leadMinutes),
            eventId: event.id,
            leadMinutes,
            startsAt: startsAt.toISOString(),
            title: leadMinutes >= 60
              ? `${event.shortName || 'Event'}: all hands in 1 hour`
              : `${event.shortName || 'Event'}: all hands in 10 minutes`,
            body: [item.title, item.location].filter(Boolean).join(' · '),
          });
        }
      }
    }
  }
  return due;
}
