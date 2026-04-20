import { connectLambda, getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";

const STORE_NAME = "content-images";
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB per image
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export async function handler(event, context) {
  connectLambda(event);

  const user = context.clientContext?.user;
  const roles = user?.app_metadata?.roles || [];
  const isAdmin = roles.includes("admin");
  const method = event.httpMethod;
  const store = getStore(STORE_NAME);

  // Serve an image — any logged-in user can view content images
  if (method === "GET") {
    if (!user) return json(401, { error: "Unauthorized" });
    const id = event.queryStringParameters?.id;
    if (!id || !/^[a-z0-9-]+$/i.test(id)) return json(400, { error: "Bad id" });

    const result = await store.getWithMetadata(id, { type: "arrayBuffer" });
    if (!result || !result.data) return json(404, { error: "Not found" });

    const contentType = result.metadata?.contentType || "application/octet-stream";
    const buffer = Buffer.from(result.data);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
      body: buffer.toString("base64"),
      isBase64Encoded: true,
    };
  }

  // Upload — admin only
  if (method === "POST") {
    if (!user) return json(401, { error: "Unauthorized" });
    if (!isAdmin) return json(403, { error: "Forbidden — admin role required" });

    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return json(400, { error: "Invalid JSON body" });
    }

    const { contentType, data, filename } = body;
    if (!contentType || !data) return json(400, { error: "Missing contentType or data" });
    if (!ALLOWED_TYPES.has(contentType)) {
      return json(400, { error: `Unsupported type: ${contentType}` });
    }

    const buffer = Buffer.from(data, "base64");
    if (buffer.byteLength > MAX_BYTES) {
      return json(413, { error: `Too large — max ${Math.floor(MAX_BYTES / 1024 / 1024)}MB` });
    }

    const id = randomUUID();
    await store.set(id, buffer, {
      metadata: { contentType, filename: filename || "upload" },
    });

    return json(201, {
      id,
      url: `/.netlify/functions/images?id=${id}`,
    });
  }

  return json(405, { error: "Method not allowed" });
}
