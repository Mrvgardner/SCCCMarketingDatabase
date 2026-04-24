import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CakeIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { listFieldNotes } from "../api/fieldNotes";
import RichText from "../components/RichText.jsx";
import { birthdays, anniversaries } from "../data/celebrations";
import { getUpcoming, formatDate as formatCelebDate, yearsOfService } from "../utils/celebrations";

function formatDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function formatShortDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function FieldNoteCard({ note, onOpen }) {
  return (
    <button
      onClick={() => onOpen(note)}
      className="group text-left rounded-2xl bg-gray-900/40 border border-white/10 backdrop-blur-md p-6 shadow-xl hover:border-[#5fae4b]/50 hover:bg-gray-900/60 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-[#7bc966] font-semibold">
          Field Note
        </span>
        <span className="text-xs text-gray-400">{formatShortDate(note.date)}</span>
      </div>
      <h3 className="font-switch-bold text-xl text-white group-hover:text-[#7bc966] transition-colors mb-3 leading-tight">
        {note.title}
      </h3>
      <p className="text-sm text-gray-300 line-clamp-4 mb-4 flex-1">{note.excerpt}</p>
      <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
        <span className="text-xs text-gray-500">{note.author || "Team"}</span>
        <span className="text-xs text-[#7bc966] group-hover:underline inline-flex items-center">
          Read more
          <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </button>
  );
}

function NoteModal({ note, onClose }) {
  useEffect(() => {
    if (!note) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [note, onClose]);

  if (!note) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-gray-900 to-gray-900/95 border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
          aria-label="Close"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        <div className="p-8">
          <div className="text-sm text-gray-400 mb-3">
            {formatDate(note.date)}
            {note.author && <span> · {note.author}</span>}
          </div>
          <h2 className="font-switch-bold text-3xl text-white mb-6 pr-10 bg-gradient-to-r from-[#5fae4b] to-[#7bc966] bg-clip-text text-transparent">
            {note.title}
          </h2>
          <div className="prose prose-invert max-w-none text-gray-200">
            <RichText content={note.content} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarBirthdays() {
  const list = getUpcoming(birthdays, 6);
  if (list.length === 0) return null;
  return (
    <div className="rounded-2xl bg-gray-900/40 border border-white/10 backdrop-blur-md shadow-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
        <CakeIcon className="h-5 w-5 text-[#ff4f00]" />
        <h3 className="font-switch-bold text-sm tracking-wider uppercase text-white">Birthdays</h3>
      </div>
      <ul className="divide-y divide-white/5">
        {list.map((b) => (
          <li
            key={b.name}
            className="flex items-center justify-between px-5 py-3 text-sm hover:bg-white/5 transition-colors"
          >
            <span className="text-gray-200 truncate">{b.name}</span>
            <span className={`text-xs font-medium flex-shrink-0 ml-3 ${b.daysUntil <= 7 ? "text-[#ff4f00]" : "text-gray-400"}`}>
              {formatCelebDate(b.next)}
            </span>
          </li>
        ))}
      </ul>
      <Link
        to="/birthdays"
        className="block text-center text-xs text-gray-400 hover:text-white py-3 border-t border-white/10 transition-colors"
      >
        View all →
      </Link>
    </div>
  );
}

function SidebarAnniversaries() {
  const list = getUpcoming(anniversaries, 6);
  if (list.length === 0) return null;
  return (
    <div className="rounded-2xl bg-gray-900/40 border border-white/10 backdrop-blur-md shadow-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
        <SparklesIcon className="h-5 w-5 text-[#9333ea]" />
        <h3 className="font-switch-bold text-sm tracking-wider uppercase text-white">Anniversaries</h3>
      </div>
      <ul className="divide-y divide-white/5">
        {list.map((a) => {
          const years = yearsOfService(a.startYear, a.next);
          const isMilestone = years > 0 && years % 5 === 0;
          return (
            <li
              key={a.name}
              className="flex items-center justify-between px-5 py-3 text-sm hover:bg-white/5 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-200 truncate">{a.name}</span>
                  {isMilestone && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-gradient-to-r from-[#ff4f00] to-[#ff7f50] text-white flex-shrink-0">
                      {years}Y
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{years} {years === 1 ? "year" : "years"}</div>
              </div>
              <span className={`text-xs font-medium flex-shrink-0 ml-3 ${a.daysUntil <= 7 ? "text-[#9333ea]" : "text-gray-400"}`}>
                {formatCelebDate(a.next)}
              </span>
            </li>
          );
        })}
      </ul>
      <Link
        to="/anniversaries"
        className="block text-center text-xs text-gray-400 hover:text-white py-3 border-t border-white/10 transition-colors"
      >
        View all →
      </Link>
    </div>
  );
}

export default function FieldNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [activeNote, setActiveNote] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listFieldNotes()
      .then((data) => !cancelled && setNotes(data))
      .catch((err) => !cancelled && setError(err.message || "Failed to load notes"))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) =>
      [n.title, n.excerpt, n.author, n.content].some((f) => (f || "").toLowerCase().includes(q))
    );
  }, [notes, query]);

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <h1 className="font-switch-bold text-5xl mb-2 bg-gradient-to-r from-[#5fae4b] to-[#7bc966] bg-clip-text text-transparent">
              Field Notes
            </h1>
            <p className="text-gray-400">Team updates, announcements, and news.</p>
          </div>
          <div className="relative w-full lg:w-96">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes…"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-900/40 border border-white/10 backdrop-blur-md text-white placeholder-gray-500 focus:outline-none focus:border-[#5fae4b]/60 focus:ring-2 focus:ring-[#5fae4b]/20 transition-all"
            />
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_20rem] gap-8">
          {/* Notes grid */}
          <div>
            {loading ? (
              <div className="text-center py-16 text-gray-400">
                <div className="inline-block h-8 w-8 border-4 border-[#5fae4b] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p>Loading…</p>
              </div>
            ) : error ? (
              <div className="text-center py-16 rounded-2xl bg-gray-900/40 border border-white/10 backdrop-blur-md">
                <h3 className="text-lg font-medium text-red-400 mb-2">Couldn't load notes</h3>
                <p className="text-gray-500 text-sm">{error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-gray-900/40 border border-white/10 backdrop-blur-md text-gray-400">
                {query ? `No notes match "${query}".` : "No field notes yet. Check back soon."}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((note) => (
                  <FieldNoteCard key={note.id} note={note} onOpen={setActiveNote} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-br from-[#5fae4b]/20 via-gray-900/40 to-gray-900/40 border border-[#5fae4b]/25 backdrop-blur-md p-6 shadow-xl">
              <h2 className="font-switch-bold text-sm tracking-wider uppercase text-white mb-1">
                What We're Celebrating
              </h2>
              <p className="text-xs text-gray-400">
                Upcoming birthdays and work anniversaries across the team.
              </p>
            </div>
            <SidebarBirthdays />
            <SidebarAnniversaries />
          </aside>
        </div>
      </div>

      <NoteModal note={activeNote} onClose={() => setActiveNote(null)} />
    </div>
  );
}
