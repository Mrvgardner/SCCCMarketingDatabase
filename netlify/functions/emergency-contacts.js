import { getStore } from "@netlify/blobs";
import { authenticate } from "../lib/auth.mjs";
import { withCors } from "../lib/http.mjs";
import { validateEmergencyContact, contactKey, emailFromKey } from "../lib/emergency-contact.mjs";

// Emergency contacts.
//
// Access rules, which are the whole point of this endpoint:
//   • You can always read and write your own, and only your own. The owner is
//     taken from the authenticated session, never from the request body, so
//     there is no way to write into someone else's record.
//   • Admins can read everyone's, because in an emergency a lead is the one
//     making the call. Admins still cannot write anyone else's.
//
// Each person's contact is its own blob key rather than a row in one shared
// document. Two people saving at the same time touch different keys, so the
// lost-update problem that the trade-shows store has cannot arise here.

const STORE_NAME = "emergency-contacts";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      // Never let a proxy or the browser hold on to someone's family details.
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}

export default withCors(async (request) => {
  const user = await authenticate(request);
  if (!user) return json({ error: "Unauthorized" }, 401);

  const email = String(user.email || "").trim().toLowerCase();
  if (!email) return json({ error: "Unauthorized" }, 401);

  const roles = user.roles || user.app_metadata?.roles || [];
  const isAdmin = roles.some((role) => String(role).toLowerCase() === "admin");
  const store = getStore({ name: STORE_NAME, consistency: "strong" });
  const myKey = contactKey(email);

  if (request.method === "GET") {
    const mine = await store.get(myKey, { type: "json" });

    if (!isAdmin) return json({ mine: mine || null });

    // Admin view: everyone's, so a lead can act without hunting.
    const { blobs } = await store.list();
    const entries = await Promise.all(
      blobs.map(async (blob) => {
        const contact = await store.get(blob.key, { type: "json" });
        return contact ? [emailFromKey(blob.key), contact] : null;
      }),
    );

    return json({
      mine: mine || null,
      all: Object.fromEntries(entries.filter(Boolean)),
    });
  }

  if (request.method !== "PUT") return json({ error: "Method not allowed" }, 405);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const result = validateEmergencyContact(payload?.contact);
  if (result.error) return json({ error: result.error }, 400);

  if (result.value === null) {
    await store.delete(myKey);
    return json({ mine: null });
  }

  const record = { ...result.value, updatedAt: new Date().toISOString() };
  await store.setJSON(myKey, record);
  return json({ mine: record });
});
