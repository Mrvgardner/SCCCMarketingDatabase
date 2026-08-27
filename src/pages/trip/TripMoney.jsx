import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { CameraIcon } from "@heroicons/react/24/outline";
import {
  createReceipt,
  deleteReceipt,
  expenseCategories,
  flushReceipts,
  getReceiptImage,
  listReceipts,
  reanalyzeReceipt,
  updateReceipt,
} from "../../api/expenses";
import { downloadExpensePackage } from "../../utils/expenseExports";
import { Card, Eyebrow, StatusPill } from "../../components/trip/TripChrome";

const money = (value) => Number(value || 0).toFixed(2);

// Presentation only — every write goes through the existing expenses API so the
// OCR, offline queue, confirm and finalize behaviour stays exactly as it is on
// the event hub.
export default function TripMoney() {
  const { event, user, myName } = useOutletContext();
  const [receipts, setReceipts] = useState([]);
  const [images, setImages] = useState({});
  const [openId, setOpenId] = useState(null);
  // Deleting a receipt destroys the photo as well as the row, so it takes two
  // taps rather than one. This holds the id waiting on that second tap.
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const fileInput = useRef(null);

  useEffect(() => {
    let cancelled = false;
    listReceipts(event.id, user)
      .then((items) => {
        if (cancelled) return;
        setReceipts(items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))));
        setPendingCount(items.filter((item) => item.pendingUpload).length);
      })
      .catch((loadError) => !cancelled && setError(loadError.message || "Could not load receipts."));
    return () => { cancelled = true; };
  }, [event.id, user?.email]);

  // Same foreground replay the event hub uses: iOS has no Background Sync, so
  // this is the only moment a parked receipt can send.
  useEffect(() => {
    let cancelled = false;
    const send = async () => {
      try {
        const { uploaded, remaining } = await flushReceipts(event.id, user);
        if (cancelled) return;
        if (uploaded.length) {
          const byPlaceholder = new Map(uploaded.map((item) => [item.placeholderId, item.receipt]));
          setReceipts((current) => current.map((receipt) => byPlaceholder.get(receipt.id) || receipt));
          setMessage(`${uploaded.length} queued receipt${uploaded.length === 1 ? "" : "s"} uploaded.`);
        }
        if (remaining >= 0) setPendingCount(remaining);
      } catch { /* still offline */ }
    };
    send();
    window.addEventListener("online", send);
    return () => { cancelled = true; window.removeEventListener("online", send); };
  }, [event.id, user?.email]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(receipts.map(async (receipt) => {
      if (images[receipt.id] || receipt.pendingUpload) return null;
      try {
        const blob = await getReceiptImage(receipt.id, event.id, user);
        return [receipt.id, URL.createObjectURL(blob)];
      } catch { return null; }
    })).then((entries) => {
      if (cancelled) return;
      const next = Object.fromEntries(entries.filter(Boolean));
      if (Object.keys(next).length) setImages((current) => ({ ...current, ...next }));
    });
    return () => { cancelled = true; };
  }, [receipts.map((r) => r.id).join("|"), event.id]);

  const totals = useMemo(() => {
    const sum = receipts.reduce((acc, receipt) => acc + Number(receipt.total || 0), 0);
    const ready = receipts.filter((receipt) => receipt.confirmed).length;
    return { sum, ready, review: receipts.length - ready };
  }, [receipts]);

  const addReceipt = async (file) => {
    if (!file) return;
    setBusy(true); setError(""); setMessage("Reading the receipt…");
    try {
      const receipt = await createReceipt(event.id, file, user);
      setReceipts((current) => [receipt, ...current]);
      if (receipt.pendingUpload) {
        setPendingCount((current) => current + 1);
        setMessage("No connection — the photo is saved and will upload automatically.");
      } else {
        setMessage("Receipt added. Check the amounts and confirm.");
        setOpenId(receipt.id);
      }
    } catch (addError) {
      setError(addError.message || "Could not add the receipt.");
      setMessage("");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const saveReceipt = async (receipt, patch) => {
    setBusy(true); setError("");
    try {
      const saved = await updateReceipt({ ...receipt, ...patch }, user);
      setReceipts((current) => current.map((item) => (item.id === saved.id ? saved : item)));
      if (patch.confirmed) { setOpenId(null); setMessage("Receipt confirmed."); }
    } catch (saveError) {
      setError(saveError.message || "Could not save the receipt.");
    } finally { setBusy(false); }
  };

  const removeReceipt = async (receipt) => {
    setBusy(true); setError(""); setMessage("");
    try {
      await deleteReceipt(receipt.id, event.id, user);
      if (images[receipt.id]) URL.revokeObjectURL(images[receipt.id]);
      setReceipts((current) => current.filter((item) => item.id !== receipt.id));
      setImages((current) => {
        const next = { ...current };
        delete next[receipt.id];
        return next;
      });
      setConfirmingDelete(null);
      setOpenId(null);
      setMessage("Receipt deleted.");
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete the receipt.");
    } finally { setBusy(false); }
  };

  // For when the first read got it wrong — the photo is already stored, so this
  // re-runs the extraction against it rather than asking for another picture.
  const readAgain = async (receipt) => {
    setBusy(true); setError(""); setMessage("Reading the receipt again…");
    try {
      const analyzed = await reanalyzeReceipt(receipt.id, event.id, user);
      setReceipts((current) => current.map((item) => (item.id === analyzed.id ? analyzed : item)));
      setMessage("Read again. Check the details and confirm.");
    } catch (analysisError) {
      setError(analysisError.message || "Could not read the receipt again.");
      setMessage("");
    } finally { setBusy(false); }
  };

  const allReady = receipts.length > 0 && totals.review === 0;

  const finalize = async () => {
    setBusy(true); setError(""); setMessage("Building the trip report…");
    try {
      await downloadExpensePackage({
        event,
        employeeName: myName || user?.user_metadata?.full_name || user?.email,
        // Chronological in the report, even though the list above is newest
        // first — an expense report reads as a trip, not as a feed.
        receipts: [...receipts].sort((a, b) => String(a.date || "").localeCompare(String(b.date || ""))),
        getImage: (receiptId) => getReceiptImage(receiptId, event.id, user),
      });
      setMessage("Trip report downloaded.");
    } catch (exportError) {
      setError(exportError.message || "Could not build the report.");
      setMessage("");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <Eyebrow>{event.shortName} {event.year} · Reimbursement</Eyebrow>

      <div className="flex items-baseline">
        <span className="font-switch-bold text-[46px] leading-[0.9] text-white">
          ${Math.floor(totals.sum).toLocaleString()}
        </span>
        <span className="font-switch-bold text-[18px] leading-none text-[#75808d]">
          .{money(totals.sum).split(".")[1]}
        </span>
      </div>
      <p className="text-[12px] font-semibold text-[#93a0b4]">
        {receipts.length} receipt{receipts.length === 1 ? "" : "s"}
        {" · "}<span className="text-[#10b981]">{totals.ready} ready</span>
        {" · "}<span className="text-[#f59e0b]">{totals.review} need review</span>
      </p>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => addReceipt(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => fileInput.current?.click()}
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#0951fa] text-[15px] font-semibold text-white disabled:opacity-60"
      >
        <CameraIcon className="h-5 w-5" />
        Snap a receipt
      </button>
      <p className="text-center text-[11.5px] leading-[1.5] text-[#75808d]">
        Shoot it now — it reads the merchant and total, and uploads when you get signal.
      </p>

      {pendingCount > 0 && (
        <p role="status" className="rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-3 py-2 text-[12.5px] text-[#f59e0b]">
          {pendingCount} waiting to upload. They send once you have a connection — keep this screen open when you get signal.
        </p>
      )}
      {message && <p role="status" className="text-[12.5px] font-semibold text-[#10b981]">{message}</p>}
      {error && <p role="alert" className="text-[12.5px] font-semibold text-[#ef4444]">{error}</p>}

      <div className="space-y-2">
        {receipts.map((receipt) => {
          const ready = receipt.confirmed;
          const open = openId === receipt.id;
          return (
            <Card
              key={receipt.id}
              className={ready ? "" : "border-[#f59e0b]/35"}
            >
              <button
                type="button"
                onClick={() => { setConfirmingDelete(null); setOpenId(open ? null : receipt.id); }}
                disabled={receipt.pendingUpload}
                className="flex w-full items-center gap-3 p-3 text-left disabled:opacity-70"
              >
                <span
                  className="h-12 w-10 shrink-0 overflow-hidden rounded-md bg-white/[0.05]"
                  style={images[receipt.id] ? undefined : {
                    backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,.12) 0 3px, transparent 3px 7px)",
                  }}
                >
                  {images[receipt.id] && (
                    <img src={images[receipt.id]} alt="" className="h-full w-full object-cover" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-white">
                    {receipt.merchant || "Untitled receipt"}
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] text-[#93a0b4]">
                    {[receipt.date, receipt.category, `$${money(receipt.total)}`].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <StatusPill tone={receipt.pendingUpload ? "pending" : ready ? "ready" : "review"}>
                  {receipt.pendingUpload ? "Waiting" : ready ? "Ready" : "Review"}
                </StatusPill>
              </button>

              {open && !receipt.pendingUpload && (
                <div className="space-y-2.5 border-t border-white/[0.07] p-3">
                  <Field label="Merchant" value={receipt.merchant}
                    onChange={(v) => setReceipts((c) => c.map((r) => r.id === receipt.id ? { ...r, merchant: v } : r))} />
                  <div className="flex gap-2.5">
                    <Field label="Date" type="date" value={receipt.date}
                      onChange={(v) => setReceipts((c) => c.map((r) => r.id === receipt.id ? { ...r, date: v } : r))} />
                    <Field label="Total" type="number" value={receipt.total}
                      onChange={(v) => setReceipts((c) => c.map((r) => r.id === receipt.id ? { ...r, total: v } : r))} />
                  </div>
                  <label className="block">
                    <span className="font-switch-reg text-[10px] uppercase tracking-[0.16em] text-[#75808d]">Category</span>
                    <select
                      value={receipt.category || "Other"}
                      onChange={(e) => setReceipts((c) => c.map((r) => r.id === receipt.id ? { ...r, category: e.target.value } : r))}
                      className="mt-1 min-h-[44px] w-full rounded-xl border border-white/10 bg-gray-950/55 px-3 text-white"
                    >
                      {expenseCategories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </label>
                  {receipt.analysisNote && (
                    <p className="text-[11.5px] leading-[1.45] text-[#75808d]">{receipt.analysisNote}</p>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => saveReceipt(receipt, { confirmed: true })}
                    className="min-h-[48px] w-full rounded-xl bg-[#10b981] text-[14px] font-semibold text-white disabled:opacity-60"
                  >
                    Confirm receipt
                  </button>

                  {confirmingDelete === receipt.id ? (
                    <div className="rounded-xl border border-[#ef4444]/40 bg-[#ef4444]/[0.08] p-3">
                      <p className="text-[12.5px] leading-[1.45] text-white">
                        Delete this receipt and its photo? This cannot be undone.
                      </p>
                      <div className="mt-2.5 flex gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => removeReceipt(receipt)}
                          className="min-h-[44px] flex-1 rounded-lg bg-[#ef4444] text-[13px] font-semibold text-white disabled:opacity-60"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingDelete(null)}
                          className="min-h-[44px] flex-1 rounded-lg border border-white/15 text-[13px] font-semibold text-[#93a0b4]"
                        >
                          Keep
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => readAgain(receipt)}
                        className="min-h-[44px] flex-1 rounded-lg border border-white/15 text-[13px] font-semibold text-[#93a0b4] disabled:opacity-60"
                      >
                        Read again
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setConfirmingDelete(receipt.id)}
                        className="min-h-[44px] flex-1 rounded-lg border border-[#ef4444]/35 text-[13px] font-semibold text-[#ef4444] disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
        {!receipts.length && (
          <p className="py-6 text-center text-[13px] text-[#93a0b4]">
            No receipts yet. Snap the first one above.
          </p>
        )}
      </div>

      <div>
        <button
          type="button"
          disabled={!allReady || busy}
          onClick={finalize}
          className="min-h-[52px] w-full rounded-2xl border border-[#f59e0b]/40 bg-[#f59e0b]/[0.08] text-[15px] font-semibold text-[#f59e0b] disabled:opacity-45"
        >
          Finalize trip report
        </button>
        {!allReady && (
          <p className="mt-2 text-center text-[11.5px] leading-[1.5] text-[#75808d]">
            {receipts.length
              ? `Confirm the ${totals.review} receipt${totals.review === 1 ? "" : "s"} still marked Review to finalize.`
              : "Add and confirm your receipts to finalize."}
          </p>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="block flex-1">
      <span className="font-switch-reg text-[10px] uppercase tracking-[0.16em] text-[#75808d]">{label}</span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 min-h-[44px] w-full rounded-xl border border-white/10 bg-gray-950/55 px-3 text-white"
      />
    </label>
  );
}
