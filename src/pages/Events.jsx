import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowTopRightOnSquareIcon,
  Bars3Icon,
  BellAlertIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  ClipboardDocumentIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PencilSquareIcon,
  PhoneIcon,
  QueueListIcon,
  ReceiptPercentIcon,
  UserGroupIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { tradeShows } from "../data/tradeShows";
import { listTradeShows, lookupFlight, updateMyTravel } from "../api/tradeShows";
import { useAuth } from "../contexts/AuthContext";
import { formatPhoneNumber, phoneLinkValue } from "../utils/phone";
import EventExpenses from "../components/EventExpenses";
import PwaControls from "../components/PwaControls";
import { downloadEventResourceFile } from "../api/eventResources";

const levelStyles = {
  Urgent: "border-[#ef4444]/50 bg-[#ef4444]/15 text-white",
  Important: "border-[#ff4f00]/50 bg-[#ff4f00]/15 text-white",
  Normal: "border-[#0951fa]/50 bg-[#0951fa]/15 text-white",
};

const sectionClass = "rounded-lg border border-white/10 bg-gray-900/45 p-5 shadow-xl shadow-black/10";
const collapsibleSectionClass = "overflow-hidden rounded-lg border border-white/10 bg-gray-900/45 shadow-xl shadow-black/10";

const eventMenuItems = [
  {
    id: "updates",
    label: "Updates",
    detail: "Latest news",
    icon: BellAlertIcon,
    color: "border-[#ff4f00]/45 bg-[#ff4f00]/15 text-[#e8e7e7] hover:border-[#ff4f00] hover:bg-[#ff4f00]/25",
  },
  {
    id: "schedule",
    label: "Schedule",
    detail: "Times & dress code",
    icon: CalendarDaysIcon,
    color: "border-[#0951fa]/45 bg-[#0951fa]/15 text-[#e8e7e7] hover:border-[#0951fa] hover:bg-[#0951fa]/25",
  },
  {
    id: "hotel",
    label: "Hotel",
    detail: "Stay & maps",
    icon: BuildingOffice2Icon,
    color: "border-[#10b981]/45 bg-[#10b981]/15 text-[#e8e7e7] hover:border-[#10b981] hover:bg-[#10b981]/25",
  },
  {
    id: "travel",
    label: "Travel",
    detail: "Team arrivals",
    icon: PaperAirplaneIcon,
    color: "border-[#002b5e] bg-[#002b5e]/55 text-[#e8e7e7] hover:border-[#0951fa] hover:bg-[#002b5e]/80",
  },
  {
    id: "expenses",
    label: "Expenses",
    detail: "Receipts & report",
    icon: ReceiptPercentIcon,
    color: "border-[#f59e0b]/45 bg-[#f59e0b]/15 text-[#e8e7e7] hover:border-[#f59e0b] hover:bg-[#f59e0b]/25",
  },
  {
    id: "resources",
    label: "Resources",
    detail: "Links & talking points",
    icon: ClipboardDocumentIcon,
    color: "border-[#75808d]/60 bg-[#75808d]/20 text-[#e8e7e7] hover:border-[#c2c2c2] hover:bg-[#75808d]/30",
  },
  {
    id: "archive",
    label: "Archive",
    detail: "Post-show recap",
    icon: CheckCircleIcon,
    color: "border-white/15 bg-white/[0.05] text-gray-200 hover:border-white/35 hover:bg-white/10",
  },
];

const mapMenuItem = {
  id: "map",
  label: "Map",
  detail: "Hotel to booth 312",
  icon: MapPinIcon,
  color: "border-[#ff4f00]/45 bg-[#ff4f00]/15 text-[#e8e7e7] hover:border-[#ff4f00] hover:bg-[#ff4f00]/25",
};

function EventStatusBadge({ status }) {
  const label = status === "current" ? "Current" : status === "past" ? "Past" : "Upcoming";
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">
      {label}
    </span>
  );
}

function EmptyValue({ children = "TBD" }) {
  return <span className="text-gray-500">{children}</span>;
}

function ExternalLink({ href, children }) {
  if (!href) return <EmptyValue>Add link</EmptyValue>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-[#e8e7e7] hover:text-[#0951fa] transition-colors"
    >
      {children}
      <ArrowTopRightOnSquareIcon className="h-4 w-4" />
    </a>
  );
}

function ResourceAction({ eventId, resource }) {
  const [error, setError] = useState("");
  if (!resource.fileId) return <ExternalLink href={resource.url}>Open resource</ExternalLink>;

  const download = async () => {
    setError("");
    try {
      await downloadEventResourceFile(eventId, resource);
    } catch (err) {
      setError(err.message || "Unable to download file.");
    }
  };

  return (
    <div>
      <button type="button" onClick={download} className="inline-flex min-h-[40px] items-center gap-1.5 text-[#e8e7e7] transition-colors hover:text-[#0951fa]">
        Download file
        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
      </button>
      {error && <p role="alert" className="mt-1 text-xs text-[#ef4444]">{error}</p>}
    </div>
  );
}

function EventsIndex({ events }) {
  const upcoming = events.filter((event) => event.status !== "past");
  const past = events.filter((event) => event.status === "past");

  return (
    <main className="flex-1 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ff4f00]">Event operations</p>
            <h1 className="font-switch-bold mt-2 text-3xl sm:text-5xl tracking-wide">Trade Show Hub</h1>
            <p className="mt-3 max-w-2xl text-gray-300">
              A reusable home for schedules, hotels, dress code, resources, maps, team travel, and post-show history.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-gray-300">
            Managed by <span className="font-semibold text-white">Vic</span> and <span className="font-semibold text-white">Trip</span>
          </div>
        </div>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-[#0951fa]" />
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="group block rounded-lg border border-white/10 bg-gray-900/55 p-5 shadow-xl shadow-black/10 transition-all hover:-translate-y-0.5 hover:border-[#0951fa]/60 hover:bg-gray-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <EventStatusBadge status={event.status} />
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">{event.year}</span>
                    </div>
                    <h3 className="mt-4 text-2xl font-bold text-white">{event.name}</h3>
                    <p className="mt-1 text-sm text-gray-400">{event.audience}</p>
                  </div>
                  <div className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white">{event.shortName}</div>
                </div>
                <div className="mt-5 grid gap-3 text-sm text-gray-300 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="h-4 w-4 text-[#0951fa]" />
                    {event.dates}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-[#ff4f00]" />
                    {event.city}
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                  <span className="text-gray-400">{event.venue}</span>
                  <span className="font-semibold text-[#0951fa] group-hover:text-white">Open event</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <div className="flex items-center gap-2">
            <QueueListIcon className="h-5 w-5 text-[#ff4f00]" />
            <h2 className="text-xl font-semibold">Past Event Archive</h2>
          </div>
          <p className="mt-3 text-sm text-gray-300">
            Once events wrap, they can stay here with the final schedule, resource links, booth notes, lead process, and recap.
          </p>
          {past.length === 0 && (
            <div className="mt-4 rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm text-gray-400">
              No archived trade shows yet.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function EventAppMenu({ event, isAdmin }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuItems = [
    { id: "today", label: "Today", detail: "Next up and latest changes", icon: ClockIcon },
    ...eventMenuItems.filter((item) => item.id !== "archive"),
  ];
  if (event.floorMap) menuItems.splice(menuItems.findIndex((item) => item.id === "hotel") + 1, 0, mapMenuItem);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? "Close event menu" : "Open event menu"}
        aria-expanded={isOpen}
        aria-controls="event-app-menu"
        title="Event menu"
        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-md border border-white/15 bg-white/[0.06] px-3 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#0951fa]"
      >
        {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        <span className="hidden sm:inline">Event menu</span>
      </button>

      {isOpen && (
        <>
          <button type="button" aria-label="Close event menu" onClick={() => setIsOpen(false)} className="fixed inset-0 z-30 cursor-default bg-black/30" />
          <nav id="event-app-menu" aria-label="Event sections" className="absolute right-0 z-40 mt-2 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-md border border-white/15 bg-[#111827] p-2 shadow-2xl shadow-black/50">
            <div className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">{event.shortName} event menu</div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const label = item.id === "travel" ? "Team" : item.label;
              const detail = item.id === "travel" ? "People, contact and flights" : item.detail;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => {
                    setIsOpen(false);
                    window.dispatchEvent(new CustomEvent("event-section:open", { detail: item.id }));
                  }}
                  className="flex min-h-[52px] items-center gap-3 rounded-md px-3 py-2 text-left text-white transition-colors hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#0951fa]"
                >
                  <Icon className="h-5 w-5 shrink-0 text-[#00ace8]" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="block text-xs leading-4 text-gray-400">{detail}</span>
                  </span>
                </a>
              );
            })}
            {isAdmin && (
              <Link to={`/admin/events/${event.id}`} onClick={() => setIsOpen(false)} className="mt-1 flex min-h-[52px] items-center gap-3 border-t border-white/10 px-3 pt-3 text-sm font-semibold text-white hover:text-[#00ace8]">
                <PencilSquareIcon className="h-5 w-5" /> Manage event
              </Link>
            )}
            <div className="mt-2 border-t border-white/10 px-3 py-3">
              <PwaControls eventId={event.id} />
            </div>
          </nav>
        </>
      )}
    </div>
  );
}

function CollapsibleSection({ id, title, icon: Icon, iconClassName, meta, aliases = [], children }) {
  const matchesHash = () => [id, ...aliases].includes(window.location.hash.replace("#", ""));
  const [isOpen, setIsOpen] = useState(matchesHash);

  useEffect(() => {
    const openFromHash = () => {
      if (!matchesHash()) return;
      setIsOpen(true);
      window.requestAnimationFrame(() => document.getElementById(window.location.hash.replace("#", ""))?.scrollIntoView());
    };
    const openFromMenu = (event) => {
      if (![id, ...aliases].includes(event.detail)) return;
      setIsOpen(true);
    };
    window.addEventListener("hashchange", openFromHash);
    window.addEventListener("event-section:open", openFromMenu);
    openFromHash();
    return () => {
      window.removeEventListener("hashchange", openFromHash);
      window.removeEventListener("event-section:open", openFromMenu);
    };
  }, [id, aliases.join("|")]);

  return (
    <section id={id} className={`${collapsibleSectionClass} scroll-mt-24`}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls={`${id}-content`}
        className="flex min-h-[64px] w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0951fa]"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Icon className={`h-5 w-5 shrink-0 ${iconClassName}`} />
          <span className="text-xl font-semibold text-white">{title}</span>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          {meta && <span className="hidden text-xs text-gray-500 sm:inline">{meta}</span>}
          <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </span>
      </button>
      {isOpen && <div id={`${id}-content`} className="border-t border-white/10 p-5">{children}</div>}
    </section>
  );
}

function todayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function scheduleStartMinutes(time) {
  if (!time || time === "TBD") return null;
  if (time.toLowerCase().includes("all day")) return 0;
  const match = time.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!match) return null;
  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hours += 12;
  return hours * 60 + Number(match[2] || 0);
}

function TodayDashboard({ event }) {
  const today = todayISO();
  const datedDays = event.schedule.filter((day) => day.date).sort((a, b) => a.date.localeCompare(b.date));
  const relevantDay = datedDays.find((day) => day.date >= today) || datedDays[datedDays.length - 1] || event.schedule[0];
  const isToday = relevantDay?.date === today;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const nextItem = isToday
    ? relevantDay?.items?.find((item) => {
        const start = scheduleStartMinutes(item.time);
        return start === null || start >= currentMinutes;
      }) || relevantDay?.items?.[relevantDay.items.length - 1]
    : relevantDay?.items?.[0];
  const featuredUpdate = event.latestUpdates[0];
  const urgentUpdate = featuredUpdate?.level === "Urgent" ? featuredUpdate : null;

  const quickLinks = [
    { href: "#schedule", label: "Schedule", icon: CalendarDaysIcon, color: "bg-[#f59e0b] text-[#002b5e] hover:opacity-90" },
    { href: event.floorMap ? "#map" : "#hotel", label: event.floorMap ? "Hotel & Map" : "Hotel", icon: BuildingOffice2Icon, color: "bg-[#0951fa] text-white hover:opacity-90" },
    { href: "#travel", label: "Travel", icon: PaperAirplaneIcon, color: "bg-[#10b981] text-[#002b5e] hover:opacity-90" },
    { href: "#resources", label: "Resources", icon: ClipboardDocumentIcon, color: "bg-[#ff4f00] text-[#002b5e] hover:opacity-90" },
  ];

  return (
    <section id="today" className="mb-5 scroll-mt-24 overflow-hidden rounded-lg border border-white/80 bg-white text-gray-950 shadow-2xl shadow-black/25">
      <div className="border-b border-gray-200 px-4 py-4 sm:px-5">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#0951fa]">
            <ClockIcon className="h-5 w-5" />
            {isToday ? "Today" : "Next up"}
          </div>
          <p className="mt-1 text-sm text-gray-600">The essentials teammates need before they move.</p>
        </div>
      </div>

      {urgentUpdate && (
        <div role="alert" className="flex gap-3 border-b border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-[#002b5e] sm:px-5">
          <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.12em]">Urgent update</div>
            <div className="mt-1 font-semibold text-[#002b5e]">{urgentUpdate.title}</div>
            <p className="mt-1 text-sm leading-5 text-[#002b5e]">{urgentUpdate.body}</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <div className="border-b border-gray-200 p-4 sm:p-5 lg:border-b-0 lg:border-r">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{relevantDay?.day || "Schedule"}</div>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-bold text-[#0951fa]">{nextItem?.time || "Time TBD"}</div>
              <h2 className="mt-1 text-2xl font-bold text-gray-950">{nextItem?.title || "Schedule coming soon"}</h2>
              {nextItem && <p className="mt-2 text-sm text-gray-600">{nextItem.location} · {nextItem.owner}</p>}
            </div>
            <div className="rounded-lg border border-[#f59e0b]/35 bg-[#f59e0b]/10 px-4 py-3 sm:max-w-[250px]">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#002b5e]">Dress code</div>
              <div className="mt-1 font-semibold text-gray-950">{relevantDay?.dressCode || "TBD"}</div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Latest update</div>
          {featuredUpdate ? (
            <>
              <div className="mt-2 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${featuredUpdate.level === "Urgent" ? "bg-[#ef4444]/15 text-[#002b5e]" : "bg-gray-100 text-gray-700"}`}>
                  {featuredUpdate.level}
                </span>
                <span className="text-xs text-gray-500">{featuredUpdate.date}</span>
              </div>
              <h3 className="mt-2 font-semibold text-gray-950">{featuredUpdate.title}</h3>
              <p className="mt-1 text-sm leading-5 text-gray-600">{featuredUpdate.body}</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-gray-600">No updates published yet.</p>
          )}
        </div>
      </div>

      <nav aria-label="Today quick links" className="grid grid-cols-2 gap-2 border-t border-gray-200 bg-gray-100 p-2 sm:grid-cols-4">
        {quickLinks.map(({ href, label, icon: Icon, color }) => (
          <a key={href} href={href} className={`flex min-h-[56px] items-center justify-center gap-2 rounded-md px-3 py-3 text-sm font-bold shadow-sm transition-colors ${color}`}>
            <Icon className="h-5 w-5" />
            {label}
          </a>
        ))}
      </nav>
    </section>
  );
}

function MapCanvas({ map, expanded = false }) {
  const markerRadius = map.markerRadius || 18;

  return (
    <span className={expanded ? "relative block min-w-[820px] max-w-[1400px] overflow-hidden rounded-lg bg-white" : "relative block overflow-hidden rounded-lg bg-white"}>
      <img src={map.src} alt={map.alt} className="block h-auto w-full" />
      <svg
        viewBox={map.viewBox}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path d={map.routePath} className="event-route-shadow" pathLength="100" style={{ strokeWidth: (map.routeWidth || 11) * 1.7 }} />
        <path d={map.routePath} className="event-route-dots" pathLength="100" style={{ strokeWidth: map.routeWidth || 11 }} />
        <circle cx={map.start.x} cy={map.start.y} r={markerRadius} className="event-route-start" />
        <circle cx={map.destination.x} cy={map.destination.y} r={markerRadius * 1.35} className="event-route-destination-pulse" />
        <circle cx={map.destination.x} cy={map.destination.y} r={markerRadius * 0.75} className="event-route-destination" />
        {map.boothMarker && (
          <g>
            <rect
              x={map.boothMarker.x}
              y={map.boothMarker.y}
              width={map.boothMarker.width}
              height={map.boothMarker.height}
              fill="rgba(10, 18, 30, 0.62)"
            />
            <rect
              x={map.boothMarker.x}
              y={map.boothMarker.y}
              width={map.boothMarker.width}
              height={map.boothMarker.height}
              className="event-route-shadow"
              pathLength="100"
              style={{ strokeWidth: (map.routeWidth || 11) * 1.7 }}
            />
            <rect
              x={map.boothMarker.x}
              y={map.boothMarker.y}
              width={map.boothMarker.width}
              height={map.boothMarker.height}
              className="event-route-dots"
              pathLength="100"
              style={{ strokeWidth: map.routeWidth || 11 }}
            />
            <text x={map.boothMarker.labelX} y={map.boothMarker.y + 31} textAnchor="middle" fill="#ffffff" fontSize="23" fontWeight="800">SC</text>
            <text x={map.boothMarker.labelX} y={map.boothMarker.y + 64} textAnchor="middle" fill="#ff6a1a" fontSize="23" fontWeight="800">312</text>
            <text x={map.boothMarker.labelX} y={map.boothMarker.y + 98} textAnchor="middle" fill="#ffffff" fontSize="23" fontWeight="800">CC</text>
          </g>
        )}
      </svg>
    </span>
  );
}

function EventMap({ map }) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isExpanded) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsExpanded(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  return (
    <>
      <div id={map.id} className="scroll-mt-24 border-t border-white/10 pt-5">
        <div className="mb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-[#ff8a4d]" />
              <h3 className="text-lg font-semibold">{map.title}</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white/35 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#7ea6ff]"
            >
              <ArrowsPointingOutIcon className="h-5 w-5" />
              Expand map
            </button>
          </div>
          <p className="mt-3 w-full text-sm leading-6 text-gray-300">{map.description}</p>
        </div>

        <div className="mb-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-gray-300">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-white bg-[#0951fa]" />
            Start: {map.startLabel}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-white bg-[#ff4f00]" />
            Destination: {map.destinationLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          aria-label={`Expand map: ${map.title}`}
          className="block w-full cursor-zoom-in rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-[#7ea6ff] focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          <MapCanvas map={map} />
        </button>
        <p className="mt-3 text-xs leading-5 text-gray-500">{map.note}</p>
      </div>

      {isExpanded && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Expanded map: ${map.title}`}
          onClick={() => setIsExpanded(false)}
          className="fixed inset-0 z-[100] flex flex-col bg-gray-950/95 p-3 sm:p-5"
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">{map.title}</h2>
              <p className="text-xs text-gray-400">Scroll the map to inspect the route.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              aria-label="Close expanded map"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-[#7ea6ff]"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto rounded-lg">
            <div className="w-fit" onClick={(event) => event.stopPropagation()}>
              <MapCanvas map={map} expanded />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function LatestUpdates({ updates, eventId, user }) {
  const readStateKey = `scc:trade-show-update-reads:${user?.email || "local"}:${eventId}`;
  const [readUpdateIds, setReadUpdateIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(readStateKey) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      setReadUpdateIds(JSON.parse(localStorage.getItem(readStateKey) || "[]"));
    } catch {
      setReadUpdateIds([]);
    }
  }, [readStateKey]);

  const saveReadState = (nextIds) => {
    const uniqueIds = [...new Set(nextIds)];
    setReadUpdateIds(uniqueIds);
    try {
      localStorage.setItem(readStateKey, JSON.stringify(uniqueIds));
    } catch {}
  };

  const unreadCount = updates.filter((update) => !readUpdateIds.includes(update.id)).length;
  const toggleRead = (updateId) => {
    saveReadState(readUpdateIds.includes(updateId)
      ? readUpdateIds.filter((id) => id !== updateId)
      : [...readUpdateIds, updateId]);
  };

  return (
    <CollapsibleSection id="updates" title="Latest Updates" icon={BellAlertIcon} iconClassName="text-[#ff4f00]" meta={unreadCount ? `${unreadCount} unread` : "All read"}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-400">Read status is personal to you.</p>
        {unreadCount > 0 && (
          <button type="button" onClick={() => saveReadState(updates.map((update) => update.id))} className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-md border border-white/15 px-3 text-sm font-semibold text-gray-200 hover:bg-white/[0.06]">
            <CheckCircleIcon className="h-4 w-4" /> Mark all as read
          </button>
        )}
      </div>
      <div className="space-y-3">
        {updates.map((update) => {
          const isRead = readUpdateIds.includes(update.id);
          return (
            <article key={update.id} role={update.level === "Urgent" ? "alert" : undefined} className={`rounded-lg border p-4 transition-opacity ${levelStyles[update.level] || levelStyles.Normal} ${isRead ? "opacity-70" : "ring-1 ring-inset ring-white/25"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em]">
                  {!isRead && <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-gray-950">Unread</span>}
                  <span>{update.level}</span>
                  <span className="text-white/35">/</span>
                  <span>{update.date}</span>
                  <span className="text-white/35">/</span>
                  <span>{update.author}</span>
                </div>
                <button type="button" onClick={() => toggleRead(update.id)} aria-label={`Mark ${update.title} as ${isRead ? "unread" : "read"}`} className="inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-md border border-white/15 bg-black/10 px-3 text-xs font-semibold text-white hover:bg-white/10">
                  <CheckCircleIcon className="h-4 w-4" /> {isRead ? "Mark unread" : "Mark read"}
                </button>
              </div>
              <h3 className="mt-2 text-lg font-semibold text-white">{update.title}</h3>
              <p className="mt-1 text-sm leading-6 text-white/80">{update.body}</p>
              {update.smsCopy && (
                <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/55">
                    <ClipboardDocumentIcon className="h-4 w-4" />
                    SMS copy
                  </div>
                  <p className="text-sm text-white/80">{update.smsCopy}</p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}

const emptyFlightLeg = { airline: "", flightNumber: "", airport: "", date: "", time: "" };
const emptyTravelForm = {
  person: "",
  arrivalFlight: { ...emptyFlightLeg },
  departureFlight: { ...emptyFlightLeg },
  notes: "",
};

function travelFormFor(existingTravel) {
  if (!existingTravel) return emptyTravelForm;
  return {
    person: existingTravel.person || "",
    arrivalFlight: { ...emptyFlightLeg, ...existingTravel.arrivalFlight },
    departureFlight: { ...emptyFlightLeg, ...existingTravel.departureFlight },
    notes: existingTravel.notes || "",
  };
}

function formatFlightDate(date) {
  if (!date) return "Date not added";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function formatFlightTime(time) {
  if (!time) return "Time not added";
  const [hour, minute] = time.split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" })
    .format(new Date(2000, 0, 1, hour, minute));
}

function FlightSummary({ leg, legacyText, direction }) {
  const hasStructuredFlight = leg && Object.values(leg).some(Boolean);
  if (!hasStructuredFlight) return <span>{legacyText || "Not added"}</span>;

  const flight = [leg.airline, leg.flightNumber].filter(Boolean).join(" ");
  const route = leg.airport
    ? direction === "arrival" ? `${leg.airport.toUpperCase()} to LAS` : `LAS to ${leg.airport.toUpperCase()}`
    : "Airport not added";

  return (
    <div className="space-y-0.5">
      <p className="font-semibold text-white">{formatFlightDate(leg.date)} at {formatFlightTime(leg.time)}</p>
      <p>{route}{flight ? ` · ${flight}` : ""}</p>
    </div>
  );
}

function FlightLegFields({ title, description, airportLabel, leg, onChange, inputClass, direction, eventAirport }) {
  const updateLeg = (key, value) => onChange({ ...leg, [key]: value });
  const [flightNumber, setFlightNumber] = useState(leg.flightNumber || "");
  const [flightDate, setFlightDate] = useState(leg.date || "");
  const [results, setResults] = useState([]);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupMessage, setLookupMessage] = useState("");
  const [lookupError, setLookupError] = useState("");

  useEffect(() => {
    setFlightNumber(leg.flightNumber || "");
    setFlightDate(leg.date || "");
  }, [leg.flightNumber, leg.date]);

  const useFlight = (flight) => {
    const eventMovement = direction === "arrival" ? flight.arrival : flight.departure;
    const otherAirport = direction === "arrival" ? flight.departure : flight.arrival;
    onChange({
      airline: flight.airline,
      flightNumber: flight.flightNumber,
      airport: otherAirport.iata,
      date: eventMovement.date,
      time: eventMovement.time,
    });
    setResults([]);
    setLookupError("");
    setLookupMessage(`${flight.flightNumber} was added. Confirm the details below before saving.`);
  };

  const findFlight = async () => {
    setLookingUp(true);
    setLookupMessage("");
    setLookupError("");
    setResults([]);
    try {
      const lookup = await lookupFlight({
        flightNumber,
        date: flightDate,
        direction,
        eventAirport,
      });
      if (!lookup.flights.length) {
        setLookupError("No matching flight was found. Check the number and date, or enter it manually.");
      } else if (lookup.flights.length === 1) {
        useFlight(lookup.flights[0]);
      } else {
        setResults(lookup.flights);
        setLookupMessage("Choose the itinerary that matches your reservation.");
      }
    } catch (error) {
      setLookupError(error.message || "Could not look up that flight.");
    } finally {
      setLookingUp(false);
    }
  };

  return (
    <fieldset className="border-t border-white/10 pt-4">
      <legend className="flex items-center gap-2 pr-3 text-base font-semibold text-white">
        <PaperAirplaneIcon className="h-5 w-5 text-[#0951fa]" />
        {title}
      </legend>
      <p className="mt-1 text-sm text-gray-400">{description}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
        <label className="text-sm font-semibold text-gray-300">
          Flight number
          <input
            value={flightNumber}
            onChange={(e) => {
              const value = e.target.value.toUpperCase();
              setFlightNumber(value);
              updateLeg("flightNumber", value);
            }}
            className={inputClass}
            autoCapitalize="characters"
            placeholder="AA 1234"
          />
        </label>
        <label className="block text-sm font-semibold text-gray-300">
          Flight date
          <span className="relative mt-1 block min-h-[44px]">
            <input
              type="date"
              value={flightDate}
              onChange={(e) => {
                setFlightDate(e.target.value);
                updateLeg("date", e.target.value);
              }}
              className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              aria-label={`${title} flight date`}
            />
            <span className="flex min-h-[44px] items-center justify-between gap-3 rounded-md border border-white/15 bg-gray-950/70 px-3 py-2 text-sm text-white peer-focus:border-[#0951fa] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0951fa]/40">
              <span>{flightDate ? formatFlightDate(flightDate) : "Choose date"}</span>
              <CalendarDaysIcon className="h-5 w-5 shrink-0 text-[#0951fa]" />
            </span>
          </span>
        </label>
        <button
          type="button"
          onClick={findFlight}
          disabled={lookingUp || !flightNumber.trim() || !flightDate}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-[#0951fa] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
          {lookingUp ? "Finding..." : "Find flight"}
        </button>
      </div>

      {lookupMessage && <p role="status" className="mt-3 text-sm font-semibold text-[#10b981]">{lookupMessage}</p>}
      {lookupError && <p role="alert" className="mt-3 text-sm font-semibold text-[#f59e0b]">{lookupError}</p>}

      {!!results.length && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {results.map((flight) => (
            <button
              key={flight.id}
              type="button"
              onClick={() => useFlight(flight)}
              className="rounded-md border border-white/15 bg-white/[0.04] p-3 text-left hover:border-[#0951fa] hover:bg-[#0951fa]/10 focus:outline-none focus:ring-2 focus:ring-[#0951fa]"
            >
              <span className="block font-semibold text-white">{flight.flightNumber} · {flight.airline}</span>
              <span className="mt-1 block text-sm text-gray-300">
                {flight.departure.iata} {formatFlightTime(flight.departure.time)} to {flight.arrival.iata} {formatFlightTime(flight.arrival.time)}
              </span>
            </button>
          ))}
        </div>
      )}

      {leg.flightNumber && (leg.airline || leg.airport || leg.time) && (
        <div className="mt-3 rounded-md border border-[#10b981]/35 bg-[#10b981]/10 p-3 text-sm">
          <p className="font-semibold text-white">{leg.airline} · {leg.flightNumber}</p>
          <p className="mt-1 text-gray-300">{airportLabel}: {leg.airport || "Not available"} · {formatFlightDate(leg.date)} at {formatFlightTime(leg.time)}</p>
        </div>
      )}

      <details className="mt-3 rounded-md border border-white/10 bg-black/10 px-3">
        <summary className="cursor-pointer py-3 text-sm font-semibold text-gray-300">Enter or correct details manually</summary>
        <div className="grid gap-3 border-t border-white/10 pb-3 pt-3 sm:grid-cols-3">
          <label className="text-sm font-semibold text-gray-300">
            Airline
            <input value={leg.airline} onChange={(e) => updateLeg("airline", e.target.value)} className={inputClass} placeholder="American Airlines" />
          </label>
          <label className="text-sm font-semibold text-gray-300">
            {airportLabel}
            <input value={leg.airport} onChange={(e) => updateLeg("airport", e.target.value.toUpperCase())} className={inputClass} maxLength={3} autoCapitalize="characters" placeholder="DFW" />
          </label>
          <label className="text-sm font-semibold text-gray-300">
            Local time
            <input type="time" value={leg.time} onChange={(e) => updateLeg("time", e.target.value)} className={inputClass} />
          </label>
        </div>
      </details>
    </fieldset>
  );
}

function TravelSection({ event, user }) {
  const travelingTeam = event.travelingTeam || [];
  const travelEntries = event.travel || [];
  const teamContacts = event.teamContacts || {};
  const existingTravel = travelEntries.find((item) => item.email === user?.email);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(emptyTravelForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(travelFormFor(existingTravel));
  }, [event.id, existingTravel]);

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const hasDetails = [
    ...Object.values(form.arrivalFlight || {}),
    ...Object.values(form.departureFlight || {}),
    form.notes,
  ].some((value) => (value || "").trim());
  const canSave = (form.person || "").trim() && hasDetails;

  const saveTravel = async (submitEvent) => {
    submitEvent.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await updateMyTravel(event.id, form, user);
      setMessage("Your flight information has been saved.");
      setIsEditing(false);
    } catch (saveError) {
      setError(saveError.message || "Could not save your flight information.");
    } finally {
      setSaving(false);
    }
  };

  const removeTravel = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await updateMyTravel(event.id, { remove: true }, user);
      setForm(emptyTravelForm);
      setMessage("Your flight information has been removed.");
      setIsEditing(false);
    } catch (removeError) {
      setError(removeError.message || "Could not remove your flight information.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "mt-1 min-h-[44px] w-full rounded-md border border-white/15 bg-gray-950/70 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[#0951fa] focus:outline-none focus:ring-2 focus:ring-[#0951fa]/40";

  return (
    <CollapsibleSection id="travel" title="Team" icon={UserGroupIcon} iconClassName="text-[#10b981]" meta={`${travelingTeam.length} traveling`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-300">Everyone attending the event, with their contact and travel details.</p>
        <button
          type="button"
          onClick={() => {
            setIsEditing((current) => !current);
            setMessage("");
            setError("");
          }}
          aria-expanded={isEditing}
          disabled={!travelingTeam.length}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-[#0951fa] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#0951fa] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PencilSquareIcon className="h-5 w-5" />
          {existingTravel ? "Edit my flight info" : "Add my flight info"}
        </button>
      </div>

      {!travelingTeam.length && <p className="mb-4 text-sm text-[#f59e0b]">An event manager needs to add the traveling team before flight information can be submitted.</p>}

      {isEditing && (
        <form onSubmit={saveTravel} className="mb-5 border-y border-white/10 py-4">
          <p className="mb-4 text-sm text-gray-300">Sharing is optional. Dates use a calendar picker, and all times should be entered in the local time shown on the flight itinerary.</p>
          <div className="space-y-5">
            <label className="block max-w-md text-sm font-semibold text-gray-300">
              Your name
              <select value={form.person || ""} onChange={(e) => updateField("person", e.target.value)} className={inputClass} required>
                <option value="">Select your name</option>
                {travelingTeam.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <FlightLegFields
              title="Arrival flight"
              description="The flight bringing you to Las Vegas."
              airportLabel="Flying from"
              leg={form.arrivalFlight}
              onChange={(value) => updateField("arrivalFlight", value)}
              inputClass={inputClass}
              direction="arrival"
              eventAirport={event.airportCode || "LAS"}
            />
            <FlightLegFields
              title="Departure flight"
              description="The flight taking you home from Las Vegas."
              airportLabel="Flying to"
              leg={form.departureFlight}
              onChange={(value) => updateField("departureFlight", value)}
              inputClass={inputClass}
              direction="departure"
              eventAirport={event.airportCode || "LAS"}
            />
            <label className="block max-w-2xl text-sm font-semibold text-gray-300">
              Notes
              <input value={form.notes} onChange={(e) => updateField("notes", e.target.value)} className={inputClass} placeholder="Connecting through Dallas" />
            </label>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <button type="submit" disabled={saving || !canSave} className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#10b981] px-5 py-2 text-sm font-semibold text-[#002b5e] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? "Saving..." : "Save my flight info"}
            </button>
            <button type="button" onClick={() => setIsEditing(false)} disabled={saving} className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-white/[0.06]">
              Cancel
            </button>
            {existingTravel && (
              <button type="button" onClick={removeTravel} disabled={saving} className="inline-flex min-h-[44px] items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-[#ef4444] hover:bg-[#ef4444]/10 disabled:opacity-50 sm:ml-auto">
                Remove my flight info
              </button>
            )}
          </div>
        </form>
      )}

      {message && <p role="status" className="mb-4 text-sm font-semibold text-[#10b981]">{message}</p>}
      {error && <p role="alert" className="mb-4 text-sm font-semibold text-[#ef4444]">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {travelingTeam.map((name) => {
          const traveler = travelEntries.find((item) => item.person?.toLowerCase() === name.toLowerCase()) || { person: name };
          const contact = teamContacts[name] || {};
          const dialablePhone = phoneLinkValue(contact.phone);
          return (
            <details key={name} className="group self-start rounded-lg border border-white/10 bg-white/[0.035] px-4 shadow-sm shadow-black/10">
              <summary className="flex min-h-[68px] cursor-pointer list-none items-center justify-between gap-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0951fa] [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="block font-semibold text-white">{name}</span>
                  <span className="mt-0.5 block text-xs text-gray-500">Tap for contact and flight information</span>
                </span>
                <ChevronDownIcon className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-white/10 pb-4 pt-4 text-sm">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Contact</p>
                  <div className="space-y-2">
                    {contact.phone && (
                      <div>
                        <a href={`tel:${dialablePhone}`} className="flex min-h-[40px] items-center gap-2 font-semibold text-[#e8e7e7] hover:text-[#0951fa]">
                          <PhoneIcon className="h-4 w-4" /> {formatPhoneNumber(contact.phone)}
                        </a>
                        <div className="mt-1 grid grid-cols-2 gap-2">
                          <a href={`tel:${dialablePhone}`} className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-md border border-[#0951fa]/45 bg-[#0951fa]/15 px-3 font-semibold text-white hover:bg-[#0951fa]/25">
                            <PhoneIcon className="h-4 w-4" /> Call
                          </a>
                          <a href={`sms:${dialablePhone}`} className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-md border border-[#10b981]/45 bg-[#10b981]/15 px-3 font-semibold text-white hover:bg-[#10b981]/25">
                            <ChatBubbleLeftRightIcon className="h-4 w-4" /> Text
                          </a>
                        </div>
                      </div>
                    )}
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="flex min-h-[40px] items-center gap-2 break-all text-[#e8e7e7] hover:text-[#0951fa]">
                        <EnvelopeIcon className="h-4 w-4 shrink-0" /> {contact.email}
                      </a>
                    )}
                    {!contact.phone && !contact.email && <p className="text-gray-500">Contact information has not been added.</p>}
                  </div>
                </div>
                <div className="mt-5 space-y-4 border-t border-white/10 pt-4">
                  <div className="text-gray-300">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Arrival</p>
                    <FlightSummary leg={traveler.arrivalFlight} legacyText={traveler.arrival} direction="arrival" />
                  </div>
                  <div className="text-gray-300">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Departure</p>
                    <FlightSummary leg={traveler.departureFlight} legacyText={traveler.departure} direction="departure" />
                  </div>
                  {traveler.notes && <p className="text-gray-400">{traveler.notes}</p>}
                </div>
              </div>
            </details>
          );
        })}
        {!travelingTeam.length && <p className="py-4 text-sm text-gray-500">No team members have been added yet.</p>}
      </div>
    </CollapsibleSection>
  );
}

function EventDetail({ event, isAdmin, user }) {
  const allScheduleItems = event.schedule.flatMap((day) => day.items.map((item) => ({ ...item, day: day.day })));

  return (
    <main className="flex-1 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <header className="relative z-20 mb-5 border-b border-white/10 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-switch-bold text-3xl tracking-wide sm:text-5xl">{event.name.replace(" & ", " and ")}</h1>
              <p className="mt-2 text-sm text-gray-300 sm:text-base">{event.dates} · {event.city}</p>
            </div>
            <EventAppMenu event={event} isAdmin={isAdmin} />
          </div>
        </header>

        <TodayDashboard event={event} />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <div className="min-w-0 space-y-5">
            <LatestUpdates updates={event.latestUpdates} eventId={event.id} user={user} />

            <CollapsibleSection id="schedule" title="Schedule" icon={CalendarDaysIcon} iconClassName="text-[#0951fa]" meta={`${allScheduleItems.length} items`}>
              <div className="space-y-4">
                {event.schedule.map((day) => (
                  <div key={day.day} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-lg font-semibold text-white">{day.day}</h3>
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-300">
                        <UserGroupIcon className="h-4 w-4 text-[#ff4f00]" />
                        {day.dressCode}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {day.items.map((item) => (
                        <div key={`${day.day}-${item.time}-${item.title}`} className="grid gap-3 rounded-md border border-white/10 bg-gray-950/35 p-3 sm:grid-cols-[145px_minmax(0,1fr)]">
                          <div className="text-sm font-semibold text-[#e8e7e7]">{item.time}</div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-semibold text-white">{item.title}</h4>
                              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-gray-300">{item.type}</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-400">{item.location} · {item.owner}</p>
                            <p className="mt-2 text-sm leading-6 text-gray-300">{item.notes}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            <TravelSection event={event} user={user} />

            <CollapsibleSection id="expenses" title="Expenses" icon={ReceiptPercentIcon} iconClassName="text-[#f59e0b]" meta="Receipts & final report">
              <EventExpenses event={event} user={user} />
            </CollapsibleSection>
          </div>

          <aside className="min-w-0 space-y-5">
            <CollapsibleSection id="hotel" title="Hotel & Venue" icon={MapPinIcon} iconClassName="text-[#ff4f00]" aliases={["map"]}>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Hotel</dt>
                  <dd className="font-semibold text-white">{event.hotel.name}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Address</dt>
                  <dd className="text-gray-300">{event.hotel.address}</dd>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-gray-500">Check-in</dt>
                    <dd className="text-gray-300">{event.hotel.checkIn}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Check-out</dt>
                    <dd className="text-gray-300">{event.hotel.checkOut}</dd>
                  </div>
                </div>
                <div>
                  <dt className="text-gray-500">Notes</dt>
                  <dd className="text-gray-300">{event.hotel.notes}</dd>
                </div>
              </dl>
              <div className="mt-4 grid gap-2">
                <ExternalLink href={event.venueMapUrl}>Open venue map</ExternalLink>
                <ExternalLink href={event.hotelMapUrl}>Open hotel map</ExternalLink>
              </div>
              {event.floorMap && (
                <div className="mt-5">
                  <EventMap map={event.floorMap} />
                </div>
              )}
            </CollapsibleSection>

            <CollapsibleSection
              id="resources"
              title="Resources"
              icon={ClipboardDocumentIcon}
              iconClassName="text-[#ff4f00]"
              meta={`${event.resources.length} items`}
            >
              <div className="space-y-3">
                {event.resources.map((resource) => (
                  <div key={resource.id || resource.title} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-white">{resource.title}</h3>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-gray-300">{resource.type}</span>
                    </div>
                    <p className="mb-2 text-sm leading-6 text-gray-400">{resource.description}</p>
                    <ResourceAction eventId={event.id} resource={resource} />
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            <section id="archive" className={`${sectionClass} scroll-mt-24`}>
              <div className="mb-4 flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-[#10b981]" />
                <h2 className="text-xl font-semibold">Post-Show Archive</h2>
              </div>
              <p className="text-sm leading-6 text-gray-300">{event.recap.notes}</p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function Events() {
  const { eventId } = useParams();
  const { isAdmin, user } = useAuth();
  const [events, setEvents] = useState(tradeShows);
  const event = eventId ? events.find((item) => item.id === eventId) : null;

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      listTradeShows()
        .then((items) => !cancelled && setEvents(items))
        .catch(() => {});
    };

    load();
    window.addEventListener("trade-shows:updated", load);
    return () => {
      cancelled = true;
      window.removeEventListener("trade-shows:updated", load);
    };
  }, []);

  if (!eventId) return <EventsIndex events={events} />;

  if (!event) {
    return (
      <main className="flex-1 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-white">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="font-switch-bold text-3xl">Event not found</h1>
          <p className="mt-3 text-gray-300">This trade show may have been archived, renamed, or not added yet.</p>
          <Link to="/events" className="mt-6 inline-flex rounded-lg bg-[#0951fa] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
            Back to trade shows
          </Link>
        </div>
      </main>
    );
  }

  return <EventDetail event={event} isAdmin={isAdmin} user={user} />;
}
