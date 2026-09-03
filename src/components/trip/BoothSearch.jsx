import { useCallback, useEffect, useMemo, useState } from "react";
import { MagnifyingGlassIcon, SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { listProducts } from "../../api/products";
import { askProductSearch } from "../../api/productSearch";
import RichText from "../RichText";

// Answering a question at the booth.
//
// Searches the product knowledge base and this show's own material together.
// Products already carry `_searchBlob` — title, problem, plan, keywords and
// synonyms flattened into one lowercase string — so matching on what a customer
// described ("tampering") finds the product they never named (Watchdog).
//
// Everything is searched in memory: the product list is already fetched and
// cached by the app, so this costs nothing per query and keeps working when the
// show-floor wifi does not.

const EXAMPLES = ["tampering", "settlement", "disputes", "vault cash", "compliance"];

function matches(haystack, terms) {
  return terms.every((term) => haystack.includes(term));
}

// A hit on the name is what someone meant; a hit anywhere else is what they
// described. Names first.
function rank(title, haystack, terms) {
  const name = String(title || "").toLowerCase();
  return terms.some((term) => name.includes(term)) ? 0 : 1;
}

function Badge({ tone, children }) {
  const tones = {
    switch: "bg-[#0951fa]/20 text-[#7fa8ff]",
    choice: "bg-[#ff4f00]/15 text-[#ff9a63]",
    show: "bg-[#10b981]/15 text-[#4fd1a5]",
  };
  return (
    <span className={`shrink-0 rounded px-1.5 py-[3px] text-[9.5px] font-semibold uppercase tracking-[0.08em] ${tones[tone] || tones.show}`}>
      {children}
    </span>
  );
}

// `children` is the screen's resting content — the pinned list, the map, the
// resource library. It gives way to results while someone is searching, so an
// answer is not buried under everything they were not asking about.
export default function BoothSearch({ event, briefing = [], children }) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [openId, setOpenId] = useState(null);
  // Interpreted search: what the keyword pass cannot reach.
  const [asked, setAsked] = useState(null);
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState("");

  useEffect(() => {
    let cancelled = false;
    listProducts()
      .then((items) => !cancelled && setProducts(items || []))
      // Search still works over this show's own material without the catalogue.
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // This show's own material: the pinned list and the resource links, so one
  // search covers "what did we decide" as well as "what do we sell".
  const showItems = useMemo(() => {
    const fromBriefing = briefing.map((item) => ({
      id: `b-${item.id}`,
      title: item.kind === "file" ? item.fileName : item.text,
      detail: item.kind === "file" ? "Pinned document" : `Know this cold${item.author ? ` · ${item.author}` : ""}`,
      haystack: `${item.text || ""} ${item.fileName || ""} ${item.author || ""}`.toLowerCase(),
    }));
    const fromResources = (event.resources || []).map((resource, index) => ({
      id: `r-${index}`,
      title: resource.title,
      detail: resource.description || resource.type || "Resource",
      haystack: `${resource.title || ""} ${resource.description || ""} ${resource.type || ""}`.toLowerCase(),
    }));
    return [...fromBriefing, ...fromResources];
  }, [briefing, event.resources]);

  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  const showHits = terms.length ? showItems.filter((item) => matches(item.haystack, terms)) : [];
  const productHits = terms.length
    ? products
        .filter((product) => matches(product._searchBlob || "", terms))
        .sort((a, b) => rank(a.title, a._searchBlob, terms) - rank(b.title, b._searchBlob, terms))
        .slice(0, 12)
    : [];

  const searching = terms.length > 0;
  const noKeywordHits = searching && !showHits.length && !productHits.length;

  const ask = useCallback(async (text) => {
    setAsking(true);
    setAskError("");
    try {
      setAsked({ query: text, ...(await askProductSearch(text)) });
    } catch (error) {
      setAskError(error.message || "Could not run that search.");
    } finally {
      setAsking(false);
    }
  }, []);

  // Asking costs money, so it is not fired on every keystroke. It runs by
  // itself only when the free pass found nothing at all — the case where the
  // alternative is an empty screen — and after typing has stopped. Anything
  // else is a deliberate tap.
  useEffect(() => {
    const text = query.trim();
    setAskError("");
    if (!noKeywordHits || text.length < 4) {
      setAsked(null);
      return undefined;
    }
    const timer = setTimeout(() => ask(text), 700);
    return () => clearTimeout(timer);
  }, [query, noKeywordHits, ask]);

  const interpreted = asked && asked.query === query.trim() ? asked : null;
  const nothing = noKeywordHits && !asking && interpreted && !interpreted.matches.length;

  // One card shape for both passes. An interpreted hit carries the extra line
  // saying why it came back, since it did not match on any word that was typed.
  const renderProduct = (product, reason) => {
    const open = openId === product.id;
    const isSwitch = /switch/i.test(product.company || "");
    return (
      <button
        key={product.id}
        type="button"
        onClick={() => setOpenId(open ? null : product.id)}
        aria-expanded={open}
        className="block w-full rounded-xl border border-white/10 bg-white/[0.045] p-3 text-left"
      >
        <span className="flex items-center gap-2">
          <span className="min-w-0 flex-1 text-[13.5px] font-semibold leading-[1.3] text-white">
            {product.title}
          </span>
          <Badge tone={isSwitch ? "switch" : "choice"}>{isSwitch ? "Switch" : "Clear Choice"}</Badge>
        </span>
        {reason ? (
          <p className="mt-1.5 text-[12.5px] leading-[1.4] text-[#cbd5e3]">{reason}</p>
        ) : (
          product.problem && (
            // problem/plan/description are edited through the site's rich-text
            // editor and stored as HTML — RichText sanitizes and renders it, so
            // a bolded phrase or a link comes through as one, not as visible
            // "<strong>" tags. It also degrades quietly to plain paragraphs for
            // the products that only ever held plain text.
            <div className="mt-1.5 text-[12.5px] leading-[1.4] text-[#93a0b4]">
              <RichText content={product.problem} />
            </div>
          )
        )}
        {open && (
          <div className="mt-2.5 space-y-3 border-t border-white/[0.07] pt-2.5 text-[12.5px] leading-[1.5] text-[#cbd5e3] [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mt-1 [&_li_strong]:text-white [&_p]:mt-1.5 first:[&_p]:mt-0 [&_a]:text-[#3d7bff] [&_h4]:text-white [&_h4]:border-white/10">
            {/* Three layers, in the order a booth conversation actually runs:
                the line you open with, the substance for when they ask more,
                and who this is really for. The CTA closes it. */}
            {product.plan && (
              <div>
                <span className="font-switch-reg block text-[10px] uppercase tracking-[0.15em] text-[#75808d]">Say this</span>
                <div className="mt-1 text-white"><RichText content={product.plan} /></div>
              </div>
            )}
            {product.description && (
              <div>
                <span className="font-switch-reg block text-[10px] uppercase tracking-[0.15em] text-[#75808d]">If they ask more</span>
                <div className="mt-1"><RichText content={product.description} /></div>
              </div>
            )}
            {product.useCases && (
              <div>
                <span className="font-switch-reg block text-[10px] uppercase tracking-[0.15em] text-[#75808d]">Who it's for</span>
                <p className="mt-1">{product.useCases}</p>
              </div>
            )}
            {!product.plan && !product.description && (
              <p className="text-[#75808d]">No talking points written yet.</p>
            )}
            {product.cta && <p className="font-semibold text-white">{product.cta}</p>}
          </div>
        )}
      </button>
    );
  };

  return (
    <div>
      <div className="flex min-h-[46px] items-center gap-2 rounded-xl border border-white/10 bg-gray-950/55 px-3 focus-within:border-[#0951fa]/65">
        <MagnifyingGlassIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-[#75808d]" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What did they just ask you?"
          aria-label="Search products and this show's resources"
          autoComplete="off"
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-white placeholder:text-[#75808d] focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="-mr-1 p-1 text-[#75808d]"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {!searching && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setQuery(example)}
              className="min-h-[32px] rounded-full border border-white/10 bg-white/[0.04] px-3 text-[12px] text-[#93a0b4]"
            >
              {example}
            </button>
          ))}
        </div>
      )}

      {showHits.length > 0 && (
        <>
          <p className="mt-4 font-switch-reg text-[10px] uppercase tracking-[0.15em] text-[#75808d]">This show</p>
          <div className="mt-2 space-y-2">
            {showHits.map((item) => (
              <div key={item.id} className="rounded-xl border border-white/10 bg-white/[0.045] p-3">
                <p className="text-[13.5px] font-semibold leading-[1.3] text-white">{item.title}</p>
                <p className="mt-1 text-[12px] leading-[1.4] text-[#93a0b4]">{item.detail}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {productHits.length > 0 && (
        <>
          <p className="mt-4 font-switch-reg text-[10px] uppercase tracking-[0.15em] text-[#75808d]">Products</p>
          <div className="mt-2 space-y-2">
            {productHits.map((product) => renderProduct(product))}
          </div>
          <button
            type="button"
            disabled={asking}
            onClick={() => ask(query.trim())}
            className="mt-2.5 inline-flex min-h-[36px] items-center gap-1.5 text-[12.5px] font-semibold text-[#93a0b4] disabled:opacity-60"
          >
            <SparklesIcon className="h-4 w-4 text-[#0951fa]" />
            {asking ? "Reading the question…" : "Not what you meant? Read the question"}
          </button>
        </>
      )}

      {asking && !productHits.length && (
        <p className="mt-4 text-[13px] text-[#93a0b4]">Reading the question…</p>
      )}

      {interpreted?.matches?.length > 0 && (
        <>
          <p className="mt-4 flex items-center gap-1.5 font-switch-reg text-[10px] uppercase tracking-[0.15em] text-[#0951fa]">
            <SparklesIcon className="h-3.5 w-3.5" /> Reading the question
          </p>
          <div className="mt-2 space-y-2">
            {interpreted.matches.map(({ product, reason }) => renderProduct(product, reason))}
          </div>
        </>
      )}

      {askError && <p role="alert" className="mt-3 text-[12.5px] text-[#ef4444]">{askError}</p>}

      {nothing && (
        <p className="mt-4 text-[13px] leading-[1.5] text-[#75808d]">
          {interpreted?.note
            ? interpreted.note
            : `Nothing for “${query.trim()}”. Try what the customer actually said.`}
        </p>
      )}

      {!searching && children && <div className="mt-5 space-y-5">{children}</div>}
    </div>
  );
}
