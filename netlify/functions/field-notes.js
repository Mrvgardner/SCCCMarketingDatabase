import { connectLambda, getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";
import seedData from "./field-notes-seed.json";

const STORE_NAME = "knowledge-base";
const KEY = "field-notes.json";
const ALLOWED_REACTIONS = new Set(["👍", "✅", "🔥"]);

async function loadSeed() {
  return seedData;
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function ensureId(note) {
  if (!note.id) note.id = randomUUID();
  return note;
}

function userKey(user) {
  return user?.sub || user?.id || user?.email || user?.user_metadata?.full_name || null;
}

// Newest first, stable across equal dates
function sortByDate(notes) {
  return [...notes].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// A note is publicly visible when it's published AND its publishAt date (if any) has arrived.
function isPubliclyVisible(note) {
  if (note.published === false) return false;
  if (note.publishAt && note.publishAt > todayISO()) return false;
  return true;
}

export async function handler(event, context) {
  connectLambda(event);

  const user = context.clientContext?.user;
  const roles = user?.app_metadata?.roles || [];
  const isAdmin = roles.includes("admin");
  const method = event.httpMethod;

  // Token-gated public GET — used by the Yodeck kitchen TV (server-to-server
  // via env var). Token is never exposed to the browser. Writes still require
  // Netlify Identity + admin role.
  const publicToken = process.env.KITCHEN_READ_TOKEN;
  const provided    = event.queryStringParameters?.token
                   || event.headers?.['x-read-token']
                   || event.headers?.['X-Read-Token'];
  const isTokenRead = method === "GET" && publicToken && provided === publicToken;

  if (!user && !isTokenRead) return json(401, { error: "Unauthorized" });

  const store = getStore(STORE_NAME);

  if (method === "GET") {
    let notes = await store.get(KEY, { type: "json" });
    if (!notes) {
      notes = (await loadSeed()).map(ensureId);
      await store.setJSON(KEY, notes);
    }
    // Admins see all notes (including drafts); public only sees published ones.
    const visible = isAdmin ? notes : notes.filter(isPubliclyVisible);
    return json(200, sortByDate(visible));
  }

  if (method === "PATCH") {
    let notes = await store.get(KEY, { type: "json" });
    if (!notes) {
      notes = (await loadSeed()).map(ensureId);
      await store.setJSON(KEY, notes);
    }

    let body;
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch {
      return json(400, { error: "Invalid JSON body" });
    }

    if (!body.id) return json(400, { error: "Missing id" });
    if (!ALLOWED_REACTIONS.has(body.emoji)) return json(400, { error: "Unsupported reaction" });

    const uid = userKey(user);
    if (!uid) return json(400, { error: "Unable to resolve user identity" });

    const idx = notes.findIndex((n) => n.id === body.id);
    if (idx === -1) return json(404, { error: "Not found" });

    const note = notes[idx];
    const reactions = { ...(note.reactions || {}) };
    const users = Array.isArray(reactions[body.emoji]) ? reactions[body.emoji] : [];
    const hasReacted = users.includes(uid);
    const nextUsers = hasReacted
      ? users.filter((u) => u !== uid)
      : [...users, uid];

    if (nextUsers.length > 0) reactions[body.emoji] = nextUsers;
    else delete reactions[body.emoji];

    notes[idx] = { ...note, reactions };
    await store.setJSON(KEY, notes);
    return json(200, notes[idx]);
  }

  if (!isAdmin) return json(403, { error: "Forbidden — admin role required" });

  const notes =
    (await store.get(KEY, { type: "json" })) ||
    (await loadSeed()).map(ensureId);

  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  if (method === "POST") {
    const note = ensureId({ ...body });
    notes.push(note);
    await store.setJSON(KEY, notes);
    return json(201, note);
  }

  if (method === "PUT") {
    if (!body.id) return json(400, { error: "Missing id" });
    const idx = notes.findIndex((n) => n.id === body.id);
    if (idx === -1) return json(404, { error: "Not found" });
    notes[idx] = { ...body };
    await store.setJSON(KEY, notes);
    return json(200, notes[idx]);
  }

  if (method === "DELETE") {
    if (!body.id) return json(400, { error: "Missing id" });
    const idx = notes.findIndex((n) => n.id === body.id);
    if (idx === -1) return json(404, { error: "Not found" });
    notes.splice(idx, 1);
    await store.setJSON(KEY, notes);
    return { statusCode: 204, body: "" };
  }

  return json(405, { error: "Method not allowed" });
}
