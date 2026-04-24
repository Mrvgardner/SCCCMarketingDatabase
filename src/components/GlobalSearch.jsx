import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { listProducts } from "../api/products";
import { listFieldNotes } from "../api/fieldNotes";

const CATEGORIES = {
  product: {
    label: "Knowledge Base",
    color: "bg-[#0951fa]/20 text-[#7ea9ff] border-[#0951fa]/40",
    dot: "#0951fa",
  },
  "field-note": {
    label: "Field Notes",
    color: "bg-[#5fae4b]/20 text-[#9fd388] border-[#5fae4b]/40",
    dot: "#5fae4b",
  },
  page: {
    label: "Page",
    color: "bg-gray-700/40 text-gray-300 border-gray-600/60",
    dot: "#9ca3af",
  },
};

const STATIC_PAGES = [
  {
    type: "page", title: "Knowledge Base",
    subtitle: "Browse all products, use cases, and sales resources",
    url: "/products",
  },
  {
    type: "page", title: "Field Notes",
    subtitle: "Team announcements and updates",
    url: "/field-notes",
  },
  {
    type: "page", title: "Email Signature",
    subtitle: "Generate your branded email signature",
    url: "/email-signature",
  },
  {
    type: "page", title: "Wallpapers",
    subtitle: "Branded desktop and mobile wallpapers",
    url: "/wallpapers",
  },
  {
    type: "page", title: "Brochures & Flyers",
    subtitle: "Latest brochures and one-pagers",
    url: "/print-collateral",
  },
  {
    type: "page", title: "Switch Commerce Brand Guidelines",
    subtitle: "Logos, colors, and typography",
    url: "/switch-commerce/branding",
  },
  {
    type: "page", title: "Clear Choice Brand Guidelines",
    subtitle: "Logos, colors, and typography",
    url: "/clear-choice/branding",
  },
  {
    type: "page", title: "Upcoming Birthdays",
    subtitle: "Team birthdays coming up",
    url: "/birthdays",
  },
  {
    type: "page", title: "Upcoming Anniversaries",
    subtitle: "Work anniversaries coming up",
    url: "/anniversaries",
  },
  {
    type: "page", title: "Marketing Request",
    subtitle: "Submit a marketing request",
    url: "https://getswitchdone.netlify.app/f/marketing-request-cbkday",
    external: true,
  },
];

function stripHtml(html) {
  if (!html) return "";
  if (typeof document === "undefined") return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent || "").trim();
}

function truncate(str, n = 120) {
  if (!str) return "";
  return str.length <= n ? str : str.slice(0, n).trimEnd() + "…";
}

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Load everything searchable once on mount
  useEffect(() => {
    let cancelled = false;
    Promise.all([listProducts().catch(() => []), listFieldNotes().catch(() => [])]).then(
      ([products, notes]) => {
        if (cancelled) return;
        const indexed = [
          ...products.map((p) => ({
            type: "product",
            id: p.id,
            title: p.title,
            subtitle: p.company,
            body: [p.description, p.problem, p.plan, p.keywords].map(stripHtml).join(" "),
            url: `/products?id=${encodeURIComponent(p.id)}`,
          })),
          ...notes.map((n) => ({
            type: "field-note",
            id: n.id,
            title: n.title,
            subtitle: n.excerpt,
            body: stripHtml(n.content),
            url: "/field-notes",
          })),
          ...STATIC_PAGES,
        ];
        setItems(indexed);
      }
    );
    return () => { cancelled = true; };
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        threshold: 0.35,
        ignoreLocation: true,
        keys: [
          { name: "title", weight: 3 },
          { name: "subtitle", weight: 2 },
          { name: "body", weight: 1 },
        ],
      }),
    [items]
  );

  // Quick links shown when the input is focused but empty
  const quickLinks = useMemo(
    () => STATIC_PAGES.filter((p) => [
      "Knowledge Base",
      "Field Notes",
      "Email Signature",
      "Brochures & Flyers",
      "Marketing Request",
    ].includes(p.title)),
    []
  );

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return fuse.search(q).slice(0, 12).map((r) => r.item);
  }, [fuse, query]);

  // Group results by category, preserving rank order
  const grouped = useMemo(() => {
    const order = ["product", "field-note", "page"];
    const map = new Map(order.map((k) => [k, []]));
    for (const item of results) {
      if (map.has(item.type)) map.get(item.type).push(item);
    }
    return order
      .map((k) => ({ type: k, items: map.get(k) }))
      .filter((g) => g.items.length > 0);
  }, [results]);

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Esc clears, Enter opens first result
  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      if (query) setQuery("");
      else inputRef.current?.blur();
      setOpen(false);
    } else if (e.key === "Enter" && results[0]) {
      goTo(results[0]);
    }
  };

  const goTo = (item) => {
    setOpen(false);
    setQuery("");
    if (item.external) {
      window.open(item.url, "_blank", "noopener,noreferrer");
    } else {
      navigate(item.url);
    }
  };

  const showDropdown = open;
  const hasQuery = query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search the portal — products, field notes, resources…"
          className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-gray-900/70 border border-white/15 focus:border-[#0951fa]/60 focus:outline-none focus:ring-2 focus:ring-[#0951fa]/30 backdrop-blur-md text-white placeholder-gray-300 text-base transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Clear"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-gray-900/95 border border-white/10 shadow-2xl backdrop-blur-md overflow-hidden z-50">
          {!hasQuery ? (
            <div className="py-1 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Quick links
                </span>
              </div>
              {quickLinks.map((item) => {
                const cfg = CATEGORIES.page;
                return (
                  <button
                    key={`ql-${item.title}`}
                    onClick={() => goTo(item)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white truncate group-hover:text-[#0a7cff] transition-colors">
                          {item.title}
                        </span>
                        <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      {item.subtitle && (
                        <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.subtitle}</div>
                      )}
                    </div>
                  </button>
                );
              })}
              <div className="px-4 py-2 text-[11px] text-gray-500 border-t border-white/5">
                Start typing to search products, field notes, and more.
              </div>
            </div>
          ) : grouped.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">
              No matches for <span className="text-white">"{query}"</span>.
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto">
              {grouped.map(({ type, items }) => {
                const cfg = CATEGORIES[type];
                return (
                  <div key={type} className="py-1">
                    <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.dot }} />
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {cfg.label}
                      </span>
                    </div>
                    {items.map((item) => (
                      <button
                        key={`${type}-${item.id || item.title}`}
                        onClick={() => goTo(item)}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white truncate group-hover:text-[#0a7cff] transition-colors">
                              {item.title}
                            </span>
                            <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </div>
                          {(item.subtitle || item.body) && (
                            <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                              {truncate(item.subtitle || item.body, 140)}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
