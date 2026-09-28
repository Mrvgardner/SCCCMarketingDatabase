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

// `tone` says what the text sits on. Most of the site is dark, so that is the
// default; the knowledge base pop-up is a white card, where the dark-page
// styling rendered bold text and headings white on white.
const TONES = {
  dark: "prose prose-invert max-w-none prose-a:text-[#0a7cff] prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-headings:text-white",
  light: "prose max-w-none not-italic prose-a:text-[#0951fa] prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-headings:text-gray-900 prose-li:marker:text-gray-400",
};

export default function RichText({ content, className = "", tone = "dark" }) {
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
        className={`${TONES[tone] || TONES.dark} ${className}`}
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    );
  }

  // Legacy plain-text content — use existing paragraph/bullet formatter
  return <div className={className}>{formatTextContent(content)}</div>;
}
