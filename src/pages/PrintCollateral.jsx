import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PrintCollateralPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Print Collateral - Switch Commerce';
  }, []);

  const collateral = [
    {
      category: "Brochures",
      items: [
        {
          name: "Switch Commerce & Clear Choice Brochure - 2026",
          description: "Combined company brochure featuring both Switch Commerce and Clear Choice",
          url: "/brochures/SwitchCommerceClearChoiceBrochure.pdf",
          thumbnail: "/brochures/thumbnails/switch-clearchoice-thumb.jpg?v=1"
        },
        {
          name: "Switch Commerce Brochure - 2025",
          description: "Switch Commerce payment processing solutions and services",
          url: "/brochures/switch-brochure.pdf",
          thumbnail: "/brochures/thumbnails/switch-thumb.jpg?v=1"
        },
        {
          name: "Clear Choice Brochure - 2025",
          description: "Clear Choice merchant services and payment solutions",
          url: "/brochures/clearchoice-brochure.pdf",
          thumbnail: "/brochures/thumbnails/clearchoice-thumb.jpg?v=1"
        }
      ]
    },
    {
      category: "One-Pagers",
      items: [
        {
          name: "Watchdog One-Page - 2026",
          description: "Clear Choice WatchDog monitoring and security services",
          url: "/pdfs/CC-WatchDogOnline.pdf",
          thumbnail: "/pdfs/thumbnails/watchdog-thumb.jpg"
        },
        {
          name: "Cash Recycler One-Page - 2026",
          description: "ATEC Cash Recycler solutions for efficient cash management",
          url: "/pdfs/Cash_Reccler.pdf",
          thumbnail: "/pdfs/thumbnails/atec-thumb.jpg"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <div className="py-16">
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
          <h1 className="font-switch-bold text-5xl mb-4 bg-gradient-to-r from-[#0951fa] to-[#ff4f00] bg-clip-text text-transparent">Print Collateral</h1>
          <p className="text-lg text-gray-300 max-w-3xl">
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
              {section.items.map((item, itemIdx) => (
                <a
                  key={itemIdx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl overflow-hidden bg-gradient-to-br from-[#0951fa]/30 from-0% via-[#0951fa]/5 via-45% to-gray-900/70 to-100% border border-white/10 hover:border-[#0951fa]/50 shadow-xl hover:shadow-2xl backdrop-blur-md transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-24 h-32 rounded-lg overflow-hidden shadow-md">
                        <img 
                          src={item.thumbnail} 
                          alt={`${item.name} cover`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml,%3Csvg width="96" height="128" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="96" height="128" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="48" fill="%239ca3af" text-anchor="middle" dy=".3em"%3E📄%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white group-hover:text-[#0a7cff] transition-colors mb-2">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                          {item.description}
                        </p>
                        <div className="flex items-center text-[#0a7cff] font-medium group-hover:underline">
                          <span>View PDF</span>
                          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
