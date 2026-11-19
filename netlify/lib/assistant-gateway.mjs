function httpsGatewayUrl(candidate) {
  let url;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password ||
      url.search || url.hash || url.hostname === "openai.com" ||
      url.hostname.endsWith(".openai.com")) {
    return null;
  }
  return url;
}

function withOpenAIVersion(url) {
  const path = url.pathname.replace(/\/+$/, "");
  url.pathname = path.endsWith("/v1") ? path : `${path}/v1`;
  return url.href;
}

// Use the Netlify gateway explicitly. OpenAI's SDK defaults can route directly
// to the provider, which is not an acceptable fallback for this briefing.
export function assistantGatewayConfig(env = process.env) {
  const apiKey = env.NETLIFY_AI_GATEWAY_KEY?.trim();
  const gateway = env.NETLIFY_AI_GATEWAY_URL?.trim();
  const legacyBase = env.NETLIFY_AI_GATEWAY_BASE_URL?.trim();
  const candidate = gateway || legacyBase;
  if (apiKey && candidate) {
    const url = httpsGatewayUrl(candidate);
    if (!url) return { code: "gateway_url_invalid" };

    // The generic gateway URL can omit the OpenAI API version path. Keep legacy
    // SDK base URLs unchanged; existing configurations may already include it.
    return { apiKey, baseURL: gateway ? withOpenAIVersion(url) : url.href };
  }

  // Netlify also injects provider-specific credentials, unless overridden.
  // Only trust that pair if the endpoint is the official gateway route on the
  // canonical origin the Netlify Functions runtime sets in URL.
  const providerKey = env.OPENAI_API_KEY?.trim();
  const providerBase = env.OPENAI_BASE_URL?.trim();
  if (!providerKey || !providerBase) return { code: "gateway_config_missing" };
  const site = httpsGatewayUrl(env.URL?.trim());
  const url = httpsGatewayUrl(providerBase);
  if (!site || !url || site.port || url.port || site.origin !== url.origin ||
      !/^\/\.netlify\/ai(?:\/v1)?\/?$/.test(url.pathname)) {
    return { code: "gateway_url_invalid" };
  }
  return { apiKey: providerKey, baseURL: withOpenAIVersion(url) };
}

export async function requestAssistantCompletion(config, request, createClient) {
  if (!config.apiKey || !config.baseURL) throw new Error("Assistant gateway unavailable");
  return createClient({ apiKey: config.apiKey, baseURL: config.baseURL }).chat.completions.create(request);
}
