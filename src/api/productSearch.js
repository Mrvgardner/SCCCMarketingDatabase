import { apiUrl } from "./apiBase";

const ENDPOINT = apiUrl("/.netlify/functions/product-search");
const useDev = import.meta.env.DEV;

// Answers are stable for a given question, and the same one gets asked more
// than once at a show. Remembering them for the session keeps a repeat instant
// and unbilled, on top of the server's own cache.
const session = new Map();

async function authHeaders() {
  const user = window.netlifyIdentity?.currentUser();
  if (!user) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${await user.jwt()}` };
}

export async function askProductSearch(query) {
  const normalized = String(query || "").toLowerCase().replace(/\s+/g, " ").trim();
  if (normalized.length < 3) return { matches: [], note: "" };
  if (session.has(normalized)) return session.get(normalized);

  if (useDev) {
    // No gateway credentials locally. Say so plainly rather than faking an
    // answer that would not match what production returns.
    const result = { matches: [], note: "Interpreted search runs on the deployed site, not locally." };
    session.set(normalized, result);
    return result;
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { ...(await authHeaders()), "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  const text = await response.text().catch(() => "");
  if (!response.ok) {
    let message = "";
    try {
      message = JSON.parse(text)?.error || "";
    } catch { /* not JSON */ }
    throw new Error(message || `Search failed (${response.status}).`);
  }

  const result = text ? JSON.parse(text) : { matches: [], note: "" };
  session.set(normalized, result);
  return result;
}
