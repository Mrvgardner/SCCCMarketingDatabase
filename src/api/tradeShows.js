import { tradeShows as seedTradeShows } from "../data/tradeShows";
import { apiUrl } from "./apiBase";

const DEV_KEY = "scc:trade-shows";
const ENDPOINT = apiUrl("/.netlify/functions/trade-shows");
const FLIGHT_LOOKUP_ENDPOINT = import.meta.env.DEV
  ? "http://127.0.0.1:3001/.netlify/functions/flight-lookup"
  : apiUrl("/.netlify/functions/flight-lookup");

// Vite replaces this condition at build time; Rollup removes the directory from production assets.
const DEV_TRAVELER_CONTACTS = import.meta.env.DEV ? {
  "vic gardner": { phone: "(940) 391-5591", email: "vgardner@switchcommerce.com" },
  "susie velasquez": { phone: "(909) 472-5457", email: "scarreto@switchcommerce.com" },
  "paul willingham": { phone: "(214) 394-0947", email: "pwillingham@switchcommerce.com" },
  "michael willis": { phone: "(214) 668-1183", email: "mwillis@switchcommerce.com" },
  "carlos cotto": { phone: "(682) 269-0810", email: "ccotto@switchcommerce.com" },
  "cathy cranford": { phone: "(817) 718-8990", email: "ccranford@switchcommerce.com" },
  "danny estes": { phone: "(214) 504-5182", email: "destes@switchcommerce.com" },
  "masen funderburk": { phone: "(469) 525-5283", email: "mfunderburk@switchcommerce.com" },
  "renee mesecher": { phone: "(214) 717-0278", email: "rrmesecher@switchcommerce.com" },
  "trip ochenski iii": { phone: "(972) 467-5988", email: "tochenski@switchcommerce.com" },
  "hector ortiz-perez": { phone: "(469) 602-2126", email: "hortiz-perez@switchcommerce.com" },
  "kevin watts": { phone: "(469) 323-0779", email: "kwatts@switchcommerce.com" },
} : {};

const DEV_TRAVELER_ALIASES = {
  vic: "vic gardner",
  trip: "trip ochenski iii",
  "trip ochenski": "trip ochenski iii",
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function enrichDevTeamContacts(event) {
  const teamContacts = { ...(event.teamContacts || {}) };
  for (const traveler of event.travelingTeam || []) {
    const lookup = String(traveler || "").trim().toLowerCase();
    const known = DEV_TRAVELER_CONTACTS[DEV_TRAVELER_ALIASES[lookup] || lookup];
    if (!known) continue;
    const current = teamContacts[traveler] || {};
    teamContacts[traveler] = {
      phone: String(current.phone || "").trim() || known.phone,
      email: String(current.email || "").trim() || known.email,
    };
  }
  return { ...event, teamContacts };
}

function mergeSeedConfiguration(events) {
  return events.map((event) => {
    const seed = seedTradeShows.find((item) => item.id === event.id);
    if (!seed) return event;

    const { boothMap: _legacyBoothMap, ...savedEvent } = event;
    const useSeedDetails = (seed.detailsRevision || 0) > (savedEvent.detailsRevision || 0);
    const useSeedSchedule = (seed.scheduleRevision || 0) > (savedEvent.scheduleRevision || 0);
    const useSeedTeam = (seed.teamRevision || 0) > (savedEvent.teamRevision || 0);
    const mergedTeam = useSeedTeam
      ? [...(savedEvent.travelingTeam || [])]
      : [];
    if (useSeedTeam) {
      for (const traveler of seed.travelingTeam || []) {
        if (!mergedTeam.some((name) => name.toLowerCase() === traveler.toLowerCase())) mergedTeam.push(traveler);
      }
    }
    const mergedTravel = useSeedTeam ? clone(savedEvent.travel || []) : [];
    if (useSeedTeam) {
      for (const traveler of mergedTeam) {
        if (mergedTravel.some((entry) => entry.person?.toLowerCase() === traveler.toLowerCase())) continue;
        const seedEntry = (seed.travel || []).find((entry) => entry.person?.toLowerCase() === traveler.toLowerCase());
        mergedTravel.push(seedEntry ? clone(seedEntry) : {
          person: traveler,
          arrival: "TBD",
          departure: "TBD",
          carrier: "Optional",
          notes: "Flight info not added.",
        });
      }
    }
    const savedUpdates = savedEvent.latestUpdates || [];
    const newSeedUpdates = (seed.latestUpdates || []).filter(
      (update) => !savedUpdates.some((savedUpdate) => savedUpdate.id === update.id),
    );
    return {
      ...seed,
      ...savedEvent,
      ...(useSeedDetails
        ? {
            detailsRevision: seed.detailsRevision,
            dates: seed.dates,
            city: seed.city,
            timezone: seed.timezone,
            venue: seed.venue,
            booth: seed.booth,
            boothUrl: seed.boothUrl,
            audience: seed.audience,
            officialUrl: seed.officialUrl,
            venueMapUrl: seed.venueMapUrl,
            hotelMapUrl: seed.hotelMapUrl,
            travelingTeam: clone(seed.travelingTeam || []),
            // Mirrors the server merge in netlify/functions/trade-shows.js —
            // keep the two in step. `travel`/`teamContacts` are team-entered and
            // must not be reset from seed on a details bump; the teamRevision
            // branch below owns them and merges rather than overwrites.
            resources: clone(seed.resources || []),
          }
        : {}),
      ...(useSeedSchedule
        ? {
            expoDates: seed.expoDates,
            schedule: clone(seed.schedule),
            scheduleRevision: seed.scheduleRevision,
          }
        : {}),
      ...(useSeedTeam
        ? {
            teamRevision: seed.teamRevision,
            travelingTeam: mergedTeam,
            teamContacts: { ...(savedEvent.teamContacts || {}) },
            travel: mergedTravel,
          }
        : {}),
      latestUpdates: [...newSeedUpdates, ...savedUpdates],
      floorMap: seed.floorMap || savedEvent.floorMap,
    };
  });
}

function devRead() {
  try {
    const raw = localStorage.getItem(DEV_KEY);
    if (raw) {
      const hydrated = mergeSeedConfiguration(JSON.parse(raw)).map(enrichDevTeamContacts);
      localStorage.setItem(DEV_KEY, JSON.stringify(hydrated));
      return hydrated;
    }
  } catch {}

  const seeded = clone(seedTradeShows).map(enrichDevTeamContacts);
  try {
    localStorage.setItem(DEV_KEY, JSON.stringify(seeded));
  } catch {}
  return seeded;
}

function devWrite(events) {
  try {
    localStorage.setItem(DEV_KEY, JSON.stringify(events));
  } catch {}
}

async function devList() {
  return devRead();
}

async function devUpdate(event) {
  const events = devRead();
  const index = events.findIndex((item) => item.id === event.id);
  if (index === -1) throw new Error("Event not found");
  events[index] = enrichDevTeamContacts(clone(event));
  devWrite(events);
  window.dispatchEvent(new CustomEvent("trade-shows:updated", { detail: event.id }));
  return events[index];
}

async function devUpdateMyTravel(eventId, travel, user) {
  const events = devRead();
  const index = events.findIndex((item) => item.id === eventId);
  if (index === -1) throw new Error("Event not found");

  const email = user?.email || "dev@localhost";
  const person = String(travel.person || "").trim();
  const travelingTeam = events[index].travelingTeam || [];
  const currentTravel = events[index].travel || [];
  const ownedTravel = currentTravel.find((item) => item.email === email);

  if (!travel.remove && !travelingTeam.some((name) => name.toLowerCase() === person.toLowerCase())) {
    throw new Error("Select a name from the traveling team.");
  }

  if (travel.remove) {
    const remaining = currentTravel.filter((item) => item.email !== email);
    events[index].travel = ownedTravel && travelingTeam.some((name) => name.toLowerCase() === ownedTravel.person.toLowerCase())
      ? [...remaining, { person: ownedTravel.person, arrival: "TBD", departure: "TBD", carrier: "Optional", notes: "Flight info not added." }]
      : remaining;
  } else {
    const claimedByAnother = currentTravel.some(
      (item) => item.person?.toLowerCase() === person.toLowerCase() && item.email && item.email !== email,
    );
    if (claimedByAnother) throw new Error(`${person} has already added flight information.`);

    const entry = { person, email, ...clone(travel) };
    events[index].travel = [
      ...currentTravel.filter(
        (item) => item.email !== email && !(item.person?.toLowerCase() === person.toLowerCase() && !item.email),
      ),
      entry,
    ];
  }

  devWrite(events);
  return events[index].travel;
}

async function authHeaders() {
  const user = window.netlifyIdentity?.currentUser();
  if (!user) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${await user.jwt()}` };
}

async function prodRequest(method, body) {
  const options = { method, headers: await authHeaders() };
  if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(ENDPOINT, options);
  if (!response.ok) {
    // The server explains refusals in plain language — "use a three-letter
    // airport code", "too many people are saving at once". Show that, and fall
    // back to the raw status only when there is nothing to show.
    const body = await response.text().catch(() => "");
    let message = "";
    try {
      message = JSON.parse(body)?.error || "";
    } catch { /* not JSON */ }
    throw new Error(message || `Request failed (${response.status}).`);
  }
  return response.json();
}

const useDev = import.meta.env.DEV;

export const listTradeShows = useDev ? devList : () => prodRequest("GET");
export const updateTradeShow = useDev ? devUpdate : (event) => prodRequest("PUT", event);
export async function updateMyTravel(eventId, travel, user) {
  const result = useDev
    ? await devUpdateMyTravel(eventId, travel, user)
    : await prodRequest("POST", { eventId, travel });
  window.dispatchEvent(new CustomEvent("trade-shows:updated", { detail: eventId }));
  return result;
}

export async function lookupFlight({ flightNumber, date, direction, eventAirport }) {
  const headers = useDev ? {} : await authHeaders();
  headers["Content-Type"] = "application/json";
  const response = await fetch(FLIGHT_LOOKUP_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ flightNumber, date, direction, eventAirport }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Could not look up that flight.");
  return payload;
}
