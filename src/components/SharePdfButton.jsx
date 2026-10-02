import { useEffect, useRef, useState } from "react";
import { ArrowUpOnSquareIcon, CheckIcon } from "@heroicons/react/24/outline";
import { prepareFile, sharePdf } from "../utils/sharePdf";

// "Share" next to a brochure or one-pager: sends the PDF itself to a
// customer, never a link. See utils/sharePdf.js for why.

const LABELS = {
  idle: "Share",
  preparing: "Preparing…",
  retry: "Tap to share",
  shared: "Sent",
  saved: "Saved",
  error: "Try again",
};

export default function SharePdfButton({ url, label = "", className = "", tone = "blue" }) {
  const [state, setState] = useState("idle");
  const reset = useRef(null);

  useEffect(() => () => clearTimeout(reset.current), []);

  const settle = (next) => {
    setState(next);
    clearTimeout(reset.current);
    if (next === "shared" || next === "saved" || next === "error") {
      reset.current = setTimeout(() => setState("idle"), 2500);
    }
  };

  const warm = () => {
    prepareFile(url).catch(() => {});
  };

  const share = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (state === "preparing") return;
    setState("preparing");
    try {
      const result = await sharePdf(url);
      settle(result === "cancelled" ? "idle" : result);
    } catch {
      settle("error");
    }
  };

  const colors = tone === "green"
    ? "border-[#10b981]/35 text-[#10b981] hover:bg-[#10b981]/10"
    : "border-[#0951fa]/45 text-[#7aa2ff] hover:bg-[#0951fa]/15";
  const done = state === "shared" || state === "saved";

  return (
    <button
      type="button"
      onClick={share}
      onPointerDown={warm}
      onMouseEnter={warm}
      onFocus={warm}
      aria-label={label ? `Share ${label} with a customer` : "Share with a customer"}
      title={state === "saved" ? "Saved to your device. Attach it to an email or message." : "Send the PDF itself to a customer"}
      className={`inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-semibold transition-colors disabled:opacity-60 ${colors} ${className}`}
    >
      {done ? <CheckIcon className="h-4 w-4" /> : <ArrowUpOnSquareIcon className="h-4 w-4" />}
      <span aria-live="polite">{LABELS[state]}</span>
    </button>
  );
}
