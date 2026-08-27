import { useEffect, useMemo, useState } from "react";
import { listTradeShows } from "../../api/tradeShows";
import { tradeShows as seedTradeShows, getTradeShowById } from "../../data/tradeShows";
import { useAuth } from "../../contexts/AuthContext";

const DEFAULT_TIMEZONE = "America/Los_Angeles";

// Today's calendar date in the event's own timezone. The countdown is in show
// days, so it must not drift by a day just because the traveller is in Texas.
function todayInZone(timeZone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function calendarDaysBetween(fromIsoDate, toIsoDate) {
  const from = Date.parse(`${fromIsoDate}T00:00:00Z`);
  const to = Date.parse(`${toIsoDate}T00:00:00Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
  return Math.round((to - from) / 86_400_000);
}

// Mirrors travelerForEmail in netlify/functions/trade-shows.js: the server
// derives the traveller from the caller's own email, so the UI must resolve the
// same person or it will show one row and save another.
export function travelerNameForUser(travelingTeam, teamContacts, user) {
  const email = (user?.email || "").trim().toLowerCase();
  if (!email) return "";
  return (travelingTeam || []).find(
    (name) => (teamContacts?.[name]?.email || "").trim().toLowerCase() === email,
  ) || "";
}

export function useTripEvent(eventId) {
  const { user, isAdmin } = useAuth();
  const [event, setEvent] = useState(() => getTradeShowById(eventId) || seedTradeShows[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      listTradeShows()
        .then((events) => {
          if (cancelled) return;
          const match = events.find((item) => item.id === eventId);
          if (match) setEvent(match);
        })
        // Offline or a failed call leaves the seed copy in place rather than an
        // empty screen. The banner in TripLayout says so, so stale data is
        // never passed off as live.
        .catch(() => {})
        .finally(() => !cancelled && setLoading(false));
    };
    load();
    window.addEventListener("trade-shows:updated", load);
    return () => {
      cancelled = true;
      window.removeEventListener("trade-shows:updated", load);
    };
  }, [eventId]);

  const derived = useMemo(() => {
    const timeZone = event?.timezone || DEFAULT_TIMEZONE;
    const firstDay = event?.schedule?.[0]?.date;
    const daysOut = firstDay ? calendarDaysBetween(todayInZone(timeZone), firstDay) : null;

    const myName = travelerNameForUser(event?.travelingTeam, event?.teamContacts, user);
    const myTravel = (event?.travel || []).find(
      (row) => (row.email || "").toLowerCase() === (user?.email || "").toLowerCase(),
    ) || (event?.travel || []).find(
      (row) => (row.person || "").toLowerCase() === myName.toLowerCase(),
    ) || null;

    // Readiness is derived, never stored — so it can never disagree with the
    // record it is describing.
    const hasFlight = Boolean(
      myTravel?.arrivalFlight?.flightNumber || (myTravel?.arrival && myTravel.arrival !== "TBD"),
    );
    const onRoster = Boolean(myName);

    const readiness = [
      { id: "registered", label: `Registered for ${event?.shortName || "the show"}`, done: onRoster },
      { id: "hotel", label: `Room at ${event?.hotel?.name || "the host hotel"}`, done: Boolean(event?.hotel?.name && event.hotel.name !== "Hotel TBD") },
      { id: "flight", label: `Add your flight into ${event?.airportCode || "LAS"}`, done: hasFlight, action: "Add", to: "trip" },
      { id: "expenses", label: "Expense capture ready", done: true },
    ];

    return {
      timeZone,
      daysOut,
      myName,
      myTravel,
      onRoster,
      readiness,
      doneCount: readiness.filter((item) => item.done).length,
    };
  }, [event, user]);

  return { event, loading, user, isAdmin, ...derived };
}
