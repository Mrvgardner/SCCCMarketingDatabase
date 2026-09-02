import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { formatFlightRoute, formatFlightWhen, hasFlight } from "../../utils/flight";

// One person's flights, for an admin who needs to know when the team lands.
//
// Deliberately reads as a boarding pass rather than a form: flight number
// first, because that is what gets said out loud, then the route, then when.

function Leg({ label, leg, direction, eventAirport }) {
  const route = formatFlightRoute(leg, direction, eventAirport);
  const when = formatFlightWhen(leg);

  return (
    <div className="flex gap-3">
      <span className="font-switch-reg w-[52px] shrink-0 pt-[3px] text-[10px] uppercase leading-none tracking-[0.14em] text-[#75808d]">
        {label}
      </span>
      {hasFlight(leg) ? (
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-semibold leading-[1.3] text-white">
            {leg.flightNumber}
            {route && <span className="font-normal text-[#93a0b4]">{`  ${route}`}</span>}
          </p>
          {/* A flight number entered by hand carries no time until someone runs
              the lookup. An admin reading this is usually chasing exactly that
              gap, so name it rather than quietly showing a date alone. */}
          <p className="mt-0.5 text-[12px] leading-[1.35] text-[#93a0b4]">
            {when || <span className="text-[#f59e0b]">Date and time not recorded</span>}
            {when && !leg.time && <span className="text-[#f59e0b]"> · time TBC</span>}
          </p>
        </div>
      ) : (
        <p className="flex-1 text-[12.5px] leading-[1.35] text-[#75808d]">Not recorded yet</p>
      )}
    </div>
  );
}

export default function TeamItinerary({ row, eventAirport }) {
  const noneAtAll = !hasFlight(row?.arrivalFlight) && !hasFlight(row?.departureFlight);

  if (noneAtAll) {
    return (
      <div className="mb-2.5 flex gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
        <PaperAirplaneIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-[#75808d]" />
        <p className="text-[12.5px] leading-[1.4] text-[#93a0b4]">
          No flights added yet. They add their own from Your Trip.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-2.5 space-y-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
      <Leg label="Arrives" leg={row?.arrivalFlight} direction="arrival" eventAirport={eventAirport} />
      <Leg label="Departs" leg={row?.departureFlight} direction="departure" eventAirport={eventAirport} />
      {row?.notes && (
        <p className="whitespace-pre-line border-t border-white/[0.07] pt-2 text-[12px] leading-[1.45] text-[#75808d]">
          {row.notes}
        </p>
      )}
    </div>
  );
}
