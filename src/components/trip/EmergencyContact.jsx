import { useEffect, useState } from "react";
import { ShieldExclamationIcon } from "@heroicons/react/24/outline";
import { getEmergencyContacts, saveEmergencyContact } from "../../api/emergencyContacts";
import { formatPhoneInput, formatPhoneNumber, phoneLinkValue } from "../../utils/phone";
import { Card, Eyebrow } from "./TripChrome";

const empty = { name: "", relationship: "", phone: "", notes: "" };

const fieldClass = "mt-1 min-h-[44px] w-full rounded-xl border border-white/10 bg-gray-950/55 px-3 text-white";
const labelClass = "block text-[13px] font-semibold text-[#93a0b4]";

export default function EmergencyContact({ user }) {
  const [contact, setContact] = useState(null);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    getEmergencyContacts(user)
      .then((result) => !cancelled && setContact(result.mine || null))
      .catch(() => { /* leave it empty rather than claim there is none */ })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [user?.email]);

  const startEditing = () => {
    setForm({ ...empty, ...contact });
    setError("");
    setMessage("");
    setEditing(true);
  };

  const save = async (submitEvent) => {
    submitEvent.preventDefault();
    setSaving(true);
    setError("");
    try {
      const result = await saveEmergencyContact(form, user);
      setContact(result.mine || null);
      setEditing(false);
      setMessage(result.mine ? "Emergency contact saved." : "Emergency contact removed.");
    } catch (saveError) {
      setError(saveError.message || "Could not save your emergency contact.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    setError("");
    try {
      await saveEmergencyContact(empty, user);
      setContact(null);
      setForm(empty);
      setEditing(false);
      setMessage("Emergency contact removed.");
    } catch (removeError) {
      setError(removeError.message || "Could not remove your emergency contact.");
    } finally {
      setSaving(false);
    }
  };

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <section>
      <Eyebrow>Emergency contact</Eyebrow>
      <Card className="mt-3 p-4">
        {!editing && (
          <>
            {loading ? (
              <p className="text-[13px] text-[#75808d]">Loading…</p>
            ) : contact ? (
              <>
                <p className="text-[15px] font-semibold text-white">{contact.name}</p>
                <p className="mt-0.5 text-[13px] text-[#93a0b4]">
                  {[contact.relationship, formatPhoneNumber(contact.phone)].filter(Boolean).join(" · ")}
                </p>
                {contact.notes && (
                  <p className="mt-2 whitespace-pre-line text-[12.5px] leading-[1.5] text-[#75808d]">{contact.notes}</p>
                )}
                <a
                  href={`tel:${phoneLinkValue(contact.phone)}`}
                  className="mt-3 inline-flex min-h-[44px] items-center text-[13px] font-semibold text-[#0951fa]"
                >
                  Call {contact.name.split(" ")[0]}
                </a>
              </>
            ) : (
              <div className="flex gap-3">
                <ShieldExclamationIcon aria-hidden="true" className="h-5 w-5 shrink-0 text-[#f59e0b]" />
                <p className="text-[13px] leading-[1.5] text-[#93a0b4]">
                  Nobody to call yet. If something happens to you on the road, this is who the team reaches.
                </p>
              </div>
            )}

            {!loading && (
              <button
                type="button"
                onClick={startEditing}
                className="mt-3 min-h-[44px] w-full rounded-xl border border-white/15 text-[14px] font-semibold text-white"
              >
                {contact ? "Edit" : "Add an emergency contact"}
              </button>
            )}
          </>
        )}

        {editing && (
          <form onSubmit={save} className="space-y-2.5">
            <label className={labelClass}>
              Their name
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Dana Willingham"
                autoComplete="off"
                className={fieldClass}
              />
            </label>
            <div className="flex gap-2.5">
              <label className={`${labelClass} flex-1`}>
                Relationship
                <input
                  value={form.relationship}
                  onChange={(e) => set("relationship", e.target.value)}
                  placeholder="Spouse"
                  className={fieldClass}
                />
              </label>
              <label className={`${labelClass} flex-1`}>
                Phone
                <input
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", formatPhoneInput(e.target.value))}
                  placeholder="(214) 555-0148"
                  className={fieldClass}
                />
              </label>
            </div>
            <label className={labelClass}>
              Anything the team should know
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Optional — a second number, an allergy, who else to try."
                className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-gray-950/55 px-3 py-2 text-white"
              />
            </label>

            <p className="text-[11.5px] leading-[1.5] text-[#75808d]">
              Only you and the event managers can see this.
            </p>

            {error && <p role="alert" className="text-[12.5px] font-semibold text-[#ef4444]">{error}</p>}

            <div className="flex gap-2.5">
              <button
                type="submit"
                disabled={saving}
                className="min-h-[48px] flex-1 rounded-xl bg-[#0951fa] text-[14px] font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); setError(""); }}
                className="min-h-[48px] rounded-xl border border-white/15 px-4 text-[14px] font-semibold text-[#93a0b4]"
              >
                Cancel
              </button>
            </div>

            {contact && (
              <button
                type="button"
                disabled={saving}
                onClick={remove}
                className="min-h-[44px] w-full text-[13px] font-semibold text-[#ef4444] disabled:opacity-50"
              >
                Remove my emergency contact
              </button>
            )}
          </form>
        )}

        {message && !editing && (
          <p role="status" className="mt-2 text-[12.5px] font-semibold text-[#10b981]">{message}</p>
        )}
      </Card>
    </section>
  );
}
