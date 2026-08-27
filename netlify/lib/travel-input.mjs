// Validation for the travel details a traveler submits.
//
// A blank field means "not filled in yet" and is always allowed — the form is
// meant to be completed in stages. A field with something in it has to be the
// shape it claims to be: the alternative is storing "not-a-date" and finding
// out about it when the flight monitor tries to read it hours later.

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const CLOCK_TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const IATA_CODE = /^[A-Z]{3}$/;
const FLIGHT_NUMBER = /^[A-Z0-9]{2,8}$/;

// Control characters are replaced rather than dropped, so "AA\u00001234" cannot
// be smuggled through as "AA1234". Newlines and tabs survive only where the
// field is genuinely multi-line.
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
const CONTROL_CHARS_KEEPING_BREAKS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

// Only strings and numbers become text. Anything else — an object, an array, a
// boolean — used to arrive as "[object Object]" or "true" and be stored as if
// it were a real value.
export function clean(value, maxLength = 240, { multiline = false } = {}) {
  if (typeof value !== "string" && typeof value !== "number") return "";
  const control = multiline ? CONTROL_CHARS_KEEPING_BREAKS : CONTROL_CHARS;
  return String(value).replace(control, " ").trim().slice(0, maxLength);
}

export function validateFlightLeg(leg, label) {
  if (leg !== undefined && leg !== null && (typeof leg !== "object" || Array.isArray(leg))) {
    return { error: `${label}: unexpected format.` };
  }

  const airline = clean(leg?.airline, 80);
  // Matches the normalisation in flight-lookup.js, so "AA 1234" and "AA-1234"
  // are stored the same way they are looked up.
  const flightNumber = clean(leg?.flightNumber, 20).toUpperCase().replace(/[^A-Z0-9]/g, "");
  const airport = clean(leg?.airport, 8).toUpperCase();
  const date = clean(leg?.date, 10);
  const time = clean(leg?.time, 5);

  if (flightNumber && !FLIGHT_NUMBER.test(flightNumber)) {
    return { error: `${label}: enter a flight number such as AA1234.` };
  }
  if (airport && !IATA_CODE.test(airport)) {
    return { error: `${label}: use a three-letter airport code, or leave it blank.` };
  }
  if (date && (!ISO_DATE.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`)))) {
    return { error: `${label}: choose a valid date.` };
  }
  if (time && !CLOCK_TIME.test(time)) {
    return { error: `${label}: enter the time as HH:MM.` };
  }

  return { value: { airline, flightNumber, airport, date, time } };
}
