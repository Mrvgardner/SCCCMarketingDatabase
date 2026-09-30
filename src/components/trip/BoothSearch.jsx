import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatBubbleLeftIcon, DocumentTextIcon, MagnifyingGlassIcon, PhoneIcon, SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { listProducts } from "../../api/products";
import { askProductSearch, logSearch } from "../../api/productSearch";
import { downloadEventResourceFile } from "../../api/eventResources";
import RichText from "../RichText";
import { handoutsFor } from "../../data/collateral";
import { phoneLinkValue } from "../../utils/phone";

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

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// A hit on the name is what someone meant; a hit anywhere else is what they
// described. Names first.
// Then the phrase as typed: "bill break" should put the product that offers
// Bill Break above one that merely mentions "bill pay" and "break" apart.
function rank(title, haystack, terms) {
  const name = String(title || "").toLowerCase();
  // A term has to start a word in the name: "settle" finds Settlement, but
  // "TMS" is not a match for ATMs.
  if (terms.some((term) => new RegExp(`(^|[^a-z0-9])${escapeRegExp(term)}`).test(name))) return 0;
  if (terms.length > 1 && String(haystack || "").includes(terms.join(" "))) return 1;
  return 2;
}

// A hand-off card is an instruction, not one answer among several. When the
// search is plainly about its topic — by name, synonym or keyword, not a stray
// word deep in its text — it goes first, so the rep reads "walk them over"
// before anything else.
function rankProduct(product, terms) {
  const handsOff = product.handoff?.people?.length && product.handoff.hideDetails !== false;
  if (handsOff) {
    const named = `${product.title} ${product._synonymsTitle || ""} ${product._synonymsKeywords || ""} ${product.keywords || ""}`.toLowerCase();
    if (terms.every((term) => named.includes(term))) return -1;
  }
  // Synonyms are the other names a card goes by ("TMS" for Terminal
  // Management System), so a match on one counts as a match on the name —
  // just behind a card that has the word in its actual title.
  const byTitle = rank(product.title, product._searchBlob, terms);
  if (byTitle === 0 || !product._synonymsTitle) return byTitle;
  return Math.min(byTitle, rank(product._synonymsTitle, product._searchBlob, terms) + 0.5);
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
      detail: item.kind === "file" ? "Pinned document · tap to open" : `Know this cold${item.author ? ` · ${item.author}` : ""}`,
      haystack: `${item.text || ""} ${item.fileName || ""} ${item.author || ""}`.toLowerCase(),
      // A pinned document opens; a pinned note is the answer itself.
      file: item.kind === "file" ? { fileId: item.fileId, fileName: item.fileName } : null,
    }));
    const fromResources = (event.resources || []).map((resource, index) => ({
      id: `r-${index}`,
      title: resource.title,
      detail: resource.description || resource.type || "Resource",
      haystack: `${resource.title || ""} ${resource.description || ""} ${resource.type || ""}`.toLowerCase(),
      url: resource.url || null,
      file: !resource.url && (resource.fileId || resource.fileName) ? resource : null,
    }));
    return [...fromBriefing, ...fromResources];
  }, [briefing, event.resources]);

  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  const showHits = terms.length ? showItems.filter((item) => matches(item.haystack, terms)) : [];
  const productHits = terms.length
    ? products
        .filter((product) => matches(product._searchBlob || "", terms))
        .sort((a, b) => rankProduct(a, terms) - rankProduct(b, terms))
        .slice(0, 12)
    : [];

  const searching = terms.length > 0;
  const noKeywordHits = searching && !showHits.length && !productHits.length;

  const ask = useCallback(async (text) => {
    setAsking(true);
    setAskError("");
    try {
      const result = await askProductSearch(text);
      setAsked({ query: text, ...result });
      // The keyword pass found nothing (or wasn't what they meant); this is the
      // answer the question actually got, so this is the entry worth keeping.
      logSearch({ query: text, keywordHits: 0, interpretedHits: result.matches?.length || 0 });
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

  // A search that found something by keyword is logged once it settles. One
  // that found nothing is logged by the interpreted pass instead, with both
  // numbers, so a question is never counted twice.
  useEffect(() => {
    const text = query.trim();
    if (!searching || noKeywordHits || text.length < 3) return undefined;
    const timer = setTimeout(
      () => logSearch({ query: text, keywordHits: showHits.length + productHits.length, interpretedHits: null }),
      1500,
    );
    return () => clearTimeout(timer);
  }, [query, searching, noKeywordHits, showHits.length, productHits.length]);

  const interpreted = asked && asked.query === query.trim() ? asked : null;

  // What to physically hand the customer. Knowing the answer is half of it; the
  // other half is which sheet to pick up off the table. Driven by the cards the
  // search found, keyword hits first and the interpreted ones when there were
  // none, and limited to what is printed for this show.
  const found = productHits.length
    ? productHits
    : (interpreted?.matches || []).map((match) => match.product);
  const isHandoff = (product) => Boolean(product?.handoff?.people?.length) && product.handoff.hideDetails !== false;
  // A hand-off topic gets a person, not a sheet. When it is the best match,
  // nothing is offered to hand over; further down the results, it just does
  // not count towards what gets recommended.
  const handouts = !searching || isHandoff(found[0])
    ? []
    : handoutsFor(query, found.filter((product) => !isHandoff(product)).map((product) => product.title), { show: event.shortName });
  const nothing = noKeywordHits && !asking && interpreted && !interpreted.matches.length;

  // One card shape for both passes. An interpreted hit carries the extra line
  // saying why it came back, since it did not match on any word that was typed.
  //
  // Some topics are not the rep's to explain. A card with a `handoff` says so:
  // it gives the one line to open with and the people to walk the customer to,
  // and shows none of the detail, so nothing gets quoted that only those people
  // should say. That holds for interpreted hits too — the model's sentence is
  // dropped in favour of the hand-off.
  const renderProduct = (product, reason) => {
    const open = openId === product.id;
    const isSwitch = /switch/i.test(product.company || "");
    const handoff = product.handoff?.people?.length && product.handoff.hideDetails !== false ? product.handoff : null;
    const firstNames = handoff ? handoff.people.map((name) => name.split(" ")[0]) : [];
    const nameList = firstNames.length > 1
      ? `${firstNames.slice(0, -1).join(", ")}, or ${firstNames[firstNames.length - 1]}`
      : firstNames[0];

    return (
      <div
        key={product.id}
        className={`rounded-xl border bg-white/[0.045] ${handoff ? "border-[#f59e0b]/35" : "border-white/10"}`}
      >
        <button
          type="button"
          onClick={() => setOpenId(open ? null : product.id)}
          aria-expanded={open}
          className="block w-full p-3 text-left"
        >
          <span className="flex items-center gap-2">
            <span className="min-w-0 flex-1 text-[13.5px] font-semibold leading-[1.3] text-white">
              {product.title}
            </span>
            <Badge tone={isSwitch ? "switch" : "choice"}>{isSwitch ? "Switch" : "Clear Choice"}</Badge>
          </span>
          {handoff ? (
            <span className="mt-1.5 block text-[12.5px] font-semibold leading-[1.4] text-[#f59e0b]">
              Hand off to {nameList}
            </span>
          ) : reason ? (
            <span className="mt-1.5 block text-[12.5px] leading-[1.4] text-[#cbd5e3]">{reason}</span>
          ) : (
            product.problem && (
              // problem/plan/description are edited through the site's rich-text
              // editor and stored as HTML — RichText sanitizes and renders it.
              <span className="mt-1.5 block text-[12.5px] leading-[1.4] text-[#93a0b4]">
                <RichText content={product.problem} />
              </span>
            )
          )}
        </button>

        {open && handoff && (
          <div className="space-y-3 border-t border-white/[0.07] px-3 pb-3 pt-2.5 text-[12.5px] leading-[1.5] text-[#cbd5e3]">
            <div>
              <span className="font-switch-reg block text-[10px] uppercase tracking-[0.15em] text-[#75808d]">Say this</span>
              <p className="mt-1 text-[14px] leading-[1.45] text-white">“{handoff.line}”</p>
            </div>
            <div>
              <span className="font-switch-reg block text-[10px] uppercase tracking-[0.15em] text-[#75808d]">Then walk them to</span>
              <ul className="mt-1.5 space-y-1.5">
                {handoff.people.map((name) => {
                  // Only people on this show's roster can be walked to. Anyone
                  // else is named, so the rep knows, but marked as not here.
                  const here = (event.travelingTeam || []).some((member) => member.toLowerCase() === name.toLowerCase());
                  const phone = here ? event.teamContacts?.[name]?.phone : "";
                  const dial = phone ? phoneLinkValue(phone) : "";
                  return (
                    <li key={name} className="flex min-h-[44px] items-center gap-2">
                      <span className={`min-w-0 flex-1 text-[13.5px] font-semibold ${here ? "text-white" : "text-[#75808d]"}`}>
                        {name}
                        {!here && <span className="font-normal"> · not at this show</span>}
                      </span>
                      {dial && (
                        <>
                          <a
                            href={`tel:${dial}`}
                            aria-label={`Call ${name}`}
                            className="grid h-10 w-10 place-items-center rounded-lg bg-white/[0.06] text-white"
                          >
                            <PhoneIcon className="h-4 w-4" />
                          </a>
                          <a
                            href={`sms:${dial}`}
                            aria-label={`Message ${name}`}
                            className="grid h-10 w-10 place-items-center rounded-lg bg-white/[0.06] text-white"
                          >
                            <ChatBubbleLeftIcon className="h-4 w-4" />
                          </a>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
            {handoff.note && (
              <p className="rounded-lg border border-[#f59e0b]/25 bg-[#f59e0b]/[0.07] px-2.5 py-2 text-[12px] leading-[1.45] text-[#f5c37b]">
                {handoff.note}
              </p>
            )}
          </div>
        )}

        {open && !handoff && (
          <div className="space-y-3 border-t border-white/[0.07] px-3 pb-3 pt-2.5 text-[12.5px] leading-[1.5] text-[#cbd5e3] [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mt-1 [&_li_strong]:text-white [&_p]:mt-1.5 first:[&_p]:mt-0 [&_a]:text-[#3d7bff] [&_h4]:text-white [&_h4]:border-white/10">
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
      </div>
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
            {showHits.map((item) => {
              const inner = (
                <>
                  <span className="block text-[13.5px] font-semibold leading-[1.3] text-white">{item.title}</span>
                  <span className="mt-1 block text-[12px] leading-[1.4] text-[#93a0b4]">{item.detail}</span>
                </>
              );
              const cardClass = "block w-full rounded-xl border border-white/10 bg-white/[0.045] p-3 text-left";
              if (item.url) {
                return (
                  <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className={cardClass}>
                    {inner}
                  </a>
                );
              }
              if (item.file) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => downloadEventResourceFile(event.id, item.file).catch(() => {})}
                    className={cardClass}
                  >
                    {inner}
                  </button>
                );
              }
              return <div key={item.id} className={cardClass}>{inner}</div>;
            })}
          </div>
        </>
      )}

      {handouts.length > 0 && (
        <>
          <p className="mt-4 flex items-center gap-1.5 font-switch-reg text-[10px] uppercase tracking-[0.15em] text-[#10b981]">
            <DocumentTextIcon className="h-3.5 w-3.5" /> Hand them this
          </p>
          <div className="mt-2 space-y-2">
            {handouts.map(({ item, forCard }) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-[#10b981]/25 bg-[#10b981]/[0.06] p-2.5"
              >
                {/* The cover, because at the table people find a sheet by what
                    it looks like, not by what it is called. */}
                <img
                  src={item.thumbnail}
                  alt=""
                  width="44"
                  height="58"
                  loading="lazy"
                  className="h-[58px] w-[44px] shrink-0 rounded object-cover object-top"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-semibold leading-[1.3] text-white">{item.shortName || item.name}</span>
                  <span className="mt-0.5 block text-[12px] leading-[1.4] text-[#93a0b4]">
                    {[item.kind, item.audience ? `for ${item.audience}` : null, forCard && forCard !== item.products?.[0] ? `covers ${forCard}` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <span className="shrink-0 pr-1 text-[12px] font-semibold text-[#10b981]">View</span>
              </a>
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
