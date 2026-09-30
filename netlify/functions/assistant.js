import { getStore } from "@netlify/blobs";
import OpenAI from "openai";
import { authenticate } from "../lib/auth.mjs";
import { withCors } from "../lib/http.mjs";
import { clean } from "../lib/travel-input.mjs";
import { loadEvents } from "./trade-shows.js";
import seedProducts from "./products-seed.json";
import { currentCollateral } from "../../src/data/collateral.js";

// The site's assistant: one place to ask anything the site already knows.
//
// "What do I hand out for TMS?", "When does Susie land?", "What do my receipts
// total?" — each of those has an answer on some screen. This gathers the
// screens' data into one briefing, hands it to the model with the question,
// and returns the answer.
//
// It runs as the signed-in person. Everything the model can see is what that
// person could see in the app: their own receipts (everyone's, for an admin),
// the team's flights and phones, the show's schedule and pins. Emergency
// contacts are never included, and a hand-off card contributes its
// instruction, not the detail it withholds. The model gets no tools and no
// other source, so it cannot reach past that.
//
// No tool-calling loop: the whole briefing fits in one request, which keeps a
// question to one billed call and one round trip.

const KNOWLEDGE_STORE = "knowledge-base";
const PRODUCTS_KEY = "products.json";
const RECEIPT_STORE = "trade-show-receipts";
const FLIGHT_STATE_STORE = "flight-monitor";
const USAGE_STORE = "assistant";

const ASSISTANT_MODEL = process.env.ASSISTANT_MODEL || "gpt-5.6-luna";
const DAILY_LIMIT = Number(process.env.ASSISTANT_DAILY_LIMIT || 150);
const HISTORY_LIMIT = 12;
const MESSAGE_MAX = 2000;

const ANSWER_SCHEMA = {
  name: "assistant_answer",
  strict: true,
  schema: {
    type: "object",
    properties: {
      answer: {
        type: "string",
        description: "The reply, in plain text. Short paragraphs; a line per item for lists. No markdown.",
      },
      followUps: {
        type: "array",
        description: "Up to two short questions the person might ask next, answerable from the briefing. Empty if none are natural.",
        items: { type: "string" },
      },
    },
    required: ["answer", "followUps"],
    additionalProperties: false,
  },
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
  });
}

function client() {
  const apiKey = process.env.NETLIFY_AI_GATEWAY_KEY;
  const baseURL = process.env.NETLIFY_AI_GATEWAY_BASE_URL;
  return apiKey && baseURL ? new OpenAI({ apiKey, baseURL }) : new OpenAI();
}

function userKey(email) {
  return Buffer.from(String(email).toLowerCase()).toString("base64url");
}

async function withinBudget(store, email) {
  const day = new Date().toISOString().slice(0, 10);
  const key = `usage/${userKey(email)}/${day}.json`;
  const used = (await store.get(key, { type: "json" }))?.count || 0;
  if (used >= DAILY_LIMIT) return false;
  await store.setJSON(key, { count: used + 1 });
  return true;
}

// Card text is stored as HTML for the knowledge base page; the model wants
// the words.
function text(html, max = 1200) {
  return String(html || "")
    .replace(/<\/(p|li|h\d|div|br)>/gi, "\n")
    .replace(/<li>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

// A hand-off card tells the rep what to say and who to walk the customer to.
// That is all of it the assistant gets, so the detail cannot leak through a
// differently worded question.
export function productBriefing(product) {
  const handoff = product.handoff;
  if (handoff?.people?.length && handoff.hideDetails !== false) {
    return {
      title: product.title,
      company: product.company,
      handOffOnly: true,
      instruction:
        `Reps do not explain this topic. Only ${handoff.people.join(", ")} speak to it. ` +
        `Open with: "${handoff.line}" and walk the customer to one of them.` +
        (handoff.note ? ` ${handoff.note}` : ""),
    };
  }
  return {
    title: product.title,
    company: product.company,
    type: product.type,
    alsoCalled: product._synonymsTitle || "",
    opener: text(product.problem, 300),
    talkingPoint: text(product.plan, 400),
    detail: text(product.description, 1200),
    whoItIsFor: text(product.useCases, 300),
    ask: text(product.cta, 200),
  };
}

// The show as the team sees it. Hotel confirmation numbers and travelers'
// emails are left out: nobody needs them read aloud at a booth.
export function eventBriefing(event, flightStates) {
  const legStatus = (entry, direction) => {
    const leg = entry[direction];
    if (!leg?.flightNumber || !entry.email) return undefined;
    const flightNumber = String(leg.flightNumber).toUpperCase().replace(/[^A-Z0-9]/g, "");
    const dir = direction === "arrivalFlight" ? "arrival" : "departure";
    const state = flightStates[`${event.id}|${entry.email}|${dir}|${flightNumber}|${leg.date}`];
    if (!state?.snapshot) return undefined;
    const snap = state.snapshot;
    return {
      status: snap.status,
      departs: snap.departure?.revised || snap.departure?.scheduled || "",
      arrives: snap.arrival?.revised || snap.arrival?.scheduled || "",
      gate: snap.arrival?.gate || snap.departure?.gate || "",
      checkedAt: state.checkedAt,
    };
  };

  const flight = (leg) =>
    leg?.flightNumber
      ? {
          flight: leg.flightNumber,
          airline: leg.airline || "",
          date: leg.date || "",
          // The time a traveler types is the time at the show's airport:
          // arrival time for the flight in, departure time for the flight out.
          time: leg.time || "",
          airport: leg.airport || "",
        }
      : undefined;

  return {
    id: event.id,
    name: event.name,
    shortName: event.shortName,
    dates: event.dates,
    expoDates: event.expoDates,
    city: event.city,
    venue: event.venue,
    booth: event.booth,
    timezone: event.timezone,
    airport: event.airportCode,
    status: event.status,
    hotel: event.hotel
      ? { name: event.hotel.name, address: event.hotel.address, checkIn: event.hotel.checkIn, checkOut: event.hotel.checkOut, notes: event.hotel.notes }
      : undefined,
    travelingTeam: event.travelingTeam || [],
    teamPhones: Object.fromEntries(
      Object.entries(event.teamContacts || {}).map(([name, contact]) => [name, contact?.phone || ""]),
    ),
    travel: (event.travel || []).map((entry) => ({
      person: entry.person,
      arrivalFlight: flight(entry.arrivalFlight),
      arrivalLiveStatus: legStatus(entry, "arrivalFlight"),
      departureFlight: flight(entry.departureFlight),
      departureLiveStatus: legStatus(entry, "departureFlight"),
      notes: entry.notes || "",
      // Older rows written before flights were structured.
      arrival: entry.arrivalFlight ? undefined : entry.arrival,
      departure: entry.departureFlight ? undefined : entry.departure,
    })),
    schedule: (event.schedule || []).map((day) => ({
      day: day.day,
      date: day.date,
      dressCode: day.dressCode,
      items: (day.items || []).map((item) => ({
        time: item.time, title: item.title, location: item.location, owner: item.owner, notes: item.notes,
      })),
    })),
    knowThisCold: (event.briefing || []).map((item) => (item.kind === "file" ? `Document: ${item.fileName}` : item.text)),
    latestUpdates: (event.latestUpdates || []).slice(-10),
    resources: (event.resources || []).map((r) => ({ title: r.title, description: r.description, url: r.url || "" })),
  };
}

// Totals are computed here, not by the model. It reads a number; it does not
// add a column.
export function summarizeReceipts(receipts) {
  const cents = (value) => Math.round(Number(value || 0) * 100);
  const sum = (items) => items.reduce((acc, r) => acc + cents(r.total), 0) / 100;
  const byCategory = {};
  for (const r of receipts) {
    const category = r.category || "Other";
    byCategory[category] = ((byCategory[category] || 0) * 100 + cents(r.total)) / 100;
  }
  return {
    count: receipts.length,
    total: sum(receipts),
    confirmed: receipts.filter((r) => r.confirmed).length,
    needingReview: receipts.filter((r) => !r.confirmed).length,
    byCategory,
  };
}

async function receiptBriefing(store, events, user, isAdmin) {
  const own = [];
  for (const event of events) {
    const receipts = (await store.get(`reports/${event.id}/${userKey(user.email)}/index.json`, { type: "json" })) || [];
    if (!receipts.length) continue;
    own.push({
      event: event.shortName || event.name,
      ...summarizeReceipts(receipts),
      receipts: receipts.map((r) => ({
        date: r.date, merchant: r.merchant, category: r.category, total: r.total, currency: r.currency,
        confirmed: r.confirmed, purpose: r.businessPurpose || "", notes: r.notes || "",
      })),
    });
  }

  if (!isAdmin) return { mine: own };

  // An admin sees the team's totals, by person, the way the expense report
  // does. Names come from the travel rows; an email nobody has claimed a row
  // for is shown as is.
  const team = [];
  const { blobs } = await store.list({ prefix: "reports/" });
  const indexes = blobs.filter((blob) => blob.key.endsWith("/index.json"));
  for (const blob of indexes) {
    const [, eventId] = blob.key.split("/");
    const receipts = (await store.get(blob.key, { type: "json" })) || [];
    if (!receipts.length) continue;
    const email = receipts[0].userEmail || "";
    const event = events.find((item) => item.id === eventId);
    const person = event?.travel?.find((entry) => entry.email && entry.email.toLowerCase() === email.toLowerCase())?.person || email;
    team.push({ event: event?.shortName || eventId, person, ...summarizeReceipts(receipts) });
  }
  return { mine: own, team };
}

function localNow(timeZone) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone, weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short",
    }).format(new Date());
  } catch {
    return new Date().toISOString();
  }
}

export default withCors(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const user = await authenticate(request);
  if (!user?.email) return json({ error: "Unauthorized" }, 401);
  const roles = user.roles || user.app_metadata?.roles || [];
  const isAdmin = roles.some((role) => String(role).toLowerCase() === "admin");

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const history = (Array.isArray(body?.messages) ? body.messages : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-HISTORY_LIMIT)
    .map((m) => ({ role: m.role, content: clean(m.content, MESSAGE_MAX, { multiline: true }) }))
    .filter((m) => m.content);
  if (!history.length || history[history.length - 1].role !== "user") {
    return json({ error: "Ask a question." }, 400);
  }
  const eventId = clean(body?.eventId, 80);

  const usage = getStore({ name: USAGE_STORE, consistency: "strong" });
  if (!(await withinBudget(usage, user.email))) {
    return json({ error: "The assistant has hit today's limit for your account. Try again tomorrow." }, 429);
  }

  const [products, { events }, flightState] = await Promise.all([
    getStore(KNOWLEDGE_STORE).get(PRODUCTS_KEY, { type: "json" }).then((live) => (live?.length ? live : seedProducts)),
    loadEvents(getStore({ name: KNOWLEDGE_STORE, consistency: "strong" })),
    getStore({ name: FLIGHT_STATE_STORE, consistency: "strong" }).get("legs.json", { type: "json" }).then((s) => s || {}),
  ]);

  // The show the person is looking at comes first, so "the schedule" and
  // "the booth" resolve to it without their saying which one.
  const ordered = [...events].sort((a, b) => (a.id === eventId ? -1 : b.id === eventId ? 1 : 0));
  const current = ordered.find((event) => event.id === eventId) || ordered[0];

  const receipts = await receiptBriefing(getStore({ name: RECEIPT_STORE, consistency: "strong" }), events, user, isAdmin);

  const me = user.user_metadata?.full_name || user.email;
  const briefing = {
    now: localNow(current?.timezone || "America/Chicago"),
    askedBy: { name: me, email: user.email, isAdmin },
    currentShow: current?.shortName || "",
    shows: ordered.map((event) => eventBriefing(event, flightState)),
    products: products.map(productBriefing),
    printedCollateral: currentCollateral.map((item) => ({
      name: item.name, kind: item.kind, company: item.company, about: item.products, audience: item.audience || "",
      atShows: item.shows || "all", onTheBoothTable: Boolean(item.atBooth), url: item.url,
    })),
    expenses: receipts,
  };

  const system =
    "You are the assistant inside Switch Commerce's team site, used by employees at trade shows and at their desks. " +
    "Answer only from the briefing. It holds everything the person asking is allowed to see: the shows (schedule, " +
    "team, flights, hotel, pinned notes, resources), the product knowledge base, the printed brochures and one-pagers, " +
    "and their expense receipts.\n" +
    "Rules:\n" +
    "- If the briefing does not contain the answer, say so plainly and name the screen or person that would have it. Never guess or invent.\n" +
    "- A product marked handOffOnly: give exactly its instruction (who handles it and the opening line). Do not speculate about the topic beyond that.\n" +
    "- Flights: a traveler's arrivalFlight time is when they land at the show's airport; departureFlight time is when they leave it. " +
    "Quote the flight number and the field you read. If a live status is present, prefer it and say when it was checked.\n" +
    "- Money: use the precomputed totals. 'My' receipts are under expenses.mine. Team totals exist only if expenses.team is present; " +
    "otherwise say that team expenses are visible to admins on the Money tab.\n" +
    "- Times are local to the show unless the briefing says otherwise. Use the 'now' field for 'today', 'tomorrow', 'next'.\n" +
    "- Settlement is next-day, never same-day.\n" +
    "- Be brief and direct, like a colleague answering across the booth. Plain text, no markdown. Give a URL only when asked where to find a document.";

  let answer;
  try {
    const completion = await client().chat.completions.create({
      model: ASSISTANT_MODEL,
      reasoning_effort: "none",
      response_format: { type: "json_schema", json_schema: ANSWER_SCHEMA },
      messages: [
        { role: "system", content: system },
        { role: "system", content: `Briefing:\n${JSON.stringify(briefing)}` },
        ...history,
      ],
    });
    answer = JSON.parse(completion.choices[0]?.message?.content || "{}");
  } catch (error) {
    console.error("assistant failed:", error?.message || error);
    return json({ error: "The assistant could not answer right now. Try again in a moment." }, 502);
  }

  return json({
    answer: clean(answer.answer, 4000, { multiline: true }) || "I don't have an answer for that.",
    followUps: (Array.isArray(answer.followUps) ? answer.followUps : []).map((q) => clean(q, 120)).filter(Boolean).slice(0, 2),
  });
});
