import { useCallback, useEffect, useState } from "react";

// Which of a show's posted updates this person has dealt with, on this device.
//
// Shared by the floating banner and the More tab's list, so dismissing the
// banner marks the update read in the list and marking it read in the list
// takes the banner away. Same storage key the list has always used, so
// anything already read stays read.

const SYNC = "scc:updates-read";
const keyFor = (eventId) => `scc:event-updates-read:${eventId}`;

function load(eventId) {
  try {
    return JSON.parse(localStorage.getItem(keyFor(eventId)) || "[]");
  } catch {
    return [];
  }
}

export function useReadUpdates(eventId) {
  const [readIds, setReadIds] = useState(() => load(eventId));

  useEffect(() => {
    setReadIds(load(eventId));
    const sync = (e) => {
      if (!e.detail || e.detail === eventId) setReadIds(load(eventId));
    };
    const fromOtherTab = (e) => {
      if (e.key === keyFor(eventId)) setReadIds(load(eventId));
    };
    window.addEventListener(SYNC, sync);
    window.addEventListener("storage", fromOtherTab);
    return () => {
      window.removeEventListener(SYNC, sync);
      window.removeEventListener("storage", fromOtherTab);
    };
  }, [eventId]);

  const save = useCallback((ids) => {
    const unique = [...new Set(ids)];
    setReadIds(unique);
    try {
      localStorage.setItem(keyFor(eventId), JSON.stringify(unique));
    } catch { /* storage unavailable; still right for this session */ }
    window.dispatchEvent(new CustomEvent(SYNC, { detail: eventId }));
  }, [eventId]);

  const markRead = useCallback((ids) => save([...load(eventId), ...[].concat(ids)]), [eventId, save]);
  const markUnread = useCallback((id) => save(load(eventId).filter((item) => item !== id)), [eventId, save]);

  return { readIds, markRead, markUnread, save };
}
