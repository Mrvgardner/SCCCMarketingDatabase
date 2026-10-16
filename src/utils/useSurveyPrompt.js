import { useCallback, useEffect, useState } from "react";
import { getSurvey } from "../api/survey";

// Whether to ask this person to take the show's survey: it is open, they
// worked the show, they have not answered, and they have not waved it away.
// Rechecked when the app comes back to the foreground and whenever the survey
// changes, so opening it reaches people without a reload.

const dismissedKey = (eventId) => `scc:survey-dismissed:${eventId}`;

export function useSurveyPrompt(eventId) {
  const [survey, setSurvey] = useState(null);
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(dismissedKey(eventId)) === "1"; } catch { return false; }
  });

  useEffect(() => {
    let cancelled = false;
    const load = () => getSurvey(eventId).then((s) => !cancelled && setSurvey(s)).catch(() => {});
    load();
    const onVisible = () => document.visibilityState === "visible" && load();
    const onChanged = (e) => (!e.detail || e.detail === eventId) && load();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("survey:changed", onChanged);
    try { setDismissed(localStorage.getItem(dismissedKey(eventId)) === "1"); } catch { /* ignore */ }
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("survey:changed", onChanged);
    };
  }, [eventId]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try { localStorage.setItem(dismissedKey(eventId), "1"); } catch { /* ignore */ }
  }, [eventId]);

  const shouldPrompt = Boolean(survey?.open && survey.canAnswer && !survey.mine && !dismissed);
  return { survey, shouldPrompt, dismiss };
}
