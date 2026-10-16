// A show's status, with its archive time taken into account.
//
// `archiveAt` (an ISO instant) moves a show to the past on its own at that
// moment: no one has to be awake at noon to flip it, and every place that
// sorts shows — the hub, the app's launch screen, the assistant — agrees
// because they all ask this. Archived shows stay fully open; archiving only
// changes where a show is listed.

export function effectiveStatus(event, now = Date.now()) {
  if (event?.archiveAt) {
    const at = Date.parse(event.archiveAt);
    if (!Number.isNaN(at) && at <= now) return "past";
  }
  return event?.status || "upcoming";
}

export function withEffectiveStatus(event, now = Date.now()) {
  const status = effectiveStatus(event, now);
  return status === event?.status ? event : { ...event, status };
}

function firstDay(event) {
  return event?.schedule?.[0]?.date || "";
}

// Where the app opens: the next show that has not happened, or, when every
// show is over, the most recent one, so people land on their own receipts and
// recap rather than on last year.
export function launchShow(events, now = Date.now()) {
  const list = events || [];
  const upcoming = list.filter((event) => effectiveStatus(event, now) !== "past");
  if (upcoming.length) return upcoming[0];
  return [...list].sort((a, b) => firstDay(b).localeCompare(firstDay(a)))[0];
}
