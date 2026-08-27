import { NavLink } from "react-router-dom";

// Five equal items, a 6px dot above a 10px label. Active #0951FA, inactive
// #75808D. The tab lives in the URL so back/forward and PWA restore work.
const TABS = [
  { id: "today", label: "Today" },
  { id: "trip", label: "Trip" },
  { id: "money", label: "Money" },
  { id: "booth", label: "Booth" },
  { id: "team", label: "Team" },
  // A sixth tab beyond the five in the design. The design's five answer the
  // questions people open their phone for; this carries the rest of the hub's
  // functionality — updates, resources, archive, device settings — so nothing
  // was lost when the web app moved onto this design.
  { id: "more", label: "More" },
];

export default function TripTabBar({ eventId }) {
  return (
    <nav
      aria-label="Trip sections"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-white/[0.03] backdrop-blur-xl"
      style={{ paddingBottom: "max(30px, env(safe-area-inset-bottom))" }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch px-1 pt-2.5">
        {TABS.map((tab) => (
          <li key={tab.id} className="flex-1">
            <NavLink
              to={`/trip/${eventId}/${tab.id}`}
              className="flex min-h-[44px] flex-col items-center justify-center gap-1.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0951fa]"
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${isActive ? "bg-[#0951fa]" : "bg-[#75808d]"}`}
                  />
                  <span
                    className={`text-[10px] font-semibold tracking-[0.04em] transition-colors ${isActive ? "text-[#0951fa]" : "text-[#75808d]"}`}
                  >
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
