import assert from "node:assert/strict";
import test from "node:test";
import { ASK_SIGN_IN_MESSAGE, sendAssistantRequest } from "../src/api/assistant-session.mjs";

function fixture(statuses, jwt) {
  const requests = [];
  const refresh = [];
  const user = { jwt: async (force) => {
    refresh.push(force);
    return jwt ? jwt(force) : (refresh.includes(true) ? "new-session" : "current-session");
  } };
  const options = {
    user,
    endpoint: "/.netlify/functions/assistant",
    messages: [{ role: "user", content: "What is the next event?" }],
    eventId: "test-event",
    fetchImpl: async (url, request) => {
      requests.push({ url, ...request });
      return { status: statuses.shift() };
    },
  };
  return { options, requests, refresh };
}

test("uses the same signed-in user even when no widget global exists", async () => {
  const { options, requests, refresh } = fixture([200]);
  assert.equal((await sendAssistantRequest(options)).status, 200);
  assert.deepEqual(refresh, [false]);
  assert.equal(requests[0].headers.Authorization, "Bearer current-session");
  assert.deepEqual(JSON.parse(requests[0].body), { messages: options.messages, eventId: "test-event" });
});

test("on 401 forces one refresh and resubmits the same question with the fresh token", async () => {
  const { options, requests, refresh } = fixture([401, 200]);
  assert.equal((await sendAssistantRequest(options)).status, 200);
  assert.deepEqual(refresh, [false, true]);
  assert.equal(requests[1].headers.Authorization, "Bearer new-session");
  assert.equal(requests[0].body, requests[1].body);
});

test("a rejected refresh or invalid token produces sign-in guidance without leaking the error", async () => {
  for (const jwt of [() => { throw new Error("opaque integration detail"); }, () => " "]) {
    const { options, requests } = fixture([], jwt);
    await assert.rejects(sendAssistantRequest(options), { message: ASK_SIGN_IN_MESSAGE });
    assert.equal(requests.length, 0);
  }
});

test("anonymous callers never send a request", async () => {
  const { options, requests } = fixture([]);
  await assert.rejects(sendAssistantRequest({ ...options, user: null }), { message: ASK_SIGN_IN_MESSAGE });
  assert.equal(requests.length, 0);
});

test("401 after refresh fails closed", async () => {
  const { options, requests, refresh } = fixture([401, 401]);
  await assert.rejects(sendAssistantRequest(options), { message: ASK_SIGN_IN_MESSAGE });
  assert.deepEqual(refresh, [false, true]);
  assert.equal(requests.length, 2);
});

test("a model or server failure is never automatically replayed", async () => {
  for (const status of [500, 502, 503]) {
    const { options, requests, refresh } = fixture([status]);
    assert.equal((await sendAssistantRequest(options)).status, status);
    assert.equal(requests.length, 1);
    assert.deepEqual(refresh, [false]);
  }
  const { options, requests, refresh } = fixture([401, 503]);
  assert.equal((await sendAssistantRequest(options)).status, 503);
  assert.equal(requests.length, 2);
  assert.deepEqual(refresh, [false, true]);
});

test("authorization/validation/rate errors are not retried", async () => {
  for (const status of [400, 403, 429]) {
    const { options, requests } = fixture([status]);
    assert.equal((await sendAssistantRequest(options)).status, status);
    assert.equal(requests.length, 1);
  }
});
