import { useState, useEffect } from "react";
import { DocumentIcon, PhotoIcon, BookOpenIcon, DocumentTextIcon, CakeIcon, SparklesIcon, NewspaperIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { listFieldNotes } from "./api/fieldNotes";
import { birthdays, anniversaries } from "./data/celebrations";
import { getUpcoming, formatDate, yearsOfService } from "./utils/celebrations";

const externalTools = [
  { name: "Slack", icon: "/logos/slack-logo.png", url: "https://switch-commerce.slack.com/" },
  { name: "Assembly", icon: "/logos/assembly-logo.png", url: "https://app.joinassembly.com/" },
  { name: "BambooHR", icon: "/logos/bamboohr-logo.png", url: "https://switch.bamboohr.com/home/" },
  { name: "Jira", icon: "/logos/jira-logo.png", url: "https://switchcommerce.atlassian.net/jira/your-work" },
  { name: "Confluence", icon: "/logos/confluence-logo.jpg", url: "https://switchcommerce.atlassian.net/wiki/home" },
];

const resources = [
  {
    name: "Email Signature",
    type: "resource",
    url: "/email-signature",
    description: "Download your branded email signature",
    color: "bg-gradient-to-br from-[#0951fa]/60 from-0% via-[#0951fa]/10 via-45% to-gray-900/70 to-100% border border-[#0951fa]/25 hover:border-[#0951fa]/50",
    icon: "document",
  },
  {
    name: "Wallpapers",
    type: "download",
    url: "/wallpapers",
    description: "Branded desktop and mobile wallpapers",
    color: "bg-gradient-to-br from-[#ff4f00]/55 from-0% via-[#ff4f00]/10 via-45% to-gray-900/70 to-100% border border-[#ff4f00]/25 hover:border-[#ff4f00]/50",
    icon: "photo",
  },
  {
    name: "Brochures & Flyers",
    type: "resource",
    url: "/print-collateral",
    description: "Access the latest brochures and one-pagers",
    color: "bg-gradient-to-br from-[#9333ea]/55 from-0% via-[#9333ea]/10 via-45% to-gray-900/70 to-100% border border-[#9333ea]/25 hover:border-[#9333ea]/50",
    icon: "document-text",
  },
];

const FloatingTile = ({ delay = 0, className = "", children }) => (
  <div
    className={`opacity-0 translate-y-8 animate-slide-in transform transition duration-300 hover:scale-105 hover:shadow-2xl ${className}`}
    style={{ animationDelay: `${delay}s`, animationFillMode: 'forwards' }}
  >
    {children}
  </div>
);

// Section separator component
const SectionSeparator = () => (
  <div className="max-w-5xl mx-auto my-16">
    <div className="h-px bg-gradient-to-r from-transparent via-gray-500/30 to-transparent"></div>
  </div>
);

// Add fade-in animation to global CSS (index.css or here)
// In index.css, add:
/*
@keyframes fade-in {
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fade-in 0.8s ease forwards;
}
*/

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("all");
  const sections = ["All", "Branding Assets", "Resources"];
  const isVisible = (section) => activeFilter === "all" || activeFilter === section.toLowerCase();

  const [latestFieldNote, setLatestFieldNote] = useState(null);
  const upcomingBirthdays = getUpcoming(birthdays, 3);
  const upcomingAnniversaries = getUpcoming(anniversaries, 3);

  useEffect(() => {
    let cancelled = false;
    listFieldNotes()
      .then((notes) => !cancelled && setLatestFieldNote(notes[0] || null))
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto text-center mb-6">
        <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-[#0951fa] from-10% via-[#0951fa] via-30% to-[#ff4f00] to-80% bg-clip-text text-transparent">
          Team Switch Commerce
        </h1>
        <h2 className="text-lg md:text-xl font-medium text-gray-300">
          <span className="animate-slide-in inline-block">One Team.</span>
          {" "}
          <span className="animate-slide-in-delayed inline-block opacity-0">One Goal.</span>
        </h2>
      </div>

      {/* Section Navigation */}
      <div className="flex justify-center gap-4 mb-12">
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => setActiveFilter(section.toLowerCase())}
            className={`px-6 py-2 rounded-full transition-all duration-300 ${
              activeFilter === section.toLowerCase()
                ? "bg-[#0951fa] text-white shadow-lg shadow-[#0951fa]/30"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      {(activeFilter === "all" || (
        (isVisible("quick tools") || isVisible("branding assets") || isVisible("resources"))
      )) && <SectionSeparator />}

      {/* Quick Tools Section */}
      <div
        className={`mb-16 ${isVisible("quick tools") ? "block" : "hidden"}`}
      >
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
                </div>
                {latestFieldNote ? (
                  <>
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

          {/* Upcoming Birthdays - right column, top */}
          <FloatingTile delay={0.1} className="lg:col-start-3 lg:row-start-1">
            <Link
              to="/birthdays"
              className="block rounded-xl p-6 bg-gradient-to-br from-[#ff4f00]/55 from-0% via-[#ff4f00]/10 via-45% to-gray-900/70 to-100% border border-[#ff4f00]/25 hover:border-[#ff4f00]/50 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl backdrop-blur-md h-full min-h-[180px]"
            >
              <div className="h-full flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <CakeIcon className="h-7 w-7 text-white flex-shrink-0" />
                  <h3 className="text-2xl font-bold text-white">Upcoming Birthdays</h3>
                </div>
                {upcomingBirthdays.length > 0 ? (
                  <ul className="space-y-1.5">
                    {upcomingBirthdays.slice(0, 3).map((b) => (
                      <li key={b.name} className="flex items-center justify-between text-white/95 text-sm">
                        <span className="font-medium truncate pr-2">{b.name}</span>
                        <span className="text-white/80 flex-shrink-0">{formatDate(b.next)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-white/80 text-sm">No upcoming birthdays →</div>
                )}
              </div>
            </Link>
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

          {/* Upcoming Anniversaries - right column, bottom */}
          <FloatingTile delay={0.3} className="lg:col-start-3 lg:row-start-2">
            <Link
              to="/anniversaries"
              className="block rounded-xl p-6 bg-gradient-to-br from-[#9333ea]/55 from-0% via-[#9333ea]/10 via-45% to-gray-900/70 to-100% border border-[#9333ea]/25 hover:border-[#9333ea]/50 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl backdrop-blur-md h-full min-h-[180px]"
            >
              <div className="h-full flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-7 w-7 text-white flex-shrink-0" />
                  <h3 className="text-2xl font-bold text-white">Upcoming Anniversaries</h3>
                </div>
                {upcomingAnniversaries.length > 0 ? (
                  <ul className="space-y-1.5">
                    {upcomingAnniversaries.slice(0, 3).map((a) => (
                      <li key={a.name} className="flex items-center justify-between text-white/95 text-sm">
                        <span className="font-medium truncate pr-2">{a.name}</span>
                        <span className="text-white/80 flex-shrink-0">
                          {yearsOfService(a.startYear, a.next)} yr · {formatDate(a.next)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-white/80 text-sm">No upcoming anniversaries →</div>
                )}
              </div>
            </Link>
          </FloatingTile>

          {/* Marketing Request - left column, bottom */}
          <FloatingTile delay={0.4} className="lg:col-start-1 lg:row-start-2">
            <a
              href="https://getswitchdone.netlify.app/f/marketing-request-cbkday"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl p-6 bg-gradient-to-br from-[#6b46c1]/60 from-0% via-[#6b46c1]/10 via-45% to-gray-900/70 to-100% border border-[#6b46c1]/25 hover:border-[#6b46c1]/50 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl backdrop-blur-md h-full min-h-[180px]"
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
            </a>
          </FloatingTile>
        </div>

        {/* External tools row */}
        <div className="mt-10 flex flex-wrap items-start justify-center gap-6 max-w-3xl mx-auto">
          {externalTools.map((tool, i) => (
            <FloatingTile key={tool.name} delay={0.5 + i * 0.05}>
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                title={tool.name}
                aria-label={tool.name}
                className="group relative flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 bg-white rounded-xl p-2.5 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-[#0951fa]/20">
                  <img src={tool.icon} alt="" className="w-full h-full object-contain" />
                </div>
                <span className="text-xs text-gray-400 group-hover:text-white transition-colors">
                  {tool.name}
                </span>
              </a>
            </FloatingTile>
          ))}
        </div>
      </div>

      {(activeFilter === "all" || (
        (isVisible("quick tools") && (isVisible("branding assets") || isVisible("resources"))) ||
        (isVisible("branding assets") && isVisible("resources"))
      )) && <SectionSeparator />}

      {/* Branding Assets Section */}
      <div
        className={`mb-16 ${isVisible("branding assets") ? "block" : "hidden"}`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Switch Commerce Assets */}
          <FloatingTile delay={0.2}>
            <div className="block rounded-xl overflow-hidden bg-gradient-to-br from-[#0951fa]/60 from-0% via-[#0951fa]/10 via-45% to-gray-900/70 to-100% border border-[#0951fa]/25 p-6 shadow-xl hover:shadow-2xl hover:border-[#0951fa]/50 hover:scale-105 transition-all duration-300 backdrop-blur-md h-full">
              <h3 className="text-2xl font-bold mb-4">Switch Commerce</h3>
              <div className="space-y-4">
                <Link
                  to="/print-collateral"
                  className="block p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <span className="text-lg font-medium">Brochures & Flyers</span>
                </Link>
                <Link
                  to="/switch-commerce/branding"
                  className="block p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <span className="text-lg font-medium">Brand Guidelines</span>
                </Link>
              </div>
            </div>
          </FloatingTile>

          {/* Clear Choice Assets */}
          <FloatingTile delay={0.4}>
            <div className="block rounded-xl overflow-hidden bg-gradient-to-br from-[#ff4f00]/55 from-0% via-[#ff4f00]/10 via-45% to-gray-900/70 to-100% border border-[#ff4f00]/25 p-6 shadow-xl hover:shadow-2xl hover:border-[#ff4f00]/50 hover:scale-105 transition-all duration-300 backdrop-blur-md h-full">
              <h3 className="text-2xl font-bold mb-4">Clear Choice</h3>
              <div className="space-y-4">
                <Link
                  to="/print-collateral"
                  className="block p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <span className="text-lg font-medium">Brochures & Flyers</span>
                </Link>
                <Link
                  to="/clear-choice/branding"
                  className="block p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <span className="text-lg font-medium">Brand Guidelines</span>
                </Link>
              </div>
            </div>
          </FloatingTile>
        </div>
      </div>

      {(activeFilter === "all" || 
        ((isVisible("branding assets") && isVisible("resources")) || 
        (isVisible("quick tools") && isVisible("resources")))
      ) && <SectionSeparator />}

      {/* Resources Section */}
      <div
        className={`${isVisible("resources") ? "block" : "hidden"}`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {resources.map((resource, index) => (
            <FloatingTile key={resource.name} delay={index * 0.2}>
              {resource.url.endsWith('.pdf') ? (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block rounded-xl p-5 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl h-full backdrop-blur-md ${resource.color || 'bg-gray-800'}`}
                >
                  <div className="h-full flex flex-col items-center text-center">
                    <div className="flex items-center justify-center mb-4">
                      <h3 className="text-xl font-semibold mb-0 flex items-center gap-2">
                        {resource.icon === "document" && <DocumentIcon className="h-7 w-7 text-white" />}
                        {resource.icon === "photo" && <PhotoIcon className="h-7 w-7 text-white" />}
                        {resource.icon === "book" && <BookOpenIcon className="h-7 w-7 text-white" />}
                        {resource.icon === "document-text" && <DocumentTextIcon className="h-7 w-7 text-white" />}
                        {resource.name}
                      </h3>
                    </div>
                    {resource.thumbnail && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <img
                          src={resource.thumbnail}
                          alt={resource.name}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                    <p className="text-sm text-gray-100 mb-4">{resource.description}</p>
                    <div className="mt-auto px-4 py-1.5 bg-gray-700 rounded-full text-xs uppercase tracking-wide">
                      {resource.type}
                    </div>
                  </div>
                </a>
              ) : (
                <Link
                  to={resource.url}
                  className={`block rounded-xl p-5 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl h-full backdrop-blur-md ${resource.color || 'bg-gray-800'}`}
                >
                <div className="h-full flex flex-col items-center text-center">
                  <div className="flex items-center justify-center mb-4">
                    <h3 className="text-xl font-semibold mb-0 flex items-center gap-2">
                      {resource.icon === "document" && <DocumentIcon className="h-7 w-7 text-white" />}
                      {resource.icon === "photo" && <PhotoIcon className="h-7 w-7 text-white" />}
                      {resource.icon === "book" && <BookOpenIcon className="h-7 w-7 text-white" />}
                      {resource.name}
                    </h3>
                  </div>
                  {resource.thumbnail && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img
                        src={resource.thumbnail}
                        alt={resource.name}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                  {/* Removed duplicate card label */}
                  <p className="text-sm text-gray-100 mb-4">{resource.description}</p>
                    <div className="mt-auto px-4 py-1.5 bg-gray-700 rounded-full text-xs uppercase tracking-wide">
                      {resource.type}
                    </div>
                  </div>
                </Link>
              )}
            </FloatingTile>
          ))}
        </div>
      </div>
    </div>
  );
}
