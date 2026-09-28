import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { COLLATERAL_SECTIONS, archivedCollateral, currentCollateral } from '../data/collateral';

export default function PrintCollateralPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Print Collateral - Switch Commerce';
  }, []);

  // The list itself lives in src/data/collateral.js, shared with booth search,
  // so a piece added there appears here and becomes recommendable in one step.
  const collateral = COLLATERAL_SECTIONS.map((category) => ({
    category,
    items: currentCollateral.filter((item) => item.section === category),
  })).filter((section) => section.items.length > 0);

  // Superseded pieces. Kept reachable because people still get asked for "the
  // old one", and because links to them are already out in the world — but
  // behind a toggle, so nobody hands out last year's sheet by accident. To
  // retire a document, move it to the Archive section in collateral.js and say
  // what replaced it.
  const archived = archivedCollateral;
  const [showArchive, setShowArchive] = useState(false);

  const fallbackThumb = 'data:image/svg+xml,%3Csvg width="96" height="128" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="96" height="128" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="48" fill="%239ca3af" text-anchor="middle" dy=".3em"%3E📄%3C/text%3E%3C/svg%3E';

  const renderCard = (item, key, isArchived = false) => (
    <a
      key={key}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group rounded-xl overflow-hidden border shadow-xl hover:shadow-2xl backdrop-blur-md transition-all duration-300 ${
        isArchived
          ? "bg-gray-900/60 border-white/10 hover:border-white/25"
          : "bg-gradient-to-br from-[#0951fa]/30 from-0% via-[#0951fa]/5 via-45% to-gray-900/70 to-100% border-white/10 hover:border-[#0951fa]/50"
      }`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className={`flex-shrink-0 w-20 h-28 sm:w-24 sm:h-32 rounded-lg overflow-hidden shadow-md ${isArchived ? "opacity-60 grayscale" : ""}`}>
            <img
              src={item.thumbnail}
              alt={`${item.name} cover`}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              width="96"
              height="128"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackThumb;
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            {isArchived && (
              <span className="mb-2 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-300">
                Archived
              </span>
            )}
            <h3 className={`text-lg font-semibold transition-colors mb-2 ${isArchived ? "text-gray-200 group-hover:text-white" : "text-white group-hover:text-[#0a7cff]"}`}>
              {item.name}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {item.description}
            </p>
            {isArchived && item.replacedBy && (
              <p className="text-sm text-[#f59e0b] mb-3">Replaced by {item.replacedBy}</p>
            )}
            <div className={`flex items-center font-medium group-hover:underline ${isArchived ? "text-gray-300" : "text-[#0a7cff]"}`}>
              <span>View PDF</span>
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </a>
  );

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <div className="py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="font-switch-bold text-3xl sm:text-4xl md:text-5xl mb-4 bg-gradient-to-r from-[#0951fa] to-[#ff4f00] bg-clip-text text-transparent">Print Collateral</h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-3xl">
            Access the latest brochures, one-pagers, and marketing materials for Switch Commerce and Clear Choice.
          </p>

        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {collateral.map((section, idx) => (
          <div key={idx} className="mb-16">
            <h2 className="font-switch-bold text-2xl mb-6 text-white border-b border-white/10 pb-3">
              {section.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((item, itemIdx) => renderCard(item, itemIdx))}
            </div>
          </div>
        ))}

        {archived.length > 0 && (
          <div className="border-t border-white/10 pt-8">
            <button
              type="button"
              onClick={() => setShowArchive((open) => !open)}
              aria-expanded={showArchive}
              aria-controls="collateral-archive"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-semibold text-gray-300 transition-colors hover:border-white/30 hover:text-white"
            >
              <svg className={`w-4 h-4 transition-transform ${showArchive ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {showArchive ? "Hide" : "Show"} archived documents ({archived.length})
            </button>

            {showArchive && (
              <div id="collateral-archive" className="mt-8">
                <h2 className="font-switch-bold text-2xl mb-2 text-white">Archive</h2>
                <p className="mb-6 max-w-3xl text-sm text-gray-400">
                  Older versions, kept for reference. Each has been replaced, so please send the current one to customers.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {archived.map((item, itemIdx) => renderCard(item, `archived-${itemIdx}`, true))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
