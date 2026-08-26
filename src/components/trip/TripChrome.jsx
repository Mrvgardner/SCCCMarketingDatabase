// Shared building blocks for the trip screens, so the token values from the
// design brief live in one place instead of being retyped on every screen.

export const CANVAS = "#05101f";

export function Eyebrow({ children, className = "" }) {
  return (
    <p className={`font-switch-reg text-[10px] uppercase leading-none tracking-[0.16em] text-[#75808d] ${className}`}>
      {children}
    </p>
  );
}

export function ScreenTitle({ children, className = "" }) {
  return <h1 className={`text-[30px] font-bold leading-[1.1] text-white ${className}`}>{children}</h1>;
}

export function Card({ children, className = "", as: Tag = "div", ...rest }) {
  return (
    <Tag
      className={`rounded-2xl border border-white/10 bg-white/[0.045] ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// The three-bar motif: an abstraction of the logo's offset bars. Decoration
// only — per the brief it must never stand in for the logo itself.
export function ThreeBars({ className = "" }) {
  return (
    <span aria-hidden="true" className={`flex flex-col gap-1 ${className}`}>
      <span className="block h-[3px] w-11 rounded-full bg-white/50" />
      <span className="ml-[-8px] block h-[3px] w-[30px] rounded-full bg-white/[0.28]" />
      <span className="block h-[3px] w-[52px] rounded-full bg-white/[0.14]" />
    </span>
  );
}

export function StatusPill({ tone = "review", children }) {
  const tones = {
    ready: "border-[#10b981]/50 bg-[#10b981]/[0.18] text-[#10b981]",
    review: "border-[#f59e0b]/50 bg-[#f59e0b]/[0.15] text-[#f59e0b]",
    pending: "border-white/20 bg-white/[0.06] text-[#93a0b4]",
  };
  return (
    <span
      className={`shrink-0 rounded-[5px] border px-2 py-1 text-[9.5px] font-bold uppercase leading-none tracking-[0.08em] ${tones[tone] || tones.review}`}
    >
      {children}
    </span>
  );
}

// Initials avatar. Fill cycles through the three brand tones by index so a
// roster reads as a group rather than a list.
const AVATAR_FILLS = ["#002b5e", "#0951fa", "#75808d"];

export function Avatar({ name, index = 0, size = 38, ring = false }) {
  const initials = String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${ring ? "ring-[1.5px] ring-[#05101f]" : ""}`}
      style={{
        width: size,
        height: size,
        background: AVATAR_FILLS[index % AVATAR_FILLS.length],
        fontSize: Math.round(size * 0.36),
      }}
    >
      {initials}
    </span>
  );
}
