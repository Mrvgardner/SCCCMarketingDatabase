import { parseStartTime, zonedToUtc, isAllHands } from "../../netlify/lib/reminder-schedule.mjs";

// The schedule as real instants, so "what's next" is a comparison rather than
// a guess. Same parsing the reminder job uses, so the countdown on Today and
// the push at T-60 agree about when a thing starts.

const DEFAULT_TIMEZONE = "America/Los_Angeles";

export function scheduleInstants(event) {
  const timeZone = event?.timezone || DEFAULT_TIMEZONE;
  const out = [];
  for (const day of event?.schedule || []) {
    if (!day?.date) continue;
    for (const item of day.items || []) {
      const start = parseStartTime(item?.time);
      if (!start) continue;
      const at = zonedToUtc(day.date, start.hour, start.minute, timeZone);
      if (!at) continue;
      out.push({ item, day, at, allHands: isAllHands(item) });
    }
  }
  return out.sort((a, b) => a.at - b.at);
}

// The next thing that has not started yet. Null once the show is over.
export function nextUp(event, now = new Date()) {
  return scheduleInstants(event).find((entry) => entry.at.getTime() > now.getTime()) || null;
}

// "in 1h 40m", "in 12m", "now". Rounded up, because "in 0m" while the clock
// still reads 3:59 is the kind of thing people argue with.
export function formatCountdown(msUntil) {
  if (msUntil <= 30_000) return "now";
  const minutes = Math.ceil(msUntil / 60_000);
  if (minutes < 60) return `in ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `in ${days}d ${hours % 24}h`;
  }
  return rest ? `in ${hours}h ${rest}m` : `in ${hours}h`;
}
