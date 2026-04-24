// Build a mailto: link that pre-fills a partner-ready email from a KB card.

function stripHtml(html) {
  if (!html) return "";
  // Browser-native, handles entities correctly
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent || "").replace(/\s+\n/g, "\n").trim();
}

function section(label, value) {
  const text = stripHtml(value);
  if (!text) return "";
  return `${label}\n${text}\n\n`;
}

const DIVIDER = "—".repeat(40);

export function buildProductShareMailto(product, recipient = {}) {
  if (!product) return "#";

  const subject = `${product.title}${product.company ? ` — ${product.company}` : ""}`;
  const firstName = (recipient.name || "").trim().split(/\s+/)[0] || "[First Name]";
  const toAddress = (recipient.email || "").trim();

  const parts = [];
  parts.push(`Hi ${firstName},\n\n`);
  parts.push("It was great speaking with you today.\n\n");
  parts.push(
    "As promised, here's the info I mentioned when we were on the phone. It walks through the details we discussed and should be a helpful reference if you need to revisit anything later.\n\n"
  );
  parts.push(
    "If any questions come up after you've had a chance to review it, feel free to reply here—we're happy to help.\n\n"
  );

  parts.push(`${DIVIDER}\n\n`);

  parts.push(`${product.title}\n`);
  if (product.company) parts.push(`${product.company}\n`);
  parts.push("\n");

  if (product.description) {
    parts.push(`${stripHtml(product.description)}\n\n`);
  }

  parts.push(section("The Challenge:", [product.problem, product.villain].filter(Boolean).join(" ")));
  parts.push(section("Our Solution:", product.plan));
  parts.push(section("Next step:", product.cta));

  parts.push(`${DIVIDER}\n`);

  const body = parts.filter(Boolean).join("");

  const to = toAddress ? encodeURIComponent(toAddress) : "";
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export async function copyProductText(product) {
  if (!product) return;
  const lines = [
    product.title,
    product.company,
    "",
    stripHtml(product.description),
    "",
    product.problem && `Challenge: ${stripHtml([product.problem, product.villain].filter(Boolean).join(" "))}`,
    product.plan && `Solution: ${stripHtml(product.plan)}`,
    product.cta && `Next step: ${stripHtml(product.cta)}`,
  ].filter(Boolean);
  await navigator.clipboard.writeText(lines.join("\n"));
}
