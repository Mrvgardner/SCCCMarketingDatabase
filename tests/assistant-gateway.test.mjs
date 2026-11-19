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

test("provider credentials cannot substitute for missing gateway configuration", () => {
  assert.deepEqual(assistantGatewayConfig({ OPENAI_API_KEY: "test-provider-key", OPENAI_BASE_URL: "https://api.openai.com/v1" }),
    { code: "gateway_config_missing" });
  assert.deepEqual(assistantGatewayConfig({ NETLIFY_AI_GATEWAY_KEY: key }), { code: "gateway_config_missing" });
  assert.deepEqual(assistantGatewayConfig({ NETLIFY_AI_GATEWAY_URL: env.NETLIFY_AI_GATEWAY_URL }), { code: "gateway_config_missing" });
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
