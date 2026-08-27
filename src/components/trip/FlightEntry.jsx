import { useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { lookupFlight, updateMyTravel } from "../../api/tradeShows";

// Flight entry, in the tab where flights live.
//
// The retired event hub carried this inside its Team section. The trip design
// kept pointing "Look up flight" at that hub, which now redirects to Today —
// so the button bounced away from the form instead of opening it, and there
// was no way to add a flight at all. This is that capability, rebuilt where the
// design puts it, on the same lookup and save calls the hub used.

const emptyLeg = { airline: "", flightNumber: "", airport: "", date: "", time: "" };

const fieldClass = "mt-1 min-h-[44px] w-full rounded-xl border border-white/10 bg-gray-950/55 px-3 text-white";
const labelClass = "block text-[13px] font-semibold text-[#93a0b4]";

function LegFields({ title, description, leg, onChange, eventAirport, direction, onLookup, looking }) {
  const set = (key, value) => onChange({ ...leg, [key]: value });

  return (
    <fieldset className="border-t border-white/[0.07] pt-4">
      <legend className="flex items-center gap-2 pr-3 text-[14.5px] font-semibold text-white">
        <PaperAirplaneIcon className="h-4 w-4 text-[#0951fa]" /> {title}
      </legend>
      <p className="mt-1 text-[12.5px] leading-[1.5] text-[#75808d]">{description}</p>

      <div className="mt-3 space-y-2.5">
        <label className={labelClass}>
          Flight number
          <input
            value={leg.flightNumber}
            onChange={(event) => set("flightNumber", event.target.value.toUpperCase())}
            placeholder="AA 1234"
            autoCapitalize="characters"
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Flight date
          <input type="date" value={leg.date} onChange={(event) => set("date", event.target.value)} className={fieldClass} />
        </label>
        <button
          type="button"
          disabled={looking || !leg.flightNumber || !leg.date}
          onClick={() => onLookup(direction)}
          className="min-h-[48px] w-full rounded-xl bg-[#0951fa] text-[14px] font-semibold text-white disabled:opacity-45"
        >
          {looking ? "Looking up…" : "Find flight"}
        </button>

        {/* Lookup fills these in, but they stay editable: the provider does not
            have every charter and codeshare, and a hand-entered flight is
            better than none. */}
        <div className="grid grid-cols-2 gap-2.5">
          <label className={labelClass}>
            Airline
            <input value={leg.airline} onChange={(event) => set("airline", event.target.value)} className={fieldClass} />
          </label>
          <label className={labelClass}>
            {direction === "arrival" ? "Flying from" : "Flying to"}
            <input
              value={leg.airport}
              onChange={(event) => set("airport", event.target.value.toUpperCase())}
              maxLength={3}
              placeholder={direction === "arrival" ? "DFW" : eventAirport}
              className={fieldClass}
            />
          </label>
        </div>
        <label className={labelClass}>
          {direction === "arrival" ? "Lands at" : "Departs at"}
          <input type="time" value={leg.time} onChange={(event) => set("time", event.target.value)} className={fieldClass} />
        </label>
      </div>
    </fieldset>
  );
}

export default function FlightEntry({ event, user, myName, myTravel, onDone }) {
  const eventAirport = event.airportCode || "LAS";
  const [arrival, setArrival] = useState({ ...emptyLeg, ...myTravel?.arrivalFlight });
  const [departure, setDeparture] = useState({ ...emptyLeg, ...myTravel?.departureFlight });
  const [notes, setNotes] = useState(myTravel?.notes || "");
  const [looking, setLooking] = useState("");
  const [choices, setChoices] = useState([]);
  const [choiceFor, setChoiceFor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // The provider returns both ends of the flight. The date and time that matter
  // to the team are the ones at the event's end — when you land, or when you
  // leave — while the airport worth showing is the other end, since the event
  // airport is already implied.
  const applyFlight = (flight, direction) => {
    const eventEnd = direction === "arrival" ? flight.arrival : flight.departure;
    const otherEnd = direction === "arrival" ? flight.departure : flight.arrival;
    const leg = {
      airline: flight.airline || "",
      flightNumber: flight.flightNumber || "",
      airport: otherEnd?.iata || "",
      date: eventEnd?.date || "",
      time: eventEnd?.time || "",
    };
    if (direction === "arrival") setArrival(leg);
    else setDeparture(leg);
    setChoices([]);
    setChoiceFor(null);
    setError("");
    setMessage(`${flight.flightNumber} added. Check the details, then save.`);
  };

  const find = async (direction) => {
    const leg = direction === "arrival" ? arrival : departure;
    setLooking(direction);
    setError("");
    setMessage("");
    setChoices([]);
    setChoiceFor(direction);
    try {
      const lookup = await lookupFlight({
        flightNumber: leg.flightNumber,
        date: leg.date,
        direction,
        eventAirport,
      });
      if (!lookup.flights?.length) {
        setError("No matching flight found. Check the number and date, or fill it in by hand below.");
      } else if (lookup.flights.length === 1) {
        applyFlight(lookup.flights[0], direction);
      } else {
        setChoices(lookup.flights);
        setMessage("Choose the itinerary that matches your reservation.");
      }
    } catch (lookupError) {
      setError(lookupError.message || "Could not look up that flight.");
    } finally {
      setLooking("");
    }
  };

  const save = async (submitEvent) => {
    submitEvent.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      // `person` is ignored by the server, which derives the traveler from the
      // caller's own email. It is sent to keep the payload shape the dev store
      // and the function agree on.
      await updateMyTravel(
        event.id,
        { person: myName, arrivalFlight: arrival, departureFlight: departure, notes },
        user,
      );
      onDone?.();
    } catch (saveError) {
      setError(saveError.message || "Could not save your flight information.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await updateMyTravel(event.id, { remove: true }, user);
      onDone?.();
    } catch (removeError) {
      setError(removeError.message || "Could not remove your flight information.");
    } finally {
      setSaving(false);
    }
  };

  // Mirrors the server's own guard: it files travel under the email that signed
  // in, so someone off the roster has nothing to file under.
  if (!myName) {
    return (
      <p className="text-[12.5px] leading-[1.5] text-[#f59e0b]">
        Flight information is filed against your sign-in email, and yours is not on this event's
        traveling team. Ask Vic or Trip to add you, then come back.
      </p>
    );
  }

  const hasSaved = Boolean(myTravel?.arrivalFlight?.flightNumber || myTravel?.departureFlight?.flightNumber);

  return (
    <form onSubmit={save} className="space-y-4">
      <div>
        <span className="font-switch-reg text-[10px] uppercase tracking-[0.16em] text-[#75808d]">Your name</span>
        <p className="mt-1 flex min-h-[44px] items-center rounded-xl border border-white/10 bg-white/[0.04] px-3 text-[15px] font-semibold text-white">
          {myName}
        </p>
        <p className="mt-1.5 text-[11.5px] leading-[1.5] text-[#75808d]">
          Taken from your sign-in. Flights always save under your own name.
        </p>
      </div>

      <LegFields
        title="Arrival flight"
        description={`The flight bringing you to ${event.city?.split(",")[0] || "the show"}.`}
        leg={arrival}
        onChange={setArrival}
        eventAirport={eventAirport}
        direction="arrival"
        onLookup={find}
        looking={looking === "arrival"}
      />

      <LegFields
        title="Departure flight"
        description="The flight taking you home."
        leg={departure}
        onChange={setDeparture}
        eventAirport={eventAirport}
        direction="departure"
        onLookup={find}
        looking={looking === "departure"}
      />

      {choices.length > 0 && (
        <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.04] p-3">
          {choices.map((flight) => (
            <button
              key={flight.id}
              type="button"
              onClick={() => applyFlight(flight, choiceFor)}
              className="block min-h-[44px] w-full rounded-lg border border-white/10 px-3 py-2 text-left text-[13px] text-white"
            >
              <span className="font-semibold">{flight.flightNumber}</span>{" "}
              <span className="text-[#93a0b4]">
                {flight.departure?.iata} {flight.departure?.time} → {flight.arrival?.iata} {flight.arrival?.time}
              </span>
            </button>
          ))}
        </div>
      )}

      <label className={labelClass}>
        Notes
        <textarea
          rows={2}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Sharing a ride, arriving early, anything useful."
          className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-gray-950/55 px-3 py-2 text-white"
        />
      </label>

      {message && <p role="status" className="text-[12.5px] font-semibold text-[#10b981]">{message}</p>}
      {error && <p role="alert" className="text-[12.5px] font-semibold text-[#ef4444]">{error}</p>}

      <div className="flex gap-2.5">
        <button
          type="submit"
          disabled={saving}
          className="min-h-[52px] flex-1 rounded-2xl bg-[#0951fa] text-[15px] font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save flight info"}
        </button>
        {hasSaved && (
          <button
            type="button"
            disabled={saving}
            onClick={remove}
            className="min-h-[52px] rounded-2xl border border-white/15 px-4 text-[14px] font-semibold text-[#93a0b4] disabled:opacity-50"
          >
            Remove
          </button>
        )}
      </div>
    </form>
  );
}
