import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpIcon, ArrowUpRightIcon, SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { askAssistant } from "../api/assistant";
import SharePdfButton from "./SharePdfButton";
import { isPdf } from "../utils/sharePdf";

// The site's assistant, a button in the bottom-right corner of every signed-in
// page. It answers from what the site already knows — the shows, the
// knowledge base, the printed collateral, the person's own receipts — so
// "when does Susie land?" and "what do I hand out for TMS?" get the same
// answer the right screen would give, without finding the screen.
//
// It sits at the app shell so the conversation survives moving between pages.

const SUGGESTIONS = {
  trip: [
    "What's next on the schedule?",
    "What do my receipts total?",
    "What do I hand out for TMS?",
  ],
  site: [
    "Which one-pager covers the MultiFunction Kiosk?",
    "How does Fast Settlement work?",
    "What do my receipts total?",
    "When is the next show?",
  ],
};

function eventIdFrom(pathname) {
  return pathname.match(/^\/(?:trip|events)\/([^/]+)/)?.[1] || "";
}

export default function Assistant() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const endRef = useRef(null);

  const inTrip = pathname.startsWith("/trip/");
  const eventId = eventIdFrom(pathname);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, busy, followUps]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!user || pathname === "/login" || pathname === "/app-auth") return null;

  const ask = async (question) => {
    const content = question.trim();
    if (!content || busy) return;
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setDraft("");
    setFollowUps([]);
    setError("");
    setBusy(true);
    try {
      const reply = await askAssistant(next, { eventId });
      setMessages([...next, { role: "assistant", content: reply.answer, links: reply.links || [] }]);
      setFollowUps(reply.followUps || []);
    } catch (askError) {
      setError(askError.message || "The assistant could not answer.");
    } finally {
      setBusy(false);
    }
  };

  const retry = () => {
    const last = [...messages].reverse().find((m) => m.role === "user");
    if (!last) return;
    setMessages(messages.slice(0, messages.lastIndexOf(last)));
    setTimeout(() => ask(last.content), 0);
  };

  const reset = () => {
    setMessages([]);
    setFollowUps([]);
    setError("");
    setDraft("");
    inputRef.current?.focus();
  };

  // Inside a trip the tab bar owns the bottom edge; sit above it.
  const bottom = inTrip ? "calc(max(30px, env(safe-area-inset-bottom)) + 72px)" : "max(20px, env(safe-area-inset-bottom))";
  const suggestions = SUGGESTIONS[inTrip ? "trip" : "site"];

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ask the assistant"
          className="fixed right-4 z-50 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#0951fa] text-white shadow-[0_8px_24px_rgba(9,81,250,0.45)] transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          style={{ bottom }}
        >
          <SparklesIcon className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Assistant"
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[86vh] flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#0b1730] text-white shadow-[0_-12px_40px_rgba(0,0,0,0.5)] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:h-[600px] sm:max-h-[80vh] sm:w-[400px] sm:rounded-2xl"
        >
          <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0951fa]/20 text-[#7aa2ff]">
              <SparklesIcon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-semibold leading-tight">Ask</h2>
              <p className="text-[11.5px] text-[#93a0b4]">Answers from this site: shows, products, your receipts</p>
            </div>
            {messages.length > 0 && (
              <button type="button" onClick={reset} className="min-h-[36px] px-2 text-[12px] font-semibold text-[#93a0b4] hover:text-white">
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#93a0b4] hover:bg-white/10 hover:text-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {!messages.length && (
              <div>
                <p className="text-[13px] leading-[1.5] text-[#93a0b4]">
                  Ask about a show, a product, what to hand a customer, or your expenses. It answers from
                  what's on this site and says so when it doesn't know.
                </p>
                <ul className="mt-3 space-y-1.5">
                  {suggestions.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => ask(s)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left text-[13.5px] leading-[1.4] text-[#e8edf4] hover:border-[#0951fa]/60 hover:bg-[#0951fa]/10"
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <ol className="space-y-3">
              {messages.map((m, i) => (
                <li key={i} className={m.role === "user" ? "flex justify-end" : "flex flex-col items-start gap-1.5"}>
                  <p
                    className={
                      m.role === "user"
                        ? "max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-md bg-[#0951fa] px-3.5 py-2 text-[14px] leading-[1.45]"
                        : "max-w-[92%] whitespace-pre-line rounded-2xl rounded-bl-md bg-white/[0.06] px-3.5 py-2.5 text-[14px] leading-[1.5] text-[#e8edf4]"
                    }
                  >
                    {m.content}
                  </p>
                  {m.links?.length > 0 && (
                    <div className="flex max-w-[92%] flex-wrap gap-1.5">
                      {m.links.map((link) => {
                        // A page of the app opens in place; a document or an
                        // outside site opens in its own tab so the chat is
                        // still there to come back to.
                        const isPage = link.url.startsWith("/") && !/\.[a-z0-9]{2,5}$/i.test(link.url.split("?")[0]);
                        const className = "inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-[#0951fa]/50 bg-[#0951fa]/15 px-3 text-[13px] font-semibold text-[#9db8ff] hover:bg-[#0951fa]/25 hover:text-white";
                        return isPage ? (
                          <Link key={link.url} to={link.url} onClick={() => setOpen(false)} className={className}>
                            {link.label} <ArrowUpRightIcon aria-hidden="true" className="h-3.5 w-3.5" />
                          </Link>
                        ) : (
                          <span key={link.url} className="inline-flex items-center gap-1.5">
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className={className}>
                              {link.label} <ArrowUpRightIcon aria-hidden="true" className="h-3.5 w-3.5" />
                            </a>
                            {isPdf(link.url) && <SharePdfButton url={link.url} label={link.label} />}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </li>
              ))}
              {busy && (
                <li className="flex" aria-live="polite">
                  <p className="rounded-2xl rounded-bl-md bg-white/[0.06] px-3.5 py-2.5 text-[14px] text-[#93a0b4]">Looking…</p>
                </li>
              )}
            </ol>

            {error && (
              <div role="alert" className="mt-3 rounded-xl border border-[#ef4444]/35 bg-[#ef4444]/10 px-3 py-2 text-[13px] text-[#fca5a5]">
                {error}{" "}
                <button type="button" onClick={retry} className="font-semibold underline underline-offset-2">Try again</button>
              </div>
            )}

            {!busy && followUps.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {followUps.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => ask(q)}
                    className="rounded-full border border-white/15 px-3 py-1.5 text-[12.5px] text-[#c7d0dd] hover:border-[#0951fa]/60 hover:text-white"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); ask(draft); }}
            className="flex items-end gap-2 border-t border-white/10 px-3 py-3"
            style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
          >
            <label className="sr-only" htmlFor="assistant-question">Your question</label>
            <input
              id="assistant-question"
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={2000}
              autoComplete="off"
              placeholder={messages.length ? "Ask a follow-up…" : "Ask anything about the site…"}
              className="min-h-[44px] flex-1 rounded-xl border border-white/10 bg-gray-950/55 px-3.5 text-[15px] text-white placeholder:text-[#75808d] focus:border-[#0951fa] focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !draft.trim()}
              aria-label="Send"
              className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl bg-[#0951fa] text-white disabled:opacity-40"
            >
              <ArrowUpIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
