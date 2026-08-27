import { expenseCategories, suggestExpenseCategory } from "../data/expenseCategories";
import { apiUrl } from "./apiBase";
import {
  queueReceipt,
  queuedAsReceipt,
  isOfflineError,
  flushReceiptQueue,
  listQueuedReceipts,
  removeQueuedReceipt,
} from "./receiptQueue";

const DB_NAME = "scc-trade-show-expenses";
const STORE_NAME = "receipts";
const ENDPOINT = apiUrl("/.netlify/functions/receipts");

function resolveEventId(eventId) {
  if (eventId) return eventId;
  return decodeURIComponent(window.location.pathname.match(/\/events\/([^/]+)/)?.[1] || "");
}

async function normalizeReceiptImage(file) {
  const bitmap = await createImageBitmap(file);
  const maxDimension = 2400;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Could not prepare receipt image")), "image/jpeg", 0.92));
  const baseName = (file.name || "receipt").replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function useStore(mode, operation) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = operation(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

function userEmail(user) {
  return user?.email || "dev@localhost";
}

function parseMoney(text, label) {
  const lines = String(text || "").split(/\r?\n/).filter((line) => new RegExp(label, "i").test(line));
  for (const line of lines.reverse()) {
    const matches = [...line.matchAll(/(?:\$\s*)?(\d{1,6}[.,]\d{2})/g)];
    const match = matches.at(-1);
    if (match) return Number(match[1].replace(",", "."));
  }
  return 0;
}

function parseLocalReceipt(text, fileName) {
  const lines = String(text || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const dateMatch = text.match(/\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})\b/);
  let date = "";
  if (dateMatch) {
    const year = dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3];
    date = `${year}-${dateMatch[1].padStart(2, "0")}-${dateMatch[2].padStart(2, "0")}`;
  }
  const total = parseMoney(text, "(?:grand\\s+)?total") || Math.max(0, ...[...text.matchAll(/(?:\$\s*)?(\d{1,6}[.,]\d{2})/g)].map((match) => Number(match[1].replace(",", "."))));
  const tax = parseMoney(text, "tax");
  const tip = parseMoney(text, "tip|gratuity");
  const printedSubtotal = parseMoney(text, "subtotal");
  const subtotal = printedSubtotal || (total > tax + tip ? Math.round((total - tax - tip) * 100) / 100 : 0);
  const thankYouMerchant = text.match(/thanks?\s+for\s+(?:shopping|dining)\s+at\s+([^!\n\r]+)/i)?.[1];
  const numberedLocation = lines.find((line) => /[a-z].*#\s*\d+/i.test(line) && !/store\s*#/i.test(line));
  const merchant = String(thankYouMerchant || numberedLocation || lines.find((line) => /[a-z]{3}/i.test(line) && line.length < 70) || fileName.replace(/\.[^.]+$/, ""))
    .replace(/\s+#\s*\d+.*$/i, "")
    .replace(/[^a-z0-9&'., -]+$/i, "")
    .trim();
  return {
    merchant,
    date,
    category: suggestExpenseCategory(`${merchant} ${text} ${fileName}`),
    subtotal,
    tax,
    tip,
    total,
    currency: "USD",
    confidence: "Needs review",
    analysisNote: "Read locally with OCR. Confirm all values before finalizing.",
  };
}

async function analyzeLocally(file) {
  let worker;
  try {
    const module = await import("tesseract.js");
    const tesseract = module.default || module;
    worker = await tesseract.createWorker("eng");
    await worker.setParameters({
      tessedit_pageseg_mode: tesseract.PSM.SINGLE_BLOCK,
      preserve_interword_spaces: "1",
    });
    const result = await worker.recognize(file);
    return parseLocalReceipt(result.data.text, file.name);
  } catch {
    return {
      merchant: "",
      date: "",
      category: "Other",
      subtotal: 0,
      tax: 0,
      tip: 0,
      total: 0,
      currency: "USD",
      confidence: "Needs review",
      analysisNote: "Automatic reading was unavailable. Enter the receipt details manually.",
    };
  } finally {
    await worker?.terminate().catch(() => {});
  }
}

async function authHeaders() {
  const identityUser = window.netlifyIdentity?.currentUser();
  if (!identityUser) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${await identityUser.jwt()}` };
}

async function request(method, query = "", body) {
  const headers = await authHeaders();
  if (typeof body === "string") headers["Content-Type"] = "application/json";
  const response = await fetch(`${ENDPOINT}${query}`, { method, headers, body });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Receipt request failed");
  }
  return response;
}

async function devList(eventId, user) {
  const all = await useStore("readonly", (store) => store.getAll());
  return all.filter((item) => item.eventId === eventId && item.userEmail === userEmail(user)).map(({ image: _image, ...item }) => item);
}

async function devCreate(eventId, file, user) {
  const analysis = await analyzeLocally(file);
  const receipt = {
    id: crypto.randomUUID(),
    eventId,
    userEmail: userEmail(user),
    fileName: file.name || "receipt.jpg",
    contentType: file.type || "image/jpeg",
    createdAt: new Date().toISOString(),
    businessPurpose: "",
    notes: "",
    confirmed: false,
    ...analysis,
    image: file,
  };
  await useStore("readwrite", (store) => store.put(receipt));
  const { image: _image, ...metadata } = receipt;
  return metadata;
}

async function devUpdate(receipt, user) {
  const existing = await useStore("readonly", (store) => store.get(receipt.id));
  if (!existing || existing.userEmail !== userEmail(user)) throw new Error("Receipt not found");
  const next = { ...existing, ...receipt, image: existing.image, userEmail: existing.userEmail, eventId: existing.eventId };
  await useStore("readwrite", (store) => store.put(next));
  const { image: _image, ...metadata } = next;
  return metadata;
}

async function devDelete(receiptId, user) {
  const existing = await useStore("readonly", (store) => store.get(receiptId));
  if (!existing || existing.userEmail !== userEmail(user)) throw new Error("Receipt not found");
  await useStore("readwrite", (store) => store.delete(receiptId));
}

async function devImage(receiptId, user) {
  const existing = await useStore("readonly", (store) => store.get(receiptId));
  if (!existing || existing.userEmail !== userEmail(user)) throw new Error("Receipt not found");
  return existing.image;
}

async function devReanalyze(receiptId, user) {
  const existing = await useStore("readonly", (store) => store.get(receiptId));
  if (!existing || existing.userEmail !== userEmail(user)) throw new Error("Receipt not found");
  const analysis = await analyzeLocally(existing.image);
  return devUpdate({ ...existing, ...analysis, confirmed: false }, user);
}

const useDev = import.meta.env.DEV;

export async function listReceipts(eventId, user) {
  eventId = resolveEventId(eventId);
  if (useDev) return devList(eventId, user);
  const queued = (await listQueuedReceipts(eventId)).map(queuedAsReceipt);
  try {
    const remote = await (await request("GET", `?eventId=${encodeURIComponent(eventId)}`)).json();
    return [...queued, ...remote];
  } catch (error) {
    // Offline: the queued ones are all we have, and showing them beats an error.
    if (isOfflineError(error)) return queued;
    throw error;
  }
}

// The actual network upload, separated so the offline queue can replay it
// later without going back through the queueing branch.
async function uploadReceiptNow(eventId, preparedFile, user) {
  const data = new FormData();
  data.append("eventId", eventId);
  data.append("receipt", preparedFile, preparedFile.name);
  const created = await (await request("POST", "", data)).json();
  if (!created.analysisNote?.startsWith("Automatic reading was unavailable")) return created;
  const localAnalysis = await analyzeLocally(preparedFile);
  return updateReceipt({ ...created, ...localAnalysis, confirmed: false }, user);
}

export async function createReceipt(eventId, file, user) {
  eventId = resolveEventId(eventId);
  const preparedFile = await normalizeReceiptImage(file);
  if (useDev) return devCreate(eventId, preparedFile, user);
  try {
    return await uploadReceiptNow(eventId, preparedFile, user);
  } catch (error) {
    // Only park it for a network failure. A rejection from the function — bad
    // file, expired session — will never succeed on retry and must surface.
    if (!isOfflineError(error)) throw error;
    return queuedAsReceipt(await queueReceipt(eventId, preparedFile));
  }
}

// Send anything parked by an earlier offline upload. Safe to call often.
export async function flushReceipts(eventId, user) {
  if (useDev) return { uploaded: [], remaining: 0 };
  return flushReceiptQueue(
    resolveEventId(eventId),
    (queuedEventId, file) => uploadReceiptNow(queuedEventId, file, user),
  );
}

export async function pendingReceiptCount(eventId) {
  if (useDev) return 0;
  return (await listQueuedReceipts(resolveEventId(eventId))).length;
}

export async function updateReceipt(receipt, user) {
  if (String(receipt?.id).startsWith("queued-")) {
    throw new Error("This receipt has not uploaded yet. It can be edited once it sends.");
  }
  if (useDev) return devUpdate(receipt, user);
  return (await request("PUT", "", JSON.stringify(receipt))).json();
}

export async function deleteReceipt(receiptId, eventId, user) {
  if (String(receiptId).startsWith("queued-")) return removeQueuedReceipt(receiptId);
  eventId = resolveEventId(eventId);
  if (useDev) return devDelete(receiptId, user);
  await request("DELETE", `?eventId=${encodeURIComponent(eventId)}&receiptId=${encodeURIComponent(receiptId)}`);
}

export async function getReceiptImage(receiptId, eventId, user) {
  eventId = resolveEventId(eventId);
  if (useDev) return devImage(receiptId, user);
  return (await request("GET", `?eventId=${encodeURIComponent(eventId)}&receiptId=${encodeURIComponent(receiptId)}&image=1`)).blob();
}

export async function reanalyzeReceipt(receiptId, eventId, user) {
  eventId = resolveEventId(eventId);
  if (useDev) return devReanalyze(receiptId, user);
  try {
    return await (await request("PATCH", `?eventId=${encodeURIComponent(eventId)}&receiptId=${encodeURIComponent(receiptId)}`)).json();
  } catch (error) {
    const image = await getReceiptImage(receiptId, eventId, user);
    const localAnalysis = await analyzeLocally(new File([image], `receipt-${receiptId}.jpg`, { type: image.type || "image/jpeg" }));
    if (localAnalysis.analysisNote?.startsWith("Automatic reading was unavailable")) throw error;
    return updateReceipt({ id: receiptId, ...localAnalysis, confirmed: false }, user);
  }
}

export { expenseCategories };
