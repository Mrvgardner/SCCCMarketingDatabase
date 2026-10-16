import { apiUrl } from "./apiBase";

const ENDPOINT = apiUrl("/.netlify/functions/survey");
const useDev = import.meta.env.DEV;

async function authHeaders() {
  const user = window.netlifyIdentity?.currentUser();
  if (!user) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${await user.jwt()}` };
}

async function request(method, query, body) {
  const options = { method, headers: await authHeaders() };
  if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }
  const response = await fetch(`${ENDPOINT}${query}`, options);
  const text = await response.text().catch(() => "");
  if (!response.ok) {
    let message = "";
    try { message = JSON.parse(text)?.error || ""; } catch { /* not JSON */ }
    throw new Error(message || `Request failed (${response.status}).`);
  }
  return JSON.parse(text);
}

// Local development has no functions; keep a stand-in in localStorage so the
// screens can be exercised end to end.
const DEV_QUESTIONS = [
  { id: "show", kind: "rating", label: "Overall, how was the show for you?", required: true },
  { id: "app", kind: "rating", label: "How useful was the app at this show?" },
  { id: "worked", kind: "text", label: "What worked well, at the show or in the app?" },
  { id: "didnt", kind: "text", label: "What didn't work, or what should we do differently next time?" },
  { id: "else", kind: "text", label: "Anything else?" },
];
const devKey = (eventId) => `scc:survey-dev:${eventId}`;
function devRead(eventId) {
  try { return JSON.parse(localStorage.getItem(devKey(eventId)) || "null") || { open: false, responses: {} }; } catch { return { open: false, responses: {} }; }
}
function devWrite(eventId, value) {
  localStorage.setItem(devKey(eventId), JSON.stringify(value));
}
function devResults(state) {
  const all = Object.values(state.responses);
  return {
    total: all.length,
    named: all.filter((r) => r.name).length,
    questions: DEV_QUESTIONS.map((q) => {
      if (q.kind === "rating") {
        const values = all.map((r) => r.answers[q.id]).filter(Boolean);
        return { ...q, count: values.length, average: values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : null, spread: [1, 2, 3, 4, 5].map((s) => values.filter((v) => v === s).length) };
      }
      const answers = all.filter((r) => r.answers[q.id]).map((r) => ({ text: r.answers[q.id], name: r.name }));
      return { ...q, count: answers.length, answers };
    }),
  };
}

export async function getSurvey(eventId, { results = false } = {}) {
  if (useDev) {
    const state = devRead(eventId);
    const mine = state.responses.me;
    return {
      open: state.open, questions: DEV_QUESTIONS, canAnswer: true, name: "Local Dev",
      mine: mine ? { answers: mine.answers, named: Boolean(mine.name), submittedAt: mine.submittedAt } : null,
      results: results ? devResults(state) : undefined,
    };
  }
  return request("GET", `?eventId=${encodeURIComponent(eventId)}${results ? "&results=1" : ""}`);
}

export async function submitSurvey(eventId, answers, named) {
  if (useDev) {
    const state = devRead(eventId);
    if (!state.open) throw new Error("This survey is closed.");
    if (!answers.show) throw new Error("Please answer: Overall, how was the show for you?");
    state.responses.me = { answers, name: named ? "Local Dev" : "", submittedAt: new Date().toISOString().slice(0, 10) };
    devWrite(eventId, state);
  } else {
    await request("POST", "", { eventId, answers, named });
  }
  window.dispatchEvent(new CustomEvent("survey:changed", { detail: eventId }));
}

export async function setSurveyOpen(eventId, open) {
  if (useDev) {
    devWrite(eventId, { ...devRead(eventId), open });
  } else {
    await request("POST", "", { eventId, action: open ? "open" : "close" });
  }
  window.dispatchEvent(new CustomEvent("survey:changed", { detail: eventId }));
}
