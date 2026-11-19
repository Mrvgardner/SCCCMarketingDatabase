import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const ENDPOINT = "/.netlify/functions/celebrations";
const EMPTY = Object.freeze([]);

export function useCelebrations() {
  const { user } = useAuth();
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!user) return;
    const request = new AbortController();

    async function load() {
      try {
        if (typeof user.jwt !== "function") return { status: "unavailable" };
        const token = await user.jwt();
        if (!token || request.signal.aborted) return { status: "hidden" };
        const response = await fetch(ENDPOINT, {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          redirect: "error",
          headers: { Authorization: `Bearer ${token}` },
          signal: request.signal,
        });
        if (response.status === 401 || response.status === 403) return { status: "hidden" };
        if (!response.ok) return { status: "unavailable" };
        const { birthdays, anniversaries } = await response.json();
        if (!Array.isArray(birthdays) || !Array.isArray(anniversaries)) return { status: "unavailable" };
        return { status: "ready", birthdays, anniversaries };
      } catch {
        return { status: "unavailable" };
      }
    }

    load().then((value) => {
      if (!request.signal.aborted) setResult({ user, ...value });
    });
    return () => request.abort();
  }, [user]);

  // Results are transient and bound to this exact auth session. A sign-out or
  // account switch immediately hides any previous user's rows, even during load.
  if (!user) return { status: "hidden", birthdays: EMPTY, anniversaries: EMPTY };
  if (result?.user !== user) return { status: "loading", birthdays: EMPTY, anniversaries: EMPTY };
  const { status, birthdays = EMPTY, anniversaries = EMPTY } = result;
  return { status, birthdays, anniversaries };
}
