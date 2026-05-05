import { connectLambda, getStore } from "@netlify/blobs";
import { randomUUID, timingSafeEqual } from "node:crypto";
import seedData from "./products-seed.json";

// Constant-time string compare. Returns false if lengths differ (so we never
// leak length via timing differences against a known token).
function timingSafeEqualStr(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

const STORE_NAME = "knowledge-base";
const KEY = "products.json";

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

function ensureId(product) {
  if (!product.id) product.id = randomUUID();
  return product;
}

function rebuildSearchBlob(p) {
  const parts = [
    p.title,
    p.company,
    p.description,
    p.problem,
    p.villain,
    p.plan,
    p.cta,
    p.success,
    p.failure,
    p.transformation,
    p.useCases,
    p.keywords,
    p.type,
    p.problemTags,
    p.outcomeTags,
    p.buyerTags,
    p.industryTags,
    p._synonymsTitle,
    p._synonymsDescription,
    p._synonymsKeywords,
  ].filter(Boolean);
  return parts.join(" ").toLowerCase();
}

export async function handler(event, context) {
  // v1 handler functions need explicit wiring so @netlify/blobs can
  // pick up the deploy context injected into the Lambda event.
  connectLambda(event);

  const user = context.clientContext?.user;
  const roles = user?.app_metadata?.roles || [];
  const isAdmin = roles.includes("admin");
  const method = event.httpMethod;

  // Read-only service-token path. Used by the MCP server function (and by any
  // long-lived agent) to query the knowledge base without going through
  // Netlify Identity. Token lives in the AGENT_SERVICE_TOKEN env var; rotate
  // by setting a new value in Netlify and updating the agent connector.
  const authHeader = event.headers?.authorization || event.headers?.Authorization || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const expected = process.env.AGENT_SERVICE_TOKEN || "";
  const hasServiceToken = expected && bearer && timingSafeEqualStr(bearer, expected);

  if (hasServiceToken) {
    if (method !== "GET") return json(405, { error: "Service token is read-only" });
    const store = getStore(STORE_NAME);
    let products = await store.get(KEY, { type: "json" });
    if (!products) {
      products = (await loadSeed()).map(ensureId);
      await store.setJSON(KEY, products);
    }
    return json(200, products);
  }

  if (!user) {
    return json(401, { error: "Unauthorized" });
  }

  const store = getStore(STORE_NAME);

  if (method === "GET") {
    let products = await store.get(KEY, { type: "json" });
    if (!products) {
      products = (await loadSeed()).map(ensureId);
      await store.setJSON(KEY, products);
    }
    return json(200, products);
  }

  if (!isAdmin) {
    return json(403, { error: "Forbidden — admin role required" });
  }

  const products =
    (await store.get(KEY, { type: "json" })) ||
    (await loadSeed()).map(ensureId);

  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  if (method === "POST") {
    const product = ensureId({ ...body });
    product._searchBlob = rebuildSearchBlob(product);
    products.push(product);
    await store.setJSON(KEY, products);
    return json(201, product);
  }

  if (method === "PUT") {
    if (!body.id) return json(400, { error: "Missing id" });
    const idx = products.findIndex((p) => p.id === body.id);
    if (idx === -1) return json(404, { error: "Not found" });
    const updated = { ...body };
    updated._searchBlob = rebuildSearchBlob(updated);
    products[idx] = updated;
    await store.setJSON(KEY, products);
    return json(200, updated);
  }

  if (method === "DELETE") {
    if (!body.id) return json(400, { error: "Missing id" });
    const idx = products.findIndex((p) => p.id === body.id);
    if (idx === -1) return json(404, { error: "Not found" });
    products.splice(idx, 1);
    await store.setJSON(KEY, products);
    return { statusCode: 204, body: "" };
  }

  return json(405, { error: "Method not allowed" });
}
