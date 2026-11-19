import assert from "node:assert/strict";
import test from "node:test";
import OpenAI from "openai";
import { assistantGatewayConfig, requestAssistantCompletion } from "../netlify/lib/assistant-gateway.mjs";

const key = "synthetic-gateway-key";
const env = { NETLIFY_AI_GATEWAY_KEY: key, NETLIFY_AI_GATEWAY_URL: "https://gateway.example.test/account" };

test("prefers the documented gateway URL and adds the OpenAI version path once", () => {
  assert.deepEqual(assistantGatewayConfig({ ...env, NETLIFY_AI_GATEWAY_BASE_URL: "https://legacy.example.test/v1" }), {
    apiKey: key, baseURL: "https://gateway.example.test/account/v1",
  });
  assert.equal(assistantGatewayConfig({ ...env, NETLIFY_AI_GATEWAY_URL: "https://gateway.example.test/account/v1/" }).baseURL,
    "https://gateway.example.test/account/v1");
});

test("retains a complete explicit legacy gateway configuration", () => {
  assert.deepEqual(assistantGatewayConfig({
    NETLIFY_AI_GATEWAY_KEY: key, NETLIFY_AI_GATEWAY_BASE_URL: "https://legacy.example.test/custom-path",
  }), { apiKey: key, baseURL: "https://legacy.example.test/custom-path" });
});

test("an incomplete provider pair cannot substitute for missing gateway configuration", () => {
  assert.deepEqual(assistantGatewayConfig({ OPENAI_API_KEY: "test-provider-key", OPENAI_BASE_URL: "https://api.openai.com/v1" }),
    { code: "gateway_url_invalid" });
  assert.deepEqual(assistantGatewayConfig({ OPENAI_API_KEY: "test-provider-key" }), { code: "gateway_config_missing" });
  assert.deepEqual(assistantGatewayConfig({ OPENAI_BASE_URL: "https://site.example.test/.netlify/ai" }), { code: "gateway_config_missing" });
  assert.deepEqual(assistantGatewayConfig({ NETLIFY_AI_GATEWAY_KEY: key }), { code: "gateway_config_missing" });
  assert.deepEqual(assistantGatewayConfig({ NETLIFY_AI_GATEWAY_URL: env.NETLIFY_AI_GATEWAY_URL }), { code: "gateway_config_missing" });
});

test("uses a complete provider pair only on the canonical Netlify AI path", async () => {
  const site = "https://site.example.test";
  const providerKey = "synthetic-netlify-provider-key";
  for (const urlPath of ["/.netlify/ai", "/.netlify/ai/", "/.netlify/ai/v1", "/.netlify/ai/v1/"]) {
    const config = assistantGatewayConfig({ URL: site, OPENAI_API_KEY: providerKey, OPENAI_BASE_URL: site + urlPath });
    assert.deepEqual(config, { apiKey: providerKey, baseURL: site + "/.netlify/ai/v1" });
  }
  let calls = 0;
  const config = assistantGatewayConfig({ URL: site, OPENAI_API_KEY: providerKey, OPENAI_BASE_URL: site + "/.netlify/ai" });
  await requestAssistantCompletion(config, { model: "fixture", messages: [{ role: "user", content: "synthetic" }] },
    (options) => new OpenAI({ ...options, maxRetries: 0, fetch: async (url, init) => {
      calls++;
      assert.equal(String(url), site + "/.netlify/ai/v1/chat/completions");
      assert.equal(new Headers(init.headers).get("authorization"), `Bearer ${providerKey}`);
      return Response.json({ choices: [] });
    } }));
  assert.equal(calls, 1);
});

test("rejects missing trusted site URL, other origins, direct providers, or invalid route details", () => {
  const site = "https://site.example.test";
  const providerKey = "synthetic-netlify-provider-key";
  for (const baseURL of ["invalid", "http://site.example.test/.netlify/ai", "https://other.example.test/.netlify/ai",
    "https://site.example.test:8443/.netlify/ai", "https://api.openai.com/.netlify/ai", site + "/v1",
    site + "/.netlify/ai/v2", site + "/.netlify/ai/v1/chat/completions", site + "/.netlify/ai?x=1",
    site + "/.netlify/ai#x", "https://user@site.example.test/.netlify/ai"]) {
    assert.deepEqual(assistantGatewayConfig({ URL: site, OPENAI_API_KEY: providerKey, OPENAI_BASE_URL: baseURL }),
      { code: "gateway_url_invalid" }, baseURL);
  }
  assert.deepEqual(assistantGatewayConfig({ OPENAI_API_KEY: providerKey, OPENAI_BASE_URL: site + "/.netlify/ai" }),
    { code: "gateway_url_invalid" });
  assert.equal(assistantGatewayConfig({ ...env, URL: site, OPENAI_API_KEY: providerKey, OPENAI_BASE_URL: site + "/.netlify/ai" }).apiKey, key);
});

test("rejects invalid URLs and direct-provider URLs without accepting a secondary URL", () => {
  for (const value of ["not a url", "http://gateway.example.test", "https://api.openai.com/v1", "https://gateway.example.test/?token=synthetic"]) {
    assert.deepEqual(assistantGatewayConfig({ ...env, NETLIFY_AI_GATEWAY_URL: value,
      NETLIFY_AI_GATEWAY_BASE_URL: "https://legacy.example.test/v1" }), { code: "gateway_url_invalid" });
  }
});

test("does not instantiate the provider if the configuration is absent", async () => {
  await assert.rejects(requestAssistantCompletion(assistantGatewayConfig({}), {}, () => assert.fail("SDK called")),
    /Assistant gateway unavailable/);
});

test("the real installed SDK sends synthetic prompts to the expected gateway path with no network", async () => {
  const config = assistantGatewayConfig(env);
  const prompts = ["Hello", "What is a trade show?", "Test request number three"];
  let calls = 0;
  const createClient = (options) => new OpenAI({
    ...options, maxRetries: 0,
    fetch: async (url, init) => {
      assert.equal(String(url), "https://gateway.example.test/account/v1/chat/completions");
      assert.equal(new Headers(init.headers).get("authorization"), `Bearer ${key}`);
      assert.equal(JSON.parse(init.body).messages[0].content, prompts[calls++]);
      return Response.json({ choices: [{ message: { content: '{"answer":"Synthetic result"}' } }] });
    },
  });
  for (const content of prompts) {
    const completion = await requestAssistantCompletion(config,
      { model: "synthetic-model", messages: [{ role: "user", content }] }, createClient);
    assert.equal(JSON.parse(completion.choices[0].message.content).answer, "Synthetic result");
  }
  assert.equal(calls, prompts.length);
});
