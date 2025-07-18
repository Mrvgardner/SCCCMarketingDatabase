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
          <div key={index} className="bg-white p-4 shadow rounded">
            <h2 className="text-xl font-semibold">{asset.title}</h2>
            <p className="text-sm text-gray-600">{asset.type} • {asset.category}</p>
            <p className="text-sm">Tags: {asset.tags.join(', ')}</p>
            <a
              href={asset.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 mt-2 inline-block"
            >
              View / Download
            </a>
          </div>
        ))}
      </div>
    </ClearChoiceLayout>
  );
}