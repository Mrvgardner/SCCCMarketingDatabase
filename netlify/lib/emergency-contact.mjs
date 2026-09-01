// Emergency contact: who to call if something happens to someone on the road.
//
// This is a colleague's family, so the rules here are deliberately tighter than
// the rest of the app. Nothing is inferred, nothing is half-saved: an entry is
// either complete enough to act on in an emergency or it is not stored at all.
// A name with no number would be worse than nothing, because it looks like
// cover that isn't there.

import { clean } from "./travel-input.mjs";

// Deliberately permissive about shape — people write "(940) 391-5591",
// "940.391.5591", "+44 20 7946 0958". What matters is that there are enough
// digits to be a real number, not that it matches a US format.
const MIN_PHONE_DIGITS = 7;
const MAX_PHONE_DIGITS = 15; // E.164 upper bound

export function validateEmergencyContact(input) {
  if (input !== undefined && input !== null && (typeof input !== "object" || Array.isArray(input))) {
    return { error: "Unexpected format." };
  }

  const name = clean(input?.name, 120);
  const relationship = clean(input?.relationship, 60);
  const phone = clean(input?.phone, 40);
  const notes = clean(input?.notes, 300, { multiline: true });

  // Entirely blank is how someone removes theirs.
  if (!name && !relationship && !phone && !notes) return { value: null };

  if (!name) return { error: "Add the name of the person to call." };
  if (!phone) return { error: "Add a phone number — a name alone is no use in an emergency." };

  const digits = phone.replace(/\D/g, "");
  if (digits.length < MIN_PHONE_DIGITS || digits.length > MAX_PHONE_DIGITS) {
    return { error: "That phone number does not look complete. Include the area code." };
  }

  return { value: { name, relationship, phone, notes } };
}

// Blob keys have to survive a round trip and must not let one person's email
// collide with another's. Lowercase for stability, then encode everything that
// is not plainly safe.
export function contactKey(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return "";
  return `${encodeURIComponent(normalized)}.json`;
}

export function emailFromKey(key) {
  return decodeURIComponent(String(key || "").replace(/\.json$/, ""));
}
