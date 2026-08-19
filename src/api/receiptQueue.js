// Offline queue for receipt uploads.
//
// Convention-centre wifi is the whole reason this exists: an upload is a
// multi-megabyte POST, and on the expo floor it frequently just fails. Rather
// than losing the photo, park it here and send it later.
//
// Deliberately NOT the Background Sync API. Safari still does not implement it
// on iOS as of 2026 and Apple has taken no public position on the spec, so a
// sync-event design would silently do nothing on exactly the phones the team
// carries. Instead the queue is replayed when the app is next open and online,
// which works everywhere.

const DB_NAME = "scc-receipt-queue";
const STORE_NAME = "pending";

// Keep the queue bounded — receipt images are ~1-3 MB each after downscaling
// and IndexedDB quota is not generous on iOS.
const MAX_QUEUED = 25;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(mode, operation) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = operation(transaction.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

export function isOfflineError(error) {
  // A failed fetch throws TypeError with a browser-specific message; an
  // explicit offline signal is the other giveaway. Anything else — a 4xx from
  // the function, an auth failure — is a real error the user must see, not
  // something to silently retry forever.
  if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
  return error instanceof TypeError;
}

export async function queueReceipt(eventId, file) {
  const queued = await listQueuedReceipts();
  if (queued.length >= MAX_QUEUED) {
    throw new Error("Too many receipts are already waiting to upload. Reconnect and let them send first.");
  }
  const id = `queued-${crypto.randomUUID()}`;
  const record = {
    id,
    eventId,
    file,
    fileName: file?.name || "receipt.jpg",
    queuedAt: new Date().toISOString(),
  };
  await withStore("readwrite", (store) => store.put(record));
  return record;
}

export async function listQueuedReceipts(eventId) {
  const all = (await withStore("readonly", (store) => store.getAll())) || [];
  return eventId ? all.filter((record) => record.eventId === eventId) : all;
}

export async function removeQueuedReceipt(id) {
  await withStore("readwrite", (store) => store.delete(id));
}

// A queued item rendered as something the receipt list can display, so a
// pending upload is visible rather than appearing to have vanished.
export function queuedAsReceipt(record) {
  return {
    id: record.id,
    eventId: record.eventId,
    fileName: record.fileName,
    createdAt: record.queuedAt,
    pendingUpload: true,
    merchant: "",
    date: "",
    category: "Other",
    subtotal: 0,
    tax: 0,
    tip: 0,
    total: 0,
    currency: "USD",
    confidence: "Needs review",
    analysisNote: "Waiting to upload. This sends automatically once you are back online.",
    confirmed: false,
  };
}

// Try to send everything queued for an event. Returns what actually uploaded so
// the caller can swap the placeholders for real receipts.
//
// `upload` is injected rather than imported to keep this module free of a
// circular dependency with api/expenses.js.
export async function flushReceiptQueue(eventId, upload) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return { uploaded: [], remaining: -1 };

  const queued = await listQueuedReceipts(eventId);
  const uploaded = [];

  for (const record of queued) {
    try {
      const receipt = await upload(record.eventId, record.file);
      await removeQueuedReceipt(record.id);
      uploaded.push({ placeholderId: record.id, receipt });
    } catch (error) {
      // Still offline, or the server is unreachable — stop and keep the rest
      // queued rather than hammering a dead connection.
      if (isOfflineError(error)) break;
      // A genuine rejection (bad file, auth) will never succeed on retry, so
      // drop it instead of blocking the queue forever.
      await removeQueuedReceipt(record.id);
      console.error("Dropped an unsendable queued receipt", error);
    }
  }

  const remaining = (await listQueuedReceipts(eventId)).length;
  return { uploaded, remaining };
}
