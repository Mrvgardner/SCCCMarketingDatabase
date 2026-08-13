import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, CalendarDaysIcon, PencilSquareIcon } from "@heroicons/react/24/solid";
import { listTradeShows } from "../../api/tradeShows";

export default function TradeShowsAdmin() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    listTradeShows()
      .then((items) => !cancelled && setEvents(items))
      .catch((err) => !cancelled && setError(err.message || "Unable to load trade shows"))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 px-4 py-6 text-white sm:px-8 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white">
          <ArrowLeftIcon className="h-4 w-4" /> Admin
        </Link>

        <div className="mb-8 flex items-start gap-3">
          <CalendarDaysIcon className="mt-1 h-8 w-8 text-[#ff8a4d]" />
          <div>
            <h1 className="font-switch-bold text-3xl tracking-wide">Trade Show Manager</h1>
            <p className="mt-1 text-gray-400">Choose an event to update what teammates see.</p>
          </div>
        </div>

        {import.meta.env.DEV && (
          <div className="mb-6 rounded-lg border border-blue-400/25 bg-blue-500/10 p-4 text-sm text-blue-100">
            Local preview: edits made here are saved in this browser. The deployed app uses the shared, admin-protected event store.
          </div>
        )}

        {error && <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

        {loading ? (
          <p className="py-12 text-center text-gray-400">Loading events...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => {
              const urgent = event.latestUpdates?.find((update) => update.level === "Urgent");
              return (
                <Link
                  key={event.id}
                  to={`/admin/events/${event.id}`}
                  className="group rounded-lg border border-white/10 bg-gray-900/55 p-5 shadow-xl shadow-black/10 transition-colors hover:border-[#ff8a4d]/55 hover:bg-gray-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">{event.shortName} {event.year}</div>
                      <h2 className="mt-2 text-xl font-bold text-white">{event.name}</h2>
                    </div>
                    <PencilSquareIcon className="h-5 w-5 text-gray-500 transition-colors group-hover:text-[#ff8a4d]" />
                  </div>
                  <div className="mt-4 grid gap-1 text-sm text-gray-300">
                    <span>{event.dates}</span>
                    <span>{event.venue} · {event.booth}</span>
                  </div>
                  {urgent && (
                    <div className="mt-4 rounded-md border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                      <span className="font-bold">Urgent:</span> {urgent.title}
                    </div>
                  )}
                  <div className="mt-4 text-sm font-semibold text-[#9dbaff] group-hover:text-white">Manage event →</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

