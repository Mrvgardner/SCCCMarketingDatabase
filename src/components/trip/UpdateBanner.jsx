import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BellAlertIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useReadUpdates } from "../../utils/updateReads";

// A posted update floats over the trip app until the person does something
// with it: tap to open it on the More tab, or swipe it away (or tap the X).
// Either one marks it read; nothing else does. Several unread stack, newest
// first, one at a time.
//
// Only recent updates float. Someone opening the app for the first time
// should see what is current, not a backlog from the planning months.

const RECENT_DAYS = 7;
const SWIPE_AWAY = 90;

function isRecent(update) {
  if (!update?.date) return true;
  const posted = new Date(`${update.date}T12:00:00`);
  if (Number.isNaN(posted.getTime())) return true;
  return Date.now() - posted.getTime() < RECENT_DAYS * 24 * 60 * 60 * 1000;
}

export default function UpdateBanner({ event }) {
  const navigate = useNavigate();
  const { readIds, markRead } = useReadUpdates(event.id);
  const [dragX, setDragX] = useState(0);
  const [leaving, setLeaving] = useState(0);
  const start = useRef(null);
  const moved = useRef(false);

  const unread = (event.latestUpdates || []).filter((update) => update?.id && !readIds.includes(update.id) && isRecent(update));
  const update = unread[0];
  if (!update) return null;

  const urgent = update.level === "Urgent";

  const dismiss = (direction = 1) => {
    setLeaving(direction);
    setTimeout(() => {
      markRead(update.id);
      setLeaving(0);
      setDragX(0);
    }, 180);
  };

  const open = () => {
    markRead(update.id);
    navigate(`/trip/${event.id}/more#update-${update.id}`);
  };

  const onPointerDown = (e) => {
    start.current = e.clientX;
    moved.current = false;
  };
  const onPointerMove = (e) => {
    if (start.current === null) return;
    const dx = e.clientX - start.current;
    if (Math.abs(dx) > 6) moved.current = true;
    setDragX(dx);
  };
  const onPointerUp = () => {
    if (start.current === null) return;
    start.current = null;
    if (Math.abs(dragX) > SWIPE_AWAY) dismiss(Math.sign(dragX));
    else setDragX(0);
  };

  const offset = leaving ? leaving * 480 : dragX;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[45] px-3"
      style={{ top: "max(12px, calc(env(safe-area-inset-top) + 8px))" }}
    >
      <div
        role="alertdialog"
        aria-labelledby={`update-title-${update.id}`}
        aria-describedby={update.body ? `update-body-${update.id}` : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`pointer-events-auto relative mx-auto max-w-lg touch-pan-y select-none rounded-2xl border shadow-[0_14px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl ${
          urgent ? "border-[#ff4f00]/50 bg-[#2a1208]/95" : "border-white/15 bg-[#0d1b30]/95"
        }`}
        style={{
          transform: `translateX(${offset}px)`,
          opacity: Math.max(0.2, 1 - Math.abs(offset) / 360),
          transition: start.current === null ? "transform 180ms ease, opacity 180ms ease" : "none",
        }}
      >
        <button
          type="button"
          onClick={() => { if (!moved.current) open(); }}
          className="flex w-full items-start gap-3 p-3.5 pr-11 text-left"
        >
          <span
            className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${urgent ? "bg-[#ff4f00]/20 text-[#ff8a4c]" : "bg-[#0951fa]/20 text-[#7aa2ff]"}`}
          >
            <BellAlertIcon className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#93a0b4]">
              {urgent ? <span className="text-[#ff8a4c]">Urgent</span> : "Update"}
              {event.shortName && <span>· {event.shortName}</span>}
              {unread.length > 1 && <span>· 1 of {unread.length}</span>}
            </span>
            <span id={`update-title-${update.id}`} className="mt-1 block text-[14.5px] font-semibold leading-[1.3] text-white">
              {update.title}
            </span>
            {update.body && (
              <span id={`update-body-${update.id}`} className="mt-0.5 line-clamp-2 block text-[13px] leading-[1.45] text-[#c7d0dd]">
                {update.body}
              </span>
            )}
            <span className="mt-1.5 block text-[11.5px] text-[#75808d]">Tap to open · swipe to dismiss</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => dismiss(1)}
          aria-label="Dismiss update"
          className="absolute right-1.5 top-1.5 grid h-9 w-9 place-items-center rounded-full text-[#93a0b4] hover:bg-white/10 hover:text-white"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
