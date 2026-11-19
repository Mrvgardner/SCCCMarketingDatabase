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

  // Auth is checked before any processing or usage write. Only a 401
  // authorizes one automatic repeat; backend failures may already be billed.
  let response = await send();
  if (response.status === 401) response = await send(true);
  if (response.status === 401) throw signInError();
  return response;
}
