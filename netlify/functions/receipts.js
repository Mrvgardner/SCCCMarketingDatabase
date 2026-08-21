import { getStore } from "@netlify/blobs";
import { authenticate } from "../lib/auth.mjs";
import OpenAI from "openai";

const RECEIPT_STORE = "trade-show-receipts";
// Receipt reading is a bounded extraction task, so it runs on the cheapest
// current-generation vision model. reasoning_effort "none" keeps the call fast
// enough for a synchronous function — Luna's reasoning modes add many seconds
// of latency before the first token, which would blow the function timeout.
const RECEIPT_MODEL = process.env.RECEIPT_MODEL || "gpt-5.6-luna";
const CATEGORIES = [
  "Airfare", "Lodging", "Meals", "Ground transportation", "Rental car", "Fuel",
  "Parking and tolls", "Baggage fees", "Conference and event fees",
  "Internet and phone", "Business supplies", "Other",
];

const RECEIPT_SCHEMA = {
  name: "business_travel_receipt",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      merchant: { type: "string" },
      date: { type: "string", description: "Transaction date in YYYY-MM-DD format, or an empty string." },
      category: { type: "string", enum: CATEGORIES },
      subtotal: { type: "number", minimum: 0 },
      tax: { type: "number", minimum: 0 },
      tip: { type: "number", minimum: 0 },
      total: { type: "number", minimum: 0 },
      currency: { type: "string", description: "Three-letter ISO currency code." },
      confidence: { type: "string", enum: ["High", "Medium", "Needs review"] },
      analysisNote: { type: "string" },
    },
    required: ["merchant", "date", "category", "subtotal", "tax", "tip", "total", "currency", "confidence", "analysisNote"],
  },
};

function createReceiptAnalysisClient() {
  const apiKey = process.env.NETLIFY_AI_GATEWAY_KEY;
  const baseURL = process.env.NETLIFY_AI_GATEWAY_BASE_URL;

  // Netlify's standard OpenAI variables are injected at function startup.
  // Prefer the explicit gateway pair when the runtime exposes it.
  return apiKey && baseURL ? new OpenAI({ apiKey, baseURL }) : new OpenAI();
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function clean(value, length = 240) {
  return String(value || "").trim().slice(0, length);
}

function userKey(email) {
  return Buffer.from(email.toLowerCase()).toString("base64url");
}

function indexKey(eventId, email) {
  return `reports/${clean(eventId, 100)}/${userKey(email)}/index.json`;
}

// Vision calls are billed per request and any signed-in employee can trigger
// them — POST on upload, and PATCH re-reads an already-stored image with no
// upload at all, so a loop over one receipt could run unbounded. Cap per user
// per day instead of leaving the spend open-ended.
const ANALYSIS_DAILY_LIMIT = Number(process.env.RECEIPT_ANALYSIS_DAILY_LIMIT || 100);

async function withinAnalysisBudget(store, email) {
  const day = new Date().toISOString().slice(0, 10);
  const budgetKey = `usage/${userKey(email)}/${day}.json`;
  const used = (await store.get(budgetKey, { type: "json" }))?.count || 0;
  if (used >= ANALYSIS_DAILY_LIMIT) return false;
  await store.setJSON(budgetKey, { count: used + 1 });
  return true;
}

function eventIdFromReferer(request) {
  try {
    return clean(new URL(request.headers.get("referer")).pathname.match(/\/events\/([^/]+)/)?.[1], 100);
  } catch {
    return "";
  }
}

function sanitizeReceipt(receipt, existing = {}) {
  const number = (value) => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
  const category = CATEGORIES.includes(receipt.category) ? receipt.category : "Other";
  return {
    ...existing,
    id: existing.id,
    eventId: existing.eventId,
    userEmail: existing.userEmail,
    imageKey: existing.imageKey,
    fileName: existing.fileName,
    contentType: existing.contentType,
    createdAt: existing.createdAt,
    merchant: clean(receipt.merchant, 160),
    date: clean(receipt.date, 10),
    category,
    businessPurpose: clean(receipt.businessPurpose, 300),
    subtotal: number(receipt.subtotal),
    tax: number(receipt.tax),
    tip: number(receipt.tip),
    total: number(receipt.total),
    currency: clean(receipt.currency || "USD", 3).toUpperCase(),
    notes: clean(receipt.notes, 500),
    confidence: clean(receipt.confidence || existing.confidence || "Needs review", 40),
    analysisNote: clean(receipt.analysisNote || existing.analysisNote, 300),
    confirmed: receipt.confirmed === true,
  };
}

async function analyzeReceipt(file) {
  try {
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const openai = createReceiptAnalysisClient();
    const completion = await openai.chat.completions.create({
      model: RECEIPT_MODEL,
      reasoning_effort: "none",
      response_format: { type: "json_schema", json_schema: RECEIPT_SCHEMA },
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: `Read the entire business-travel receipt image carefully. It may be rotated, skewed, faded, handwritten, or photographed at an angle.

Extract the merchant name, transaction date, category, subtotal, tax, tip, final total, and currency. Follow these rules:
- Use the transaction date, not a print date, due date, or card expiration date.
- Use the final amount charged as total. Do not confuse balance, change, cash tendered, savings, or a suggested tip with the total.
- Use an explicitly printed tip or gratuity when present. Otherwise use 0.
- Use an explicitly printed subtotal and tax when present. Otherwise use 0 rather than guessing.
- Choose the category from the merchant and purchased items, not from the payment method.
- Check whether subtotal + tax + tip reasonably agrees with total. Lower confidence and explain any mismatch.
- Use an empty merchant/date and 0 for monetary fields that cannot be read. Never invent values.
- analysisNote must briefly identify uncertain or missing fields. If every field is clear and internally consistent, say that all printed values were read clearly.
- Do not return card numbers, authorization codes, loyalty identifiers, customer phone numbers, or other personal financial identifiers.`,
          },
          { type: "image_url", image_url: { url: `data:${file.type || "image/jpeg"};base64,${base64}`, detail: "high" } },
        ],
      }],
    });
    const analysis = JSON.parse(completion.choices[0]?.message?.content || "{}");
    const amounts = ["subtotal", "tax", "tip", "total"];
    for (const field of amounts) {
      const value = Number(analysis[field]);
      analysis[field] = Number.isFinite(value) && value >= 0 ? Math.round(value * 100) / 100 : 0;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(analysis.date || "")) analysis.date = "";
    analysis.currency = /^[A-Z]{3}$/.test(analysis.currency || "") ? analysis.currency : "USD";
    return analysis;
  } catch (error) {
    console.error("Receipt analysis failed", error);
    return { _analysisFailed: true, category: "Other", currency: "USD", confidence: "Needs review", analysisNote: "Automatic reading was unavailable. Enter the receipt details manually." };
  }
}

export default async (request) => {
  const user = await authenticate(request);
  if (!user?.email) return json({ error: "Unauthorized" }, 401);

  const url = new URL(request.url);
  const eventId = clean(url.searchParams.get("eventId"), 100) || eventIdFromReferer(request);
  const receiptId = clean(url.searchParams.get("receiptId"), 100);
  const store = getStore({ name: RECEIPT_STORE, consistency: "strong" });

  if (request.method === "POST") {
    const form = await request.formData();
    const postedEventId = clean(form.get("eventId"), 100) || eventId;
    const file = form.get("receipt");
    if (!postedEventId || !(file instanceof File)) return json({ error: "Event and receipt image are required" }, 400);
    if (!file.type.startsWith("image/")) return json({ error: "Receipt must be an image" }, 400);
    if (file.size > 5_500_000) return json({ error: "Receipt image must be smaller than 5.5 MB" }, 413);

    const key = indexKey(postedEventId, user.email);
    const receipts = await store.get(key, { type: "json" }) || [];
    const id = crypto.randomUUID();
    const extension = file.type === "image/png" ? "png" : "jpg";
    const imageKey = `reports/${postedEventId}/${userKey(user.email)}/images/${id}.${extension}`;
    const buffer = await file.arrayBuffer();
    const base = {
      id,
      eventId: postedEventId,
      userEmail: user.email,
      imageKey,
      fileName: clean(file.name || `receipt-${id}.${extension}`, 180),
      contentType: file.type,
      createdAt: new Date().toISOString(),
    };

    // Persist the image and a placeholder row BEFORE the vision call. Reading a
    // receipt can outrun the function timeout, and analyzing first meant a
    // timeout discarded the upload entirely — the user re-shot the receipt and
    // hit the same wall. Stored first, a timeout costs the reading, not the receipt.
    await store.set(imageKey, buffer, { metadata: { contentType: file.type, owner: user.email, eventId: postedEventId } });
    await store.setJSON(key, [...receipts, sanitizeReceipt({
      businessPurpose: "",
      notes: "",
      confidence: "Needs review",
      analysisNote: "Receipt saved. Automatic reading did not finish — check the amounts.",
    }, base)]);

    const withinBudget = await withinAnalysisBudget(store, user.email);
    const analysis = withinBudget
      ? await analyzeReceipt({ type: file.type, arrayBuffer: async () => buffer })
      : { _analysisFailed: true, category: "Other", currency: "USD", confidence: "Needs review", analysisNote: "Daily automatic-reading limit reached. Enter the receipt details manually." };
    const receipt = sanitizeReceipt({ ...analysis, businessPurpose: "", notes: "" }, base);
    await store.setJSON(key, [...receipts, receipt]);
    const { imageKey: _imageKey, ...publicReceipt } = receipt;
    return json(publicReceipt, 201);
  }

  if (!eventId) return json({ error: "Event is required" }, 400);
  const key = indexKey(eventId, user.email);
  const receipts = await store.get(key, { type: "json" }) || [];

  if (request.method === "GET" && receiptId && url.searchParams.get("image") === "1") {
    const receipt = receipts.find((item) => item.id === receiptId);
    if (!receipt) return json({ error: "Receipt not found" }, 404);
    const image = await store.get(receipt.imageKey, { type: "arrayBuffer" });
    if (!image) return json({ error: "Receipt image not found" }, 404);
    return new Response(image, { headers: { "Content-Type": receipt.contentType || "image/jpeg", "Cache-Control": "private, no-store" } });
  }

  if (request.method === "GET") {
    return json(receipts.map(({ imageKey: _imageKey, ...receipt }) => receipt));
  }

  if (request.method === "PATCH") {
    const index = receipts.findIndex((item) => item.id === receiptId);
    if (index === -1) return json({ error: "Receipt not found" }, 404);
    const image = await store.get(receipts[index].imageKey, { type: "arrayBuffer" });
    if (!image) return json({ error: "Receipt image not found" }, 404);
    if (!(await withinAnalysisBudget(store, user.email))) {
      return json({ error: "Daily automatic-reading limit reached. Try again tomorrow or enter the details manually." }, 429);
    }
    const analysis = await analyzeReceipt({
      type: receipts[index].contentType || "image/jpeg",
      arrayBuffer: async () => image,
    });
    if (analysis._analysisFailed) return json({ error: "The receipt reader is temporarily unavailable. Please try again." }, 503);
    receipts[index] = sanitizeReceipt({ ...receipts[index], ...analysis, confirmed: false }, receipts[index]);
    await store.setJSON(key, receipts);
    const { imageKey: _imageKey, ...publicReceipt } = receipts[index];
    return json(publicReceipt);
  }

  if (request.method === "PUT") {
    const payload = await request.json().catch(() => null);
    const index = receipts.findIndex((item) => item.id === payload?.id);
    if (index === -1) return json({ error: "Receipt not found" }, 404);
    receipts[index] = sanitizeReceipt(payload, receipts[index]);
    await store.setJSON(key, receipts);
    const { imageKey: _imageKey, ...publicReceipt } = receipts[index];
    return json(publicReceipt);
  }

  if (request.method === "DELETE") {
    const receipt = receipts.find((item) => item.id === receiptId);
    if (!receipt) return json({ error: "Receipt not found" }, 404);
    await store.delete(receipt.imageKey);
    await store.setJSON(key, receipts.filter((item) => item.id !== receiptId));
    return new Response(null, { status: 204 });
  }

  return json({ error: "Method not allowed" }, 405);
};
