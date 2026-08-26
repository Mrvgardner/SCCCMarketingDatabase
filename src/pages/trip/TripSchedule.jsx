import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, Eyebrow, ScreenTitle } from "../../components/trip/TripChrome";

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
  const { event, myTravel } = useOutletContext();
  const [day, setDay] = useState(0);
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
          action={hasFlight ? null : "Look up flight"}
          // Flight entry lives on the event hub's Team section, which already
          // has the lookup wired to netlify/functions/flight-lookup.
          onAction={() => { window.location.href = `/events/${event.id}#travel`; }}
        />
        <StatCard
          eyebrow="Hotel"
          value={event.hotel?.name || "Hotel TBD"}
          meta={
            event.hotel?.checkIn && event.hotel.checkIn !== "TBD"
              ? `${event.hotel.checkIn} → ${event.hotel.checkOut}`
              : "Dates TBD"
          }
        />
      </div>

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
