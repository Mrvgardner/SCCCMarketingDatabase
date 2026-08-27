import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  BellAlertIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  DocumentArrowUpIcon,
  LinkIcon,
  MapPinIcon,
  PencilSquareIcon,
  PlusIcon,
  UserGroupIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { listTradeShows, updateTradeShow } from "../../api/tradeShows";
import { sendEventPush } from "../../api/pushNotifications";
import { useAuth } from "../../contexts/AuthContext";
import { formatPhoneInput } from "../../utils/phone";
import {
  deleteEventResourceFile,
  RESOURCE_FILE_ACCEPT,
  uploadEventResource,
} from "../../api/eventResources";

const inputClass = "mt-1 w-full rounded-lg border border-white/10 bg-gray-950/55 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-[#7ea6ff] focus:ring-1 focus:ring-[#7ea6ff]";
const panelClass = "rounded-lg border border-white/10 bg-gray-900/55 p-4 shadow-xl shadow-black/10 sm:p-5";

function todayISO() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block text-sm font-medium text-gray-300">
      {label}
      <input type={type} value={value || ""} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={inputClass} />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <label className="block text-sm font-medium text-gray-300">
      {label}
      <textarea rows={rows} value={value || ""} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={inputClass} />
    </label>
  );
}

const emptyScheduleItem = {
  time: "",
  title: "",
  location: "",
  owner: "Team",
  type: "Event",
  notes: "",
};

const emptyResource = {
  title: "",
  description: "",
  type: "Internal",
  url: "",
};

export default function TradeShowEditor() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [scheduleItem, setScheduleItem] = useState(emptyScheduleItem);
  const [newTraveler, setNewTraveler] = useState("");
  const [editingTravelerName, setEditingTravelerName] = useState("");
  const [travelerNameDraft, setTravelerNameDraft] = useState("");
  const [resourceDraft, setResourceDraft] = useState(emptyResource);
  const [resourceFile, setResourceFile] = useState(null);
  const [resourceFileInputKey, setResourceFileInputKey] = useState(0);
  const [editingResourceIndex, setEditingResourceIndex] = useState(null);
  const [resourceSaving, setResourceSaving] = useState(false);
  const [updateDraft, setUpdateDraft] = useState({
    title: "",
    body: "",
    urgent: false,
    sendPush: true,
    smsCopy: "",
    author: user?.user_metadata?.full_name || user?.email || "",
  });

  useEffect(() => {
    let cancelled = false;
    listTradeShows()
      .then((items) => {
        if (cancelled) return;
        const found = items.find((item) => item.id === eventId);
        if (!found) setError("Trade show not found");
        else setEvent(clone(found));
      })
      .catch((err) => !cancelled && setError(err.message || "Unable to load event"))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [eventId]);

  const selectedDay = event?.schedule?.[selectedDayIndex];
  const attendeeUrl = `/trip/${eventId}/today`;

  const latestStatus = useMemo(() => {
    const latest = event?.latestUpdates?.[0];
    return latest ? `${latest.level}: ${latest.title}` : "No updates yet";
  }, [event]);

  const saveEvent = async (nextEvent, message) => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const saved = await updateTradeShow(nextEvent);
      setEvent(clone(saved));
      setNotice(message);
      return saved;
    } catch (err) {
      setError(err.message || "Save failed");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const updateTopLevel = (key, value) => setEvent((current) => ({ ...current, [key]: value }));
  const updateHotel = (key, value) => setEvent((current) => ({ ...current, hotel: { ...current.hotel, [key]: value } }));
  const updateTeamContact = (name, key, value) => {
    setEvent((current) => ({
      ...current,
      teamContacts: {
        ...(current.teamContacts || {}),
        [name]: { ...(current.teamContacts?.[name] || {}), [key]: value },
      },
    }));
  };
  const updateSelectedDay = (key, value) => {
    setEvent((current) => {
      const schedule = clone(current.schedule);
      schedule[selectedDayIndex] = { ...schedule[selectedDayIndex], [key]: value };
      return { ...current, schedule };
    });
  };

  const beginEditItem = (index) => {
    setEditingItemIndex(index);
    setScheduleItem(clone(selectedDay.items[index]));
  };

  const resetItemForm = () => {
    setEditingItemIndex(null);
    setScheduleItem(emptyScheduleItem);
  };

  const saveScheduleItem = async (formEvent) => {
    formEvent.preventDefault();
    const nextEvent = clone(event);
    const items = nextEvent.schedule[selectedDayIndex].items;
    if (editingItemIndex === null) items.push({ ...scheduleItem });
    else items[editingItemIndex] = { ...scheduleItem };
    const saved = await saveEvent(nextEvent, editingItemIndex === null ? "Schedule item added." : "Schedule item updated.");
    if (saved) resetItemForm();
  };

  const publishUpdate = async (formEvent) => {
    formEvent.preventDefault();
    const nextEvent = clone(event);
    const update = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `update-${Date.now()}`,
      level: updateDraft.urgent ? "Urgent" : "Normal",
      date: todayISO(),
      author: updateDraft.author || "Event manager",
      title: updateDraft.title,
      body: updateDraft.body,
      smsCopy: updateDraft.smsCopy,
    };
    nextEvent.latestUpdates = [
      update,
      ...(nextEvent.latestUpdates || []),
    ];
    const saved = await saveEvent(nextEvent, updateDraft.urgent ? "Urgent update published." : "Update published.");
    if (saved) {
      if (updateDraft.sendPush) {
        try {
          const delivery = await sendEventPush(event.id, update);
          setNotice(`Update published. Push sent to ${delivery.delivered} device${delivery.delivered === 1 ? "" : "s"}.`);
        } catch (err) {
          setNotice(`Update published. Push delivery unavailable: ${err.message}`);
        }
      }
      setUpdateDraft((current) => ({ ...current, title: "", body: "", urgent: false, smsCopy: "" }));
    }
  };

  const addTraveler = async (formEvent) => {
    formEvent.preventDefault();
    const name = newTraveler.trim();
    if (!name) return;
    if ((event.travelingTeam || []).some((traveler) => traveler.toLowerCase() === name.toLowerCase())) {
      setError(`${name} is already on the traveling team.`);
      return;
    }

    const nextEvent = clone(event);
    nextEvent.travelingTeam = [...(nextEvent.travelingTeam || []), name];
    nextEvent.teamContacts = { ...(nextEvent.teamContacts || {}), [name]: { phone: "", email: "" } };
    if (!(nextEvent.travel || []).some((traveler) => traveler.person?.toLowerCase() === name.toLowerCase())) {
      nextEvent.travel = [
        ...(nextEvent.travel || []),
        { person: name, arrival: "TBD", departure: "TBD", carrier: "Optional", notes: "Flight info not added." },
      ];
    }
    const saved = await saveEvent(nextEvent, `${name} added to the traveling team.`);
    if (saved) setNewTraveler("");
  };

  const removeTraveler = async (name) => {
    const nextEvent = clone(event);
    nextEvent.travelingTeam = (nextEvent.travelingTeam || []).filter((traveler) => traveler !== name);
    nextEvent.travel = (nextEvent.travel || []).filter((traveler) => traveler.person !== name);
    if (nextEvent.teamContacts) delete nextEvent.teamContacts[name];
    await saveEvent(nextEvent, `${name} removed from the traveling team.`);
  };

  const renameTraveler = async (oldName) => {
    const newName = travelerNameDraft.trim();
    if (!newName || newName === oldName) {
      setEditingTravelerName("");
      return;
    }
    if ((event.travelingTeam || []).some((name) => name !== oldName && name.toLowerCase() === newName.toLowerCase())) {
      setError(`${newName} is already on the traveling team.`);
      return;
    }

    const nextEvent = clone(event);
    nextEvent.travelingTeam = (nextEvent.travelingTeam || []).map((name) => name === oldName ? newName : name);
    nextEvent.travel = (nextEvent.travel || []).map((traveler) => traveler.person === oldName ? { ...traveler, person: newName } : traveler);
    nextEvent.teamContacts = { ...(nextEvent.teamContacts || {}) };
    if (nextEvent.teamContacts[oldName]) {
      nextEvent.teamContacts[newName] = nextEvent.teamContacts[oldName];
      delete nextEvent.teamContacts[oldName];
    }
    const saved = await saveEvent(nextEvent, `${oldName} renamed to ${newName}.`);
    if (saved) {
      setEditingTravelerName("");
      setTravelerNameDraft("");
    }
  };

  const resetResourceForm = () => {
    setResourceDraft(emptyResource);
    setResourceFile(null);
    setEditingResourceIndex(null);
    setResourceFileInputKey((current) => current + 1);
  };

  const beginEditResource = (index) => {
    const resource = event.resources[index];
    setEditingResourceIndex(index);
    setResourceDraft({
      title: resource.title || "",
      description: resource.description || "",
      type: resource.type === "External" ? "External" : "Internal",
      url: resource.url || "",
    });
    setResourceFile(null);
    setResourceFileInputKey((current) => current + 1);
  };

  const saveResource = async (formEvent) => {
    formEvent.preventDefault();
    const existing = editingResourceIndex === null ? null : event.resources[editingResourceIndex];
    if (!resourceFile && !resourceDraft.url.trim() && !existing?.fileId) {
      setError("Add a web address or choose a file for this resource.");
      return;
    }

    setResourceSaving(true);
    setError("");
    let uploadedFile = null;
    try {
      if (resourceFile) uploadedFile = await uploadEventResource(event.id, resourceFile);
      const resource = {
        ...(existing || {}),
        id: existing?.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `resource-${Date.now()}`),
        title: resourceDraft.title.trim(),
        description: resourceDraft.description.trim(),
        type: uploadedFile || existing?.fileId ? "File" : resourceDraft.type,
        url: uploadedFile || existing?.fileId ? "" : resourceDraft.url.trim(),
        ...(uploadedFile || {}),
      };
      const nextEvent = clone(event);
      nextEvent.resources = [...(nextEvent.resources || [])];
      if (editingResourceIndex === null) nextEvent.resources.push(resource);
      else nextEvent.resources[editingResourceIndex] = resource;

      const saved = await saveEvent(nextEvent, editingResourceIndex === null ? "Resource added." : "Resource updated.");
      if (!saved) {
        if (uploadedFile?.fileId) await deleteEventResourceFile(event.id, uploadedFile.fileId).catch(() => {});
        return;
      }
      if (uploadedFile?.fileId && existing?.fileId) await deleteEventResourceFile(event.id, existing.fileId).catch(() => {});
      resetResourceForm();
    } catch (err) {
      setError(err.message || "Unable to save resource.");
    } finally {
      setResourceSaving(false);
    }
  };

  const removeResource = async (index) => {
    const resource = event.resources[index];
    const nextEvent = clone(event);
    nextEvent.resources.splice(index, 1);
    const saved = await saveEvent(nextEvent, `${resource.title} removed.`);
    if (saved && resource.fileId) await deleteEventResourceFile(event.id, resource.fileId).catch(() => {});
    if (editingResourceIndex === index) resetResourceForm();
  };

  if (loading) return <main className="min-h-screen bg-gray-900 py-20 text-center text-gray-400">Loading event manager...</main>;
  if (!event) return <main className="min-h-screen bg-gray-900 p-8 text-center text-red-200">{error || "Event not found"}</main>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 px-4 py-6 text-white sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link to="/admin/events" className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white">
            <ArrowLeftIcon className="h-4 w-4" /> Trade Show Manager
          </Link>
          <Link to={attendeeUrl} className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-white/15 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-white/10 hover:text-white">
            View employee page
          </Link>
        </div>

        <header className="mb-6">
          <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[#ff8a4d]">Event manager</div>
          <h1 className="font-switch-bold mt-2 text-3xl tracking-wide sm:text-4xl">{event.name}</h1>
          <p className="mt-2 text-sm text-gray-400">Latest attendee message: {latestStatus}</p>
        </header>

        {import.meta.env.DEV && (
          <div className="mb-5 rounded-lg border border-blue-400/25 bg-blue-500/10 p-4 text-sm text-blue-100">
            Local preview mode: saves update this browser immediately. After deployment, the same controls use the shared admin-protected event store.
          </div>
        )}
        {notice && <div role="status" className="mb-5 flex items-center gap-2 rounded-lg border border-green-400/25 bg-green-500/10 p-4 text-sm text-green-100"><CheckCircleIcon className="h-5 w-5" />{notice}</div>}
        {error && <div role="alert" className="mb-5 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

        <div className="grid gap-5 xl:grid-cols-2">
          <form onSubmit={(formEvent) => { formEvent.preventDefault(); saveEvent(event, "Event essentials saved."); }} className={panelClass}>
            <div className="mb-5 flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-[#ff8a4d]" />
              <h2 className="text-xl font-semibold">Event essentials</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Event name" value={event.name} onChange={(value) => updateTopLevel("name", value)} />
              <Field label="Dates" value={event.dates} onChange={(value) => updateTopLevel("dates", value)} placeholder="October 13-15, 2026" />
              <Field label="City" value={event.city} onChange={(value) => updateTopLevel("city", value)} />
              <Field
                label="Time zone"
                value={event.timezone || ""}
                onChange={(value) => updateTopLevel("timezone", value)}
                placeholder="America/Los_Angeles"
              />
              <Field label="Venue" value={event.venue} onChange={(value) => updateTopLevel("venue", value)} />
              <Field label="Booth" value={event.booth} onChange={(value) => updateTopLevel("booth", value)} />
              <Field label="Booth link" type="url" value={event.boothUrl || ""} onChange={(value) => updateTopLevel("boothUrl", value)} placeholder="https://..." />
              <Field label="Expo schedule" value={event.expoDates} onChange={(value) => updateTopLevel("expoDates", value)} />
              <Field label="Event owner" value={event.owner} onChange={(value) => updateTopLevel("owner", value)} />
              <Field label="Hotel" value={event.hotel.name} onChange={(value) => updateHotel("name", value)} />
              <Field label="Hotel address" value={event.hotel.address} onChange={(value) => updateHotel("address", value)} />
            </div>
            <div className="mt-4">
              <TextArea label="Hotel and arrival notes" value={event.hotel.notes} onChange={(value) => updateHotel("notes", value)} />
            </div>
            <button type="submit" disabled={saving} className="mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#0951fa] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0a63ff] disabled:opacity-50">
              <CheckCircleIcon className="h-5 w-5" /> {saving ? "Saving..." : "Save event essentials"}
            </button>
          </form>

          <form onSubmit={publishUpdate} className={`${panelClass} border-orange-400/20`}>
            <div className="mb-5 flex items-center gap-2">
              <BellAlertIcon className="h-5 w-5 text-[#ff8a4d]" />
              <h2 className="text-xl font-semibold">Publish an update</h2>
            </div>
            <div className="space-y-4">
              <Field label="Headline" value={updateDraft.title} onChange={(value) => setUpdateDraft((current) => ({ ...current, title: value }))} placeholder="Booth meeting moved to 8:30" />
              <TextArea label="What teammates need to know" value={updateDraft.body} onChange={(value) => setUpdateDraft((current) => ({ ...current, body: value }))} rows={4} />
              <Field label="Posted by" value={updateDraft.author} onChange={(value) => setUpdateDraft((current) => ({ ...current, author: value }))} />
              <TextArea label="SMS copy (optional)" value={updateDraft.smsCopy} onChange={(value) => setUpdateDraft((current) => ({ ...current, smsCopy: value }))} placeholder="Short text ready to paste into the team message" />
              <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-lg border border-red-400/20 bg-red-500/[0.06] px-4 py-3">
                <input type="checkbox" checked={updateDraft.urgent} onChange={(event) => setUpdateDraft((current) => ({ ...current, urgent: event.target.checked }))} className="h-5 w-5 rounded border-gray-600 bg-gray-800 text-red-500 focus:ring-red-400" />
                <span>
                  <span className="block text-sm font-semibold text-white">Mark as urgent</span>
                  <span className="block text-xs text-gray-400">Shows a red alert at the top of the employee event page.</span>
                </span>
              </label>
              <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-lg border border-[#7ea6ff]/20 bg-[#0951fa]/[0.08] px-4 py-3">
                <input type="checkbox" checked={updateDraft.sendPush} onChange={(event) => setUpdateDraft((current) => ({ ...current, sendPush: event.target.checked }))} className="h-5 w-5 rounded border-gray-600 bg-gray-800 text-[#0951fa] focus:ring-[#7ea6ff]" />
                <span>
                  <span className="block text-sm font-semibold text-white">Send a push notification</span>
                  <span className="block text-xs text-gray-400">Notifies teammates who enabled alerts for this event.</span>
                </span>
              </label>
            </div>
            <button type="submit" disabled={saving || !updateDraft.title || !updateDraft.body} className={`mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${updateDraft.urgent ? "bg-red-600 hover:bg-red-500" : "bg-[#ff4f00] hover:bg-[#ff6a2b]"}`}>
              <BellAlertIcon className="h-5 w-5" /> {saving ? "Publishing..." : updateDraft.urgent ? "Publish urgent update" : "Publish update"}
            </button>
          </form>
        </div>

        <section id="resources" className={`${panelClass} mt-5 scroll-mt-24`}>
          <div className="mb-5 flex items-center gap-2">
            <DocumentArrowUpIcon className="h-5 w-5 text-[#d946ef]" />
            <h2 className="text-xl font-semibold">Event resources</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-3">
              {(event.resources || []).map((resource, index) => (
                <div key={resource.id || `${resource.title}-${index}`} className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-white">{resource.title}</h3>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-gray-300">{resource.type}</span>
                    </div>
                    <p className="mt-1 text-sm leading-5 text-gray-400">{resource.description || "No description"}</p>
                    <p className="mt-2 truncate text-xs text-gray-500">{resource.fileName || resource.url || "No link or file"}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button type="button" onClick={() => beginEditResource(index)} aria-label={`Edit ${resource.title}`} className="inline-flex h-11 w-11 items-center justify-center rounded-md text-gray-400 hover:bg-white/[0.06] hover:text-white">
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button type="button" onClick={() => removeResource(index)} disabled={saving || resourceSaving} aria-label={`Remove ${resource.title}`} className="inline-flex h-11 w-11 items-center justify-center rounded-md text-gray-400 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
              {!(event.resources || []).length && <p className="rounded-lg border border-dashed border-white/15 p-4 text-sm text-gray-500">No resources have been added.</p>}
            </div>

            <form onSubmit={saveResource} className="rounded-lg border border-white/10 bg-black/15 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-white">{editingResourceIndex === null ? "Add resource" : "Edit resource"}</h3>
                {editingResourceIndex !== null && <button type="button" onClick={resetResourceForm} className="text-sm text-gray-400 hover:text-white">Cancel edit</button>}
              </div>
              <div className="space-y-4">
                <Field label="Resource name" value={resourceDraft.title} onChange={(value) => setResourceDraft((current) => ({ ...current, title: value }))} placeholder="Booth talking points" />
                <TextArea label="Description" value={resourceDraft.description} onChange={(value) => setResourceDraft((current) => ({ ...current, description: value }))} rows={3} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Resource type
                    <select value={resourceDraft.type} onChange={(event) => setResourceDraft((current) => ({ ...current, type: event.target.value }))} className={inputClass} disabled={Boolean(resourceFile || (editingResourceIndex !== null && event.resources[editingResourceIndex]?.fileId))}>
                      <option value="Internal">Internal</option>
                      <option value="External">External</option>
                    </select>
                  </label>
                  <Field label="Web address" type="url" value={resourceDraft.url} onChange={(value) => setResourceDraft((current) => ({ ...current, url: value }))} placeholder="https://..." />
                </div>
                <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-4">
                  <label className="block text-sm font-medium text-gray-300">
                    {editingResourceIndex !== null && event.resources[editingResourceIndex]?.fileId ? "Replace uploaded file" : "Upload a file"}
                    <input key={resourceFileInputKey} type="file" accept={RESOURCE_FILE_ACCEPT} onChange={(event) => setResourceFile(event.target.files?.[0] || null)} className="mt-2 block w-full text-sm text-gray-400 file:mr-3 file:min-h-[40px] file:rounded-md file:border-0 file:bg-[#0951fa] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-[#0a63ff]" />
                  </label>
                  <p className="mt-2 text-xs leading-5 text-gray-500">PDF, Word, Excel, PowerPoint, image, CSV, or text file. Maximum 5 MB.</p>
                  {resourceFile && <p className="mt-2 text-sm text-blue-200">Selected: {resourceFile.name}</p>}
                  {!resourceFile && editingResourceIndex !== null && event.resources[editingResourceIndex]?.fileName && <p className="mt-2 text-sm text-gray-400">Current file: {event.resources[editingResourceIndex].fileName}</p>}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="submit" disabled={saving || resourceSaving || !resourceDraft.title.trim()} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#d946ef] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e879f9] disabled:cursor-not-allowed disabled:opacity-50">
                  {resourceFile ? <DocumentArrowUpIcon className="h-5 w-5" /> : <LinkIcon className="h-5 w-5" />}
                  {resourceSaving ? "Saving..." : editingResourceIndex === null ? "Add resource" : "Save resource"}
                </button>
                {editingResourceIndex !== null && <button type="button" onClick={resetResourceForm} className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-white/[0.06]">Cancel</button>}
              </div>
            </form>
          </div>
        </section>

        <section className={`${panelClass} mt-5`}>
          <div className="mb-5 flex items-center gap-2">
            <UserGroupIcon className="h-5 w-5 text-[#45d483]" />
            <h2 className="text-xl font-semibold">Traveling team</h2>
          </div>
          <form onSubmit={(formEvent) => { formEvent.preventDefault(); saveEvent(event, "Team contacts saved."); }}>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {(event.travelingTeam || []).map((name) => (
                <div key={name} className="grid gap-3 py-4 sm:grid-cols-[minmax(140px,0.7fr)_1fr_1fr_auto] sm:items-end">
                  <div className="self-center">
                    {editingTravelerName === name ? (
                      <div className="space-y-2">
                        <Field label="Traveler name" value={travelerNameDraft} onChange={setTravelerNameDraft} />
                        <div className="flex gap-2">
                          <button type="button" onClick={() => renameTraveler(name)} disabled={saving || !travelerNameDraft.trim()} className="inline-flex min-h-[40px] items-center justify-center rounded-md bg-[#5fae4b] px-3 text-sm font-semibold text-white hover:bg-[#6abd55] disabled:opacity-50">Save name</button>
                          <button type="button" onClick={() => setEditingTravelerName("")} disabled={saving} className="inline-flex min-h-[40px] items-center justify-center rounded-md border border-white/15 px-3 text-sm font-semibold text-gray-300 hover:bg-white/[0.06]">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{name}</span>
                        <button type="button" onClick={() => { setEditingTravelerName(name); setTravelerNameDraft(name); }} aria-label={`Edit ${name}'s name`} className="inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-400 hover:bg-white/[0.06] hover:text-white">
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <Field label="Mobile phone" type="tel" value={formatPhoneInput(event.teamContacts?.[name]?.phone)} onChange={(value) => updateTeamContact(name, "phone", formatPhoneInput(value))} placeholder="(555) 555-1234" />
                  <Field label="Email" type="email" value={event.teamContacts?.[name]?.email} onChange={(value) => updateTeamContact(name, "email", value)} placeholder="name@switchcommerce.com" />
                  <button type="button" onClick={() => removeTraveler(name)} disabled={saving} aria-label={`Remove ${name} from traveling team`} className="inline-flex h-11 w-11 items-center justify-center rounded-md text-gray-400 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {!(event.travelingTeam || []).length && <p className="py-4 text-sm text-gray-500">No travelers added yet.</p>}
            </div>
            {!!(event.travelingTeam || []).length && (
              <button type="submit" disabled={saving} className="mt-4 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#0951fa] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0a63ff] disabled:opacity-50">
                <CheckCircleIcon className="h-5 w-5" /> {saving ? "Saving..." : "Save team contacts"}
              </button>
            )}
          </form>
          <form onSubmit={addTraveler} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <Field label="Traveler name" value={newTraveler} onChange={setNewTraveler} placeholder="Cathy Smith" />
            </div>
            <button type="submit" disabled={saving || !newTraveler.trim()} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#5fae4b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#6abd55] disabled:opacity-50">
              <PlusIcon className="h-5 w-5" /> Add traveler
            </button>
          </form>
        </section>

        <section className={`${panelClass} mt-5`}>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="h-5 w-5 text-[#7ea6ff]" />
              <h2 className="text-xl font-semibold">Schedule and dress code</h2>
            </div>
            <label className="text-sm font-medium text-gray-300">
              Day to update
              <select value={selectedDayIndex} onChange={(event) => { setSelectedDayIndex(Number(event.target.value)); resetItemForm(); }} className={`${inputClass} min-w-[230px]`}>
                {event.schedule.map((day, index) => <option key={`${day.day}-${index}`} value={index}>{day.day}</option>)}
              </select>
            </label>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Day label" value={selectedDay.day} onChange={(value) => updateSelectedDay("day", value)} />
                <Field label="Date" type="date" value={selectedDay.date} onChange={(value) => updateSelectedDay("date", value)} />
              </div>
              <div className="mt-4">
                <Field label="Dress code" value={selectedDay.dressCode} onChange={(value) => updateSelectedDay("dressCode", value)} placeholder="Booth polo, dark pants, comfortable shoes" />
              </div>
              <button type="button" disabled={saving} onClick={() => saveEvent(event, "Day and dress code saved.")} className="mt-4 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#0951fa]/40 bg-[#0951fa]/15 px-4 py-2 text-sm font-semibold text-[#b8ccff] hover:bg-[#0951fa]/25 disabled:opacity-50">
                <CheckCircleIcon className="h-5 w-5" /> Save day and dress code
              </button>

              <div className="mt-6 space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">Items on this day</h3>
                {selectedDay.items.map((item, index) => (
                  <button key={`${item.time}-${item.title}-${index}`} type="button" onClick={() => beginEditItem(index)} className="flex w-full items-start justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-left transition-colors hover:border-[#7ea6ff]/40 hover:bg-white/[0.06]">
                    <span>
                      <span className="block text-sm font-semibold text-white">{item.time} · {item.title}</span>
                      <span className="mt-1 block text-xs text-gray-400">{item.location}</span>
                    </span>
                    <PencilSquareIcon className="h-5 w-5 shrink-0 text-gray-500" />
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={saveScheduleItem} className="rounded-lg border border-white/10 bg-black/15 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-white">{editingItemIndex === null ? "Add schedule item" : "Edit schedule item"}</h3>
                {editingItemIndex !== null && <button type="button" onClick={resetItemForm} className="text-sm text-gray-400 hover:text-white">Cancel edit</button>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Time" value={scheduleItem.time} onChange={(value) => setScheduleItem((current) => ({ ...current, time: value }))} placeholder="9:00 AM - 10:00 AM" />
                <Field label="Type" value={scheduleItem.type} onChange={(value) => setScheduleItem((current) => ({ ...current, type: value }))} placeholder="Expo, Meeting, Dinner" />
                <div className="sm:col-span-2"><Field label="Title" value={scheduleItem.title} onChange={(value) => setScheduleItem((current) => ({ ...current, title: value }))} /></div>
                <Field label="Location" value={scheduleItem.location} onChange={(value) => setScheduleItem((current) => ({ ...current, location: value }))} />
                <Field label="Owner" value={scheduleItem.owner} onChange={(value) => setScheduleItem((current) => ({ ...current, owner: value }))} />
                <div className="sm:col-span-2"><TextArea label="Notes" value={scheduleItem.notes} onChange={(value) => setScheduleItem((current) => ({ ...current, notes: value }))} /></div>
              </div>
              <button type="submit" disabled={saving || !scheduleItem.title || !scheduleItem.time} className="mt-4 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#5fae4b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#6abd55] disabled:opacity-50">
                {editingItemIndex === null ? <PlusIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                {saving ? "Saving..." : editingItemIndex === null ? "Add to schedule" : "Save schedule item"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
