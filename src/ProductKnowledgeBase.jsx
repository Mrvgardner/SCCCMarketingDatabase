import { useState, useMemo, useEffect } from "react";
// DaisyUI theme toggle helper
const THEME_KEY = "theme";
const THEMES = ["light", "night"];

function getSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return "night";
  }
  return "light";
}

function getInitialTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored && THEMES.includes(stored)) return stored;
  return getSystemTheme();
}
import { Dialog } from "@headlessui/react";
import Fuse from "fuse.js";
import { products } from "./data/products-tagged";
import ThemeToggle from "../components/ThemeToggle";

export default function ProductKnowledgeBase() {
  const [theme, setTheme] = useState(getInitialTheme());

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      if (!localStorage.getItem(THEME_KEY)) {
        setTheme(e.matches ? "night" : "light");
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
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
    <div className="p-8 min-h-screen">
      <div className="flex justify-end mb-2">
        <ThemeToggle />
      </div>
      <h1 className="text-4xl font-bold mb-6 text-center">Product Knowledge Base</h1>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search pain points, product names, or use cases..."
          className="w-full max-w-xl px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {["Switch Commerce", "Clear Choice"].map((name) => (
          <button
            key={name}
            onClick={() => toggleFilter("company", name)}
            className={`px-3 py-1 rounded-full text-sm ${
              filters.company === name
                ? name === "Clear Choice"
                  ? "bg-[#ff4f00] text-white"
                  : "bg-blue-600 text-white"
                : "border border-gray-300 text-gray-700"
            }`}
          >
            {name}
          </button>
        ))}
        {["ATM", "Hardware", "Kiosk", "Platform", "Service", "Software"].map((type) => (
          <button
            key={type}
            onClick={() => toggleFilter("type", type)}
            className={`px-3 py-1 rounded-full text-sm ${
              filters.type === type
                ? "bg-green-600 text-white"
                : "border border-gray-300 text-gray-700"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sorted.map((p, idx) => (
          <div
            key={idx}
            className="bg-[#e8e7e7] rounded-lg shadow-md p-6 hover:bg-[#dcdcdc] cursor-pointer transition"
            onClick={() => setSelected(p)}
          >
            <h2 className="text-xl font-semibold mb-1">{p.title}</h2>
            <p className="text-sm text-gray-600 mb-2">{p.company}</p>
            <p className="text-xs text-gray-500">{p.keywords}</p>
          </div>
        ))}
      </div>

      {selected && (
        <Dialog open={true} onClose={() => setSelected(null)} className="fixed inset-0 z-50 bg-black/50">
          <div className="bg-white rounded-lg max-w-2xl mx-auto mt-20 p-6 relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-2">{selected.title}</h2>
            <p className="text-sm text-gray-500 mb-1">{selected.company}</p>
            <p className="mb-4 italic">{selected.description}</p>
            <ul className="text-sm space-y-2">
              <li>
                <strong>The Challenge:</strong><br />
                {selected.problem} {selected.villain}
              </li>
              <li>
                <strong>Solution:</strong><br />
                {selected.plan}
              </li>
            </ul>
            {selected.resources && selected.resources.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-1">Resources:</h3>
                <div className="flex items-center justify-center gap-0 divide-x divide-gray-300 bg-gray-100 rounded p-2">
                  {selected.resources.map((res, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 first:pl-0 last:pr-0">
                      <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">{res.label}</a>
                      <div className="relative group">
                        <button
                          onClick={() => {
                            const link = res.url.startsWith('http') ? res.url : `${window.location.origin}${res.url}`;
                            navigator.clipboard.writeText(link);
                          }}
                          className="px-2 py-0.5 bg-gray-200 text-xs rounded hover:bg-gray-300 flex items-center justify-center"
                          aria-label={`Copy ${res.label} link`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><rect x="2" y="2" width="13" height="13" rx="2"/><path d="M8 13l6-6"/></svg>
                        </button>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 bottom-full mb-1 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none">Copy link</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
}