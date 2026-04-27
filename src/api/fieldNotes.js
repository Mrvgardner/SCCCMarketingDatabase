// Field Notes API client — same dev/prod split as products.js.

import { fieldNotes as seedNotes } from "../data/field-notes";

const DEV_KEY = "scc:field-notes";
const ENDPOINT = "/.netlify/functions/field-notes";
const ALLOWED_REACTIONS = new Set(["👍", "✅", "🔥"]);

function genId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function sortByDate(notes) {
  return [...notes].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function isPubliclyVisible(note) {
  if (note.published === false) return false;
  if (note.publishAt && note.publishAt > todayISO()) return false;
  return true;
}

function getCurrentUserId() {
  const user = window.netlifyIdentity?.currentUser();
  return user?.id || user?.email || user?.user_metadata?.full_name || null;
}

// --- Dev-mode localStorage backend --------------------------------

function devRead() {
  try {
    const raw = localStorage.getItem(DEV_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const seeded = seedNotes.map((n) => ({ id: n.id || genId(), ...n }));
  try {
    localStorage.setItem(DEV_KEY, JSON.stringify(seeded));
  } catch {}
  return seeded;
}

function devWrite(list) {
  try {
    localStorage.setItem(DEV_KEY, JSON.stringify(list));
  } catch {}
}

async function devList() {
  // Public view: only notes whose published date has arrived.
  return sortByDate(devRead().filter(isPubliclyVisible));
}

async function devListAll() {
  // Admin view: all notes including drafts.
  return sortByDate(devRead());
}

async function devCreate(note) {
  const list = devRead();
  const created = { ...note, id: genId() };
  list.push(created);
  devWrite(list);
  return created;
}

async function devUpdate(note) {
  const list = devRead();
  const idx = list.findIndex((n) => n.id === note.id);
  if (idx === -1) throw new Error("Not found");
  list[idx] = { ...note };
  devWrite(list);
  return list[idx];
}

async function devDelete(id) {
  devWrite(devRead().filter((n) => n.id !== id));
}

async function devToggleReaction(id, emoji) {
  if (!ALLOWED_REACTIONS.has(emoji)) throw new Error("Unsupported reaction");
  const userId = getCurrentUserId();
  if (!userId) throw new Error("Sign in required");

  const list = devRead();
  const idx = list.findIndex((n) => n.id === id);
  if (idx === -1) throw new Error("Not found");

  const note = list[idx];
  const reactions = { ...(note.reactions || {}) };
  const users = Array.isArray(reactions[emoji]) ? reactions[emoji] : [];
  const hasReacted = users.includes(userId);
  const nextUsers = hasReacted
    ? users.filter((u) => u !== userId)
    : [...users, userId];

  if (nextUsers.length > 0) reactions[emoji] = nextUsers;
  else delete reactions[emoji];

  list[idx] = { ...note, reactions };
  devWrite(list);
  return list[idx];
}

// --- Prod-mode Netlify Function backend ---------------------------

async function authHeaders() {
  const user = window.netlifyIdentity?.currentUser();
  if (!user) return {};
  try {
    const token = await user.jwt();
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

async function prodRequest(method, body) {
  const opts = {
    method,
    headers: { ...(await authHeaders()) },
  };
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(ENDPOINT, opts);
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`${method} ${ENDPOINT} → ${res.status} ${err}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

const useDev = import.meta.env.DEV;

export const listFieldNotes = useDev ? devList : () => prodRequest("GET");
export const listAllFieldNotes = useDev ? devListAll : () => prodRequest("GET");
export const createFieldNote = useDev ? devCreate : (n) => prodRequest("POST", n);
export const updateFieldNote = useDev ? devUpdate : (n) => prodRequest("PUT", n);
export const deleteFieldNote = useDev ? devDelete : (id) => prodRequest("DELETE", { id });
export const toggleFieldNoteReaction = useDev
  ? devToggleReaction
  : (id, emoji) => prodRequest("PATCH", { id, emoji });
