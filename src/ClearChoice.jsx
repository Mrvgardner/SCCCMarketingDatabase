import { Link } from 'react-router-dom';
import ClearChoiceLayout from './layouts/ClearChoiceLayout';

const assets = [
  {
    title: "Clear Choice Brochure",
    type: "PDF",
    category: "Sales Materials",
    tags: ["Brochure", "PDF"],
    url: "/assets/clear-choice/Clear Choice Brochure.pdf",
  },
  {
    title: "Clear Choice Style Kit",
    type: "Folder",
    category: "Branding",
    tags: ["Style Kit", "Branding"],
    url: "/assets/clear-choice/ClearChoice-StyleKit.zip",
  },
];

export default function ClearChoice() {
  return (
    <ClearChoiceLayout>
      {/* Brand Guidelines Feature Section */}
      <div className="mb-10 bg-gradient-to-r from-[#ff4f00] to-[#ff7e40] text-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-2/3 mb-6 md:mb-0">
            <h2 className="text-3xl font-bold mb-4">Brand Guidelines</h2>
            <p className="text-lg mb-4">
              Ensure consistent brand presentation with our comprehensive brand guidelines. 
              Access colors, typography, logo usage, and more.
            </p>
            <Link 
              to="/clear-choice/branding" 
              className="inline-block bg-white text-[#ff4f00] font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition duration-200"
            >
              View Brand Guidelines
            </Link>
          </div>
          <div className="md:w-1/3 flex justify-center">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <img 
                src="/logos/clear-choice-logo.png" 
                alt="Clear Choice Logo" 
                className="h-32 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Resources</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assets.map((asset, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-4 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{asset.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{asset.type} • {asset.category}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Tags: {asset.tags.join(', ')}</p>
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
    </ClearChoiceLayout>
  );
}