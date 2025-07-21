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
    icon: "/logos/assembly-logo.png",
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
    description: "Transaction Management System",
    color: "bg-blue-800",
  },
];

const resources = [
  {
    name: "Switch Commerce Logo Story",
    type: "video",
    url: "/assets/switch-commerce-logo-story.mp4",
    thumbnail: "/thumbnails/logo-story.jpg",
    description: "Learn about our brand evolution",
  },
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
      className="animate-float"
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
  }, []);

  return (
		<div className="p-6 max-w-5xl mx-auto">
			<h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Switch Team Portal</h1>
			<input
				type="text"
				placeholder="Search assets by keyword or tag..."
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				className="w-full px-4 py-2 mb-6 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
			/>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{results.map((asset, index) => (
					<div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
						<h2 className="text-xl font-semibold text-gray-900 dark:text-white">{asset.title}</h2>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{asset.type} • {asset.category}
						</p>
						<p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
							Tags: {asset.tags.join(", ")}
						</p>
						<a
							href={asset.url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-2 inline-block"
						>
							View / Download
						</a>
					</div>
				))}
			</div>
		</div>
	);
}
