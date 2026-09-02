// "Know this cold" — the short pinned list on the Booth screen.
//
// Two kinds of entry: a line someone typed, and a document someone attached.
// A document entry points at a file already uploaded through the event
// resources endpoint; the file is stored once and this only references it, so
// there is never a second copy to fall out of step with the first.

import { clean } from "./travel-input.mjs";

// The value of this list is that it is short enough to read while someone is
// waiting for you to answer them. Past this it has stopped being the important
// things and become another list nobody reads.
export const BRIEFING_LIMIT = 20;
export const BRIEFING_CROWDED = 6;

const TEXT_MAX = 300;

export function validateBriefing(items) {
  if (items === undefined || items === null) return { value: [] };
  if (!Array.isArray(items)) return { error: "Unexpected format." };
  if (items.length > BRIEFING_LIMIT) {
    return { error: `Keep it to ${BRIEFING_LIMIT} items or fewer — this list is meant to be read at a glance.` };
  }

  const value = [];
  const seen = new Set();

  for (const item of items) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return { error: "Unexpected format." };
    }

    const id = clean(item.id, 60);
    if (!id) return { error: "Every item needs an id." };
    if (seen.has(id)) return { error: "Two items share an id." };
    seen.add(id);

    const author = clean(item.author, 80);
    const createdAt = clean(item.createdAt, 40);

    if (item.kind === "file") {
      const fileId = clean(item.fileId, 80);
      if (!fileId) return { error: "That attachment is missing its file." };
      value.push({
        id,
        kind: "file",
        fileId,
        fileName: clean(item.fileName, 200) || "Attachment",
        contentType: clean(item.contentType, 120),
        fileSize: Number.isFinite(Number(item.fileSize)) ? Number(item.fileSize) : 0,
        author,
        createdAt,
      });
      continue;
    }

    const text = clean(item.text, TEXT_MAX, { multiline: true });
    if (!text) return { error: "Add the note before saving it." };
    value.push({ id, kind: "note", text, author, createdAt });
  }

  return { value };
}
