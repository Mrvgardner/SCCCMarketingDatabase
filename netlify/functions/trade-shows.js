import { getStore } from "@netlify/blobs";
import { authenticate } from "../lib/auth.mjs";
import { withCors } from "../lib/http.mjs";
import { clean, validateFlightLeg } from "../lib/travel-input.mjs";
import { validateBriefing } from "../lib/briefing.mjs";
import { tradeShows as seedTradeShows } from "../../src/data/tradeShows.js";

const STORE_NAME = "knowledge-base";
const KEY = "trade-shows.json";
const FUNCTION_VERSION = "team-2026-08-12-v3";

// Kept server-side so employee contact details are never shipped in the public frontend bundle.
const TRAVELER_CONTACTS = {
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
};

const TRAVELER_ALIASES = {
  vic: "vic gardner",
  trip: "trip ochenski iii",
  "trip ochenski": "trip ochenski iii",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
      "X-Trade-Shows-Version": FUNCTION_VERSION,
    },
  });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function enrichTeamContacts(event) {
  const teamContacts = { ...(event.teamContacts || {}) };
  for (const traveler of event.travelingTeam || []) {
    const lookup = String(traveler || "").trim().toLowerCase();
    const known = TRAVELER_CONTACTS[TRAVELER_ALIASES[lookup] || lookup];
    if (!known) continue;
    const current = teamContacts[traveler] || {};
    teamContacts[traveler] = {
      phone: clean(current.phone, 40) || known.phone,
      email: clean(current.email, 160) || known.email,
    };
  }
  return { ...event, teamContacts };
}

// Resolve the signed-in caller to their own name on the traveling team. Travel
// entries must never take the person from the request body: that let anyone
// file flights under a colleague's name, and the ownership check below then
// locked that colleague out of correcting it.
function travelerForEmail(email, travelingTeam) {
  const target = String(email || "").trim().toLowerCase();
  if (!target) return "";
  const canonical = Object.keys(TRAVELER_CONTACTS).find(
    (name) => TRAVELER_CONTACTS[name].email.toLowerCase() === target,
  );
  if (!canonical) return "";
  return (travelingTeam || []).find((name) => {
    const lookup = String(name || "").trim().toLowerCase();
    return (TRAVELER_ALIASES[lookup] || lookup) === canonical;
  }) || "";
}

// Exported so the scheduled reminder function reads events through exactly the
// same merge users see. Without it, reminders run against the raw stored blob
// and miss any schedule change that came from seed data.
export function mergeSeedConfiguration(events) {
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
            // Deliberately NOT `travel` or `teamContacts`. Those hold what the
            // team entered themselves, and resetting them from seed here meant
            // an admin fixing a venue typo and bumping detailsRevision silently
            // erased everyone's saved flights. Travel is owned by the
            // teamRevision branch below, which merges rather than overwrites.
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

// The store holds every event under one key, so a plain read-modify-write loses
// whichever save lands second — two people adding flights at the same time, and
// one of them silently has no flight. Every write is now conditional on the
// ETag that was read, and a clash re-reads and re-applies rather than
// overwriting. `apply` runs against freshly loaded events on each attempt, so
// it must not close over anything read outside the loop.
const MAX_WRITE_ATTEMPTS = 5;

export async function loadEvents(store) {
  const stored = await store.getWithMetadata(KEY, { type: "json" });
  if (stored?.data) {
    return { events: mergeSeedConfiguration(stored.data).map(enrichTeamContacts), etag: stored.etag };
  }

  const seeded = clone(seedTradeShows);
  const written = await store.setJSON(KEY, seeded, { onlyIfNew: true });
  if (written.modified) return { events: seeded.map(enrichTeamContacts), etag: written.etag };

  // Another invocation seeded it first; use theirs.
  const fresh = await store.getWithMetadata(KEY, { type: "json" });
  return { events: mergeSeedConfiguration(fresh?.data || []).map(enrichTeamContacts), etag: fresh?.etag };
}

export async function commit(store, apply) {
  for (let attempt = 1; attempt <= MAX_WRITE_ATTEMPTS; attempt += 1) {
    const { events, etag } = await loadEvents(store);
    const outcome = apply(events);
    if (outcome.error) return json({ error: outcome.error }, outcome.status || 400);

    const written = etag
      ? await store.setJSON(KEY, events, { onlyIfMatch: etag })
      : await store.setJSON(KEY, events, { onlyIfNew: true });
    if (written.modified) return json(outcome.value);
  }

  return json(
    { error: "Too many people are saving at once. Try that again in a moment." },
    409,
  );
}

export default withCors(async (request) => {
  const user = await authenticate(request);
  if (!user) return json({ error: "Unauthorized" }, 401);

  const roles = user.roles || user.appMetadata?.roles || user.app_metadata?.roles || [];
  const isAdmin = roles.some((role) => role.toLowerCase() === "admin");
  const store = getStore({ name: STORE_NAME, consistency: "strong" });

  if (request.method === "GET") {
    const { events } = await loadEvents(store);
    return json(events);
  }

  if (request.method === "POST") {
    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return json({ error: "Invalid request body" }, 400);
    }

    const email = clean(user.email, 160);
    const eventId = clean(payload.eventId, 80);
    const travel = payload.travel;
    if (travel !== undefined && travel !== null && (typeof travel !== "object" || Array.isArray(travel))) {
      return json({ error: "Invalid travel details" }, 400);
    }

    // Validated once, outside the retry loop: it depends only on the request,
    // so a second attempt would reach the same verdict.
    const removing = Boolean(travel?.remove);
    let arrivalFlight;
    let departureFlight;
    let notes;
    if (!removing) {
      const arrival = validateFlightLeg(travel?.arrivalFlight, "Arrival flight");
      if (arrival.error) return json({ error: arrival.error }, 400);
      const departure = validateFlightLeg(travel?.departureFlight, "Departure flight");
      if (departure.error) return json({ error: departure.error }, 400);
      arrivalFlight = arrival.value;
      departureFlight = departure.value;
      notes = clean(travel?.notes, 400, { multiline: true });
    }

    return commit(store, (events) => {
      const eventIndex = events.findIndex((item) => item.id === eventId);
      if (eventIndex === -1) return { error: "Event not found", status: 404 };

      const travelingTeam = events[eventIndex].travelingTeam || [];
      const person = travelerForEmail(email, travelingTeam);
      const currentTravel = events[eventIndex].travel || [];
      const ownedTravel = currentTravel.find((item) => item.email === email);

      if (!removing && !person) {
        return { error: "Your account is not on the traveling team for this event", status: 403 };
      }

      if (removing) {
        const remaining = currentTravel.filter((item) => item.email !== email);
        events[eventIndex].travel = ownedTravel && travelingTeam.some((name) => name.toLowerCase() === ownedTravel.person.toLowerCase())
          ? [...remaining, { person: ownedTravel.person, arrival: "TBD", departure: "TBD", carrier: "Optional", notes: "Flight info not added." }]
          : remaining;
      } else {
        // No "already claimed" guard: `person` is derived from the caller's own
        // email, so the only entries this can overwrite are their own or a
        // stale one filed under their name before that binding existed.
        // Blocking here would lock the rightful owner out of their own row.
        const entry = { person, email, arrivalFlight, departureFlight, notes };
        events[eventIndex].travel = [
          ...currentTravel.filter(
            (item) => item.email !== email && item.person?.toLowerCase() !== person.toLowerCase(),
          ),
          entry,
        ];
      }

      return { value: events[eventIndex].travel };
    });
  }

  // The Booth screen's pinned list. Its own method rather than a full-event PUT:
  // it touches one array, so two admins editing different parts of an event
  // cannot overwrite each other's work.
  if (request.method === "PATCH") {
    if (!isAdmin) return json({ error: "Admin role required" }, 403);

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return json({ error: "Invalid request body" }, 400);
    }

    const eventId = clean(payload.eventId, 80);
    const checked = validateBriefing(payload.briefing);
    if (checked.error) return json({ error: checked.error }, 400);

    return commit(store, (events) => {
      const index = events.findIndex((item) => item.id === eventId);
      if (index === -1) return { error: "Event not found", status: 404 };
      events[index].briefing = checked.value;
      return { value: events[index].briefing };
    });
  }

  if (request.method !== "PUT") return json({ error: "Method not allowed" }, 405);
  if (!isAdmin) return json({ error: "Admin role required" }, 403);

  let event;
  try {
    event = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!event || typeof event !== "object" || Array.isArray(event)) {
    return json({ error: "Invalid event body" }, 400);
  }
  if (typeof event.id !== "string" || !event.id.trim()) return json({ error: "Missing event id" }, 400);

  return commit(store, (events) => {
    const index = events.findIndex((item) => item.id === event.id);
    if (index === -1) return { error: "Event not found", status: 404 };
    events[index] = enrichTeamContacts(event);
    return { value: events[index] };
  });
});
