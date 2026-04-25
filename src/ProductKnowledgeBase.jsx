import { useState, useMemo, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { useSearchParams } from "react-router-dom";
import { Squares2X2Icon, ListBulletIcon, ViewColumnsIcon, TableCellsIcon, QueueListIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import Fuse from "fuse.js";
import { listProducts } from "./api/products";
import RichText from "./components/RichText.jsx";
import ShareRecipientDialog from "./components/ShareRecipientDialog.jsx";
import { buildProductShareMailto, copyProductText } from "./utils/shareProduct";

const VIEW_STORAGE_KEY = "scc:kb-view";
const VIEWS = [
  { id: "cards", label: "Cards", icon: Squares2X2Icon },
  { id: "list", label: "List", icon: ListBulletIcon },
  { id: "columns", label: "Columns", icon: ViewColumnsIcon },
  { id: "table", label: "Table", icon: TableCellsIcon },
  { id: "grouped", label: "Grouped by type", icon: QueueListIcon },
];

export default function ProductKnowledgeBase() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem(VIEW_STORAGE_KEY) || "cards";
    } catch {
      return "cards";
    }
  });
  const [sortKey, setSortKey] = useState("title");
  const [sortDir, setSortDir] = useState("asc");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    company: null,
    type: null,
    buyerTags: null,
    industryTags: null,
  });

  useEffect(() => {
    let cancelled = false;
    listProducts()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load products");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try { localStorage.setItem(VIEW_STORAGE_KEY, view); } catch {}
  }, [view]);

  // Open the modal for the product referenced in ?id= once products have loaded.
  useEffect(() => {
    if (loading) return;
    const id = searchParams.get("id");
    if (id && products.length) {
      const found = products.find((p) => p.id === id);
      if (found) setSelected(found);
    }
  }, [loading, products, searchParams]);

  const openProduct = (product) => {
    setSelected(product);
    if (product?.id) {
      const next = new URLSearchParams(searchParams);
      next.set("id", product.id);
      setSearchParams(next, { replace: true });
    }
  };

  const closeProduct = () => {
    setSelected(null);
    setCopied(false);
    if (searchParams.has("id")) {
      const next = new URLSearchParams(searchParams);
      next.delete("id");
      setSearchParams(next, { replace: true });
    }
  };

  const handleCopy = async (product) => {
    try {
      await copyProductText(product);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Clipboard can fail silently — ignore
    }
  };

  const toggleFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  };

  const fuse = useMemo(() => {
    return new Fuse(products, {
      threshold: 0.35,
      keys: [
        "title",
        "company",
        "problem",
        "villain",
        "keywords",
        "useCases",
      ],
    });
  }, [products]);

  const searched = query ? fuse.search(query).map((r) => r.item) : products;

  const filtered = searched.filter(
    (p) =>
      (!filters.company || p.company === filters.company) &&
      (!filters.type || p.type === filters.type) &&
      (!filters.buyerTags ||
        (p.buyerTags && p.buyerTags.includes(filters.buyerTags))) &&
      (!filters.industryTags ||
        (p.industryTags && p.industryTags.includes(filters.industryTags)))
  );

  const sorted = [...filtered].sort((a, b) => {
    if (a.company === "Switch Commerce" && b.company === "Clear Choice") return -1;
    if (a.company === "Clear Choice" && b.company === "Switch Commerce") return 1;
    return 0;
  });

  return (
    <div className="p-4 sm:p-8 flex-1 bg-gradient-to-b from-gray-900 to-black">
      <h1 className="font-switch-bold text-4xl mb-6 text-center text-white tracking-wide">Product Knowledge Base</h1>

      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search pain points, product names, or use cases…"
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-900/70 border border-white/15 focus:border-[#0951fa]/60 focus:outline-none focus:ring-2 focus:ring-[#0951fa]/30 backdrop-blur-md text-white placeholder-gray-300 text-base transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <div className="flex gap-3 mb-2 w-full justify-center">
          {["Switch Commerce", "Clear Choice"].map((name) => {
            const isActive = filters.company === name;
            const isCC = name === "Clear Choice";
            const color = isCC ? "#ff4f00" : "#0951fa";
            return (
              <button
                key={name}
                onClick={() => toggleFilter("company", name)}
                className={`px-6 py-2 rounded-full text-sm font-medium border backdrop-blur-md transition-all duration-300 ${
                  isActive
                    ? isCC
                      ? "bg-gradient-to-br from-[#ff4f00]/60 from-0% via-[#ff4f00]/20 via-50% to-gray-900/60 to-100% border-[#ff4f00]/50 text-white shadow-lg shadow-[#ff4f00]/20"
                      : "bg-gradient-to-br from-[#0951fa]/60 from-0% via-[#0951fa]/20 via-50% to-gray-900/60 to-100% border-[#0951fa]/50 text-white shadow-lg shadow-[#0951fa]/20"
                    : "bg-gradient-to-br from-gray-800/60 to-gray-900/40 border-white/10 hover:border-white/25 text-gray-400 hover:text-gray-200"
                }`}
                style={isActive ? { boxShadow: `0 10px 24px -10px ${color}33` } : undefined}
              >
                {name}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {["ATM", "Hardware", "Kiosk", "Platform", "Service", "Software"].map((type) => (
            <button
              key={type}
              onClick={() => toggleFilter("type", type)}
              className={`px-5 py-1.5 rounded-full text-sm border backdrop-blur-md transition-all duration-300 ${
                filters.type === type
                  ? "bg-gradient-to-br from-[#0951fa]/50 from-0% via-[#0951fa]/15 via-50% to-gray-900/60 to-100% border-[#0951fa]/40 text-white"
                  : "bg-gradient-to-br from-gray-800/50 to-gray-900/30 border-white/10 hover:border-white/25 text-gray-400 hover:text-gray-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* View switcher */}
      <div className="flex justify-center mb-6 max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-gray-900/70 border border-white/10 backdrop-blur-md">
          {VIEWS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              title={label}
              aria-label={label}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                view === id
                  ? "bg-gradient-to-br from-[#0951fa]/60 via-[#0951fa]/15 to-gray-900/50 border border-[#0951fa]/50 text-white"
                  : "text-gray-400 hover:text-white border border-transparent"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="inline-block h-8 w-8 border-4 border-[#0951fa] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Loading knowledge base…</p>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-red-400 mb-2">Couldn't load products</h3>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Products Found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {Object.values(filters).some(f => f !== null)
              ? "Try adjusting your filters or search query"
              : "Try a different search term"}
          </p>
          {Object.values(filters).some(f => f !== null) && (
            <button
              onClick={() => setFilters({ company: null, type: null, buyerTags: null, industryTags: null })}
              className="mt-4 inline-flex items-center px-6 py-2 text-sm font-medium bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200 rounded-full transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          {view === "cards" && <CardsView items={sorted} onOpen={openProduct} />}
          {view === "list" && <ListView items={sorted} onOpen={openProduct} />}
          {view === "columns" && <ColumnsView items={sorted} onOpen={openProduct} />}
          {view === "table" && (
            <TableView
              items={sorted}
              onOpen={openProduct}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={(k) => {
                if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
                else { setSortKey(k); setSortDir("asc"); }
              }}
            />
          )}
          {view === "grouped" && <GroupedView items={sorted} onOpen={openProduct} />}
        </div>
      )}

      {selected && (
        <Dialog open={selected !== null} onClose={closeProduct}>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <Dialog.Panel className="bg-white dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl max-w-2xl w-full mx-auto max-h-[90vh] flex flex-col text-gray-900 dark:text-white shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <div className="flex items-center justify-end gap-1 px-4 py-3 border-b border-gray-200/40 dark:border-gray-700/60 flex-shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShareDialogOpen(true);
                  }}
                  title="Send via email"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0951fa] hover:bg-[#0951fa]/90 text-white text-sm font-medium transition-colors shadow-lg shadow-[#0951fa]/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(selected)}
                  title="Copy to clipboard"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium transition-colors"
                >
                  {copied ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={closeProduct}
                  className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  title="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 pt-6">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#0951fa] to-[#0951fa]/70 bg-clip-text text-transparent">{selected.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{selected.company}</p>
                  <div className="text-gray-700 dark:text-gray-300 italic">
                    <RichText content={selected.description} />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">The Challenge</h3>
                    <div className="text-gray-700 dark:text-gray-300">
                      <RichText content={selected.problem} />
                      {selected.villain && <RichText content={selected.villain} />}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Solution</h3>
                    <div className="text-gray-700 dark:text-gray-300">
                      <RichText content={selected.plan} />
                    </div>
                  </div>
                </div>
              {selected.resources && selected.resources.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Resources</h3>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex flex-wrap gap-4">
                    {selected.resources.map((res, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <a 
                          href={res.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                        >
                          {res.label}
                        </a>
                        <div className="relative group">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const link = res.url.startsWith('http') ? res.url : `${window.location.origin}${res.url}`;
                              navigator.clipboard.writeText(link);
                            }}
                            className="p-1.5 bg-white dark:bg-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-sm"
                            aria-label={`Copy ${res.label} link`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><rect x="2" y="2" width="13" height="13" rx="2"/><path d="M8 13l6-6"/></svg>
                          </button>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap z-10 pointer-events-none">
                            Copy link
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-4 border-transparent border-t-gray-900"></span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}

      <ShareRecipientDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        productTitle={selected?.title}
        onSubmit={({ name, email }) => {
          setShareDialogOpen(false);
          if (!selected) return;
          const href = buildProductShareMailto(selected, { name, email });
          window.location.href = href;
        }}
      />
    </div>
  );
}

// ---------- View components ---------------------------------------------

function toneFor(company) {
  return company === "Switch Commerce"
    ? {
        gradient:
          "from-[#0951fa]/60 via-[#0951fa]/10 border-[#0951fa]/25 hover:border-[#0951fa]/50 shadow-[#0951fa]/10",
        badge: "bg-[#0951fa]/20 text-[#7ea9ff] border-[#0951fa]/40",
        abbr: "SC",
        accent: "[#0951fa]",
      }
    : {
        gradient:
          "from-[#ff4f00]/55 via-[#ff4f00]/10 border-[#ff4f00]/25 hover:border-[#ff4f00]/50 shadow-[#ff4f00]/10",
        badge: "bg-[#ff4f00]/20 text-[#ff9f70] border-[#ff4f00]/40",
        abbr: "CC",
        accent: "[#ff4f00]",
      };
}

function CardsView({ items, onOpen }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((p) => {
        const t = toneFor(p.company);
        return (
          <div
            key={p.id || p.title}
            onClick={() => onOpen(p)}
            className={`rounded-xl p-6 cursor-pointer bg-gradient-to-br ${t.gradient} from-0% via-45% to-gray-900/70 to-100% border hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl backdrop-blur-md`}
          >
            <h2 className="text-xl font-semibold mb-2 text-white text-center">{p.title}</h2>
            <p className="text-sm text-gray-300 text-center mb-3">{p.company}</p>
            {p.keywords && (
              <p className="text-xs text-white/90 bg-white/10 border border-white/10 py-1 px-2 rounded-full text-center">
                {p.keywords}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ListView({ items, onOpen }) {
  return (
    <div className="space-y-2">
      {items.map((p) => {
        const t = toneFor(p.company);
        return (
          <button
            key={p.id || p.title}
            onClick={() => onOpen(p)}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/40 border border-white/10 hover:border-white/30 hover:bg-white/5 backdrop-blur-md transition-all text-left group"
          >
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${t.badge} flex-shrink-0`}>
              {t.abbr}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white truncate">{p.title}</div>
              <div className="text-xs text-gray-400 truncate">{p.company} · {p.type}</div>
            </div>
            {p.keywords && (
              <div className="hidden md:block text-xs text-gray-400 truncate max-w-[300px]">
                {p.keywords}
              </div>
            )}
            <svg className="h-5 w-5 text-gray-500 group-hover:text-white transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

function ColumnsView({ items, onOpen }) {
  const sc = items.filter((p) => p.company === "Switch Commerce");
  const cc = items.filter((p) => p.company === "Clear Choice");
  const Column = ({ title, titleColor, borderColor, list }) => (
    <div className="flex-1 min-w-0">
      <div
        className="flex items-center justify-between mb-4 pb-3 border-b-2"
        style={{ borderColor }}
      >
        <h3 className="font-switch-bold text-xl" style={{ color: titleColor }}>{title}</h3>
        <span className="text-sm text-gray-400">{list.length}</span>
      </div>
      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-white/10 rounded-xl">
            No matches in {title}.
          </div>
        ) : (
          list.map((p) => {
            const t = toneFor(p.company);
            return (
              <button
                key={p.id || p.title}
                onClick={() => onOpen(p)}
                className={`w-full text-left rounded-xl p-4 bg-gradient-to-br ${t.gradient} from-0% via-45% to-gray-900/70 to-100% border hover:scale-[1.015] transition-all shadow-lg backdrop-blur-md`}
              >
                <div className="font-semibold text-white">{p.title}</div>
                <div className="text-xs text-gray-300 mt-0.5">{p.type}</div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <Column title="Switch Commerce" titleColor="#0a7cff" borderColor="rgba(10,124,255,0.4)" list={sc} />
      <Column title="Clear Choice" titleColor="#ff9f70" borderColor="rgba(255,79,0,0.4)" list={cc} />
    </div>
  );
}

function TableView({ items, onOpen, sortKey, sortDir, onSort }) {
  const sorted = useMemo(() => {
    const arr = [...items];
    arr.sort((a, b) => {
      const av = (a[sortKey] || "").toString().toLowerCase();
      const bv = (b[sortKey] || "").toString().toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [items, sortKey, sortDir]);

  const Header = ({ id, children, className = "" }) => (
    <th
      onClick={() => onSort(id)}
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300 cursor-pointer select-none hover:text-white ${className}`}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortKey === id && (
          sortDir === "asc" ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />
        )}
      </span>
    </th>
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-gray-900/40 backdrop-blur-md">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-900/60 border-b border-white/10">
          <tr>
            <Header id="title">Title</Header>
            <Header id="company">Company</Header>
            <Header id="type">Type</Header>
            <Header id="keywords" className="hidden md:table-cell">Keywords</Header>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => {
            const t = toneFor(p.company);
            return (
              <tr
                key={p.id || p.title}
                onClick={() => onOpen(p)}
                className={`cursor-pointer hover:bg-white/5 transition-colors ${i % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"}`}
              >
                <td className="px-4 py-3 text-white font-medium">{p.title}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${t.badge}`}>
                    {p.company}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300">{p.type}</td>
                <td className="px-4 py-3 text-gray-400 hidden md:table-cell truncate max-w-[360px]">
                  {p.keywords}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GroupedView({ items, onOpen }) {
  const groups = useMemo(() => {
    const map = new Map();
    for (const p of items) {
      const key = p.type || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  return (
    <div className="space-y-8">
      {groups.map(([type, list]) => (
        <section key={type}>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
            <h3 className="font-switch-bold text-lg text-white">{type}</h3>
            <span className="text-xs text-gray-400">{list.length} {list.length === 1 ? "product" : "products"}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {list.map((p) => {
              const t = toneFor(p.company);
              return (
                <button
                  key={p.id || p.title}
                  onClick={() => onOpen(p)}
                  className={`text-left rounded-lg p-3 bg-gradient-to-br ${t.gradient} from-0% via-50% to-gray-900/70 to-100% border transition-all hover:scale-[1.015] shadow-lg backdrop-blur-md`}
                >
                  <div className="font-semibold text-white text-sm truncate">{p.title}</div>
                  <div className="text-xs text-gray-300 truncate">{p.company}</div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}