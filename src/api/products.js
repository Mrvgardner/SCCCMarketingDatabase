// API client for the knowledge base.
// In production, talks to /.netlify/functions/products.
// In dev, uses localStorage seeded from the bundled static data so the
// admin UI remains testable without `netlify dev`.

import { products as seedProducts } from "../data/products-tagged";

const DEV_KEY = "scc:knowledge-base";
const ENDPOINT = "/.netlify/functions/products";

function genId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function buildSearchBlob(p) {
  return [
    p.title, p.company, p.description, p.problem, p.villain, p.plan, p.cta,
    p.success, p.failure, p.transformation, p.useCases, p.keywords, p.type,
    p.problemTags, p.outcomeTags, p.buyerTags, p.industryTags,
    p._synonymsTitle, p._synonymsDescription, p._synonymsKeywords,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

// --- Dev-mode localStorage backend --------------------------------

function devRead() {
  try {
    const raw = localStorage.getItem(DEV_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const seeded = seedProducts.map((p) => ({ id: genId(), ...p }));
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
  return devRead();
}

async function devCreate(product) {
  const list = devRead();
  const created = { ...product, id: genId() };
  created._searchBlob = buildSearchBlob(created);
  list.push(created);
  devWrite(list);
  return created;
}

async function devUpdate(product) {
  const list = devRead();
  const idx = list.findIndex((p) => p.id === product.id);
  if (idx === -1) throw new Error("Not found");
  const updated = { ...product };
  updated._searchBlob = buildSearchBlob(updated);
  list[idx] = updated;
  devWrite(list);
  return updated;
}

async function devDelete(id) {
  const list = devRead().filter((p) => p.id !== id);
  devWrite(list);
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

async function prodList() {
  return prodRequest("GET");
}
async function prodCreate(product) {
  return prodRequest("POST", product);
}
async function prodUpdate(product) {
  return prodRequest("PUT", product);
}
async function prodDelete(id) {
  return prodRequest("DELETE", { id });
}

// --- Dispatch -----------------------------------------------------

const useDev = import.meta.env.DEV;

export const listProducts = useDev ? devList : prodList;
export const createProduct = useDev ? devCreate : prodCreate;
export const updateProduct = useDev ? devUpdate : prodUpdate;
export const deleteProduct = useDev ? devDelete : prodDelete;

export function resetDevStore() {
  try {
    localStorage.removeItem(DEV_KEY);
  } catch {}
}
