import { apiUrl } from "./apiBase";
const DB_NAME = "scc-trade-show-resources";
const STORE_NAME = "files";
const ENDPOINT = apiUrl("/.netlify/functions/event-resources");
export const RESOURCE_FILE_ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.png,.jpg,.jpeg,.gif,.webp";
export const RESOURCE_MAX_BYTES = 5 * 1024 * 1024;

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
    const request = operation(transaction.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

async function authHeaders() {
  const identityUser = window.netlifyIdentity?.currentUser();
  if (!identityUser) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${await identityUser.jwt()}` };
}

function validateFile(file) {
  if (!file) throw new Error("Choose a file to upload.");
  if (file.size > RESOURCE_MAX_BYTES) throw new Error("Resource files must be 5 MB or smaller.");
}

async function prodRequest(method, query = "", body) {
  const response = await fetch(`${ENDPOINT}${query}`, { method, headers: await authHeaders(), body });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Resource file request failed");
  }
  return response;
}

const useDev = import.meta.env.DEV;

export async function uploadEventResource(eventId, file) {
  validateFile(file);
  if (useDev) {
    const id = crypto.randomUUID();
    await useStore("readwrite", (store) => store.put({ id, eventId, file }));
    return { fileId: id, fileName: file.name, contentType: file.type || "application/octet-stream", fileSize: file.size };
  }

  const form = new FormData();
  form.append("eventId", eventId);
  form.append("resource", file, file.name);
  return (await prodRequest("POST", "", form)).json();
}

export async function deleteEventResourceFile(eventId, fileId) {
  if (!fileId) return;
  if (useDev) return useStore("readwrite", (store) => store.delete(fileId));
  await prodRequest("DELETE", `?eventId=${encodeURIComponent(eventId)}&fileId=${encodeURIComponent(fileId)}`);
}

export async function downloadEventResourceFile(eventId, resource) {
  let blob;
  if (useDev) {
    const record = await useStore("readonly", (store) => store.get(resource.fileId));
    if (!record || record.eventId !== eventId) throw new Error("Resource file not found.");
    blob = record.file;
  } else {
    blob = await (await prodRequest("GET", `?eventId=${encodeURIComponent(eventId)}&fileId=${encodeURIComponent(resource.fileId)}`)).blob();
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = resource.fileName || resource.title || "event-resource";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
