import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Card, Eyebrow, ScreenTitle } from "../../components/trip/TripChrome";
import FlightEntry from "../../components/trip/FlightEntry";

function StatCard({ tone, eyebrow, value, meta, action, onAction }) {
  const alert = tone === "alert";
  return (
    <div
      className={`flex-1 rounded-2xl border p-3.5 ${alert ? "border-[#ff4f00]/[0.32] bg-[#ff4f00]/10" : "border-white/10 bg-white/[0.045]"}`}
    >
      <p
        className={`font-switch-reg text-[10px] uppercase leading-none tracking-[0.16em] ${alert ? "text-[#ff4f00]" : "text-[#75808d]"}`}
      >
        {eyebrow}
      </p>
      <p className="mt-2 text-[15px] font-bold leading-[1.25] text-white">{value}</p>
      {meta && <p className="mt-0.5 text-[12px] leading-[1.4] text-[#93a0b4]">{meta}</p>}
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 min-h-[44px] text-left text-[13px] font-semibold text-[#0951fa]"
        >
          {action}
        </button>
      )}
    </div>
  );
}

// Colour the timeline dot by what kind of commitment it is: orange for the
// things everyone has to be at, blue for expo hours, muted otherwise.
function dotColor(item) {
  if (/team call|all[\s-]*hands/i.test(`${item.type} ${item.owner} ${item.title}`)) return "#ff4f00";
  if (/expo/i.test(item.type || "")) return "#0951fa";
  return "rgba(255,255,255,0.35)";
}

export default function TripSchedule() {
  const { event, myTravel, myName, user } = useOutletContext();
  const { hash } = useLocation();
  const [day, setDay] = useState(0);
  // Today's "Add" readiness action links here with #flight so the form is open
  // on arrival — tapping "Add" and then hunting for the form is the friction
  // that made this look broken.
  const [editingFlight, setEditingFlight] = useState(hash === "#flight");
  const flightRef = useRef(null);
  const days = event.schedule || [];
  const active = days[day] || days[0];

  const dayLabels = useMemo(
    () =>
      days.map((entry) => {
        if (!entry?.date) return entry?.day || "";
        const d = new Date(`${entry.date}T12:00:00`);
        // Built from two formatters rather than one: en-US renders a combined
        // weekday+day as "13 Tue", and the design calls for "Tue 13".
        const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(d);
        const dayNumber = new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(d);
        return `${weekday} ${dayNumber}`;
      }),
    [days],
  );

  // Following the same link again while already on this tab only changes the
  // hash, so the initial state above would not fire a second time.
  useEffect(() => {
    if (hash === "#flight") setEditingFlight(true);
  }, [hash]);

  useEffect(() => {
    if (editingFlight) flightRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [editingFlight]);

  const hasFlight = Boolean(myTravel?.arrivalFlight?.flightNumber);
  const flightValue = hasFlight
    ? `${myTravel.arrivalFlight.airline || ""} ${myTravel.arrivalFlight.flightNumber}`.trim()
    : "Not added";

  return (
    <div className="space-y-5">
      <div>
        <Eyebrow>
          {event.shortName} {event.year} · {event.city}
        </Eyebrow>
        <ScreenTitle className="mt-2">Your trip</ScreenTitle>
      </div>

      <div className="flex gap-2.5">
        <StatCard
          tone={hasFlight ? "neutral" : "alert"}
          eyebrow="Flight"
          value={flightValue}
          meta={hasFlight ? [myTravel.arrivalFlight.date, myTravel.arrivalFlight.time].filter(Boolean).join(" · ") : null}
          action={editingFlight ? null : hasFlight ? "Edit flight" : "Add your flight"}
          onAction={() => setEditingFlight(true)}
        />
        <StatCard
          eyebrow="Hotel"
          value={event.hotel?.name || "Hotel TBD"}
          meta={event.city}
        />
      </div>

      {editingFlight && (
        <div ref={flightRef} className="scroll-mt-4">
          <Card className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Eyebrow>Your flights</Eyebrow>
                <p className="mt-1 text-[12.5px] leading-[1.5] text-[#75808d]">
                  Enter the flight number and date and we will fill in the rest.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingFlight(false)}
                className="-mr-1 -mt-1 min-h-[44px] px-1 text-[13px] font-semibold text-[#93a0b4]"
              >
                Close
              </button>
            </div>
            <div className="mt-3">
              <FlightEntry
                event={event}
                user={user}
                myName={myName}
                myTravel={myTravel}
                onDone={() => setEditingFlight(false)}
              />
            </div>
          </Card>
        </div>
      )}

      {days.length > 1 && (
        <div className="flex gap-1 rounded-xl bg-white/[0.05] p-1" role="tablist" aria-label="Show days">
          {dayLabels.map((label, index) => (
            <button
              key={label + index}
              type="button"
              role="tab"
              aria-selected={index === day}
              onClick={() => setDay(index)}
              className={`min-h-[44px] flex-1 rounded-[9px] px-2 py-2.5 text-[13px] font-semibold transition-colors ${
                index === day ? "bg-white text-[#05101f]" : "text-[#93a0b4]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* The hub carried full hotel and venue detail; the two stat cards above
          only summarise it, so the rest is kept here rather than dropped. */}
      {(event.hotel?.address || event.hotel?.confirmation || event.hotel?.notes || event.hotelMapUrl) && (
        <Card className="p-4">
          <Eyebrow>Hotel &amp; venue</Eyebrow>
          <p className="mt-2 text-[14.5px] font-semibold text-white">{event.hotel?.name}</p>
          {event.hotel?.address && (
            <p className="mt-0.5 text-[13px] leading-[1.5] text-[#93a0b4]">{event.hotel.address}</p>
          )}
          {event.hotel?.confirmation && (
            <p className="mt-2 text-[12.5px] leading-[1.5] text-[#75808d]">{event.hotel.confirmation}</p>
          )}
          {event.hotel?.notes && (
            <p className="mt-2 text-[12.5px] leading-[1.5] text-[#75808d]">{event.hotel.notes}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {event.hotelMapUrl && (
              <a href={event.hotelMapUrl} target="_blank" rel="noopener noreferrer"
                 className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-white/15 px-3 text-[13px] font-semibold text-white">
                Hotel map <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              </a>
            )}
            {event.venueMapUrl && (
              <a href={event.venueMapUrl} target="_blank" rel="noopener noreferrer"
                 className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-white/15 px-3 text-[13px] font-semibold text-white">
                Venue map <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              </a>
            )}
            {event.officialUrl && (
              <a href={event.officialUrl} target="_blank" rel="noopener noreferrer"
                 className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-white/15 px-3 text-[13px] font-semibold text-white">
                Show site <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        </Card>
      )}

      {active?.dressCode && (
        <Card className="flex gap-3 p-4">
          <span aria-hidden="true" className="w-[3px] shrink-0 rounded-full bg-[#0951fa]" />
          <div className="min-w-0">
            <Eyebrow>Dress code</Eyebrow>
            <p className="mt-1.5 text-[14px] leading-[1.45] text-white">{active.dressCode}</p>
          </div>
        </Card>
      )}

      <div className="space-y-5">
        {(active?.items || []).map((item, index) => (
          <div key={`${item.time}-${index}`} className="flex gap-3">
            <div className="w-[74px] shrink-0 text-right">
              <p className="text-[13px] font-bold leading-[1.25] text-white">{item.time}</p>
              {item.type && <p className="mt-0.5 text-[11px] leading-[1.3] text-[#75808d]">{item.type}</p>}
            </div>
            <div className="relative flex justify-center pt-1.5">
              <span aria-hidden="true" className="absolute inset-y-0 w-px bg-white/[0.12]" />
              <span
                aria-hidden="true"
                className="relative h-2 w-2 rounded-full"
                style={{ background: dotColor(item) }}
              />
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <p className="text-[14.5px] font-semibold leading-[1.25] text-white">{item.title}</p>
              {item.location && (
                <p className="mt-0.5 text-[12.5px] leading-[1.4] text-[#93a0b4]">{item.location}</p>
              )}
              {item.notes && (
                <p className="mt-1 text-[12.5px] leading-[1.5] text-[#75808d]">{item.notes}</p>
              )}
            </div>
          </div>
        ))}
        {!active?.items?.length && (
          <p className="text-[13px] text-[#93a0b4]">Nothing scheduled for this day yet.</p>
        )}
      </div>

      <p className="border-t border-white/[0.07] pt-3 text-[11.5px] leading-[1.5] text-[#75808d]">
        All times subject to change. Marketing updates this hub as details are confirmed.
      </p>
    </div>
  );
}
