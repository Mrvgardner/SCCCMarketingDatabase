import assert from "node:assert/strict";
import test from "node:test";
import OpenAI from "openai";
import { assistantClient, missingAssistantCredentials } from "../netlify/lib/assistant-client.mjs";

const url = "https://test-site.netlify.app";
const key = "test-only-key";
const env = { URL: url, NETLIFY_AI_GATEWAY_URL: url + "/.netlify/ai", NETLIFY_AI_GATEWAY_KEY: key };
const missing = () => new Error("Missing credentials. Please pass an apiKey.");

test("leaves established SDK defaults and legacy paths unchanged", () => {
  const calls = [];
  const create = (options) => { calls.push(options); return "client"; };
  assert.equal(assistantClient(env, create), "client");
  assert.equal(assistantClient({ ...env, NETLIFY_AI_GATEWAY_BASE_URL: url + "/legacy" }, create), "client");
  assert.deepEqual(calls, [undefined, { apiKey: key, baseURL: url + "/legacy" }]);
});

test("uses the trusted generic gateway only after a missing-credentials constructor failure", async () => {
  for (const suffix of ["/.netlify/ai", "/.netlify/ai/", "/.netlify/ai/v1", "/.netlify/ai/v1/"]) {
    const calls = [];
    const client = assistantClient({ ...env, NETLIFY_AI_GATEWAY_URL: url + suffix }, (options) => {
      if (!options) {
        // Disable any real developer environment credentials for this branch.
        return new OpenAI({ apiKey: null, adminAPIKey: null });
      }
      return new OpenAI({ ...options, maxRetries: 0, fetch: async (input, init) => {
        calls.push({ url: String(input), auth: new Headers(init.headers).get("authorization") });
        return Response.json({ choices: [] });
      } });
    });
    await client.chat.completions.create({
      model: "fixture", messages: [{ role: "user", content: "synthetic" }],
    });
    assert.deepEqual(calls, [{ url: url + "/.netlify/ai/v1/chat/completions", auth: "Bearer " + key }]);
  }
});

test("an incomplete or noncanonical generic configuration makes no fallback call", () => {
  for (const candidate of [undefined, "", "http://test-site.netlify.app/.netlify/ai",
    "https://test-site.netlify.app:8443/.netlify/ai", "https://offsite.example/.netlify/ai",
    url + "/wrong", url + "/.netlify/ai?q=1", url + "/.netlify/ai#x", "https://x@test-site.netlify.app/.netlify/ai"]) {
    let createCount = 0;
    assert.throws(() => assistantClient({ ...env, NETLIFY_AI_GATEWAY_URL: candidate }, () => {
      createCount++;
      throw missing();
    }), missingAssistantCredentials);
    assert.equal(createCount, 1);
  }
});

test("does not retry a noncredential constructor error", () => {
  let createCount = 0;
  const example = Object.assign(new Error("Missing credentials."), { status: 401 });
  assert.throws(() => assistantClient(env, () => { createCount++; throw example; }), example);
  assert.equal(createCount, 1);
});
