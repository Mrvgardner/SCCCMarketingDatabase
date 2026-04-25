// Build a mailto: link that pre-fills a partner-ready email from a KB card.

function stripHtml(html) {
  if (!html) return "";
  // Browser-native, handles entities correctly
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent || "").replace(/\s+\n/g, "\n").trim();
}

function escapeHtml(text = "") {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function textToHtml(text = "") {
  return escapeHtml(text).replace(/\n/g, "<br />");
}

function section(label, value) {
  const text = stripHtml(value);
  if (!text) return "";
  return `${label}\n${text}\n\n`;
}

const DIVIDER = "—".repeat(40);

function getCompanyWebsite(company = "") {
  const normalized = company.toLowerCase();
  if (normalized.includes("clear choice")) return "https://clearchoicepay.com";
  return "https://switchcommerce.com";
}

function getBrandStyles(company = "") {
  const normalized = company.toLowerCase();
  if (normalized.includes("clear choice")) {
    return {
      accent: "#ff4f00",
      panel: "#fff5ef",
      text: "#1f2937",
    };
  }
  return {
    accent: "#0951fa",
    panel: "#eff4ff",
    text: "#1f2937",
  };
}

function buildShareContent(product, recipient = {}) {
  if (!product) return null;

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
    "If any questions come up after you've had a chance to review it, feel free to reply here-we're happy to help.\n\n"
  );

  parts.push(`${DIVIDER}\n\n`);

  parts.push(`PRODUCT OVERVIEW\n`);
  parts.push(`${product.title}\n`);
  if (product.company) parts.push(`${product.company}\n`);
  parts.push("\n");

  if (product.description) {
    parts.push(`${stripHtml(product.description)}\n\n`);
  }

  parts.push(section("The Challenge:", [product.problem, product.villain].filter(Boolean).join(" ")));
  parts.push(section("Our Solution:", product.plan));
  parts.push(section("Next step:", product.cta));

  const website = getCompanyWebsite(product.company);
  parts.push("LEARN MORE\n");
  parts.push(`${website}\n\n`);

  parts.push(`${DIVIDER}\n`);

  return {
    subject,
    toAddress,
    body: parts.filter(Boolean).join(""),
    website,
    firstName,
  };
}

export function buildProductShareMailto(product, recipient = {}) {
  const content = buildShareContent(product, recipient);
  if (!content) return "#";

  const to = content.toAddress ? encodeURIComponent(content.toAddress) : "";
  return `mailto:${to}?subject=${encodeURIComponent(content.subject)}&body=${encodeURIComponent(content.body)}`;
}

export function buildProductShareHtml(product, recipient = {}) {
  const content = buildShareContent(product, recipient);
  if (!content) return "";

  const styles = getBrandStyles(product.company);
  const description = stripHtml(product.description || "");
  const challenge = stripHtml([product.problem, product.villain].filter(Boolean).join(" "));
  const solution = stripHtml(product.plan || "");
  const nextStep = stripHtml(product.cta || "");

  const blocks = [];
  if (description) {
    blocks.push(`<p style=\"margin:0 0 16px 0; line-height:1.55;\">${textToHtml(description)}</p>`);
  }
  if (challenge) {
    blocks.push(`<h3 style=\"margin:18px 0 6px; font-size:16px; color:${styles.accent};\">The Challenge</h3><p style=\"margin:0; line-height:1.55;\">${textToHtml(challenge)}</p>`);
  }
  if (solution) {
    blocks.push(`<h3 style=\"margin:18px 0 6px; font-size:16px; color:${styles.accent};\">Our Solution</h3><p style=\"margin:0; line-height:1.55;\">${textToHtml(solution)}</p>`);
  }
  if (nextStep) {
    blocks.push(`<h3 style=\"margin:18px 0 6px; font-size:16px; color:${styles.accent};\">Next Step</h3><p style=\"margin:0; line-height:1.55;\">${textToHtml(nextStep)}</p>`);
  }

  return `
<div style="font-family:Arial, Helvetica, sans-serif; color:${styles.text}; font-size:15px; line-height:1.55;">
  <p style="margin:0 0 14px 0;">Hi ${escapeHtml(content.firstName)},</p>
  <p style="margin:0 0 14px 0;">It was great speaking with you today.</p>
  <p style="margin:0 0 14px 0;">As promised, here is the information I mentioned when we were on the phone. It walks through the details we discussed and should be a helpful reference if you need to revisit anything later.</p>
  <p style="margin:0 0 20px 0;">If any questions come up after you have had a chance to review it, feel free to reply here, we are happy to help.</p>

  <div style="border:1px solid #d1d5db; border-radius:12px; overflow:hidden; margin:0 0 20px 0;">
    <div style="background:${styles.accent}; color:#ffffff; padding:12px 16px; font-weight:700; letter-spacing:.2px;">
      PRODUCT OVERVIEW
    </div>
    <div style="background:${styles.panel}; padding:16px;">
      <h2 style="margin:0 0 4px 0; font-size:22px; line-height:1.25; color:#111827;">${escapeHtml(product.title || "")}</h2>
      ${product.company ? `<p style=\"margin:0 0 14px 0; font-size:13px; color:#4b5563;\">${escapeHtml(product.company)}</p>` : ""}
      ${blocks.join("")}
    </div>
  </div>

  <p style="margin:0 0 8px 0; font-weight:700; color:${styles.accent};">LEARN MORE</p>
  <p style="margin:0 0 8px 0;"><a href="${escapeHtml(content.website)}" style="color:${styles.accent}; text-decoration:underline;">${escapeHtml(content.website)}</a></p>
</div>`.trim();
}

export async function copyProductShareHtml(product, recipient = {}) {
  const content = buildShareContent(product, recipient);
  if (!content) return { copiedHtml: false };

  const html = buildProductShareHtml(product, recipient);

  if (navigator.clipboard?.write && typeof window.ClipboardItem !== "undefined") {
    const item = new window.ClipboardItem({
      "text/plain": new Blob([content.body], { type: "text/plain" }),
      "text/html": new Blob([html], { type: "text/html" }),
    });
    await navigator.clipboard.write([item]);
    return { copiedHtml: true };
  }

  await navigator.clipboard.writeText(content.body);
  return { copiedHtml: false };
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
