import { useState, useMemo } from "react";
import { Dialog } from "@headlessui/react";
import Fuse from "fuse.js";
import { products } from "./data/products-tagged";

export default function ProductKnowledgeBase() {
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    company: null,
    type: null,
    buyerTags: null,
    industryTags: null,
  });

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
  }, []);

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
    <div className="p-8 min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <h1 className="text-4xl font-bold mb-6 text-center text-white">Product Knowledge Base</h1>

      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search pain points, product names, or use cases..."
            className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-shadow duration-200"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <div className="flex gap-2 mb-2 w-full justify-center">
          {["Switch Commerce", "Clear Choice"].map((name) => (
            <button
              key={name}
              onClick={() => toggleFilter("company", name)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                filters.company === name
                  ? name === "Clear Choice"
                    ? "bg-gradient-to-r from-[#ff4f00] to-[#ff4f00]/90 text-white shadow-lg shadow-[#ff4f00]/30"
                    : "bg-gradient-to-r from-[#0951fa] to-[#0951fa]/90 text-white shadow-lg shadow-[#0951fa]/30"
                  : "bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {["ATM", "Hardware", "Kiosk", "Platform", "Service", "Software"].map((type) => (
            <button
              key={type}
              onClick={() => toggleFilter("type", type)}
              className={`px-6 py-2 rounded-full text-sm transition-all duration-300 ${
                filters.type === type
                  ? "bg-[#0951fa] text-white shadow-lg shadow-[#0951fa]/30"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((p, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-6 cursor-pointer shadow-xl backdrop-blur-sm bg-opacity-90 hover:scale-105 transition-transform duration-300 ${
                p.company === "Switch Commerce"
                  ? (idx % 3 === 0
                      ? "bg-gradient-to-br from-[#0951fa] to-[#0a7cff]"
                      : idx % 3 === 1
                        ? "bg-gradient-to-t from-[#0a7cff] to-[#0951fa]"
                        : "bg-gradient-to-l from-[#0a7cff] to-[#0951fa]")
                  : (idx % 3 === 0
                      ? "bg-gradient-to-r from-[#ff4f00] to-[#ff6a1a]"
                      : idx % 3 === 1
                        ? "bg-gradient-to-tl from-[#ff6a1a] to-[#ff4f00]"
                        : "bg-gradient-to-b from-[#ff4f00] to-[#d84315]")
              }`}
              onClick={() => setSelected(p)}
            >
              <h2 className="text-xl font-semibold mb-2 text-white text-center">{p.title}</h2>
              <p className="text-sm text-gray-200 text-center mb-3">{p.company}</p>
              <p className="text-xs text-white bg-white/20 py-1 px-2 rounded-full text-center">{p.keywords}</p>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <Dialog open={selected !== null} onClose={() => setSelected(null)}>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <Dialog.Panel className="bg-white dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl max-w-2xl w-full mx-auto p-8 relative text-gray-900 dark:text-white shadow-xl border border-gray-200/50 dark:border-gray-700/50">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#0951fa] to-[#0951fa]/70 bg-clip-text text-transparent">{selected.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{selected.company}</p>
                <p className="text-gray-700 dark:text-gray-300 italic">{selected.description}</p>
              </div>
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">The Challenge</h3>
                  <p className="text-gray-700 dark:text-gray-300">{selected.problem} {selected.villain}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Solution</h3>
                  <p className="text-gray-700 dark:text-gray-300">{selected.plan}</p>
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
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </div>
  );
}