import { getStore } from "@netlify/blobs";
import { getUser } from "@netlify/identity";
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

function clean(value, maxLength = 240) {
  return String(value || "").trim().slice(0, maxLength);
}

function cleanFlightLeg(leg) {
  return {
    airline: clean(leg?.airline, 80),
    flightNumber: clean(leg?.flightNumber, 20),
    airport: clean(leg?.airport, 3).toUpperCase(),
    date: clean(leg?.date, 10),
    time: clean(leg?.time, 5),
  };
}

export default async (request) => {
  const user = await getUser();
  if (!user) return json({ error: "Unauthorized" }, 401);

  const roles = user.roles || user.appMetadata?.roles || user.app_metadata?.roles || [];
  const isAdmin = roles.some((role) => role.toLowerCase() === "admin");
  const store = getStore({ name: STORE_NAME, consistency: "strong" });

  let events = await store.get(KEY, { type: "json" });
  if (!events) {
    events = clone(seedTradeShows);
    await store.setJSON(KEY, events);
  } else {
    events = mergeSeedConfiguration(events);
  }
  events = events.map(enrichTeamContacts);

  if (request.method === "GET") return json(events);

  if (request.method === "POST") {
    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const eventIndex = events.findIndex((item) => item.id === payload?.eventId);
    if (eventIndex === -1) return json({ error: "Event not found" }, 404);

    const email = clean(user.email, 160);
    const travelingTeam = events[eventIndex].travelingTeam || [];
    const person = travelerForEmail(email, travelingTeam);
    const currentTravel = events[eventIndex].travel || [];
    const ownedTravel = currentTravel.find((item) => item.email === email);

    if (!payload.travel?.remove && !person) {
      return json({ error: "Your account is not on the traveling team for this event" }, 403);
    }

    if (payload.travel?.remove) {
      const remaining = currentTravel.filter((item) => item.email !== email);
      events[eventIndex].travel = ownedTravel && travelingTeam.some((name) => name.toLowerCase() === ownedTravel.person.toLowerCase())
        ? [...remaining, { person: ownedTravel.person, arrival: "TBD", departure: "TBD", carrier: "Optional", notes: "Flight info not added." }]
        : remaining;
    } else {
      // No "already claimed" guard: `person` is now derived from the caller's
      // own email, so the only entries this can overwrite are their own or a
      // stale one filed under their name before that binding existed. Blocking
      // here would lock the rightful owner out of their own row.
      const entry = {
        person,
        email,
        arrivalFlight: cleanFlightLeg(payload.travel?.arrivalFlight),
        departureFlight: cleanFlightLeg(payload.travel?.departureFlight),
        notes: clean(payload.travel?.notes, 400),
      };
      events[eventIndex].travel = [
        ...currentTravel.filter(
          (item) => item.email !== email && item.person?.toLowerCase() !== person.toLowerCase(),
        ),
        entry,
      ];
    }

    await store.setJSON(KEY, events);
    return json(events[eventIndex].travel);
  }

  if (request.method !== "PUT") return json({ error: "Method not allowed" }, 405);
  if (!isAdmin) return json({ error: "Admin role required" }, 403);

  let event;
  try {
    event = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!event?.id) return json({ error: "Missing event id" }, 400);
  const index = events.findIndex((item) => item.id === event.id);
  if (index === -1) return json({ error: "Event not found" }, 404);

  events[index] = enrichTeamContacts(event);
  await store.setJSON(KEY, events);
  return json(events[index]);
};
