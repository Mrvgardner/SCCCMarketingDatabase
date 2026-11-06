// Wording for a weekly highlights note, shared by the function that builds the
// draft and the admin screen that edits it, so both say the same thing.
//
// Assembly shortens group recognitions to "Dylan Kapustka and 1 other" and
// never names the rest, so "1 other" is a count, not a person: it is kept as
// `others` and shown as "+ 1 other", and counted but not named in the summary.

const OTHERS = /^(\d+)\s+others?$/i;

export function splitOthers(recipients = []) {
  let others = 0;
  const named = [];
  for (const name of recipients) {
    const match = String(name).trim().match(OTHERS);
    if (match) others += Number(match[1]);
    else if (String(name).trim()) named.push(String(name).trim());
  }
  return { recipients: named, others };
}

export function recipientLabel(h) {
  const names = h.recipients.join(", ");
  return h.others ? `${names} + ${h.others} other${h.others === 1 ? "" : "s"}` : names;
}

function list(names) {
  if (names.length <= 2) return names.join(" and ");
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

// "Danny Estes, Christian Michaels, David Standeven, and 6 others were
// recognized this week." Three names at most: it is a one-line preview.
export function highlightsExcerpt(highlights) {
  const named = [...new Set(highlights.flatMap((h) => h.recipients))];
  const unnamed = highlights.reduce((sum, h) => sum + (h.others || 0), 0);
  const total = named.length + unnamed;
  if (!total) return "This week's recognitions from across the team.";
  const shown = named.slice(0, 3);
  const rest = total - shown.length;
  const people = rest > 0 ? [...shown, `${rest} other${rest === 1 ? "" : "s"}`] : shown;
  return `${list(people)} ${total === 1 ? "was" : "were"} recognized this week.`;
}

export function highlightsText(highlights) {
  return highlights
    .map((h) => `🎉 ${recipientLabel(h)}${h.from ? ` (from ${h.from})` : ""}${h.badge ? ` · ${h.badge}` : ""}${h.message ? `\n"${h.message}"` : ""}`)
    .join("\n\n");
}
