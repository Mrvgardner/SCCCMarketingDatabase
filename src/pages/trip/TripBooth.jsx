import { useOutletContext } from "react-router-dom";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Eyebrow } from "../../components/trip/TripChrome";

export default function TripBooth() {
  const { event } = useOutletContext();
  const map = event.floorMap;

  if (!map) {
    return (
      <div className="space-y-3">
        <Eyebrow>{event.venue}</Eyebrow>
        <h1 className="text-[26px] font-bold leading-[1.15] text-white">No floor map yet</h1>
        <p className="text-[13.5px] leading-[1.6] text-[#93a0b4]">
          Marketing adds the venue map once the show publishes it.
        </p>
      </div>
    );
  }

  const radius = map.markerRadius || 18;
  const routeWidth = map.routeWidth || 13;

  return (
    <div className="space-y-4">
      <div>
        <Eyebrow>{[event.venue, map.level].filter(Boolean).join(" · ")}</Eyebrow>
        <h1 className="mt-2 text-[26px] font-bold leading-[1.15] text-white">{map.title}</h1>
        <p className="mt-1.5 text-[13px] leading-[1.5]">
          {map.walkTime && <span className="font-semibold text-[#0951fa]">{map.walkTime}</span>}
          {map.walkTime && <span className="text-[#75808d]"> · </span>}
          <span className="text-[#75808d]">{[event.booth, map.area].filter(Boolean).join(" · ")}</span>
        </p>
      </div>

      {/* Full-bleed against the 18px screen padding. The route geometry and the
          dash/pulse animations already exist — reused here, not rewritten. */}
      <div className="relative -mx-[18px] border-y border-white/[0.07] bg-[#0a1626]">
        <img src={map.src} alt={map.alt} className="block w-full" />
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={map.viewBox}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {map.boothMarker && (
            <rect
              x={map.boothMarker.x}
              y={map.boothMarker.y}
              width={map.boothMarker.width}
              height={map.boothMarker.height}
              fill="none"
              stroke="#ff4f00"
              strokeWidth="6"
            />
          )}
          {map.routePath && (
            <>
              <path
                className="event-route-shadow"
                d={map.routePath}
                fill="none"
                stroke="rgba(10,18,30,0.72)"
                strokeWidth={routeWidth}
                strokeLinecap="round"
              />
              <path
                className="event-route-dots"
                d={map.routePath}
                fill="none"
                stroke="#ff4f00"
                strokeWidth={routeWidth}
                strokeLinecap="round"
              />
            </>
          )}
          {map.start && (
            <circle cx={map.start.x} cy={map.start.y} r={radius} fill="#0951fa" stroke="#fff" strokeWidth="7" />
          )}
          {map.destination && (
            <>
              <circle
                className="event-route-pulse"
                cx={map.destination.x}
                cy={map.destination.y}
                r={radius}
                fill="#ff4f00"
              />
              <circle
                cx={map.destination.x}
                cy={map.destination.y}
                r={radius}
                fill="#ff4f00"
                stroke="#fff"
                strokeWidth="7"
              />
            </>
          )}
        </svg>
      </div>

      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2 text-[12px] text-[#93a0b4]">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#0951fa]" />
          Elevators
        </span>
        <span className="flex items-center gap-2 text-[12px] text-[#93a0b4]">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#ff4f00]" />
          {event.booth || "Booth"}
        </span>
      </div>

      {map.description && (
        <p className="text-[13.5px] leading-[1.6] text-[#93a0b4]">{map.description}</p>
      )}

      {event.venueMapUrl && (
        <a
          href={event.venueMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/15 text-[14px] font-semibold text-white"
        >
          Open in Maps
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
