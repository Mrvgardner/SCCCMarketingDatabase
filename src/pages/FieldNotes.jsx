import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { listFieldNotes } from "../api/fieldNotes";
import RichText from "../components/RichText.jsx";

function formatDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function FieldNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listFieldNotes()
      .then((data) => !cancelled && setNotes(data))
      .catch((err) => !cancelled && setError(err.message || "Failed to load notes"))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const [latest, ...older] = notes;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="font-switch-bold text-4xl mb-2 bg-gradient-to-r from-[#5fae4b] to-[#7bc966] bg-clip-text text-transparent">
          Field Notes
        </h1>
        <p className="text-gray-400 mb-10">Team updates, announcements, and news.</p>

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="inline-block h-8 w-8 border-4 border-[#5fae4b] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading…</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium text-red-400 mb-2">Couldn't load notes</h3>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        ) : (
          <>
            {latest && (
              <article className="bg-gradient-to-br from-[#5fae4b] to-[#7bc966] rounded-2xl p-8 shadow-2xl mb-12">
                <div className="text-sm text-white/80 mb-2">
                  {formatDate(latest.date)}
                  {latest.author && <span> · {latest.author}</span>}
                </div>
                <h2 className="text-3xl font-bold mb-6">{latest.title}</h2>
                <div className="prose prose-invert max-w-none text-white/95">
                  <RichText content={latest.content} />
                </div>
              </article>
            )}

            {older.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-200">Older Notes</h3>
                <div className="space-y-3">
                  {older.map((note) => {
                    const isOpen = expanded === note.id;
                    return (
                      <div
                        key={note.id}
                        className="bg-gray-800/60 border border-gray-700/50 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => setExpanded(isOpen ? null : note.id)}
                          className="w-full p-5 flex items-start justify-between text-left hover:bg-gray-700/40 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="text-xs text-gray-400 mb-1">
                              {formatDate(note.date)}
                              {note.author && <span> · {note.author}</span>}
                            </div>
                            <div className="font-semibold text-lg">{note.title}</div>
                            {!isOpen && (
                              <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                                {note.excerpt}
                              </p>
                            )}
                          </div>
                          {isOpen ? (
                            <ChevronUpIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1 ml-4" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1 ml-4" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-5 text-gray-300 border-t border-gray-700/50 pt-4">
                            <RichText content={note.content} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!latest && (
              <div className="text-center text-gray-400 py-12">
                No field notes yet. Check back soon.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
