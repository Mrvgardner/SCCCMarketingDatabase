import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, TrashIcon } from "@heroicons/react/24/solid";
import { listFieldNotes, createFieldNote, updateFieldNote, deleteFieldNote } from "../../api/fieldNotes";
import RichTextEditor from "../../components/RichTextEditor.jsx";
import { useAuth } from "../../contexts/AuthContext";

function today() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function TextField({ label, name, value, onChange, placeholder, hint, type = "text" }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-gray-300 mb-1">{label}</div>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-[#5fae4b] focus:outline-none focus:ring-1 focus:ring-[#5fae4b] transition-colors"
      />
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </label>
  );
}

function TextAreaField({ label, name, value, onChange, placeholder, hint, rows = 2 }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-gray-300 mb-1">{label}</div>
      <textarea
        rows={rows}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-[#5fae4b] focus:outline-none focus:ring-1 focus:ring-[#5fae4b] transition-colors"
      />
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </label>
  );
}

export default function FieldNoteForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [note, setNote] = useState({
    title: "",
    date: today(),
    author: user?.user_metadata?.full_name || "",
    excerpt: "",
    content: "",
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    listFieldNotes()
      .then((list) => {
        if (cancelled) return;
        const found = list.find((n) => n.id === id);
        if (!found) setError("Field note not found");
        else setNote(found);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [id, isNew]);

  const handleChange = (e) => {
    setNote((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleContentChange = (html) => {
    setNote((prev) => ({ ...prev, content: html }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isNew) await createFieldNote(note);
      else await updateFieldNote(note);
      navigate("/admin/field-notes");
    } catch (err) {
      setError(err.message || "Save failed");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${note.title}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      await deleteFieldNote(note.id);
      navigate("/admin/field-notes");
    } catch (err) {
      setError(err.message || "Delete failed");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
        <div className="max-w-3xl mx-auto text-center py-16 text-gray-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/admin/field-notes" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeftIcon className="h-4 w-4" /> Back to field notes
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#5fae4b] to-[#7bc966] bg-clip-text text-transparent">
            {isNew ? "New Field Note" : "Edit Field Note"}
          </h1>
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <TrashIcon className="h-4 w-4" /> Delete
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/40 border border-red-700/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-gray-800/40 rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-4">
              <TextField label="Title" name="title" value={note.title} onChange={handleChange} placeholder="Welcome to Field Notes" />
              <TextField label="Date" name="date" value={note.date} onChange={handleChange} type="date" />
            </div>
            <TextField label="Author" name="author" value={note.author} onChange={handleChange} placeholder="Your name" hint="Shown under the title" />
            <TextAreaField
              label="Excerpt"
              name="excerpt"
              value={note.excerpt}
              onChange={handleChange}
              rows={2}
              placeholder="One-sentence summary that shows on the home card"
              hint="Keep it short — this is what teammates see at a glance"
            />
          </section>

          <section className="bg-gray-800/40 rounded-xl p-6 space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-200">Content</h2>
              <p className="text-xs text-gray-500">The full note. Supports bold, italic, lists, and links.</p>
            </div>
            <RichTextEditor value={note.content} onChange={handleContentChange} />
          </section>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to="/admin/field-notes" className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !note.title}
              className="px-6 py-2.5 bg-[#5fae4b] hover:bg-[#5fae4b]/90 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : isNew ? "Publish note" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
