import { getStore } from "@netlify/blobs";
import { getUser } from "@netlify/identity";

const STORE_NAME = "trade-show-resource-files";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/csv",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);
const ALLOWED_EXTENSIONS = new Set(["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "csv", "txt", "png", "jpg", "jpeg", "gif", "webp"]);

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function clean(value, length = 180) {
  return String(value || "").trim().slice(0, length);
}

function validEventId(value) {
  return /^[a-z0-9-]+$/i.test(value);
}

function validFileId(value) {
  return /^[a-z0-9-]+$/i.test(value);
}

function fileKey(eventId, fileId) {
  return `events/${eventId}/${fileId}`;
}

export default async (request) => {
  const user = await getUser();
  if (!user) return json({ error: "Unauthorized" }, 401);

  const roles = user.roles || user.appMetadata?.roles || user.app_metadata?.roles || [];
  const isAdmin = roles.some((role) => role.toLowerCase() === "admin");
  const url = new URL(request.url);
  const queryEventId = clean(url.searchParams.get("eventId"), 80);
  const fileId = clean(url.searchParams.get("fileId"), 80);
  const store = getStore({ name: STORE_NAME, consistency: "strong" });

  if (request.method === "POST") {
    if (!isAdmin) return json({ error: "Admin role required" }, 403);
    const form = await request.formData();
    const eventId = clean(form.get("eventId"), 80);
    const file = form.get("resource");
    if (!validEventId(eventId) || !(file instanceof File)) return json({ error: "Event and resource file are required" }, 400);
    const extension = file.name.toLowerCase().split(".").pop();
    if (!ALLOWED_TYPES.has(file.type) && !ALLOWED_EXTENSIONS.has(extension)) return json({ error: "Unsupported file type" }, 400);
    if (file.size > MAX_BYTES) return json({ error: "Resource files must be 5 MB or smaller" }, 413);

    const id = crypto.randomUUID();
    const fileName = clean(file.name || "event-resource", 180);
    await store.set(fileKey(eventId, id), await file.arrayBuffer(), {
      metadata: { contentType: file.type || "application/octet-stream", fileName, eventId, uploadedBy: clean(user.email, 160) },
    });
    return json({ fileId: id, fileName, contentType: file.type || "application/octet-stream", fileSize: file.size }, 201);
  }

  if (!validEventId(queryEventId) || !validFileId(fileId)) return json({ error: "Valid event and file are required" }, 400);

  if (request.method === "GET") {
    const result = await store.getWithMetadata(fileKey(queryEventId, fileId), { type: "arrayBuffer" });
    if (!result?.data) return json({ error: "Resource file not found" }, 404);
    const fileName = clean(result.metadata?.fileName || "event-resource", 180).replace(/["\\\r\n]/g, "_");
    return new Response(result.data, {
      headers: {
        "Content-Type": result.metadata?.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  if (request.method === "DELETE") {
    if (!isAdmin) return json({ error: "Admin role required" }, 403);
    await store.delete(fileKey(queryEventId, fileId));
    return new Response(null, { status: 204 });
  }

  return json({ error: "Method not allowed" }, 405);
};
