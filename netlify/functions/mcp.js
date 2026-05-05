// MCP (Model Context Protocol) server — stateless Streamable HTTP transport.
//
// Exposes the Switch Commerce knowledge base read-only to authorized agents
// (Claude Cowork, Claude Code, Anthropic API custom connectors, etc.).
//
// Auth: caller must send `Authorization: Bearer <AGENT_SERVICE_TOKEN>` on
// every request. Token comes from the Netlify env var of the same name.
//
// Spec: https://modelcontextprotocol.io/specification/2025-06-18 (stateless
// mode — single POST/JSON-RPC request, single JSON-RPC response, no session
// state required between requests).

import { connectLambda, getStore } from "@netlify/blobs";
import { timingSafeEqual } from "node:crypto";
import seedData from "./products-seed.json";

const STORE_NAME = "knowledge-base";
const KEY = "products.json";
const PROTOCOL_VERSION = "2025-06-18";

function timingSafeEqualStr(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  };
}

// JSON-RPC envelope helpers
const rpcResult = (id, result) => ({ jsonrpc: "2.0", id, result });
const rpcError = (id, code, message, data) => ({
  jsonrpc: "2.0",
  id,
  error: data === undefined ? { code, message } : { code, message, data },
});

const TOOLS = [
  {
    name: "search_knowledge_base",
    description:
      "Full-text search the Switch Commerce knowledge base for products, " +
      "use cases, and sales material. Returns matching items ranked by " +
      "relevance with a relevance excerpt around the matched terms.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search terms (free-form, e.g. 'cash recycler atec' or 'kitchen tv')",
        },
        limit: {
          type: "integer",
          description: "Max results to return (1–25). Default 10.",
          minimum: 1,
          maximum: 25,
          default: 10,
        },
      },
      required: ["query"],
    },
  },
  {
    name: "list_products",
    description:
      "List all knowledge-base entries as a compact index of {id, title, " +
      "company, type}. Use this when you want to browse without a query.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_product",
    description:
      "Fetch the full record for a single knowledge-base entry by id.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string", description: "Product id" } },
      required: ["id"],
    },
  },
];

// Compact projection for list_products / search results
function summarize(p) {
  return {
    id: p.id,
    title: p.title,
    company: p.company,
    type: p.type,
    description: p.description,
  };
}

// Naive but effective ranking: case-insensitive token AND-match across the
// pre-built _searchBlob (or a fallback blob if absent), counting term hits
// for the score. Good enough for tens of thousands of entries; we have <100.
function searchProducts(products, query, limit = 10) {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  const scored = [];
  for (const p of products) {
    const blob =
      p._searchBlob ||
      [
        p.title, p.company, p.description, p.problem, p.plan, p.cta,
        p.success, p.transformation, p.useCases, p.keywords, p.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    let score = 0;
    let allMatch = true;
    for (const t of tokens) {
      const hits = (blob.match(new RegExp(escapeRegex(t), "g")) || []).length;
      if (!hits) { allMatch = false; break; }
      score += hits;
      // Title hits weigh more
      if ((p.title || "").toLowerCase().includes(t)) score += 5;
    }
    if (allMatch) scored.push({ p, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(({ p, score }) => ({
    ...summarize(p),
    score,
    excerpt: excerptAround(p, tokens),
  }));
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function excerptAround(p, tokens) {
  const text = [p.description, p.problem, p.plan, p.transformation]
    .filter(Boolean)
    .join(" — ");
  if (!text) return "";
  const lower = text.toLowerCase();
  for (const t of tokens) {
    const i = lower.indexOf(t);
    if (i >= 0) {
      const start = Math.max(0, i - 60);
      const end = Math.min(text.length, i + t.length + 100);
      return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
    }
  }
  return text.slice(0, 200) + (text.length > 200 ? "…" : "");
}

async function loadProducts() {
  const store = getStore(STORE_NAME);
  let products = await store.get(KEY, { type: "json" });
  if (!products) products = seedData;
  return products;
}

// MCP tool dispatch — returns a JSON-RPC `result` object
async function callTool(name, args) {
  const products = await loadProducts();

  if (name === "search_knowledge_base") {
    const query = String(args?.query || "");
    const limit = Math.min(Math.max(Number(args?.limit ?? 10), 1), 25);
    const results = searchProducts(products, query, limit);
    return {
      content: [
        {
          type: "text",
          text:
            results.length === 0
              ? `No matches in the knowledge base for "${query}".`
              : `Found ${results.length} match${results.length === 1 ? "" : "es"} for "${query}":\n\n` +
                results
                  .map(
                    (r, i) =>
                      `${i + 1}. ${r.title}${r.company ? ` (${r.company})` : ""}` +
                      `${r.type ? ` — ${r.type}` : ""}\n   id: ${r.id}\n   ${r.excerpt}`
                  )
                  .join("\n\n"),
        },
      ],
      structuredContent: { results },
    };
  }

  if (name === "list_products") {
    const list = products.map(summarize);
    return {
      content: [
        {
          type: "text",
          text:
            `Knowledge base contains ${list.length} entries:\n\n` +
            list
              .map((p, i) => `${i + 1}. ${p.title}${p.company ? ` (${p.company})` : ""} — id: ${p.id}`)
              .join("\n"),
        },
      ],
      structuredContent: { products: list },
    };
  }

  if (name === "get_product") {
    const id = String(args?.id || "");
    const product = products.find((p) => p.id === id);
    if (!product) {
      return {
        isError: true,
        content: [{ type: "text", text: `No product found with id ${id}` }],
      };
    }
    return {
      content: [
        {
          type: "text",
          text:
            `# ${product.title}${product.company ? ` (${product.company})` : ""}\n\n` +
            Object.entries(product)
              .filter(([k, v]) => v && !k.startsWith("_") && k !== "id")
              .map(([k, v]) => `## ${k}\n${typeof v === "string" ? v : JSON.stringify(v, null, 2)}`)
              .join("\n\n"),
        },
      ],
      structuredContent: { product },
    };
  }

  // Unknown tool
  throw Object.assign(new Error(`Unknown tool: ${name}`), { code: -32601 });
}

// JSON-RPC method dispatch
async function handleRpc(message) {
  const { id, method, params } = message;
  try {
    if (method === "initialize") {
      return rpcResult(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: { name: "switch-commerce-kb", version: "1.0.0" },
      });
    }
    if (method === "notifications/initialized") {
      // Notification — no response per JSON-RPC spec (no `id`).
      return null;
    }
    if (method === "tools/list") {
      return rpcResult(id, { tools: TOOLS });
    }
    if (method === "tools/call") {
      const result = await callTool(params?.name, params?.arguments || {});
      return rpcResult(id, result);
    }
    if (method === "ping") {
      return rpcResult(id, {});
    }
    return rpcError(id, -32601, `Method not found: ${method}`);
  } catch (err) {
    return rpcError(id, err.code || -32603, err.message || "Internal error");
  }
}

export async function handler(event, context) {
  connectLambda(event);

  // CORS preflight (Claude.ai / browser-based connectors send this)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, MCP-Protocol-Version",
        "Access-Control-Max-Age": "86400",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed — POST only" });
  }

  // Bearer-token auth. Constant-time compare to avoid token-length leaks.
  const authHeader = event.headers?.authorization || event.headers?.Authorization || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const expected = process.env.AGENT_SERVICE_TOKEN || "";
  if (!expected) {
    return jsonResponse(503, {
      error: "AGENT_SERVICE_TOKEN not configured on server",
    });
  }
  if (!bearer || !timingSafeEqualStr(bearer, expected)) {
    return jsonResponse(401, { error: "Unauthorized — invalid or missing bearer token" });
  }

  // Parse JSON-RPC body. Spec allows a single message or a batch (array).
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, rpcError(null, -32700, "Parse error"));
  }

  const messages = Array.isArray(body) ? body : [body];
  const responses = [];
  for (const msg of messages) {
    const r = await handleRpc(msg);
    if (r !== null) responses.push(r);
  }

  // Notifications-only batch → 202 Accepted with empty body
  if (responses.length === 0) {
    return { statusCode: 202, headers: { "Access-Control-Allow-Origin": "*" }, body: "" };
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(Array.isArray(body) ? responses : responses[0]),
  };
}
