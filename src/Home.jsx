import { useState, useEffect } from "react";
import { BookOpenIcon, DocumentTextIcon, NewspaperIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { listFieldNotes } from "./api/fieldNotes";
import GlobalSearch from "./components/GlobalSearch.jsx";
import { extractFirstImage } from "./utils/extractFirstImage";

const externalTools = [
  { name: "Slack", icon: "/logos/slack-logo.png", url: "https://switch-commerce.slack.com/" },
  { name: "Assembly", icon: "/logos/assembly-logo.png", url: "https://app.joinassembly.com/" },
  { name: "BambooHR", icon: "/logos/bamboohr-logo.png", url: "https://switch.bamboohr.com/home/" },
  { name: "Jira", icon: "/logos/jira-logo.png", url: "https://switchcommerce.atlassian.net/jira/your-work" },
  { name: "Confluence", icon: "/logos/confluence-logo.webp", url: "https://switchcommerce.atlassian.net/wiki/home" },
];

const FloatingTile = ({ delay = 0, className = "", children }) => (
  <div
    className={`opacity-0 translate-y-8 animate-slide-in transform transition duration-300 hover:scale-105 hover:shadow-2xl ${className}`}
    style={{ animationDelay: `${delay}s`, animationFillMode: 'forwards' }}
  >
    {children}
  </div>
);

export default function Home() {
  const [latestFieldNote, setLatestFieldNote] = useState(null);
  const [hasUnreadNote, setHasUnreadNote] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listFieldNotes()
      .then((notes) => {
        if (cancelled) return;
        const latest = notes[0] || null;
        setLatestFieldNote(latest);
        if (latest?.date) {
          const lastSeen = localStorage.getItem('fieldNotes_lastSeenDate');
          setHasUnreadNote(!lastSeen || latest.date > lastSeen);
        }
      })
      .catch(() => {});
    const onRead = () => setHasUnreadNote(false);
    window.addEventListener('fieldNotesRead', onRead);
    return () => {
      cancelled = true;
      window.removeEventListener('fieldNotesRead', onRead);
    };
  }, []);

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 sm:p-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto text-center mb-6">
        <h1 className="font-switch-bold text-3xl sm:text-4xl md:text-5xl tracking-wide mb-2 bg-gradient-to-r from-[#0951fa] from-10% via-[#0951fa] via-30% to-[#ff4f00] to-80% bg-clip-text text-transparent">
          Team Switch Commerce
        </h1>
        <h2 className="font-switch-reg text-lg md:text-xl tracking-[0.2em] text-gray-300">
          <span className="animate-slide-in inline-block">One Team.</span>
          {" "}
          <span className="animate-slide-in-delayed inline-block opacity-0">One Goal.</span>
        </h2>
      </div>

      {/* Global Search */}
      <div className="mb-8 px-4">
        <GlobalSearch />
      </div>

      {/* Quick Tools Section */}
      <div className="mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Field Notes - tall card, middle column, spans 2 rows on lg */}
          <FloatingTile delay={0} className="lg:col-start-2 lg:row-start-1 lg:row-span-2">
            <Link
              to="/field-notes"
              className="block rounded-xl p-6 bg-gradient-to-br from-[#5fae4b]/60 from-0% via-[#5fae4b]/10 via-45% to-gray-900/70 to-100% border border-[#5fae4b]/25 hover:border-[#5fae4b]/50 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl backdrop-blur-md h-full"
            >
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <NewspaperIcon className="h-6 w-6 text-white" />
                  <h3 className="text-2xl font-bold text-white">Field Notes</h3>
                  {hasUnreadNote && (
                    <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500 text-white">
                      New
                    </span>
                  )}
                </div>
                {latestFieldNote ? (
                  <>
                    {(() => {
                      const cover = extractFirstImage(latestFieldNote.content);
                      return cover ? (
                        <div className="mb-4 -mx-2 rounded-lg overflow-hidden aspect-video bg-black/20">
                          <img
                            src={cover}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : null;
                    })()}
                    <div className="text-xs text-white/70 mb-2 uppercase tracking-wide">Latest</div>
                    <div className="text-white/80 text-sm mb-2">
                      {new Date(latestFieldNote.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-3">
                      {latestFieldNote.title}
                    </h4>
                    <p className="text-white/90 text-sm leading-relaxed mb-4 line-clamp-5">
                      {latestFieldNote.excerpt}
                    </p>
                    <div className="mt-auto pt-4 border-t border-white/20 text-white/80 text-sm font-medium">
                      Read more →
                    </div>
                  </>
                ) : (
                  <p className="text-white/80 text-sm">No field notes yet.</p>
                )}
              </div>
            </Link>
          </FloatingTile>

          {/* Switch Commerce - right column, top */}
          <FloatingTile delay={0.1} className="lg:col-start-3 lg:row-start-1">
            <div className="rounded-xl p-6 bg-gradient-to-br from-[#0951fa]/60 from-0% via-[#0951fa]/10 via-45% to-gray-900/70 to-100% border border-[#0951fa]/25 hover:border-[#0951fa]/50 transition-all duration-300 shadow-xl hover:shadow-2xl backdrop-blur-md h-full min-h-[180px]">
              <h3 className="text-2xl font-bold text-white mb-4">Switch Commerce</h3>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/print-collateral" className="flex items-center justify-center text-center px-3 py-3 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 rounded-lg transition-colors text-white/90 hover:text-white text-sm font-medium">
                  Brochures & Flyers
                </Link>
                <Link to="/switch-commerce/branding" className="flex items-center justify-center text-center px-3 py-3 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 rounded-lg transition-colors text-white/90 hover:text-white text-sm font-medium">
                  Brand Guidelines
                </Link>
                <Link to="/email-signature" className="flex items-center justify-center text-center px-3 py-3 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 rounded-lg transition-colors text-white/90 hover:text-white text-sm font-medium">
                  Email Signatures
                </Link>
                <div
                  aria-disabled="true"
                  className="flex flex-col items-center justify-center text-center px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg text-white/40 text-sm font-medium cursor-not-allowed select-none leading-tight"
                >
                  <span>Slide Decks</span>
                  <span className="text-[9px] uppercase tracking-wider text-white/40 mt-0.5">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </FloatingTile>

          {/* Knowledge Base - left column, top */}
          <FloatingTile delay={0.2} className="lg:col-start-1 lg:row-start-1">
            <Link
              to="/products"
              className="block rounded-xl p-6 bg-gradient-to-br from-[#0951fa]/60 from-0% via-[#0951fa]/10 via-45% to-gray-900/70 to-100% border border-[#0951fa]/25 hover:border-[#0951fa]/50 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl backdrop-blur-md h-full min-h-[180px]"
            >
              <div className="h-full flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <BookOpenIcon className="h-7 w-7 text-white flex-shrink-0" />
                  <h3 className="text-2xl font-bold text-white">Knowledge Base</h3>
                </div>
                <div>
                  <div className="text-white text-base font-semibold leading-snug">
                    One Team. One Goal. One Voice.
                  </div>
                  <div className="text-white/75 text-xs mt-1">
                    Products, use cases & sales resources →
                  </div>
                </div>
              </div>
            </Link>
          </FloatingTile>

          {/* Clear Choice - right column, bottom */}
          <FloatingTile delay={0.3} className="lg:col-start-3 lg:row-start-2">
            <div className="rounded-xl p-6 bg-gradient-to-br from-[#ff4f00]/55 from-0% via-[#ff4f00]/10 via-45% to-gray-900/70 to-100% border border-[#ff4f00]/25 hover:border-[#ff4f00]/50 transition-all duration-300 shadow-xl hover:shadow-2xl backdrop-blur-md h-full min-h-[180px]">
              <h3 className="text-2xl font-bold text-white mb-4">Clear Choice</h3>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/print-collateral" className="flex items-center justify-center text-center px-3 py-3 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 rounded-lg transition-colors text-white/90 hover:text-white text-sm font-medium">
                  Brochures & Flyers
                </Link>
                <Link to="/clear-choice/branding" className="flex items-center justify-center text-center px-3 py-3 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 rounded-lg transition-colors text-white/90 hover:text-white text-sm font-medium">
                  Brand Guidelines
                </Link>
                <Link to="/wallpapers" className="flex items-center justify-center text-center px-3 py-3 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 rounded-lg transition-colors text-white/90 hover:text-white text-sm font-medium">
                  Wallpapers
                </Link>
                <div
                  aria-disabled="true"
                  className="flex flex-col items-center justify-center text-center px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg text-white/40 text-sm font-medium cursor-not-allowed select-none leading-tight"
                >
                  <span>Slide Decks</span>
                  <span className="text-[9px] uppercase tracking-wider text-white/40 mt-0.5">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </FloatingTile>

          {/* Marketing Request - left column, bottom */}
          <FloatingTile delay={0.4} className="lg:col-start-1 lg:row-start-2">
            <Link
              to="/marketing-request"
              className="block rounded-xl p-6 bg-gradient-to-br from-[#ff4f00]/55 from-0% via-[#ff4f00]/10 via-45% to-gray-900/70 to-100% border border-[#ff4f00]/25 hover:border-[#ff4f00]/50 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl backdrop-blur-md h-full min-h-[180px]"
            >
              <div className="h-full flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="h-7 w-7 text-white flex-shrink-0" />
                  <h3 className="text-2xl font-bold text-white">Marketing Request</h3>
                </div>
                <div>
                  <div className="text-white text-base font-semibold leading-snug">
                    Shaping the message behind your momentum.
                  </div>
                  <div className="text-white/75 text-xs mt-1">
                    Flyers, emails, or campaign assets →
                  </div>
                </div>
              </div>
            </Link>
          </FloatingTile>
        </div>

        {/* External tools row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
          {externalTools.map((tool, i) => (
            <FloatingTile key={tool.name} delay={0.5 + i * 0.05}>
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                title={tool.name}
                aria-label={tool.name}
                className="group inline-flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-gray-900/40 border border-white/10 hover:border-white/25 hover:bg-gray-900/60 backdrop-blur-md shadow-md hover:shadow-lg transition-all"
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white shadow-sm">
                  <img
                    src={tool.icon}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width="28"
                    height="28"
                    className="w-5 h-5 object-contain"
                  />
                </span>
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                  {tool.name}
                </span>
              </a>
            </FloatingTile>
          ))}
        </div>
      </div>

    </div>
  );
}
