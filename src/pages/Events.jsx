import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  MapPinIcon,
  QueueListIcon,
} from "@heroicons/react/24/outline";
import { tradeShows } from "../data/tradeShows";
import { listTradeShows } from "../api/tradeShows";
import { isNativeApp } from "../api/apiBase";

// What is left of this page is the index: the list of shows. The per-event hub
// that used to live here — schedule, hotel, travel, expenses, resources, map,
// and its own menu — was replaced by the trip experience under /trip/:eventId,
// and the detail route now redirects there. That hub sat unreachable behind the
// redirect for a while; it is gone rather than kept "just in case", since the
// live version is in src/pages/trip and two copies only ever drift apart.

const sectionClass = "rounded-lg border border-white/10 bg-gray-900/45 p-5 shadow-xl shadow-black/10";

function EventStatusBadge({ status }) {
  const label = status === "current" ? "Current" : status === "past" ? "Past" : "Upcoming";
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">
      {label}
    </span>
  );
}

function EventsIndex({ events }) {
  const upcoming = events.filter((event) => event.status !== "past");
  const past = events.filter((event) => event.status === "past");

  return (
    <main className="flex-1 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* The site nav is hidden inside the trade show app, and this page has
            no event menu, so it carries its own way back to the main site.
            Omitted in the iOS app, which has no other pages. */}
        {!isNativeApp() && <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-[#0951fa] rounded"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to switchcommerce.team
        </Link>}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ff4f00]">Event operations</p>
            <h1 className="font-switch-bold mt-2 text-3xl sm:text-5xl tracking-wide">Trade Show Hub</h1>
            <p className="mt-3 max-w-2xl text-gray-300">
              A reusable home for schedules, hotels, dress code, resources, maps, team travel, and post-show history.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-gray-300">
            Managed by <span className="font-semibold text-white">Vic</span> and <span className="font-semibold text-white">Trip</span>
          </div>
        </div>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-[#0951fa]" />
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map((event) => (
              <Link
                key={event.id}
                to={`/trip/${event.id}/today`}
                className="group block rounded-lg border border-white/10 bg-gray-900/55 p-5 shadow-xl shadow-black/10 transition-all hover:-translate-y-0.5 hover:border-[#0951fa]/60 hover:bg-gray-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <EventStatusBadge status={event.status} />
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">{event.year}</span>
                    </div>
                    <h3 className="mt-4 text-2xl font-bold text-white">{event.name}</h3>
                    <p className="mt-1 text-sm text-gray-400">{event.audience}</p>
                  </div>
                  <div className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white">{event.shortName}</div>
                </div>
                <div className="mt-5 grid gap-3 text-sm text-gray-300 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="h-4 w-4 text-[#0951fa]" />
                    {event.dates}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-[#ff4f00]" />
                    {event.city}
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                  <span className="text-gray-400">{event.venue}</span>
                  <span className="font-semibold text-[#0951fa] group-hover:text-white">Open event</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <div className="flex items-center gap-2">
            <QueueListIcon className="h-5 w-5 text-[#ff4f00]" />
            <h2 className="text-xl font-semibold">Past Event Archive</h2>
          </div>
          <p className="mt-3 text-sm text-gray-300">
            Once events wrap, they can stay here with the final schedule, resource links, booth notes, lead process, and recap.
          </p>
          {past.length === 0 && (
            <div className="mt-4 rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm text-gray-400">
              No archived trade shows yet.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function Events() {
  const { eventId } = useParams();
  const [events, setEvents] = useState(tradeShows);

  useEffect(() => {
    // Nothing to list when we are about to redirect to the trip.
    if (eventId) return undefined;

    let cancelled = false;
    const load = () => {
      listTradeShows()
        .then((items) => !cancelled && setEvents(items))
        .catch(() => {});
    };

    load();
    window.addEventListener("trade-shows:updated", load);
    return () => {
      cancelled = true;
      window.removeEventListener("trade-shows:updated", load);
    };
  }, [eventId]);

  // Kept so existing links, bookmarks and push notification URLs still land
  // somewhere sensible rather than 404ing.
  if (eventId) return <Navigate to={`/trip/${eventId}/today`} replace />;

  return <EventsIndex events={events} />;
}
