// Extract the first <img src="..."> from a rich-text HTML string.
// Returns null when the content is missing, plain text, or has no image.
export function extractFirstImage(html) {
  if (!html || typeof html !== "string") return null;
  const match = html.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i);
  return match ? match[1] : null;
}
