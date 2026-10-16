import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ArrowLeftIcon, CheckCircleIcon, StarIcon } from "@heroicons/react/24/solid";
import { getSurvey, setSurveyOpen, submitSurvey } from "../../api/survey";
import { Card, Eyebrow, ScreenTitle } from "../../components/trip/TripChrome";

// The post-show survey. Staff answer five questions, anonymously unless they
// choose to attach their name. Admins also get the open/close switch and the
// results, on a tab of their own.

function Stars({ value, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="mt-2 flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} of 5`}
          onClick={() => onChange(value === n ? undefined : n)}
          className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.05] transition-colors hover:bg-white/10"
        >
          <StarIcon className={`h-6 w-6 ${value >= n ? "text-[#f59e0b]" : "text-white/20"}`} />
        </button>
      ))}
    </div>
  );
}

function Results({ results }) {
  if (!results) return <p className="text-[13px] text-[#93a0b4]">Loading…</p>;
  if (!results.total) return <p className="text-[13px] text-[#93a0b4]">No responses yet.</p>;
  return (
    <div className="space-y-4">
      <p className="text-[13px] text-[#93a0b4]">
        <span className="font-semibold text-white">{results.total}</span> response{results.total === 1 ? "" : "s"}
        {" · "}{results.named} with a name attached
      </p>
      {results.questions.map((q) => (
        <Card key={q.id} className="p-3.5">
          <h3 className="text-[13.5px] font-semibold leading-[1.35] text-white">{q.label}</h3>
          {q.kind === "rating" ? (
            <div className="mt-2">
              <p className="text-[24px] font-bold text-white">
                {q.average ?? "—"}<span className="text-[13px] font-semibold text-[#75808d]"> / 5 · {q.count} answered</span>
              </p>
              <div className="mt-2 space-y-1">
                {[5, 4, 3, 2, 1].map((score) => {
                  const n = q.spread[score - 1];
                  const pct = q.count ? Math.round((n / q.count) * 100) : 0;
                  return (
                    <div key={score} className="flex items-center gap-2 text-[11.5px] text-[#93a0b4]">
                      <span className="w-3 text-right">{score}</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <span className="block h-full rounded-full bg-[#f59e0b]" style={{ width: `${pct}%` }} />
                      </span>
                      <span className="w-5 text-right tabular-nums">{n}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : q.answers.length ? (
            <ul className="mt-2 space-y-2">
              {q.answers.map((a, i) => (
                <li key={i} className="rounded-lg bg-white/[0.04] px-3 py-2 text-[13px] leading-[1.5] text-[#e8edf4] whitespace-pre-line">
                  {a.text}
                  {a.name && <span className="mt-1 block text-[11.5px] text-[#75808d]">— {a.name}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[12.5px] text-[#75808d]">No answers.</p>
          )}
        </Card>
      ))}
      <p className="text-[11.5px] leading-[1.5] text-[#75808d]">
        Written answers are shown in random order, so their order says nothing about who sent them.
      </p>
    </div>
  );
}

export default function TripSurvey() {
  const { event, isAdmin } = useOutletContext();
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [named, setNamed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [view, setView] = useState("answer");

  const load = (withResults = isAdmin) =>
    getSurvey(event.id, { results: withResults }).then((s) => {
      setSurvey(s);
      if (s.mine) {
        setAnswers(s.mine.answers || {});
        setNamed(Boolean(s.mine.named));
      }
    }).catch((e) => setError(e.message || "Could not load the survey."));

  useEffect(() => { load(); }, [event.id, isAdmin]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await submitSurvey(event.id, answers, named);
      setSent(true);
      await load();
    } catch (submitError) {
      setError(submitError.message || "Could not send that.");
    } finally {
      setBusy(false);
    }
  };

  const toggleOpen = async () => {
    setBusy(true); setError("");
    try {
      await setSurveyOpen(event.id, !survey.open);
      await load();
    } catch (toggleError) {
      setError(toggleError.message || "Could not change that.");
    } finally {
      setBusy(false);
    }
  };

  const set = (id, value) => setAnswers((current) => ({ ...current, [id]: value }));

  return (
    <div className="space-y-5">
      <div>
        <Link to={`/trip/${event.id}/more`} className="inline-flex min-h-[36px] items-center gap-1.5 text-[12.5px] font-semibold text-[#93a0b4]">
          <ArrowLeftIcon className="h-3.5 w-3.5" /> More
        </Link>
        <Eyebrow className="mt-1">{event.shortName} {event.year} · Post-show survey</Eyebrow>
        <ScreenTitle className="mt-2">How did it go?</ScreenTitle>
      </div>

      {isAdmin && survey && (
        <Card className="flex items-center gap-3 p-3.5">
          <span className="min-w-0 flex-1 text-[13px] leading-[1.45] text-[#93a0b4]">
            {survey.open
              ? <><span className="font-semibold text-[#10b981]">Open.</span> The team sees a prompt until they answer or dismiss it.</>
              : <><span className="font-semibold text-white">Closed.</span> Nobody is asked and nobody can answer.</>}
          </span>
          <button
            type="button"
            disabled={busy}
            onClick={toggleOpen}
            className={`min-h-[40px] shrink-0 rounded-xl px-3.5 text-[13px] font-semibold disabled:opacity-60 ${survey.open ? "border border-white/15 text-white" : "bg-[#0951fa] text-white"}`}
          >
            {survey.open ? "Close survey" : "Open survey"}
          </button>
        </Card>
      )}

      {isAdmin && (
        <div className="flex gap-1 rounded-xl bg-white/[0.04] p-1" role="tablist">
          {["answer", "results"].map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={view === tab}
              onClick={() => { setView(tab); if (tab === "results") load(true); }}
              className={`min-h-[38px] flex-1 rounded-lg text-[13px] font-semibold ${view === tab ? "bg-white/10 text-white" : "text-[#93a0b4]"}`}
            >
              {tab === "answer" ? "My answers" : `Results${survey?.results ? ` (${survey.results.total})` : ""}`}
            </button>
          ))}
        </div>
      )}

      {error && <p role="alert" className="text-[13px] font-semibold text-[#ef4444]">{error}</p>}

      {view === "results" && isAdmin ? (
        <Results results={survey?.results} />
      ) : !survey ? (
        <p className="text-[13px] text-[#93a0b4]">Loading…</p>
      ) : !survey.open && !survey.mine ? (
        <Card className="p-4 text-[13.5px] leading-[1.55] text-[#93a0b4]">This survey isn't open right now.</Card>
      ) : !survey.canAnswer ? (
        <Card className="p-4 text-[13.5px] leading-[1.55] text-[#93a0b4]">This survey is for the team that worked {event.shortName}.</Card>
      ) : sent ? (
        <Card className="p-5 text-center">
          <CheckCircleIcon className="mx-auto h-10 w-10 text-[#10b981]" />
          <p className="mt-2 text-[15px] font-semibold text-white">Thank you.</p>
          <p className="mt-1 text-[13px] leading-[1.5] text-[#93a0b4]">
            {named ? "Your answers were sent with your name." : "Your answers were sent anonymously."} You can change them while the survey is open.
          </p>
          <button type="button" onClick={() => setSent(false)} className="mt-3 min-h-[40px] text-[13px] font-semibold text-[#0951fa]">
            Review my answers
          </button>
        </Card>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <p className="text-[13px] leading-[1.55] text-[#93a0b4]">
            Five quick questions about the show and the app. Only the first is required. Your answers are anonymous unless you choose to add your name.
          </p>
          {survey.questions.map((q, i) => (
            <div key={q.id}>
              <label htmlFor={`q-${q.id}`} className="block text-[14px] font-semibold leading-[1.35] text-white">
                {i + 1}. {q.label}{q.required && <span className="text-[#f59e0b]"> *</span>}
              </label>
              {q.kind === "rating" ? (
                <Stars value={answers[q.id]} onChange={(v) => set(q.id, v)} label={q.label} />
              ) : (
                <textarea
                  id={`q-${q.id}`}
                  rows={3}
                  maxLength={2000}
                  value={answers[q.id] || ""}
                  onChange={(e) => set(q.id, e.target.value)}
                  className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-gray-950/55 px-3 py-2.5 text-[14.5px] text-white"
                />
              )}
            </div>
          ))}

          <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <input
              type="checkbox"
              checked={named}
              onChange={(e) => setNamed(e.target.checked)}
              className="mt-0.5 h-5 w-5 rounded border-white/20 bg-gray-950/55 text-[#0951fa]"
            />
            <span className="text-[13px] leading-[1.45] text-[#c7d0dd]">
              Attach my name{survey.name ? ` (${survey.name})` : ""} so I can be followed up with.
              <span className="block text-[11.5px] text-[#75808d]">Leave unticked to stay anonymous.</span>
            </span>
          </label>

          <button
            type="submit"
            disabled={busy || !answers.show || !survey.open}
            className="min-h-[52px] w-full rounded-2xl bg-[#0951fa] text-[15px] font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Sending…" : survey.mine ? "Update my answers" : "Send"}
          </button>
          {!survey.open && <p className="text-center text-[12px] text-[#75808d]">The survey is closed, so answers can no longer change.</p>}
        </form>
      )}
    </div>
  );
}
