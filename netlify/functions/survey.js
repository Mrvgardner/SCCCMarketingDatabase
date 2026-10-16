import { createHmac, randomBytes } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { authenticate } from "../lib/auth.mjs";
import { withCors } from "../lib/http.mjs";
import { clean } from "../lib/travel-input.mjs";
import { loadEvents, travelerForEmail } from "./trade-shows.js";
import { SURVEY_QUESTIONS, SURVEY_SECTIONS, isShown } from "../../src/data/surveyQuestions.js";

// The post-show survey: five questions to the people who worked a show.
//
// Anonymous unless the person ticks "attach my name". An anonymous response is
// filed under a keyed hash of the email, never the email itself, so the same
// person can come back and change their answers, but nothing in the response
// says who they are and the hash cannot be turned back into an address
// without the key. The key is generated once and kept in this store.
//
// Admins open and close a survey per show, and read the results: averages,
// the spread of ratings, and the written answers, shuffled so their order says
// nothing about who sent what or when.

const STORE = "staff-surveys";
const SECRET_KEY = "secret.json";

const QUESTIONS = SURVEY_QUESTIONS;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
  });
}

async function secret(store) {
  const existing = await store.get(SECRET_KEY, { type: "json" });
  if (existing?.key) return existing.key;
  const key = randomBytes(32).toString("hex");
  const written = await store.setJSON(SECRET_KEY, { key }, { onlyIfNew: true });
  if (written.modified) return key;
  return (await store.get(SECRET_KEY, { type: "json" })).key;
}

async function responseKey(store, eventId, email) {
  const id = createHmac("sha256", await secret(store)).update(String(email).toLowerCase()).digest("hex").slice(0, 32);
  return `responses/${eventId}/${id}.json`;
}

function validAnswers(raw) {
  const answers = {};
  for (const question of QUESTIONS) {
    const value = raw?.[question.id];
    if (question.kind === "rating") {
      const n = Number(value);
      if (Number.isInteger(n) && n >= 1 && n <= 5) answers[question.id] = n;
    } else if (question.kind === "choice") {
      if (question.options.includes(value)) answers[question.id] = value;
    } else if (question.kind === "multi") {
      const picked = (Array.isArray(value) ? value : []).filter((option) => question.options.includes(option));
      if (picked.length) answers[question.id] = [...new Set(picked)];
    } else {
      const text = clean(value, 2000, { multiline: true });
      if (text) answers[question.id] = text;
    }
  }
  // A follow-up only counts if its question was actually asked.
  for (const question of QUESTIONS) {
    if (!isShown(question, answers)) delete answers[question.id];
  }
  const missing = QUESTIONS.find((question) => question.required && answers[question.id] === undefined);
  return missing ? { error: `Please answer: ${missing.label}` } : { answers };
}

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function results(store, eventId) {
  const { blobs } = await store.list({ prefix: `responses/${eventId}/` });
  const responses = (await Promise.all(blobs.map((blob) => store.get(blob.key, { type: "json" }).catch(() => null)))).filter(Boolean);

  const summary = QUESTIONS.map((question) => {
    if (question.kind === "choice" || question.kind === "multi") {
      const picks = responses.map((r) => r.answers?.[question.id]).filter(Boolean);
      const counts = question.options.map((option) => ({
        option,
        count: picks.filter((pick) => (Array.isArray(pick) ? pick.includes(option) : pick === option)).length,
      }));
      return { ...question, count: picks.length, counts };
    }
    if (question.kind === "rating") {
      const values = responses.map((r) => r.answers?.[question.id]).filter((v) => Number.isInteger(v));
      const spread = [1, 2, 3, 4, 5].map((score) => values.filter((v) => v === score).length);
      const average = values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : null;
      return { ...question, count: values.length, average, spread };
    }
    const answers = shuffle(
      responses
        .filter((r) => r.answers?.[question.id])
        .map((r) => ({ text: r.answers[question.id], name: r.name || "" })),
    );
    return { ...question, count: answers.length, answers };
  });

  return { total: responses.length, named: responses.filter((r) => r.name).length, questions: summary };
}

export default withCors(async (request) => {
  const user = await authenticate(request);
  if (!user?.email) return json({ error: "Unauthorized" }, 401);
  const roles = user.roles || user.app_metadata?.roles || [];
  const isAdmin = roles.some((role) => String(role).toLowerCase() === "admin");

  const url = new URL(request.url);
  let body = {};
  if (request.method === "POST") {
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid request" }, 400);
    }
  }
  const eventId = clean(url.searchParams.get("eventId") || body.eventId, 80);
  if (!eventId) return json({ error: "Which show?" }, 400);

  const { events } = await loadEvents(getStore({ name: "knowledge-base", consistency: "strong" }));
  const event = events.find((item) => item.id === eventId);
  if (!event) return json({ error: "Show not found" }, 404);

  const store = getStore({ name: STORE, consistency: "strong" });
  const stateKey = `state/${eventId}.json`;
  const state = (await store.get(stateKey, { type: "json" })) || { open: false };
  const person = travelerForEmail(user.email, event.travelingTeam, event.teamContacts);
  const canAnswer = Boolean(person) || isAdmin;

  if (request.method === "GET") {
    const mine = canAnswer ? await store.get(await responseKey(store, eventId, user.email), { type: "json" }) : null;
    return json({
      open: state.open === true,
      openedAt: state.openedAt || "",
      questions: QUESTIONS,
      sections: SURVEY_SECTIONS,
      canAnswer,
      name: person || user.user_metadata?.full_name || "",
      mine: mine ? { answers: mine.answers, named: Boolean(mine.name), submittedAt: mine.submittedAt } : null,
      results: isAdmin && url.searchParams.get("results") === "1" ? await results(store, eventId) : undefined,
    });
  }

  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  if (body.action === "open" || body.action === "close") {
    if (!isAdmin) return json({ error: "Admin role required" }, 403);
    const next = body.action === "open"
      ? { open: true, openedAt: state.openedAt || new Date().toISOString() }
      : { ...state, open: false, closedAt: new Date().toISOString() };
    await store.setJSON(stateKey, next);
    return json({ open: next.open, openedAt: next.openedAt || "" });
  }

  if (!state.open) return json({ error: "This survey is closed." }, 403);
  if (!canAnswer) return json({ error: "This survey is for the team that worked this show." }, 403);

  const checked = validAnswers(body.answers);
  if (checked.error) return json({ error: checked.error }, 400);

  const named = body.named === true;
  await store.setJSON(await responseKey(store, eventId, user.email), {
    answers: checked.answers,
    // Only a name the person chose to attach, taken from their sign-in, never
    // from the request. No email, either way.
    name: named ? person || user.user_metadata?.full_name || "" : "",
    submittedAt: new Date().toISOString().slice(0, 10),
  });
  return json({ ok: true });
});
