// The Ask drawer and its request share the same signed-in Identity user.
// Never read an independent widget session or fall back to an anonymous call.
export const ASK_SIGN_IN_MESSAGE = "Your sign-in couldn’t be verified. Sign out of SwitchCommerce.team and sign back in, then try again.";

function signInError() {
  return new Error(ASK_SIGN_IN_MESSAGE);
}

export async function sendAssistantRequest({
  user,
  endpoint,
  messages,
  eventId,
  fetchImpl = fetch,
  wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
}) {
  async function send(forceRefresh = false) {
    if (typeof user?.jwt !== "function") throw signInError();
    let token;
    try {
      token = await user.jwt(forceRefresh);
    } catch {
      throw signInError();
    }
    if (typeof token !== "string" || !token.trim()) throw signInError();

    return fetchImpl(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messages, eventId }),
    });
  }

  // A server rejection may be a stale cached token. Try a forced refresh once.
  // Preserve the independent, bounded retry for transient gateway failures.
  let refreshed = false;
  let retriedGateway = false;
  let response = await send();
  while (true) {
    if (response.status === 401) {
      if (refreshed) throw signInError();
      refreshed = true;
      response = await send(true);
    } else if ((response.status === 502 || response.status === 503) && !retriedGateway) {
      retriedGateway = true;
      await wait(1500);
      response = await send();
    } else {
      return response;
    }
  }
}
