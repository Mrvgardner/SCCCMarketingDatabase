import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, PlusIcon, PencilSquareIcon, NewspaperIcon } from "@heroicons/react/24/solid";
import { listFieldNotes } from "../../api/fieldNotes";

function formatDate(isoDate) {
  if (!isoDate) return "—";
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function FieldNotesAdmin() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listFieldNotes()
      .then((list) => !cancelled && setNotes(list))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/admin" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeftIcon className="h-4 w-4" /> Admin
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <NewspaperIcon className="h-8 w-8 text-[#5fae4b]" />
              <h1 className="font-switch-bold text-3xl bg-gradient-to-r from-[#5fae4b] to-[#7bc966] bg-clip-text text-transparent">
                Field Notes Admin
              </h1>
            </div>
            <p className="text-gray-400">
              {loading ? "Loading…" : `${notes.length} ${notes.length === 1 ? "note" : "notes"}`}
            </p>
          </div>
          <Link
            to="/admin/field-notes/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5fae4b] hover:bg-[#5fae4b]/90 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-[#5fae4b]/20"
          >
            <PlusIcon className="h-5 w-5" /> New note
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/40 border border-red-700/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="inline-block h-8 w-8 border-4 border-[#5fae4b] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading…</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-gray-800/40 rounded-xl">
            No field notes yet. Click "New note" to write your first one.
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map((note, i) => (
              <Link
                key={note.id}
                to={`/admin/field-notes/${note.id}/edit`}
                className="flex items-start gap-4 p-5 bg-gray-800/60 border border-gray-700/50 rounded-xl hover:bg-gray-700/40 hover:border-[#5fae4b]/40 transition-colors group"
              >
                {i === 0 && (
                  <div className="px-2 py-0.5 rounded-full bg-[#5fae4b]/20 text-[#7bc966] border border-[#5fae4b]/40 text-xs font-semibold flex-shrink-0 mt-0.5">
                    LATEST
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 mb-1">
                    {formatDate(note.date)}
                    {note.author && <span> · {note.author}</span>}
                  </div>
                  <div className="font-semibold text-lg text-white truncate">{note.title || "Untitled"}</div>
                  {note.excerpt && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{note.excerpt}</p>
                  )}
                </div>
                <PencilSquareIcon className="h-5 w-5 text-gray-500 group-hover:text-[#7bc966] transition-colors flex-shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
