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
    <div className="p-8 bg-[#f7f7f7] min-h-screen">
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
                <ul className="space-y-1">
                  {selected.resources.map((res, i) => (
                    <li key={i}>
                      <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">{res.label}</a>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    const links = selected.resources.map(r => `${r.label}: ${window.location.origin}${r.url.startsWith('http') ? '' : r.url}`).join('\n');
                    navigator.clipboard.writeText(links);
                  }}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Share All Resources
                </button>
              </div>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
}