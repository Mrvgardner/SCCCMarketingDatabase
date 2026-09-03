import { useRef, useState } from "react";
import { PaperClipIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { updateBriefing } from "../../api/tradeShows";
import { sendPinPush } from "../../api/pushNotifications";
import {
  RESOURCE_FILE_ACCEPT,
  RESOURCE_MAX_BYTES,
  deleteEventResourceFile,
  downloadEventResourceFile,
  uploadEventResource,
} from "../../api/eventResources";

// The short pinned list at the top of Booth: the handful of things nobody
// should have to look up, and the one or two documents that go with them.
//
// Admins write it from their phone, standing at the booth — that is the whole
// point, so adding a line is two taps and a sentence, not a trip to a desktop
// admin screen. Everyone on the team reads it.

const CROWDED_AT = 6;

function sizeLabel(bytes) {
  if (!bytes) return "";
  const kb = bytes / 1024;
  // A small file rounded to "0 KB" reads as a broken upload rather than a
  // small one.
  if (kb < 1) return "< 1 KB";
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
}

export default function KnowThisCold({ event, isAdmin, myName, user }) {
  const briefing = event.briefing || [];
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);
  // Pinning is announcing. Default on, same as the "Send push" box on a posted
  // update, but it can be turned off for a quiet correction.
  const [notify, setNotify] = useState(true);
  const [notice, setNotice] = useState("");
  const fileInput = useRef(null);

  const author = myName || user?.user_metadata?.full_name || "";

  // Fire-and-report: the pin is already saved by the time this runs, so a
  // push failure is a notice, never an error that undoes the pin.
  const announce = async (item) => {
    if (!notify) return;
    try {
      const delivery = await sendPinPush(event.id, item, author);
      setNotice(`Pinned. Sent to ${delivery.delivered} device${delivery.delivered === 1 ? "" : "s"}.`);
    } catch (pushError) {
      setNotice(`Pinned. Notification didn't go out: ${pushError.message}`);
    }
  };

  const save = async (next) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await updateBriefing(event.id, next);
      return true;
    } catch (saveError) {
      setError(saveError.message || "Could not save that.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const addNote = async (submitEvent) => {
    submitEvent.preventDefault();
    if (!text.trim()) return;
    const item = {
      id: crypto.randomUUID(),
      kind: "note",
      text: text.trim(),
      author,
      createdAt: new Date().toISOString(),
    };
    if (await save([...briefing, item])) {
      setText("");
      setAdding(false);
      await announce(item);
    }
  };

  const addFile = async (file) => {
    if (!file) return;
    setError("");
    if (file.size > RESOURCE_MAX_BYTES) {
      setError(`That file is over ${Math.round(RESOURCE_MAX_BYTES / 1024 / 1024)} MB.`);
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    setBusy(true);
    try {
      const stored = await uploadEventResource(event.id, file);
      const item = {
        id: crypto.randomUUID(),
        kind: "file",
        fileId: stored.fileId,
        fileName: stored.fileName,
        contentType: stored.contentType,
        fileSize: stored.fileSize,
        author,
        createdAt: new Date().toISOString(),
      };
      await updateBriefing(event.id, [...briefing, item]);
      await announce(item);
    } catch (uploadError) {
      setError(uploadError.message || "Could not attach that file.");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const remove = async (item) => {
    const next = briefing.filter((entry) => entry.id !== item.id);
    // Take the row out first: if the file delete fails the list is still
    // correct, and an orphaned blob is a smaller problem than a dead row.
    if (await save(next)) {
      setConfirmingId(null);
      if (item.kind === "file" && item.fileId) {
        await deleteEventResourceFile(event.id, item.fileId).catch(() => {});
      }
    }
  };

  const open = async (item) => {
    setError("");
    try {
      await downloadEventResourceFile(event.id, { fileId: item.fileId, fileName: item.fileName });
    } catch (downloadError) {
      setError(downloadError.message || "Could not open that file.");
    }
  };

  if (!briefing.length && !isAdmin) return null;

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-switch-reg text-[10px] uppercase tracking-[0.16em] text-[#f59e0b]">
          Know this cold
        </h2>
        {isAdmin && !adding && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setAdding(true); setError(""); }}
              className="inline-flex min-h-[32px] items-center gap-1 rounded-lg border border-[#f59e0b]/35 bg-[#f59e0b]/10 px-2.5 text-[11.5px] font-semibold text-[#f59e0b]"
            >
              <PlusIcon className="h-3.5 w-3.5" /> Note
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => fileInput.current?.click()}
              className="inline-flex min-h-[32px] items-center gap-1 rounded-lg border border-white/15 px-2.5 text-[11.5px] font-semibold text-[#93a0b4] disabled:opacity-50"
            >
              <PaperClipIcon className="h-3.5 w-3.5" /> File
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInput}
        type="file"
        accept={RESOURCE_FILE_ACCEPT}
        className="sr-only"
        onChange={(e) => addFile(e.target.files?.[0])}
      />

      {adding && (
        <form onSubmit={addNote} className="mt-2.5 rounded-xl border border-[#f59e0b]/25 bg-[#f59e0b]/[0.06] p-3">
          <label className="block">
            <span className="sr-only">The thing everyone should know</span>
            <textarea
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={300}
              autoFocus
              placeholder="Do not quote pricing on the floor — route to Paul."
              className="w-full resize-none rounded-lg border border-white/10 bg-gray-950/55 px-3 py-2 text-white"
            />
          </label>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={busy || !text.trim()}
              className="min-h-[40px] flex-1 rounded-lg bg-[#f59e0b] text-[13px] font-semibold text-[#1b1204] disabled:opacity-50"
            >
              {busy ? "Pinning…" : "Pin it"}
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); setText(""); setError(""); }}
              className="min-h-[40px] rounded-lg border border-white/15 px-3 text-[13px] font-semibold text-[#93a0b4]"
            >
              Cancel
            </button>
          </div>
          <label className="mt-2 flex min-h-[32px] items-center gap-2 text-[12px] text-[#93a0b4]">
            <input
              type="checkbox"
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-gray-950/55 text-[#f59e0b] focus:ring-[#f59e0b]"
            />
            Notify the team
          </label>
          <p className="mt-1 text-[11px] text-[#75808d]">Everyone on the team sees this. {300 - text.length} left.</p>
        </form>
      )}

      {error && <p role="alert" className="mt-2 text-[12.5px] font-semibold text-[#ef4444]">{error}</p>}
      {notice && !error && <p role="status" className="mt-2 text-[12.5px] font-semibold text-[#10b981]">{notice}</p>}

      {briefing.length > 0 && (
        <div className="mt-2.5 rounded-2xl border border-[#f59e0b]/20 bg-[#f59e0b]/[0.05] px-3.5">
          {briefing.map((item, index) => (
            <div
              key={item.id}
              className={index === briefing.length - 1 ? "py-2.5" : "border-b border-white/[0.055] py-2.5"}
            >
              <div className="flex gap-2.5">
                {item.kind === "file" ? (
                  <>
                    <PaperClipIcon aria-hidden="true" className="mt-[3px] h-4 w-4 shrink-0 text-[#f59e0b]" />
                    <button
                      type="button"
                      onClick={() => open(item)}
                      className="min-w-0 flex-1 text-left text-[13px] leading-[1.45] text-[#e8edf4]"
                    >
                      <span className="underline decoration-white/20 underline-offset-2">{item.fileName}</span>
                      {item.fileSize ? <span className="text-[11.5px] text-[#75808d]"> · {sizeLabel(item.fileSize)}</span> : null}
                    </button>
                  </>
                ) : (
                  <>
                    <span aria-hidden="true" className="mt-[1px] shrink-0 text-[13px] leading-[1.45] text-[#f59e0b]">▸</span>
                    <p className="min-w-0 flex-1 whitespace-pre-line text-[13px] leading-[1.45] text-[#e8edf4]">
                      {item.text}
                      {item.author && <span className="text-[11.5px] text-[#75808d]"> — {item.author}</span>}
                    </p>
                  </>
                )}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(confirmingId === item.id ? null : item.id)}
                    aria-label={`Remove ${item.kind === "file" ? item.fileName : "this note"}`}
                    className="-mt-1 -mr-1 shrink-0 p-1.5 text-[#75808d]"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              {confirmingId === item.id && (
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-[#ef4444]/35 bg-[#ef4444]/[0.08] px-2.5 py-2">
                  <p className="min-w-0 flex-1 text-[12px] leading-[1.35] text-white">
                    {item.kind === "file" ? "Remove this document?" : "Remove this note?"}
                  </p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => remove(item)}
                    className="min-h-[34px] rounded-md bg-[#ef4444] px-3 text-[12px] font-semibold text-white disabled:opacity-60"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingId(null)}
                    className="min-h-[34px] rounded-md border border-white/15 px-3 text-[12px] font-semibold text-[#93a0b4]"
                  >
                    Keep
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isAdmin && briefing.length > CROWDED_AT && (
        <p className="mt-2 text-[11.5px] leading-[1.5] text-[#75808d]">
          {briefing.length} pinned. Past about {CROWDED_AT} this stops being the important things and
          becomes another list — worth pruning.
        </p>
      )}

      {isAdmin && !briefing.length && !adding && (
        <p className="mt-2.5 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-3 py-3 text-[12.5px] leading-[1.5] text-[#75808d]">
          Nothing pinned yet. This is where the things people keep asking you go — pricing rules,
          lead capture, what to lead with.
        </p>
      )}
    </section>
  );
}
