import { createHash } from "node:crypto";
import { getStore } from "@netlify/blobs";
import OpenAI from "openai";
import { authenticate } from "../lib/auth.mjs";
import { withCors } from "../lib/http.mjs";
import { clean } from "../lib/travel-input.mjs";

// Booth search, for the questions keyword matching cannot answer.
//
// "tampering" already finds Watchdog, because that word is in the product's own
// text. "my machines keep going down" finds nothing, because nobody wrote that
// sentence into the catalogue — and that is exactly how a customer talks. This
// reads the intent behind the sentence and picks the products that answer it.
//
// The client only calls this when its own instant, free keyword search comes up
// short, so the billed path is the exception rather than every keystroke.

const KNOWLEDGE_STORE = "knowledge-base";
const PRODUCTS_KEY = "products.json";
const CACHE_STORE = "product-search";

// Matching a sentence against two dozen short records is a small task, so it
// runs on the same cheap model as receipt reading. reasoning_effort "none"
// keeps it fast enough to feel like search rather than a request.
const SEARCH_MODEL = process.env.PRODUCT_SEARCH_MODEL || "gpt-5.6-luna";

// Any signed-in employee can trigger a billed call. The real usage is a handful
// of people at two or three shows a year, so this cap exists to bound a runaway
// loop, not to ration normal use.
const DAILY_LIMIT = Number(process.env.PRODUCT_SEARCH_DAILY_LIMIT || 200);

const MAX_MATCHES = 4;

const MATCH_SCHEMA = {
  name: "product_matches",
  strict: true,
  schema: {
    type: "object",
    properties: {
      matches: {
        type: "array",
        description: `Up to ${MAX_MATCHES} products that answer the question, best first. Empty if none genuinely fit.`,
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "The product id, copied exactly from the catalogue." },
            reason: {
              type: "string",
              description: "One short sentence a rep can say, connecting what was asked to this product.",
            },
          },
          required: ["id", "reason"],
          additionalProperties: false,
        },
      },
      note: {
        type: "string",
        description: "Empty when there are matches. Otherwise one sentence on what to ask the customer to narrow it down.",
      },
    },
    required: ["matches", "note"],
    additionalProperties: false,
  },
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
  });
}

function client() {
  const apiKey = process.env.NETLIFY_AI_GATEWAY_KEY;
  const baseURL = process.env.NETLIFY_AI_GATEWAY_BASE_URL;
  return apiKey && baseURL ? new OpenAI({ apiKey, baseURL }) : new OpenAI();
}

function userKey(email) {
  return Buffer.from(String(email).toLowerCase()).toString("base64url");
}

async function withinBudget(store, email) {
  const day = new Date().toISOString().slice(0, 10);
  const key = `usage/${userKey(email)}/${day}.json`;
  const used = (await store.get(key, { type: "json" }))?.count || 0;
  if (used >= DAILY_LIMIT) return false;
  await store.setJSON(key, { count: used + 1 });
  return true;
}

export default withCors(async (request) => {
  const user = await authenticate(request);
  if (!user) return json({ error: "Unauthorized" }, 401);
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const query = clean(body?.query, 200);
  if (query.length < 3) return json({ matches: [], note: "" });

  const products = (await getStore(KNOWLEDGE_STORE).get(PRODUCTS_KEY, { type: "json" })) || [];
  if (!products.length) return json({ matches: [], note: "" });

  // The cache key folds in a fingerprint of the catalogue, so editing a product
  // retires every answer that was based on the old wording.
  const catalogue = products.map((p) => ({
    id: String(p.id || ""),
    title: clean(p.title, 120),
    company: clean(p.company, 60),
    problem: clean(p.problem, 300),
    keywords: clean(p.keywords, 300),
  }));
  const fingerprint = createHash("sha256").update(JSON.stringify(catalogue)).digest("hex").slice(0, 12);
  const normalized = query.toLowerCase().replace(/\s+/g, " ").trim();
  const cacheKey = `${fingerprint}/${createHash("sha256").update(normalized).digest("hex").slice(0, 32)}.json`;

  const cacheStore = getStore({ name: CACHE_STORE, consistency: "strong" });
  const cached = await cacheStore.get(cacheKey, { type: "json" });
  if (cached) return json({ ...cached, cached: true });

  if (!(await withinBudget(cacheStore, user.email))) {
    return json({ error: "Search limit reached for today. Keyword search still works." }, 429);
  }

  let answer;
  try {
    const completion = await client().chat.completions.create({
      model: SEARCH_MODEL,
      reasoning_effort: "none",
      response_format: { type: "json_schema", json_schema: MATCH_SCHEMA },
      messages: [
        {
          role: "system",
          content:
            "You help a Switch Commerce rep standing at a trade show booth. Someone has just asked them " +
            "something in their own words. Pick the products from the catalogue that answer it.\n" +
            "Rules:\n" +
            "- Only ever return ids that appear in the catalogue. Never invent a product.\n" +
            "- Match on the underlying problem, not on shared words. A question about machines going " +
            "offline is about downtime and monitoring, whoever phrased it.\n" +
            "- Order by how directly each one answers the question. Return fewer rather than padding.\n" +
            "- Return no matches when nothing genuinely fits, and use note to say what to ask to narrow it down.\n" +
            "- Each reason is one short sentence the rep can say out loud. No marketing language.",
        },
        {
          role: "user",
          content: `Catalogue:\n${JSON.stringify(catalogue)}\n\nThey asked: ${query}`,
        },
      ],
    });
    answer = JSON.parse(completion.choices[0]?.message?.content || "{}");
  } catch (error) {
    console.error("product-search failed:", error?.message || error);
    return json({ error: "Could not run that search." }, 502);
  }

  // Trust the catalogue, not the model: drop anything that is not a real
  // product, and take the full record from our own data.
  const byId = new Map(products.map((p) => [String(p.id), p]));
  const matches = (Array.isArray(answer.matches) ? answer.matches : [])
    .map((match) => {
      const product = byId.get(clean(match?.id, 80));
      if (!product) return null;
      return { product, reason: clean(match?.reason, 220) };
    })
    .filter(Boolean)
    .slice(0, MAX_MATCHES);

  const payload = { matches, note: matches.length ? "" : clean(answer.note, 220) };
  await cacheStore.setJSON(cacheKey, payload);
  return json(payload);
});
