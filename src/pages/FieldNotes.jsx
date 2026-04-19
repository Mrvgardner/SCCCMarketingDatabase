import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { fieldNotes } from "../data/field-notes";
import { formatTextContent } from "../utils/textFormatter.jsx";

function formatDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function FieldNotes() {
  const [latest, ...older] = fieldNotes;
  const [expanded, setExpanded] = useState(null);

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

        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#5fae4b] to-[#7bc966] bg-clip-text text-transparent">
          Field Notes
        </h1>
        <p className="text-gray-400 mb-10">Team updates, announcements, and news.</p>

        {latest && (
          <article className="bg-gradient-to-br from-[#5fae4b] to-[#7bc966] rounded-2xl p-8 shadow-2xl mb-12">
            <div className="text-sm text-white/80 mb-2">
              {formatDate(latest.date)}
              {latest.author && <span> · {latest.author}</span>}
            </div>
            <h2 className="text-3xl font-bold mb-6">{latest.title}</h2>
            <div className="prose prose-invert max-w-none text-white/95">
              {formatTextContent(latest.content)}
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
                        {formatTextContent(note.content)}
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
      </div>
    </div>
  );
}
