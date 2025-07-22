import { Link } from 'react-router-dom';
import SwitchCommerceLayout from './layouts/SwitchCommerceLayout';

const assets = [
  {
    title: "Switch Commerce Brochure",
    type: "PDF",
    category: "Sales Materials",
    tags: ["Brochure", "PDF"],
    url: "/assets/switch-commerce/SC Brochure Final.pdf",
  },
  {
    title: "Switch Commerce Style Kit",
    type: "Folder",
    category: "Branding",
    tags: ["Style Kit", "Branding"],
    url: "/assets/switch-commerce/SwitchCommerce-StyleKit.zip",
  },
];

export default function SwitchCommerce() {
  return (
    <SwitchCommerceLayout>
      {/* Brand Guidelines Feature Section */}
      <div className="mb-10 bg-gradient-to-r from-blue-700 to-blue-500 text-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-2/3 mb-6 md:mb-0">
            <h2 className="text-3xl font-bold mb-4">Brand Guidelines</h2>
            <p className="text-lg mb-4">
              Access our comprehensive brand guidelines to ensure consistent application 
              of Switch Commerce's visual identity across all channels.
            </p>
            <Link 
              to="/switch-commerce/branding" 
              className="inline-block bg-white text-blue-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition duration-200"
            >
              View Brand Guidelines
            </Link>
          </div>
          <div className="md:w-1/3 flex justify-center">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <img 
                src="/logos/switch-commerce-logo.png" 
                alt="Switch Commerce Logo" 
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
    </SwitchCommerceLayout>
  );
}