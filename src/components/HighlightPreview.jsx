import { recipientLabel } from "../data/highlights";

// The recognitions of a highlights week, on the cards that link to it (the
// home page, the Field Notes list). A week is its recognitions; a sentence of
// names leaves the card empty.
//
// When there are more than fit, they scroll upward in a slow loop instead of
// being cut off at a count: hover pauses it, and a device set to reduce
// motion gets the first few and a count instead.

function Recognition({ h }) {
  return (
    <div className="rounded-lg bg-black/20 px-3 py-2.5">
      <p className="text-sm font-semibold text-white">
        🎉 {recipientLabel(h)}
        {h.from && <span className="font-normal text-white/60"> · from {h.from}</span>}
      </p>
      {h.message && <p className="mt-1 text-[13px] leading-snug text-white/85 line-clamp-2">“{h.message}”</p>}
    </div>
  );
}

const SECONDS_PER_CARD = 4;

export default function HighlightPreview({ highlights = [], max = 2, height = 200, className = "" }) {
  // Few enough to show outright: no motion needed.
  if (highlights.length <= max) {
    return (
      <div className={`space-y-2.5 ${className}`}>
        {highlights.map((h, i) => <Recognition key={i} h={h} />)}
      </div>
    );
  }

  const rest = highlights.length - max;
  return (
    <div className={className}>
      <div
        className="highlights-ticker-window relative overflow-hidden motion-reduce:hidden"
        style={{ height }}
        aria-label={`${highlights.length} recognitions this week`}
      >
        <div className="highlights-ticker" style={{ "--ticker-duration": `${highlights.length * SECONDS_PER_CARD}s` }}>
          {/* Twice, for a seamless loop; the copy is hidden from screen readers. */}
          {[0, 1].map((copy) => (
            <div key={copy} className="space-y-2.5 pb-2.5" aria-hidden={copy === 1 || undefined}>
              {highlights.map((h, i) => <Recognition key={i} h={h} />)}
            </div>
          ))}
        </div>
      </div>
      {/* Reduced motion: the first few and a count, as before. */}
      <div className="hidden space-y-2.5 motion-reduce:block">
        {highlights.slice(0, max).map((h, i) => <Recognition key={i} h={h} />)}
        <p className="text-sm text-white/75">+ {rest} more recognition{rest === 1 ? "" : "s"} this week</p>
      </div>
      <p className="mt-2 text-xs text-white/55">{highlights.length} recognitions this week</p>
    </div>
  );
}
