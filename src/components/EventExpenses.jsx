import { useEffect, useMemo, useRef, useState } from "react";
import {
  CameraIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  ArrowPathIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  createReceipt,
  deleteReceipt,
  expenseCategories,
  getReceiptImage,
  listReceipts,
  reanalyzeReceipt,
  updateReceipt,
} from "../api/expenses";
import { downloadExpensePackage } from "../utils/expenseExports";

const inputClass = "mt-1 min-h-[44px] w-full rounded-md border border-white/15 bg-gray-950/70 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[#0951fa] focus:outline-none focus:ring-2 focus:ring-[#0951fa]/40";

function money(value) {
  return Number(value || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function ReceiptEditor({ receipt, imageUrl, onSave, onDelete, onReanalyze, busy }) {
  const [draft, setDraft] = useState(receipt);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  useEffect(() => setDraft(receipt), [receipt]);
  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  return (
    <details className="group self-start rounded-lg border border-white/10 bg-white/[0.035] px-4">
      <summary className="flex min-h-[68px] cursor-pointer list-none items-center justify-between gap-3 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0951fa] [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block truncate font-semibold text-white">{receipt.merchant || "Receipt needs details"}</span>
          <span className="mt-0.5 block text-xs text-gray-400">{receipt.date || "No date"} · {receipt.category} · {money(receipt.total)}</span>
        </span>
        <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase ${receipt.confirmed ? "bg-[#10b981]/15 text-white" : "bg-[#f59e0b]/15 text-white"}`}>
          {receipt.confirmed ? "Ready" : "Review"}
        </span>
      </summary>
      <div className="border-t border-white/10 pb-4 pt-4">
        {imageUrl && <img src={imageUrl} alt={`Receipt from ${receipt.merchant || "unknown merchant"}`} className="mb-4 max-h-72 w-full rounded-md bg-white object-contain" />}
        <div className="mb-4 flex items-start gap-2 rounded-md border border-[#f59e0b]/25 bg-[#f59e0b]/10 p-3 text-xs leading-5 text-white">
          <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{receipt.analysisNote || "Confirm the extracted values before finalizing the report."}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-gray-300 sm:col-span-2">Merchant
            <input value={draft.merchant || ""} onChange={(event) => update("merchant", event.target.value)} className={inputClass} />
          </label>
          <label className="text-sm font-semibold text-gray-300">Date
            <input type="date" value={draft.date || ""} onChange={(event) => update("date", event.target.value)} className={inputClass} />
          </label>
          <label className="text-sm font-semibold text-gray-300">Category
            <select value={draft.category || "Other"} onChange={(event) => update("category", event.target.value)} className={inputClass}>
              {expenseCategories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          {["subtotal", "tax", "tip", "total"].map((field) => (
            <label key={field} className="text-sm font-semibold capitalize text-gray-300">{field}
              <input type="number" min="0" step="0.01" inputMode="decimal" value={draft[field] ?? ""} onChange={(event) => update(field, event.target.value)} className={inputClass} />
            </label>
          ))}
          <label className="text-sm font-semibold text-gray-300 sm:col-span-2">Business purpose
            <input value={draft.businessPurpose || ""} onChange={(event) => update("businessPurpose", event.target.value)} className={inputClass} placeholder="Team dinner after the expo" />
          </label>
          <label className="text-sm font-semibold text-gray-300 sm:col-span-2">Notes
            <textarea rows="2" value={draft.notes || ""} onChange={(event) => update("notes", event.target.value)} className={inputClass} />
          </label>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {!receipt.confirmed && (
            <button type="button" disabled={busy} onClick={() => onReanalyze(receipt)} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-[#0951fa] px-4 text-sm font-semibold text-white hover:bg-[#0951fa]/15 disabled:opacity-50">
              <ArrowPathIcon className={`h-5 w-5 ${busy ? "animate-spin" : ""}`} /> Read receipt again
            </button>
          )}
          <button type="button" disabled={busy || !draft.merchant || !draft.date || !Number(draft.total)} onClick={() => onSave({ ...draft, confirmed: true })} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-[#10b981] px-4 text-sm font-semibold text-[#002b5e] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
            <CheckCircleIcon className="h-5 w-5" /> Confirm receipt
          </button>
          {confirmingDelete ? (
            <div className="flex gap-2 sm:ml-auto">
              <button type="button" disabled={busy} onClick={() => setConfirmingDelete(false)} className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-white/15 px-3 text-sm font-semibold text-gray-300 hover:bg-white/[0.06]">Cancel</button>
              <button type="button" disabled={busy} onClick={() => onDelete(receipt)} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-[#ef4444] px-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                <TrashIcon className="h-5 w-5" /> Delete receipt
              </button>
            </div>
          ) : (
            <button type="button" disabled={busy} onClick={() => setConfirmingDelete(true)} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold text-[#ef4444] hover:bg-[#ef4444]/10 disabled:opacity-50 sm:ml-auto">
              <TrashIcon className="h-5 w-5" /> Delete
            </button>
          )}
        </div>
      </div>
    </details>
  );
}

export default function EventExpenses({ event, user }) {
  const fileInput = useRef(null);
  const [receipts, setReceipts] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const imageUrlsRef = useRef({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const employeeName = event.travel?.find((traveler) => traveler.email === user?.email)?.person
    || user?.user_metadata?.full_name
    || user?.email
    || "Employee";

  useEffect(() => {
    let cancelled = false;
    listReceipts(event.id, user)
      .then((items) => !cancelled && setReceipts(items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))))
      .catch((loadError) => !cancelled && setError(loadError.message || "Could not load receipts."))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [event.id, user?.email]);

  useEffect(() => {
    imageUrlsRef.current = imageUrls;
  }, [imageUrls]);

  useEffect(() => () => {
    Object.values(imageUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all(receipts.map(async (receipt) => {
      if (imageUrls[receipt.id]) return [receipt.id, imageUrls[receipt.id]];
      const blob = await getReceiptImage(receipt.id, event.id, user);
      const url = URL.createObjectURL(blob);
      return [receipt.id, url];
    })).then((entries) => !cancelled && setImageUrls((current) => ({ ...current, ...Object.fromEntries(entries) }))).catch(() => {});
    return () => { cancelled = true; };
  }, [receipts.map((receipt) => receipt.id).join("|"), event.id, user?.email]);

  const total = useMemo(() => receipts.reduce((sum, receipt) => sum + Number(receipt.total || 0), 0), [receipts]);
  const readyCount = receipts.filter((receipt) => receipt.confirmed).length;
  const allReady = receipts.length > 0 && readyCount === receipts.length;

  const addReceipt = async (file) => {
    if (!file) return;
    setBusy(true);
    setError("");
    setMessage("Reading the receipt and suggesting a category...");
    try {
      const receipt = await createReceipt(event.id, file, user);
      setReceipts((current) => [receipt, ...current]);
      setMessage("Receipt added. Open it and confirm the extracted details.");
    } catch (addError) {
      setError(addError.message || "Could not add the receipt.");
      setMessage("");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const saveReceipt = async (receipt) => {
    setBusy(true);
    setError("");
    try {
      const saved = await updateReceipt(receipt, user);
      setReceipts((current) => current.map((item) => item.id === saved.id ? saved : item));
      setMessage("Receipt confirmed and ready for the final report.");
    } catch (saveError) {
      setError(saveError.message || "Could not save the receipt.");
    } finally {
      setBusy(false);
    }
  };

  const removeReceipt = async (receipt) => {
    setBusy(true);
    try {
      await deleteReceipt(receipt.id, event.id, user);
      if (imageUrls[receipt.id]) URL.revokeObjectURL(imageUrls[receipt.id]);
      setReceipts((current) => current.filter((item) => item.id !== receipt.id));
      setImageUrls((current) => {
        const next = { ...current };
        delete next[receipt.id];
        return next;
      });
      setMessage("Receipt deleted.");
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete the receipt.");
    } finally {
      setBusy(false);
    }
  };

  const readReceiptAgain = async (receipt) => {
    setBusy(true);
    setError("");
    setMessage("Reading the saved receipt again...");
    try {
      const analyzed = await reanalyzeReceipt(receipt.id, event.id, user);
      setReceipts((current) => current.map((item) => item.id === analyzed.id ? analyzed : item));
      setMessage("Receipt read again. Review and confirm the extracted details.");
    } catch (analysisError) {
      setError(analysisError.message || "Could not read the receipt again.");
      setMessage("");
    } finally {
      setBusy(false);
    }
  };

  const finalize = async () => {
    setBusy(true);
    setError("");
    setMessage("Building the spreadsheet, PDF, and receipt package...");
    try {
      await downloadExpensePackage({
        event,
        employeeName,
        receipts: [...receipts].sort((a, b) => (a.date || "").localeCompare(b.date || "")),
        getImage: (receiptId) => getReceiptImage(receiptId, event.id, user),
      });
      setMessage("Final trip report downloaded.");
    } catch (exportError) {
      setError(exportError.message || "Could not build the final trip report.");
      setMessage("");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-400">Loading receipts...</p>;

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-300">Save receipts throughout the trip, confirm the extracted details, then download one final reimbursement package.</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-gray-400">
            <span>{receipts.length} receipts</span><span>{readyCount} ready</span><span>{money(total)} total</span>
          </div>
        </div>
        <button type="button" disabled={busy} onClick={() => fileInput.current?.click()} className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-md bg-[#0951fa] px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
          <CameraIcon className="h-5 w-5" /> {busy ? "Reading receipt..." : "Add receipt"}
        </button>
        <input ref={fileInput} type="file" accept="image/*" capture="environment" onChange={(event) => addReceipt(event.target.files?.[0])} className="sr-only" />
      </div>

      {message && <p role="status" className="mt-4 text-sm font-semibold text-[#10b981]">{message}</p>}
      {error && <p role="alert" className="mt-4 text-sm font-semibold text-[#ef4444]">{error}</p>}

      {!receipts.length ? (
        <div className="mt-5 border-y border-dashed border-white/15 py-8 text-center">
          <PhotoIcon className="mx-auto h-8 w-8 text-gray-600" />
          <p className="mt-3 font-semibold text-white">No receipts yet</p>
          <p className="mt-1 text-sm text-gray-500">Take a picture after each purchase so nothing gets lost.</p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {receipts.map((receipt) => (
            <ReceiptEditor key={receipt.id} receipt={receipt} imageUrl={imageUrls[receipt.id]} onSave={saveReceipt} onDelete={removeReceipt} onReanalyze={readReceiptAgain} busy={busy} />
          ))}
        </div>
      )}

      <div className="mt-5 border-t border-white/10 pt-5">
        <button type="button" disabled={busy || !allReady} onClick={finalize} className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-[#f59e0b] px-5 text-sm font-bold text-[#002b5e] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto">
          <DocumentArrowDownIcon className="h-5 w-5" /> Finalize and download trip report
        </button>
        {!allReady && receipts.length > 0 && <p className="mt-2 text-xs text-[#f59e0b]">Confirm every receipt before creating the final report.</p>}
        <p className="mt-2 text-xs leading-5 text-gray-500">The download includes an Excel workbook, combined receipt PDF, and original receipt images.</p>
      </div>
    </div>
  );
}
