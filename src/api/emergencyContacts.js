import { apiUrl } from "./apiBase";
// The same validator the function runs. Sharing it means the message someone
// sees is the one the server would have given, and that local development
// behaves like production instead of accepting anything.
import { validateEmergencyContact } from "../../netlify/lib/emergency-contact.mjs";

const ENDPOINT = apiUrl("/.netlify/functions/emergency-contacts");
const DEV_KEY = "scc:emergency-contacts";
const useDev = import.meta.env.DEV;

async function authHeaders() {
  const user = window.netlifyIdentity?.currentUser();
  if (!user) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${await user.jwt()}` };
}

// Local development keeps the same shape as the function so the screens behave
// identically without a live blob store behind them.
function devRead() {
  try {
    return JSON.parse(localStorage.getItem(DEV_KEY)) || {};
  } catch {
    return {};
  }
}

function devEmail(user) {
  return String(user?.email || "dev@localhost").trim().toLowerCase();
}

async function request(method, body) {
  const options = { method, headers: await authHeaders() };
  if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(ENDPOINT, options);
  const text = await response.text().catch(() => "");
  if (!response.ok) {
    let message = "";
    try {
      message = JSON.parse(text)?.error || "";
    } catch { /* not JSON */ }
    throw new Error(message || `Request failed (${response.status}).`);
  }
  return text ? JSON.parse(text) : {};
}

// Returns { mine, all? } — `all` only comes back for admins.
export async function getEmergencyContacts(user, { isAdmin = false } = {}) {
  if (!useDev) return request("GET");

  const store = devRead();
  const mine = store[devEmail(user)] || null;
  return isAdmin ? { mine, all: store } : { mine };
}

export async function saveEmergencyContact(contact, user) {
  // Checked here for an immediate answer; the function checks again, because a
  // client-side guard is a courtesy and never a control.
  const checked = validateEmergencyContact(contact);
  if (checked.error) throw new Error(checked.error);

  if (!useDev) return request("PUT", { contact });

  const store = devRead();
  const key = devEmail(user);
  if (checked.value === null) delete store[key];
  else store[key] = { ...checked.value, updatedAt: new Date().toISOString() };
  localStorage.setItem(DEV_KEY, JSON.stringify(store));
  return { mine: checked.value === null ? null : store[key] };
}
