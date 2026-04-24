import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, PlusIcon, PencilSquareIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { listProducts } from "../../api/products";

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [company, setCompany] = useState("all");

  useEffect(() => {
    let cancelled = false;
    listProducts()
      .then((list) => !cancelled && setProducts(list))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (company !== "all" && p.company !== company) return false;
      if (!q) return true;
      return (
        p.title?.toLowerCase().includes(q) ||
        p.company?.toLowerCase().includes(q) ||
        p.type?.toLowerCase().includes(q)
      );
    });
  }, [products, query, company]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeftIcon className="h-4 w-4" /> Back to Home
        </Link>

        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="font-switch-bold text-3xl bg-gradient-to-r from-[#0951fa] to-[#0a7cff] bg-clip-text text-transparent">
              Knowledge Base Admin
            </h1>
            <p className="text-gray-400 mt-1">
              {loading ? "Loading…" : `${products.length} products`}
            </p>
          </div>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0951fa] hover:bg-[#0951fa]/90 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-[#0951fa]/20"
          >
            <PlusIcon className="h-5 w-5" /> New product
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 my-8">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search title, company, or type…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-[#0951fa] focus:outline-none focus:ring-1 focus:ring-[#0951fa]"
            />
          </div>
          <div className="flex gap-2">
            {["all", "Switch Commerce", "Clear Choice"].map((c) => (
              <button
                key={c}
                onClick={() => setCompany(c)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  company === c
                    ? "bg-[#0951fa] text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/40 border border-red-700/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="inline-block h-8 w-8 border-4 border-[#0951fa] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-gray-800/40 rounded-xl">
            No products match your filters.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => (
              <Link
                key={p.id}
                to={`/admin/products/${p.id}/edit`}
                className="flex items-center gap-4 p-4 bg-gray-800/60 border border-gray-700/50 rounded-xl hover:bg-gray-700/40 hover:border-[#0951fa]/40 transition-colors group"
              >
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                    p.company === "Switch Commerce"
                      ? "bg-[#0951fa]/20 text-[#0a7cff] border border-[#0951fa]/40"
                      : "bg-[#ff4f00]/20 text-[#ff7f50] border border-[#ff4f00]/40"
                  }`}
                >
                  {p.company === "Switch Commerce" ? "SC" : "CC"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">{p.title}</div>
                  <div className="text-sm text-gray-400 truncate">{p.description}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs bg-gray-700/80 text-gray-300 flex-shrink-0 hidden sm:inline">
                  {p.type}
                </span>
                <PencilSquareIcon className="h-5 w-5 text-gray-500 group-hover:text-[#0a7cff] transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
