// OpenAI SDK 7.x reports missing credentials locally, before any model call.
export function missingAssistantCredentials(error) {
  return !Number(error?.status) && /^Missing credentials\./.test(error?.message || "");
}

function httpsUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol === "https:" && !url.port && !url.username && !url.password && !url.search && !url.hash) return url;
  } catch { /* reject incomplete or malformed configuration */ }
  return null;
}

export function assistantClient(env, createClient) {
  const apiKey = env.NETLIFY_AI_GATEWAY_KEY;
  const legacyBase = env.NETLIFY_AI_GATEWAY_BASE_URL;

  // Preserve the paths already in use on healthy invocations. This factory
  // runs in the function invocation: no cached client/env from a cold start.
  try {
    return apiKey && legacyBase ? createClient({ apiKey, baseURL: legacyBase }) : createClient();
  } catch (error) {
    if (!missingAssistantCredentials(error)) throw error;

    // Only for a locally failed SDK initialization (no call to replay).
    // Never use this key against arbitrary configured or direct-provider URLs.
    const site = httpsUrl(env.URL);
    const gateway = httpsUrl(env.NETLIFY_AI_GATEWAY_URL);
    const key = apiKey?.trim();
    if (!key || !site || !gateway || gateway.origin !== site.origin ||
        !/^\/\.netlify\/ai(?:\/v1)?\/?$/.test(gateway.pathname)) throw error;
    gateway.pathname = "/.netlify/ai/v1";
    return createClient({ apiKey: key, baseURL: gateway.href });
  }
}
