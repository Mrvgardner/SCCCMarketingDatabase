import ical from "node-ical";
import { authenticate } from "../lib/auth.mjs";

const IDENTITY_ORIGIN = "https://switchcommerce.team";
const MAX_FEED_BYTES = 1024 * 1024;
const MAX_ITEMS = 300;
const TEAM_TIME = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit",
});
const RESPONSE_HEADERS = Object.freeze({
  "Cache-Control": "private, no-store, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Netlify-CDN-Cache-Control": "no-store",
  "Vary": "Authorization, Cookie",
  "X-Content-Type-Options": "nosniff",
});

function feedUrl(value) {
  try {
    const url = new URL(value);
    const ids = url.searchParams.getAll("id");
    if (url.protocol !== "https:" || url.hostname !== "switch.bamboohr.com" ||
        url.username || url.password || url.port || url.hash ||
        url.pathname !== "/feeds/feed.php" || ids.length !== 1 ||
        [...url.searchParams.keys()].length !== 1 || !/^[a-z0-9_-]{16,128}$/i.test(ids[0])) return null;
    return url;
  } catch {
    return null;
  }
}

function eventDate(event) {
  const start = event.start;
  if (!(start instanceof Date) || !Number.isFinite(start.getTime())) return null;
  if (event.datetype === "date" || start.dateOnly) {
    const [year, month, day] = start.toISOString().slice(0, 10).split("-");
    return { year: Number(year), date: month + "-" + day };
  }
  const parts = Object.fromEntries(TEAM_TIME.formatToParts(start).map(({ type, value }) => [type, value]));
  return { year: Number(parts.year), date: parts.month + "-" + parts.day };
}

function validName(value) {
  const name = value.replace(/\s+/g, " ").trim();
  return name.length > 0 && name.length <= 120 && !/[\x00-\x1f\x7f]/.test(name) ? name : null;
}

function project(text, kind) {
  const items = new Map();
  for (const event of Object.values(ical.sync.parseICS(text))) {
    if (event.type !== "VEVENT" || typeof event.summary !== "string" || event.status === "CANCELLED") continue;
    const when = eventDate(event);
    if (!when) continue;
    if (kind === "birthdays") {
      const match = /^(.*?)(?:\s*[-–—:]\s*|['’]s\s+|\s+)Birthday\s*$/i.exec(event.summary);
      const name = match && validName(match[1]);
      if (name) items.set(name + "|" + when.date, { name, date: when.date });
    } else {
      // BambooHR's feed writes "Jane Doe (5 yrs)"; the longer forms are kept
      // in case the feed's wording changes.
      const match =
        /^(.*?)\s*\(\s*(\d{1,2})\s*(?:years?|yrs?)\s*\)\s*$/i.exec(event.summary) ||
        /^(.*?)(?:\s*[-–—:]\s*|['’]s\s+|\s+)(\d{1,2})(?:\s*(?:years?|yrs?)|(?:st|nd|rd|th)(?:\s+work)?)\s+(?:work\s+)?anniversary\s*$/i.exec(event.summary);
      const name = match && validName(match[1]);
      const years = match ? Number(match[2]) : 0;
      if (name && years > 0 && years <= 70) {
        items.set(name + "|" + when.date, { name, date: when.date, startYear: when.year - years });
      }
    }
    if (items.size >= MAX_ITEMS) break;
  }
  return [...items.values()];
}

async function readFeed(fetchImpl, url) {
  const response = await fetchImpl(url, {
    method: "GET",
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(5000),
    headers: { Accept: "text/calendar", "Cache-Control": "no-store" },
  });
  if (!response.ok || !response.body || Number(response.headers.get("Content-Length")) > MAX_FEED_BYTES) throw new Error("feed_rejected");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > MAX_FEED_BYTES) throw new Error("feed_rejected");
      text += decoder.decode(chunk.value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    await reader.cancel().catch(() => {});
  }
  if (!/^\uFEFF?BEGIN:VCALENDAR(?:\r?\n)/i.test(text) || !/(?:\r?\n)END:VCALENDAR\s*$/i.test(text)) throw new Error("feed_rejected");
  return text;
}

function reply(payload, status, extraHeaders = {}) {
  return Response.json(payload, { status, headers: { ...RESPONSE_HEADERS, ...extraHeaders } });
}

export function makeCelebrationsHandler({
  env = process.env,
  verifyIdentity = (request) => authenticate(request, {
    fetchImpl: (url, options) => {
      const endpoint = new URL(url);
      if (endpoint.origin !== IDENTITY_ORIGIN || endpoint.pathname !== "/.netlify/identity/user") {
        throw new Error("unexpected identity endpoint");
      }
      return fetch(endpoint, { ...options, redirect: "error", cache: "no-store" });
    },
  }),
  fetchImpl = fetch,
} = {}) {
  return async function handleCelebrations(request) {
    if (request.method !== "GET") return reply({ error: "method_not_allowed" }, 405, { Allow: "GET" });
    let user;
    try { user = await verifyIdentity(request); } catch { user = null; }
    if (!user?.id) return reply({ error: "unauthenticated" }, 401);
    const birthdayUrl = feedUrl(env.BAMBOOHR_BIRTHDAYS_FEED_URL);
    const anniversaryUrl = feedUrl(env.BAMBOOHR_ANNIVERSARIES_FEED_URL);
    if (!birthdayUrl || !anniversaryUrl) return reply({ error: "celebrations_unavailable" }, 503);
    try {
      const [birthdayText, anniversaryText] = await Promise.all([
        readFeed(fetchImpl, birthdayUrl),
        readFeed(fetchImpl, anniversaryUrl),
      ]);
      return reply({ birthdays: project(birthdayText, "birthdays"), anniversaries: project(anniversaryText, "anniversaries") }, 200);
    } catch {
      // Don't emit credentials, request URLs, records, or upstream errors.
      return reply({ error: "celebrations_unavailable" }, 503);
    }
  };
}

export default makeCelebrationsHandler();
