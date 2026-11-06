import { recipientLabel } from "../data/highlights";

// The first few recognitions of a highlights week, for the cards that link to
// it (the home page, the Field Notes list), with a count of the rest. A week
// is its recognitions; a sentence of names leaves the card empty.

export default function HighlightPreview({ highlights = [], max = 2, className = "" }) {
  const shown = highlights.slice(0, max);
  const rest = highlights.length - shown.length;
  return (
    <div className={`space-y-2.5 ${className}`}>
      {shown.map((h, i) => (
        <div key={i} className="rounded-lg bg-black/20 px-3 py-2.5">
          <p className="text-sm font-semibold text-white">
            🎉 {recipientLabel(h)}
            {h.from && <span className="font-normal text-white/60"> · from {h.from}</span>}
          </p>
          {h.message && <p className="mt-1 text-[13px] leading-snug text-white/85 line-clamp-2">“{h.message}”</p>}
        </div>
      ))}
      {rest > 0 && (
        <p className="text-sm text-white/75">
          + {rest} more recognition{rest === 1 ? "" : "s"} this week
        </p>
      )}
    </div>
  );
}
