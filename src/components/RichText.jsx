import DOMPurify from "dompurify";
import { formatTextContent } from "../utils/textFormatter.jsx";

const ALLOWED_TAGS = [
  "p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li",
  "a", "h2", "h3", "span", "blockquote", "code", "img",
];
const ALLOWED_ATTR = [
  "href", "target", "rel", "style", "class",
  "src", "alt", "width", "height", "loading",
];

function looksLikeHTML(str) {
  return typeof str === "string" && /<\/?[a-z][\s\S]*>/i.test(str);
}

export default function RichText({ content, className = "" }) {
  if (!content) return null;

  if (looksLikeHTML(content)) {
    const clean = DOMPurify.sanitize(content, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      // Force external links to open safely
      ADD_ATTR: ["target", "rel"],
    });
    return (
      <div
        className={`prose prose-invert max-w-none prose-a:text-[#0a7cff] prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-headings:text-white ${className}`}
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    );
  }

  // Legacy plain-text content — use existing paragraph/bullet formatter
  return <div className={className}>{formatTextContent(content)}</div>;
}
