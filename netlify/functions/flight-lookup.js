import { getStore } from "@netlify/blobs";
import { authenticate } from "../lib/auth.mjs";

const RAPID_API_HOST = "aerodatabox.p.rapidapi.com";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function json(body, status = 200) {
  const developmentHeaders = process.env.CONTEXT === "dev"
    ? {
        "Access-Control-Allow-Origin": "http://127.0.0.1:3000",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      }
    : {};
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
      ...developmentHeaders,
    },
  });
}

function localDateTime(value) {
  const match = String(value || "").match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/);
  return match ? { date: match[1], time: match[2] } : { date: "", time: "" };
}

function airportDetails(airport, movement) {
  const scheduled = localDateTime(movement?.scheduledTime?.local);
  return {
    iata: airport?.iata || "",
    name: airport?.name || airport?.shortName || "",
    date: scheduled.date,
    time: scheduled.time,
    terminal: movement?.terminal || "",
    gate: movement?.gate || "",
  };
}

function normalizeFlight(flight, index) {
  const departure = airportDetails(flight.departure?.airport, flight.departure);
  const arrival = airportDetails(flight.arrival?.airport, flight.arrival);
  const number = flight.number || flight.callSign || "";
  return {
    id: `${number}-${departure.date}-${departure.time}-${arrival.iata}-${index}`,
    flightNumber: number,
    airline: flight.airline?.name || flight.airline?.iata || flight.airline?.icao || "",
    status: flight.status || "Scheduled",
    departure,
    arrival,
  };
}

export default async (request) => {
  if (request.method === "OPTIONS" && process.env.CONTEXT === "dev") return json({}, 204);
  const user = await authenticate(request);
  if (!user && process.env.CONTEXT !== "dev") return json({ error: "Unauthorized" }, 401);
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const flightNumber = String(body?.flightNumber || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const date = String(body?.date || "");
  const direction = body?.direction === "departure" ? "departure" : "arrival";
  const eventAirport = String(body?.eventAirport || "LAS").toUpperCase().replace(/[^A-Z]/g, "");

  if (!/^[A-Z0-9]{3,8}$/.test(flightNumber)) return json({ error: "Enter a valid flight number, such as AA1234" }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: "Choose the flight date" }, 400);
  // Bound the date to a sane travel window. The cache key includes it, so an
  // unbounded date let one caller mint unlimited cache misses and burn a billed
  // API call per request.
  const dateMs = Date.parse(`${date}T00:00:00Z`);
  const nowMs = Date.now();
  if (!Number.isFinite(dateMs) || Math.abs(dateMs - nowMs) > 400 * 24 * 60 * 60 * 1000) {
    return json({ error: "Choose a flight date within the next year" }, 400);
  }
  if (!/^[A-Z]{3}$/.test(eventAirport)) return json({ error: "Invalid event airport" }, 400);

  const apiKey = process.env.AERODATABOX_API_KEY;
  if (!apiKey) return json({ error: "Flight lookup is not configured" }, 503);

  const cache = getStore({ name: "flight-lookups", consistency: "strong" });
  const cacheKey = `${flightNumber}-${date}-${direction}-${eventAirport}.json`;
  const cached = await cache.get(cacheKey, { type: "json" });
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) return json(cached.payload);

  const url = new URL(`https://${RAPID_API_HOST}/flights/number/${encodeURIComponent(flightNumber)}/${date}`);
  url.searchParams.set("dateLocalRole", "Both");
  url.searchParams.set("withAircraftImage", "false");
  url.searchParams.set("withLocation", "false");
  url.searchParams.set("withFlightPlan", "false");

  let response;
  try {
    response = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": RAPID_API_HOST,
      },
    });
  } catch {
    return json({ error: "The flight service could not be reached" }, 502);
  }

  if (response.status === 204) {
    // Cache the empty result too. Not-yet-scheduled flights are the normal case
    // when someone books months ahead, and skipping the write meant every retry
    // hit the metered API again.
    const emptyPayload = { flights: [], source: "AeroDataBox" };
    await cache.setJSON(cacheKey, { cachedAt: Date.now(), payload: emptyPayload });
    return json(emptyPayload);
  }
  if (!response.ok) {
    const providerMessage = await response.text().catch(() => "");
    console.error("AeroDataBox lookup failed", response.status, providerMessage.slice(0, 500));
    return json({ error: "Flight lookup is temporarily unavailable" }, 502);
  }

  let rawFlights;
  try {
    rawFlights = await response.json();
  } catch {
    // A 200 carrying a non-JSON body (a provider HTML error page) would
    // otherwise throw straight past the 502 handling directly above.
    return json({ error: "Flight lookup is temporarily unavailable" }, 502);
  }
  const allFlights = Array.isArray(rawFlights) ? rawFlights.map(normalizeFlight) : [];
  const matchingFlights = allFlights.filter((flight) => (
    direction === "arrival"
      ? flight.arrival.iata === eventAirport
      : flight.departure.iata === eventAirport
  ));
  const payload = {
    flights: matchingFlights.length ? matchingFlights : allFlights,
    exactEventAirportMatch: matchingFlights.length > 0,
    source: "AeroDataBox",
  };

  await cache.setJSON(cacheKey, { cachedAt: Date.now(), payload });
  return json(payload);
};
