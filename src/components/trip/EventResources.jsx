import { useState } from "react";
import { ArrowTopRightOnSquareIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { downloadEventResourceFile } from "../../api/eventResources";
import { Card } from "./TripChrome";

// The event's link and document library. Moved here from the More tab so it
// sits on Booth, under the search box and the pinned list — the longer, less
// urgent material below the handful of things that matter right now.

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
      {error && <p role="alert" className="text-[12px] text-[#ef4444]">{error}</p>}
    </div>
  );
}

export default function EventResources({ event }) {
  if (!event.resources?.length) return null;

  return (
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
  );
}
