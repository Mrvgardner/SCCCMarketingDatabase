import { connectLambda, getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";
import seedData from "./field-notes-seed.json";

const STORE_NAME = "knowledge-base";
const KEY = "field-notes.json";

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

// Newest first, stable across equal dates
function sortByDate(notes) {
  return [...notes].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export async function handler(event, context) {
  connectLambda(event);

  const user = context.clientContext?.user;
  const roles = user?.app_metadata?.roles || [];
  const isAdmin = roles.includes("admin");
  const method = event.httpMethod;

  if (!user) return json(401, { error: "Unauthorized" });

  const store = getStore(STORE_NAME);

  if (method === "GET") {
    let notes = await store.get(KEY, { type: "json" });
    if (!notes) {
      notes = (await loadSeed()).map(ensureId);
      await store.setJSON(KEY, notes);
    }
    return json(200, sortByDate(notes));
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
