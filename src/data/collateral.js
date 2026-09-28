// Every printed piece, in one place.
//
// The print collateral page lists these, and booth search recommends from them,
// so both read this file. Adding a piece here puts it on the page and makes it
// something search can tell a rep to hand over.
//
//   products    knowledge base cards this piece is *about*. A search that lands
//               on one of these cards recommends the piece.
//   alsoCovers  cards the piece touches on without being about them. Used only
//               when nothing more specific exists, so a question about vault
//               cash still ends with something to hand over.
//   audience    who to give it to, when two pieces cover the same product.
//   topics      words a customer might use that are not in the title.
//   shows       which shows the piece goes to, by the event's short name. Left
//               off, it goes to every show. The kiosk has two pieces for two
//               crowds: operators at NAC get the one-pager, store owners at
//               NACS get the brochure.
//   atBooth     printed and on the table at shows. Search only recommends
//               these; the rest are on the collateral page for reference.
//   replacedBy  set on archived pieces.

export const collateral = [
  {
    id: "kiosk-brochure",
    section: "Brochures",
    kind: "Brochure",
    company: "Clear Choice",
    name: "MultiFunction Kiosk Brochure - 2026",
    shortName: "MultiFunction Kiosk brochure",
    description: "Eight-page Clear Choice brochure for convenience stores: ATM, Bill Break, Cash Advance, ticket redemption, Cash to Card, and the staff Business Center",
    url: "/brochures/MultiFunction-Kiosk-Brochure.pdf",
    thumbnail: "/brochures/thumbnails/MultiFunction-Kiosk-Brochure.webp?v=2",
    products: ["MultiFunction Kiosk"],
    audience: "Store owners",
    shows: ["NACS"],
    topics: "kiosk c-store convenience store bill break cash advance ticket redemption tito cash to card business center gaming skill games",
    atBooth: true,
  },
  {
    id: "combined-brochure",
    section: "Brochures",
    kind: "Brochure",
    company: "Both",
    name: "Switch Commerce & Clear Choice Brochure - 2026",
    shortName: "Combined company brochure",
    description: "Combined company brochure featuring both Switch Commerce and Clear Choice",
    url: "/brochures/SwitchCommerceClearChoiceBrochure.pdf",
    thumbnail: "/brochures/thumbnails/switch-clearchoice-thumb.webp?v=2",
    products: [],
    atBooth: false,
  },
  {
    id: "sc-brochure-2025",
    section: "Brochures",
    kind: "Brochure",
    company: "Switch Commerce",
    name: "Switch Commerce Brochure - 2025",
    shortName: "Switch Commerce brochure",
    description: "Switch Commerce payment processing solutions and services",
    url: "/brochures/switch-brochure.pdf",
    thumbnail: "/brochures/thumbnails/switch-thumb.webp?v=2",
    products: [],
    atBooth: false,
  },
  {
    id: "cc-brochure-2025",
    section: "Brochures",
    kind: "Brochure",
    company: "Clear Choice",
    name: "Clear Choice Brochure - 2025",
    shortName: "Clear Choice brochure",
    description: "Clear Choice merchant services and payment solutions",
    url: "/brochures/clearchoice-brochure.pdf",
    thumbnail: "/brochures/thumbnails/clearchoice-thumb.webp?v=2",
    products: [],
    atBooth: false,
  },

  {
    id: "sc-overview",
    section: "Switch Commerce One-Pagers",
    kind: "One-pager",
    company: "Switch Commerce",
    name: "Company Overview - Fall 2026",
    shortName: "Switch Commerce overview one-pager",
    description: "Switch to the best: ATM processing, vault cash, settlement, and the tools behind them",
    url: "/pdfs/SC-Overview-One-Pager.pdf",
    thumbnail: "/pdfs/thumbnails/SC-Overview-One-Pager.webp",
    products: ["Switch Commerce Overview"],
    alsoCovers: ["ATM Processing", "Fast Settlement", "Vault Cash", "Data Security", "Electronic Journal", "Automated Reversals"],
    topics: "switch commerce company overview about processing uptime settlement vault cash security pci certifications mission",
    atBooth: true,
  },
  {
    id: "sc-tms",
    section: "Switch Commerce One-Pagers",
    kind: "One-pager",
    company: "Switch Commerce",
    name: "Terminal Management System - Fall 2026",
    shortName: "TMS one-pager",
    description: "One screen, full portfolio: terminals, cash, money, and people in real time",
    url: "/pdfs/SC-TMS-One-Pager.pdf",
    thumbnail: "/pdfs/thumbnails/SC-TMS-One-Pager.webp",
    products: ["Terminal Management System", "Mobile TMS"],
    topics: "tms terminal management mobile app reporting real-time terminal ids forecasting alerts user access portfolio",
    atBooth: true,
  },
  {
    id: "sc-international",
    section: "Switch Commerce One-Pagers",
    kind: "One-pager",
    company: "Switch Commerce",
    name: "International Transactions - Fall 2026",
    shortName: "International Transactions one-pager",
    description: "Dynamic Currency Conversion: turning cross-border traffic into revenue",
    url: "/pdfs/SC-International-One-Pager.pdf",
    thumbnail: "/pdfs/thumbnails/SC-International-One-Pager.webp",
    products: ["Dynamic Currency Conversion", "International Surcharge"],
    topics: "international dcc dynamic currency conversion surcharge foreign cards fx interchange tourists airports cross-border",
    atBooth: true,
  },

  {
    id: "cc-overview",
    section: "Clear Choice One-Pagers",
    kind: "One-pager",
    company: "Clear Choice",
    name: "Company Overview - Fall 2026",
    shortName: "Clear Choice overview one-pager",
    description: "Payments without limits: ATMs, cash, merchant services, and kiosks",
    url: "/pdfs/CC-Overview-One-Pager.pdf",
    thumbnail: "/pdfs/thumbnails/CC-Overview-One-Pager.webp",
    products: ["Clear Choice Overview"],
    alsoCovers: ["ATM Placement", "Affiliate Program", "Cash Management", "Merchant Services", "Foreign Exchange", "Billboard", "Reliable Equipment", "Expert Servicing"],
    topics: "clear choice company overview about placement affiliate merchant services high-risk advertising equipment servicing",
    atBooth: true,
  },
  {
    id: "cc-kiosk",
    section: "Clear Choice One-Pagers",
    kind: "One-pager",
    company: "Clear Choice",
    name: "MultiFunction Kiosk - Fall 2026",
    shortName: "MultiFunction Kiosk one-pager",
    description: "One kiosk, multiple lines of revenue: the partner program for IADs and ISOs",
    url: "/pdfs/CC-MultiFunction-Kiosk-One-Pager.pdf",
    thumbnail: "/pdfs/thumbnails/CC-MultiFunction-Kiosk-One-Pager.webp",
    products: ["MultiFunction Kiosk"],
    audience: "IADs and ISOs",
    shows: ["NAC"],
    topics: "kiosk partner program portfolio bill break cash advance ticket redemption tito cash to card business center gaming fleet",
    atBooth: true,
  },
  {
    id: "cc-watchdog",
    section: "Clear Choice One-Pagers",
    kind: "One-pager",
    company: "Clear Choice",
    name: "Watchdog - Fall 2026",
    shortName: "Watchdog one-pager",
    description: "Monitoring that never sleeps: 24/7 monitoring, security, and support",
    url: "/pdfs/CC-Watchdog-One-Pager.pdf",
    thumbnail: "/pdfs/thumbnails/CC-Watchdog-One-Pager.webp",
    products: ["Watchdog"],
    topics: "watchdog monitoring security tampering jackpotting skimming malware fraud downtime modem uptime remote",
    atBooth: true,
  },
  {
    id: "cc-stashpoint",
    section: "Clear Choice One-Pagers",
    kind: "One-pager",
    company: "Clear Choice",
    name: "StashPoint Cash Recycler - Fall 2026",
    shortName: "StashPoint one-pager",
    description: "We put the bank in your store: the cash recycling kiosk powered by ATEC America",
    url: "/pdfs/CC-StashPoint-ATEC-One-Pager.pdf",
    thumbnail: "/pdfs/thumbnails/CC-StashPoint-ATEC-One-Pager.webp",
    products: ["StashPoint Cash Recycler"],
    topics: "stashpoint cash recycler recycling atec deposit armored car bank",
    atBooth: true,
  },

  {
    id: "cc-watchdog-old",
    section: "Archive",
    kind: "One-pager",
    company: "Clear Choice",
    name: "Watchdog One-Page - 2026",
    description: "Clear Choice WatchDog monitoring and security services",
    url: "/pdfs/CC-WatchDogOnline.pdf",
    thumbnail: "/pdfs/thumbnails/watchdog-thumb.webp",
    products: [],
    atBooth: false,
    replacedBy: "Watchdog - Fall 2026",
  },
  {
    id: "cc-recycler-old",
    section: "Archive",
    kind: "One-pager",
    company: "Clear Choice",
    name: "Cash Recycler One-Page - 2026",
    description: "ATEC Cash Recycler solutions for efficient cash management",
    url: "/pdfs/Cash_Reccler.pdf",
    thumbnail: "/pdfs/thumbnails/atec-thumb.webp",
    products: [],
    atBooth: false,
    replacedBy: "StashPoint Cash Recycler - Fall 2026",
  },
];

export const COLLATERAL_SECTIONS = ["Brochures", "Switch Commerce One-Pagers", "Clear Choice One-Pagers"];

export const currentCollateral = collateral.filter((item) => item.section !== "Archive");
export const archivedCollateral = collateral.filter((item) => item.section === "Archive");

// What to hand a customer, given what was searched and which cards came back.
//
// A piece that is about the very thing typed comes first. After that, pieces
// about the cards the search found, best card first. Overview sheets come last
// and only when nothing more specific turned up, so "vault cash" still ends
// with something to hand over but "watchdog" is not padded with an overview.
export function handoutsFor(query, productTitles = [], { limit = 3, show = "" } = {}) {
  const terms = String(query || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];

  const atShow = String(show || "").trim().toUpperCase();
  const scored = [];
  for (const item of collateral) {
    if (!item.atBooth) continue;
    // A piece printed for one show is not on the table at another.
    if (item.shows && atShow && !item.shows.includes(atShow)) continue;
    const own = `${item.name} ${item.shortName || ""} ${item.topics || ""}`.toLowerCase();
    let score = Infinity;
    let forCard = "";

    if (terms.every((term) => own.includes(term))) score = 0;

    productTitles.slice(0, 4).forEach((title, index) => {
      if ((item.products || []).includes(title) && 1 + index * 0.1 < score) {
        score = 1 + index * 0.1;
        forCard = title;
      }
    });
    productTitles.slice(0, 3).forEach((title, index) => {
      if ((item.alsoCovers || []).includes(title) && 3 + index * 0.1 < score) {
        score = 3 + index * 0.1;
        forCard = title;
      }
    });

    // An overview sheet is a fallback unless it is the best answer: asked for
    // by name, or belonging to the top card. Its card appearing further down the
    // results is not a reason to hand it over next to something specific.
    const overview = (item.alsoCovers || []).length > 0;
    if (overview && score > 1 && score < 3) score += 2;

    if (score !== Infinity) scored.push({ item, score, forCard, specific: score < 3 });
  }

  scored.sort((a, b) => a.score - b.score);
  const specific = scored.filter((entry) => entry.specific);
  return (specific.length ? specific : scored).slice(0, limit);
}
