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