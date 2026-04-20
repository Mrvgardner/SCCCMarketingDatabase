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

export function buildProductShareMailto(product, { sharedBy } = {}) {
  if (!product) return "#";

  const subject = `${product.title}${product.company ? ` — ${product.company}` : ""}`;

  const parts = [];
  parts.push(`Hi,\n\nHere's some information about ${product.title} from ${product.company || "Switch Commerce"}:\n\n`);

  if (product.description) {
    parts.push(`${stripHtml(product.description)}\n\n`);
  }

  parts.push(section("The Challenge:", [product.problem, product.villain].filter(Boolean).join(" ")));
  parts.push(section("Our Solution:", product.plan));
  parts.push(section("Call to action:", product.cta));

  if (product.id) {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://switchcommerce.team";
    parts.push(`View this card: ${origin}/products?id=${encodeURIComponent(product.id)}\n\n`);
  }

  if (sharedBy) {
    parts.push(`— ${sharedBy}\n`);
  }

  const body = parts.filter(Boolean).join("");

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
