import { timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";
import OpenAI from "openai";
import webpush from "web-push";
import { configuredVapid, SUBSCRIPTION_STORE } from "../lib/push.js";

// The Friday "This Week's Highlights" email, turned into a Field Note.
//
// Assembly (Quantum Recognition) emails each person a weekly digest of who was
// recognized and why. Vic forwards it here: a mail rule sends it to a Make
// mailhook, and Make posts the message to this function. This reads the
// recognitions out of the email, files them as a draft "This Week's
// Highlights" note with a card per recognition, and pings the reviewers to
// publish it. Nothing goes live without a person approving it.
//
// The raw email is kept too, so a parsing miss can be looked at and replayed
// rather than guessed about.

const NOTES_STORE = "knowledge-base";
const NOTES_KEY = "field-notes.json";
const RAW_STORE = "weekly-highlights";
const MODEL = process.env.HIGHLIGHTS_MODEL || "gpt-5.6-luna";
const REVIEWERS = (process.env.HIGHLIGHTS_REVIEWERS || "vgardner@switchcommerce.com")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const SCHEMA = {
  name: "weekly_highlights",
  strict: true,
  schema: {
    type: "object",
    properties: {
      isHighlightsDigest: {
        type: "boolean",
        description: "True only if this is a weekly recognition digest listing people who were recognized.",
      },
      recognitions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            recipients: { type: "array", items: { type: "string" }, description: "Full names of the people recognized." },
            from: { type: "string", description: "Full name of the person who gave the recognition, or empty if not shown." },
            message: { type: "string", description: "The recognition message, verbatim. Empty if the email does not include it." },
            badge: { type: "string", description: "Core value, badge, or award named on it, or empty." },
          },
          required: ["recipients", "from", "message", "badge"],
          additionalProperties: false,
        },
      },
    },
    required: ["isHighlightsDigest", "recognitions"],
    additionalProperties: false,
  },
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function clean(value, max = 2000) {
  return String(value ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ").trim().slice(0, max);
}

function tokenMatches(given) {
  const expected = process.env.HIGHLIGHTS_INBOUND_TOKEN || "";
  if (!expected || !given) return false;
  const a = Buffer.from(String(given));
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Email HTML to readable text: line breaks where blocks end, no links, no
// tracking pixels. The model reads this, not the markup.
function htmlToText(html) {
  return String(html || "")
    .replace(/<(script|style|head)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|td|h\d|li|table)>/gi, "\n")
    .replace(/<img[^>]*alt="([^"]*)"[^>]*>/gi, " $1 ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*/g, "\n\n")
    .trim();
}

function client() {
  const apiKey = process.env.NETLIFY_AI_GATEWAY_KEY;
  const baseURL = process.env.NETLIFY_AI_GATEWAY_BASE_URL;
  return apiKey && baseURL ? new OpenAI({ apiKey, baseURL }) : new OpenAI();
}

// The Friday the digest belongs to, in Central time, as YYYY-MM-DD.
function weekOf(dateLike) {
  const date = new Date(dateLike || Date.now());
  const valid = Number.isNaN(date.getTime()) ? new Date() : date;
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(valid);
}

function names(list) {
  if (list.length <= 2) return list.join(" and ");
  return `${list.slice(0, -1).join(", ")}, and ${list[list.length - 1]}`;
}

function buildNote(highlights, day) {
  const everyone = [...new Set(highlights.flatMap((h) => h.recipients))];
  const excerpt = everyone.length
    ? `${names(everyone)} ${everyone.length === 1 ? "was" : "were"} recognized this week.`
    : "This week's recognitions from across the team.";
  // Plain-text body for search, the home page preview, and the kitchen TV,
  // which do not know about cards.
  const content = highlights
    .map((h) => `🎉 ${names(h.recipients)}${h.from ? ` (from ${h.from})` : ""}${h.badge ? ` · ${h.badge}` : ""}${h.message ? `\n"${h.message}"` : ""}`)
    .join("\n\n");
  return {
    id: `highlights-${day}`,
    kind: "highlights",
    title: "This Week's Highlights",
    date: day,
    author: "Quantum Recognition",
    excerpt,
    content,
    highlights,
    published: false,
    source: "assembly",
  };
}

// Field notes live in one document; write with the ETag so a save someone is
// making in the admin screen at the same moment is not overwritten.
async function saveNote(note) {
  const store = getStore({ name: NOTES_STORE, consistency: "strong" });
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const current = await store.getWithMetadata(NOTES_KEY, { type: "json" });
    const notes = Array.isArray(current?.data) ? current.data : [];
    const existing = notes.find((item) => item.id === note.id);
    // A week that is already published is left alone: someone approved it,
    // and a second forward of the same email should not undo that.
    if (existing && existing.published !== false) return { status: "already-published" };
    const next = existing
      ? notes.map((item) => (item.id === note.id ? { ...note, reactions: item.reactions } : item))
      : [note, ...notes];
    const written = current?.etag
      ? await store.setJSON(NOTES_KEY, next, { onlyIfMatch: current.etag })
      : await store.setJSON(NOTES_KEY, next, { onlyIfNew: true });
    if (written.modified) return { status: existing ? "updated" : "created" };
  }
  throw new Error("Could not save the note; too many simultaneous edits.");
}

async function notifyReviewers(note) {
  const keys = configuredVapid();
  if (!keys) return 0;
  webpush.setVapidDetails(keys.subject, keys.publicKey, keys.privateKey);
  const store = getStore({ name: SUBSCRIPTION_STORE, consistency: "strong" });
  const { blobs } = await store.list({ prefix: "events/" });
  const seen = new Set();
  const targets = [];
  for (const blob of blobs) {
    const records = (await store.get(blob.key, { type: "json" })) || [];
    for (const record of records) {
      const endpoint = record.subscription?.endpoint;
      if (!endpoint || seen.has(endpoint) || !REVIEWERS.includes(String(record.email || "").toLowerCase())) continue;
      seen.add(endpoint);
      targets.push(record.subscription);
    }
  }
  const payload = JSON.stringify({
    title: "Weekly highlights ready to publish",
    body: note.excerpt,
    url: `/admin/field-notes/${note.id}/edit`,
    tag: note.id,
    persistent: true,
  });
  const results = await Promise.allSettled(targets.map((subscription) => webpush.sendNotification(subscription, payload)));
  return results.filter((r) => r.status === "fulfilled").length;
}

export default async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!tokenMatches(request.headers.get("x-highlights-token"))) return json({ error: "Unauthorized" }, 401);

  // JSON, or a plain form: Make sends the email as form fields, which needs
  // no escaping of the quotes and markup an HTML email is full of.
  let body;
  try {
    const type = request.headers.get("content-type") || "";
    body = type.includes("application/json")
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
  } catch {
    return json({ error: "Could not read the request" }, 400);
  }

  const subject = clean(body.subject, 300);
  const html = String(body.html || "").slice(0, 600_000);
  const text = clean(body.text, 200_000) || htmlToText(html);
  const readable = (html ? htmlToText(html) : text).slice(0, 60_000);
  const day = weekOf(body.date);
  const raw = getStore({ name: RAW_STORE, consistency: "strong" });
  const rawKey = `inbound/${day}/${Date.now()}.json`;
  await raw.setJSON(rawKey, { receivedAt: new Date().toISOString(), subject, from: clean(body.from, 300), date: clean(body.date, 80), html, text });

  // Anything that is not the Assembly digest is kept for a look but not acted on.
  const looksRight = /highlights/i.test(subject) || /joinassembly|quantum recognition/i.test(`${html} ${text}`);
  if (!looksRight) return json({ status: "ignored", reason: "Not a weekly highlights email", rawKey });

  let parsed;
  try {
    const completion = await client().chat.completions.create({
      model: MODEL,
      reasoning_effort: "none",
      response_format: { type: "json_schema", json_schema: SCHEMA },
      messages: [
        {
          role: "system",
          content:
            "You read a company's weekly recognition digest email (from the Assembly platform, branded Quantum Recognition) and list every recognition in it. " +
            "Copy names and messages exactly as written; never invent or embellish. Skip buttons, points balances, prompts to recognize someone, footers, and unsubscribe text. " +
            "If the email was forwarded, ignore the forwarding header. If it is not a recognition digest, set isHighlightsDigest to false.",
        },
        { role: "user", content: `Subject: ${subject}\n\n${readable}` },
      ],
    });
    parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
  } catch (error) {
    console.error("highlights: reading failed", error?.message || error);
    return json({ error: "Could not read the email", rawKey }, 502);
  }

  const highlights = (parsed.recognitions || [])
    .map((h) => ({
      recipients: (h.recipients || []).map((name) => clean(name, 80)).filter(Boolean).slice(0, 12),
      from: clean(h.from, 80),
      message: clean(h.message, 1500),
      badge: clean(h.badge, 80),
    }))
    .filter((h) => h.recipients.length)
    .slice(0, 40);

  if (!parsed.isHighlightsDigest || !highlights.length) {
    return json({ status: "ignored", reason: "No recognitions found", rawKey });
  }

  const note = buildNote(highlights, day);
  const saved = await saveNote(note);
  const notified = saved.status === "already-published" ? 0 : await notifyReviewers(note).catch(() => 0);
  return json({ status: saved.status, id: note.id, recognitions: highlights.length, notified, rawKey });
};
