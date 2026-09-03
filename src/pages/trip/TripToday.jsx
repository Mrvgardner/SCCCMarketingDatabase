import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { nextUp, formatCountdown } from "../../utils/schedule";
import { BellIcon } from "@heroicons/react/24/outline";
import { Avatar, Card, Eyebrow, ThreeBars } from "../../components/trip/TripChrome";

function ReadinessRow({ item, eventId, isLast }) {
  return (
    <div
      className={`flex min-h-[48px] items-center gap-3 py-2 ${isLast ? "" : "border-b border-white/[0.07]"}`}
    >
      <span
        aria-hidden="true"
        className={
          item.done
            ? "grid h-5 w-5 shrink-0 place-items-center rounded-full border border-[#10b981]/50 bg-[#10b981]/[0.18] text-[11px] text-[#10b981]"
            : "h-5 w-5 shrink-0 rounded-full border-[1.5px] border-[#ff4f00]"
        }
      >
        {item.done ? "✓" : ""}
      </span>
      <span
        className={`min-w-0 flex-1 text-[14px] leading-[1.25] ${item.done ? "text-[#93a0b4]" : "font-semibold text-white"}`}
      >
        {item.label}
      </span>
      {!item.done && item.action && (
        <Link
          to={`/trip/${eventId}/${item.to || "trip"}`}
          className="shrink-0 px-1 text-[13px] font-semibold text-[#0951fa]"
        >
          {item.action}
        </Link>
      )}
    </div>
  );
}

export default function TripToday() {
  const { event, daysOut, readiness, doneCount, loading } = useOutletContext();
  const eventId = event.id;
  const firstItems = (event.schedule?.[0]?.items || []).slice(0, 2);

  // Before the show, Today shows the first thing on the ground. Once it has
  // started, that gives way to what is next and how long until it — the
  // question people actually open their phone for mid-show. The clock ticks
  // every 30s; the countdown is rounded to the minute, so finer would be noise.
  const showStarted = daysOut !== null && daysOut <= 0;
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!showStarted) return undefined;
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, [showStarted]);
  const next = showStarted ? nextUp(event, now) : null;
  const roster = event.travelingTeam || [];
  const progress = readiness.length ? Math.round((doneCount / readiness.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src="/logos/switch/Logo Icon/SC Logo - White.png"
            alt="Switch Commerce"
            className="h-[17px] w-auto"
            width="22"
            height="17"
          />
          <Eyebrow>Trade show travel</Eyebrow>
        </div>
        <Link
          to={`/trip/${eventId}/trip`}
          aria-label="Updates"
          className="relative grid h-[34px] w-[34px] place-items-center rounded-full bg-white/[0.06]"
        >
          <BellIcon className="h-4 w-4 text-white" />
          {event.latestUpdates?.length > 0 && (
            <span className="absolute right-0 top-0 h-[7px] w-[7px] rounded-full bg-[#ff4f00] ring-[1.5px] ring-[#05101f]" />
          )}
        </Link>
      </header>

      {/* Countdown. Derived from the schedule in the event's own timezone —
          never a stored or hardcoded number. */}
      <div className="flex items-end gap-4 pt-1">
        <span className="font-switch-bold text-[96px] leading-[0.82] tracking-[-0.01em] text-white">
          {daysOut === null ? "—" : Math.max(0, daysOut)}
        </span>
        <span className="flex flex-col gap-2 pb-2">
          <span className="text-[12px] font-semibold uppercase leading-none tracking-[0.2em] text-[#0951fa]">
            {daysOut === 0 ? "Today" : daysOut === 1 ? "Day out" : "Days out"}
          </span>
          <ThreeBars />
        </span>
      </div>

      <div>
        <h1 className="text-[19px] font-bold leading-[1.25] text-white">{event.name}</h1>
        <p className="mt-1 text-[13px] leading-[1.5] text-[#93a0b4]">
          {[event.dates, event.venue, event.booth].filter(Boolean).join(" · ")}
        </p>
      </div>

      <Card className="p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[15px] font-bold leading-[1.25] text-white">Trip readiness</h2>
          <span className="text-[12px] font-semibold text-[#f59e0b]">
            {doneCount} of {readiness.length} done
          </span>
        </div>
        <div className="mt-3 h-[5px] overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[#0951fa] transition-[width]" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2">
          {readiness.map((item, index) => (
            <ReadinessRow key={item.id} item={item} eventId={eventId} isLast={index === readiness.length - 1} />
          ))}
        </div>
      </Card>

      {showStarted && next && (
        <Card className="p-4">
          <div className="flex items-baseline justify-between gap-3">
            <Eyebrow>Next up</Eyebrow>
            <span className={`font-switch-bold text-[15px] leading-none tabular-nums ${next.allHands ? "text-[#ff4f00]" : "text-white"}`}>
              {formatCountdown(next.at.getTime() - now.getTime())}
            </span>
          </div>
          <div className="mt-3 flex gap-3">
            <span
              aria-hidden="true"
              className={`w-[3px] shrink-0 rounded-full ${next.allHands ? "bg-[#ff4f00]" : "bg-white/[0.16]"}`}
            />
            <div className="min-w-0">
              <p className="text-[14.5px] font-semibold leading-[1.25] text-white">{next.item.title}</p>
              <p className="mt-0.5 text-[12.5px] leading-[1.4] text-[#93a0b4]">
                {[next.item.time, next.item.location].filter(Boolean).join(" · ")}
              </p>
              {next.allHands && (
                <p className="mt-1 text-[12px] font-semibold text-[#ff4f00]">Everyone at the booth.</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {!showStarted && firstItems.length > 0 && (
        <Card className="p-4">
          <Eyebrow>First thing on the ground</Eyebrow>
          <div className="mt-3 space-y-3">
            {firstItems.map((item, index) => (
              <div key={`${item.time}-${index}`} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className={`w-[3px] shrink-0 rounded-full ${/all[\s-]*hands|team call/i.test(`${item.owner} ${item.type}`) ? "bg-[#ff4f00]" : "bg-white/[0.16]"}`}
                />
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold leading-[1.25] text-white">{item.title}</p>
                  <p className="mt-0.5 text-[12.5px] leading-[1.4] text-[#93a0b4]">
                    {[item.time, item.location].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {roster.length > 0 && (
        <Link
          to={`/trip/${eventId}/team`}
          className="flex items-center gap-3 rounded-2xl border border-[#0951fa]/30 bg-[#0951fa]/10 p-3.5"
        >
          <span className="flex shrink-0">
            {roster.slice(0, 3).map((name, index) => (
              <span key={name} className={index === 0 ? "" : "-ml-[9px]"}>
                <Avatar name={name} index={index} size={28} ring />
              </span>
            ))}
          </span>
          <span className="min-w-0 flex-1 text-[13px] leading-[1.4] text-white">
            {roster.length} of us are traveling
          </span>
          <span className="shrink-0 text-[13px] font-semibold text-[#0951fa]">Roster</span>
        </Link>
      )}

      {loading && <p className="pt-1 text-[11.5px] text-[#75808d]">Refreshing from the event record…</p>}
    </div>
  );
}
