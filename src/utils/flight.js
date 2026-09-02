// Flight dates and times arrive as the raw strings the form and the lookup
// store — "2026-10-12" and "16:32". Nobody reads a 24-hour clock at a glance in
// an airport, so these turn them into what a person would say out loud.

export function formatFlightDate(date) {
  if (!date) return "";
  // Noon avoids the timezone shift that would make an ISO date render as the
  // previous day west of UTC.
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(parsed);
}

export function formatFlightTime(time) {
  if (!time) return "";
  const [hours, minutes] = String(time).split(":");
  const hour = Number(hours);
  if (!Number.isFinite(hour) || minutes === undefined) return time;
  const suffix = hour >= 12 ? "PM" : "AM";
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  return `${twelve}:${minutes} ${suffix}`;
}

// "Mon Oct 12 · 4:32 PM", dropping whichever half is missing rather than
// leaving a stray separator.
export function formatFlightWhen(leg) {
  return [formatFlightDate(leg?.date), formatFlightTime(leg?.time)].filter(Boolean).join(" · ");
}

// "AA2864 · DFW → LAS". The event airport is the fixed end of the trip, so it
// goes on the right for an arrival and the left for a departure.
export function formatFlightRoute(leg, direction, eventAirport) {
  if (!leg?.airport && !eventAirport) return "";
  const from = direction === "arrival" ? leg?.airport : eventAirport;
  const to = direction === "arrival" ? eventAirport : leg?.airport;
  if (!from || !to) return "";
  return `${from} → ${to}`;
}

export function hasFlight(leg) {
  return Boolean(leg?.flightNumber);
}
