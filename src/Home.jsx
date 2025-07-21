import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const tools = [
  {
    name: "Slack",
    icon: "/logos/slack-logo.png",
    url: "https://switchcommerce.slack.com",
    description: "Team communication and collaboration",
    color: "bg-purple-900",
  },
  {
    name: "Assembly",
    icon: "/logos/assembly-hr.png",
    url: "https://assembly.com",
    description: "Recognition and rewards",
    color: "bg-orange-500",
  },
  {
    name: "BambooHR",
    icon: "/logos/bamboohr-logo.png",
    url: "https://switchcommerce.bamboohr.com",
    description: "HR and employee management",
    color: "bg-green-600",
  },
  {
    name: "Jira",
    icon: "/logos/jira-logo.png",
    url: "https://switchcommerce.atlassian.net",
    description: "Project and task management",
    color: "bg-blue-600",
  },
  {
    name: "TMS",
    icon: "/logos/tms-logo.png",
    url: "https://tms.switchcommerce.com",
    description: "Terminal Management System",
    color: "bg-blue-800",
  },
];

const resources = [
  {
    name: "Email Signatures",
    type: "tool",
    url: "/email-signatures",
    description: "Generate your branded email signature",
  },
  {
    name: "Wallpapers",
    type: "download",
    url: "/wallpapers",
    description: "Branded desktop and mobile wallpapers",
  },
];

const FloatingTile = ({ delay = 0, children }) => {
  return (
    <div
      className="animate-float transform transition-transform"
      style={{
        animationDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

export default function Home() {
  const [activeSection, setActiveSection] = useState(0);
  const sections = ["Quick Tools", "Branding Assets", "Resources"];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSection((prev) => (prev + 1) % sections.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [sections.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Welcome to the Resource Portal
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Your central hub for all Switch Commerce and Clear Choice resources,
          tools, and brand assets.
        </p>
      </div>

      {/* Section Navigation */}
      <div className="flex justify-center gap-4 mb-12">
        {sections.map((section, index) => (
          <button
            key={section}
            onClick={() => setActiveSection(index)}
            className={`px-6 py-2 rounded-full transition-all duration-300 ${
              activeSection === index
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Quick Tools Section */}
      <div
        className={`transition-opacity duration-500 ${
          activeSection === 0 ? "opacity-100" : "opacity-0 hidden"
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {tools.map((tool, index) => (
            <FloatingTile key={tool.name} delay={index * 0.2}>
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
            </FloatingTile>
          ))}
        </div>
      </div>

      {/* Branding Assets Section */}
      <div
        className={`transition-opacity duration-500 ${
          activeSection === 1 ? "opacity-100" : "opacity-0 hidden"
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Switch Commerce Assets */}
          <FloatingTile delay={0.2}>
            <div className="rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 p-6 shadow-xl">
              <h3 className="text-2xl font-bold mb-4">Switch Commerce</h3>
              <div className="space-y-4">
                <Link
                  to="/switch-brochure"
                  className="block p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <span className="text-lg font-medium">Brochure</span>
                </Link>
                <Link
                  to="/switch-branding"
                  className="block p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <span className="text-lg font-medium">Brand Guidelines</span>
                </Link>
              </div>
            </div>
          </FloatingTile>

          {/* Clear Choice Assets */}
          <FloatingTile delay={0.4}>
            <div className="rounded-xl overflow-hidden bg-gradient-to-br from-orange-500 to-orange-700 p-6 shadow-xl">
              <h3 className="text-2xl font-bold mb-4">Clear Choice</h3>
              <div className="space-y-4">
                <Link
                  to="/clear-choice-brochure"
                  className="block p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <span className="text-lg font-medium">Brochure</span>
                </Link>
                <Link
                  to="/clear-choice-branding"
                  className="block p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <span className="text-lg font-medium">Brand Guidelines</span>
                </Link>
              </div>
            </div>
          </FloatingTile>
        </div>
      </div>

      {/* Resources Section */}
      <div
        className={`transition-opacity duration-500 ${
          activeSection === 2 ? "opacity-100" : "opacity-0 hidden"
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {resources.map((resource, index) => (
            <FloatingTile key={resource.name} delay={index * 0.2}>
              <Link
                to={resource.url}
                className="block rounded-xl bg-gray-800 p-6 hover:bg-gray-700 transition-colors shadow-xl"
              >
                {resource.thumbnail && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={resource.thumbnail}
                      alt={resource.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-2">{resource.name}</h3>
                <p className="text-sm text-gray-400">{resource.description}</p>
                <div className="mt-4 inline-block px-3 py-1 bg-gray-700 rounded-full text-xs uppercase tracking-wide">
                  {resource.type}
                </div>
              </Link>
            </FloatingTile>
          ))}
        </div>
      </div>
    </div>
  );
}
