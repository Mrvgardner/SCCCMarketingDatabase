import { useState, useEffect } from "react";
import { DocumentIcon, PhotoIcon, BookOpenIcon, DocumentTextIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

const tools = [
  {
    name: "Slack",
    icon: "/logos/slack-logo.png",
    url: "https://switch-commerce.slack.com/",
    description: "Team communication and collaboration",
    color: "bg-purple-900",
  },
  {
    name: "Assembly",
    icon: "/logos/assembly-logo.png",
    url: "https://app.joinassembly.com/",
    description: "Recognition and rewards",
    color: "bg-[#ff4f00]",
  },
  {
    name: "BambooHR",
    icon: "/logos/bamboohr-logo.png",
    url: "https://switch.bamboohr.com/home/",
    description: "HR and employee management",
    color: "bg-green-600",
  },
  {
    name: "Jira",
    icon: "/logos/jira-logo.png",
    url: "https://switchcommerce.atlassian.net/jira/your-work",
    description: "Project and task management",
    color: "bg-blue-600",
  },
  {
    name: "Confluence",
    icon: "/logos/confluence-logo.jpg",
    url: "https://switchcommerce.atlassian.net/wiki/home",
    description: "Systems Wiki and Documentation",
    color: "bg-blue-800",
  },
  {
    name: "Marketing Request",
    icon: "/logos/marketing-form-icon.svg",
    url: "/marketing-request",
    description: "Submit marketing requests",
    color: "bg-gradient-to-br from-[#6b46c1] to-[#9333ea]",
  },
]

const resources = [
  {
    name: "Email Signature",
    type: "resource",
    url: "/email-signature",
    description: "Download your branded email signature",
    color: "bg-gradient-to-br from-[#0951fa] to-[#0a7cff]",
    icon: "document",
  },
  {
    name: "Wallpapers",
    type: "download",
    url: "/wallpapers",
    description: "Branded desktop and mobile wallpapers",
    color: "bg-gradient-to-br from-[#ff4f00] to-[#ff7f50]",
    icon: "photo",
  },
  {
    name: "Knowledge Base",
    type: "resource",
    url: "/products",
    description: "Product features, use cases, and sales resources",
    color: "bg-gradient-to-br from-[#0a7cff] to-[#0951fa]",
    icon: "book",
  },
  {
    name: "Print Collateral",
    type: "resource",
    url: "/print-collateral",
    description: "Access the latest brochures and one-pagers",
    color: "bg-gradient-to-br from-[#9333ea] to-[#c084fc]",
    icon: "document-text",
  },
];

const FloatingTile = ({ delay = 0, children }) => (
  <div
    className={`opacity-0 translate-y-8 animate-slide-in transform transition duration-300 hover:scale-105 hover:shadow-2xl`}
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
  const sections = ["All", "Quick Tools", "Branding Assets", "Resources"];
  const isVisible = (section) => activeFilter === "all" || activeFilter === section.toLowerCase();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-[#0951fa] from-10% via-[#0951fa] via-30% to-[#ff4f00] to-80% bg-clip-text text-transparent">
          Team Switch Commerce
        </h1>
        <h2 className="text-3xl md:text-4xl font-semibold mt-3 mb-5">
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
          {tools.map((tool, index) => (
            <FloatingTile key={tool.name} delay={index * 0.2}>
              {tool.url.startsWith('http') ? (
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block rounded-xl p-6 ${tool.color} hover:scale-105 transition-transform duration-300 shadow-xl backdrop-blur-sm bg-opacity-90 h-full`}
                >
                  <div className="h-full flex flex-col items-center">
                    <div className="w-16 h-16 mb-4 bg-white rounded-lg p-2 shadow-lg">
                      <img src={tool.icon} alt={tool.name} className="w-full h-full object-contain" />
                    </div>
                    <h3 className="text-lg font-semibold mb-3 text-center">{tool.name}</h3>
                    <p className="text-sm text-gray-200 text-center">{tool.description}</p>
                  </div>
                </a>
              ) : (
                <Link
                  to={tool.url}
                  className={`block rounded-xl p-6 ${tool.color} hover:scale-105 transition-transform duration-300 shadow-xl backdrop-blur-sm bg-opacity-90 h-full`}
                >
                  <div className="h-full flex flex-col items-center">
                    <div className="w-16 h-16 mb-4 bg-white rounded-lg p-2 shadow-lg">
                      <img src={tool.icon} alt={tool.name} className="w-full h-full object-contain" />
                    </div>
                    <h3 className="text-lg font-semibold mb-3 text-center">{tool.name}</h3>
                    <p className="text-sm text-gray-200 text-center">{tool.description}</p>
                  </div>
                </Link>
              )}
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
            <div className="block rounded-xl overflow-hidden bg-gradient-to-br from-[#0951fa] to-[#0951fa]/70 p-6 shadow-xl hover:scale-105 transition-transform duration-300 h-full">
              <h3 className="text-2xl font-bold mb-4">Switch Commerce</h3>
              <div className="space-y-4">
                  <a
                    href="/brochures/SwitchCommerceClearChoiceBrochure.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <span className="text-lg font-medium">Brochure</span>
                    <span className="block text-xs mt-1 text-white/70">Opens PDF in new window</span>
                  </a>
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
            <div className="block rounded-xl overflow-hidden bg-gradient-to-br from-[#ff4f00] to-[#ff4f00]/70 p-6 shadow-xl hover:scale-105 transition-transform duration-300 h-full">
              <h3 className="text-2xl font-bold mb-4">Clear Choice</h3>
              <div className="space-y-4">
                  <a
                    href="/brochures/SwitchCommerceClearChoiceBrochure.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <span className="text-lg font-medium">Brochure</span>
                    <span className="block text-xs mt-1 text-white/70">Opens PDF in new window</span>
                  </a>
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
                  className={`block rounded-xl p-5 hover:scale-105 transition-transform duration-300 shadow-xl h-full backdrop-blur-sm bg-opacity-90 ${resource.color || 'bg-gray-800'}`}
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
                  className={`block rounded-xl p-5 hover:scale-105 transition-transform duration-300 shadow-xl h-full backdrop-blur-sm bg-opacity-90 ${resource.color || 'bg-gray-800'}`}
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
