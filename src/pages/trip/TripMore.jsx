import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  BellAlertIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import PwaControls from "../../components/PwaControls";
import { downloadEventResourceFile } from "../../api/eventResources";
import { isNativeApp } from "../../api/apiBase";
import { Card, Eyebrow, ScreenTitle } from "../../components/trip/TripChrome";
import EmergencyContact from "../../components/trip/EmergencyContact";

// Everything the five primary screens deliberately do not carry. The design
// specifies five tabs answering the questions people open their phone for; this
// holds the rest of the hub's functionality rather than losing it — updates,
// resources, the post-show archive, install/notification controls, and the way
// back out to the wider site on the web.

function ResourceAction({ eventId, resource }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (resource.url) {
    return (
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-[44px] items-center gap-2 text-[13px] font-semibold text-[#0951fa]"
      >
        Open <ArrowTopRightOnSquareIcon className="h-4 w-4" />
      </a>
    );
  }
  if (!resource.fileName && !resource.storedFileName) return null;

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await downloadEventResourceFile(eventId, resource);
          } catch (downloadError) {
            setError(downloadError.message || "Could not download that file.");
          } finally {
            setBusy(false);
          }
        }}
        className="inline-flex min-h-[44px] items-center gap-2 text-[13px] font-semibold text-[#0951fa] disabled:opacity-60"
      >
        {busy ? "Downloading…" : "Download"}
      </button>
      {error && <p className="text-[12px] text-[#ef4444]">{error}</p>}
    </div>
  );
}

export default function TripMore() {
  const { event, isAdmin, user } = useOutletContext();
  const updates = useMemo(() => event.latestUpdates || [], [event]);
  const readStateKey = `scc:event-updates-read:${event.id}`;
  const [readIds, setReadIds] = useState([]);

  // Same per-event read tracking the hub used, same storage key — so anything
  // already marked read stays read.
  useEffect(() => {
    try {
      setReadIds(JSON.parse(localStorage.getItem(readStateKey) || "[]"));
    } catch {
      setReadIds([]);
    }
  }, [readStateKey]);

  const persist = (ids) => {
    const unique = [...new Set(ids)];
    setReadIds(unique);
    try {
      localStorage.setItem(readStateKey, JSON.stringify(unique));
    } catch { /* storage unavailable; the list still works this session */ }
  };

  const unreadCount = updates.filter((update) => !readIds.includes(update.id)).length;

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>{event.shortName} {event.year}</Eyebrow>
        <ScreenTitle className="mt-2">More</ScreenTitle>
      </div>

      {updates.length > 0 && (
        <section>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="flex items-center gap-2 text-[15px] font-bold text-white">
              <BellAlertIcon className="h-4 w-4 text-[#ff4f00]" /> Latest updates
            </h2>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => persist(updates.map((update) => update.id))}
                className="min-h-[44px] text-[12px] font-semibold text-[#0951fa]"
              >
                Mark all read
              </button>
            ) : (
              <span className="text-[12px] text-[#75808d]">All read</span>
            )}
          </div>
          <div className="space-y-2">
            {updates.map((update) => {
              const isRead = readIds.includes(update.id);
              return (
                <Card key={update.id} className={`p-3.5 ${isRead ? "opacity-70" : ""}`}>
                  <div className="flex items-center gap-2">
                    <span className="rounded-[5px] border border-white/15 bg-white/[0.06] px-2 py-1 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#93a0b4]">
                      {update.severity || "Normal"}
                    </span>
                    <span className="text-[12px] text-[#75808d]">{update.date}</span>
                  </div>
                  <h3 className="mt-2 text-[14.5px] font-semibold leading-[1.3] text-white">{update.title}</h3>
                  {update.body && (
                    <p className="mt-1 text-[13px] leading-[1.5] text-[#93a0b4]">{update.body}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => persist(isRead ? readIds.filter((id) => id !== update.id) : [...readIds, update.id])}
                    className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 text-[12px] font-semibold text-[#0951fa]"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    {isRead ? "Mark unread" : "Mark read"}
                  </button>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {event.resources?.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-white">
            <ClipboardDocumentIcon className="h-4 w-4 text-[#ff4f00]" /> Resources
          </h2>
          <div className="space-y-2">
            {event.resources.map((resource) => (
              <Card key={resource.id || resource.title} className="p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[14.5px] font-semibold leading-[1.3] text-white">{resource.title}</h3>
                  {resource.type && (
                    <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-[#93a0b4]">
                      {resource.type}
                    </span>
                  )}
                </div>
                {resource.description && (
                  <p className="mt-1 text-[13px] leading-[1.5] text-[#93a0b4]">{resource.description}</p>
                )}
                <ResourceAction eventId={event.id} resource={resource} />
              </Card>
            ))}
          </div>
        </section>
      )}

      {event.recap?.notes && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-white">
            <CheckCircleIcon className="h-4 w-4 text-[#10b981]" /> Post-show archive
          </h2>
          <Card className="p-3.5">
            <p className="text-[13px] leading-[1.6] text-[#93a0b4]">{event.recap.notes}</p>
          </Card>
        </section>
      )}

      <EmergencyContact user={user} />

      <section>
        <Eyebrow>This device</Eyebrow>
        <Card className="mt-3 p-3.5">
          <PwaControls eventId={event.id} />
        </Card>
      </section>

      <section className="space-y-2">
        {isAdmin && (
          <Link
            to={`/admin/events/${event.id}`}
            className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-4 text-[14px] font-semibold text-white"
          >
            <PencilSquareIcon className="h-5 w-5 text-[#0951fa]" /> Manage event
          </Link>
        )}
        {/* On the web there is a wider site to go back to. In the app there is
            not, so this is omitted there. */}
        {!isNativeApp() && (
          <Link
            to="/events"
            className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-white/10 px-4 text-[14px] font-semibold text-[#93a0b4]"
          >
            <ArrowLeftIcon className="h-5 w-5" /> All trade shows
          </Link>
        )}
      </section>
    </div>
  );
}
