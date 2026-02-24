import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PrintCollateralPage() {
  useEffect(() => {
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
          thumbnail: "/brochures/thumbnails/switch-clearchoice-thumb.jpg"
        },
        {
          name: "Switch Commerce Brochure - 2025",
          description: "Switch Commerce payment processing solutions and services",
          url: "/brochures/switch-brochure.pdf",
          thumbnail: "/brochures/thumbnails/switch-thumb.jpg"
        },
        {
          name: "Clear Choice Brochure - 2025",
          description: "Clear Choice merchant services and payment solutions",
          url: "/brochures/clearchoice-brochure.pdf",
          thumbnail: "/brochures/thumbnails/clearchoice-thumb.jpg"
        }
      ]
    },
    {
      category: "One-Pagers",
      items: [
        {
          name: "CC WatchDog Online",
          description: "Clear Choice WatchDog monitoring and security services",
          url: "/pdfs/CC-WatchDogOnline.pdf",
          thumbnail: "/pdfs/thumbnails/watchdog-thumb.jpg"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0951fa] to-[#002b5e] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-4">Print Collateral</h1>
          <p className="text-xl text-white/90 max-w-3xl">
            Access the latest brochures, one-pagers, and marketing materials for Switch Commerce and Clear Choice
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {collateral.map((section, idx) => (
          <div key={idx} className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white border-b-2 border-[#0951fa] pb-2">
              {section.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((item, itemIdx) => (
                <a
                  key={itemIdx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-[#0951fa] dark:hover:border-[#0951fa]"
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
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-[#0951fa] dark:group-hover:text-[#0951fa] transition-colors mb-2">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {item.description}
                        </p>
                        <div className="flex items-center text-[#0951fa] dark:text-[#0a7cff] font-medium group-hover:underline">
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

      {/* Footer CTA */}
      <div className="bg-gray-100 dark:bg-gray-800 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Need something custom?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Contact the marketing team for custom collateral requests
          </p>
          <a
            href="mailto:marketing@switchcommerce.com"
            className="inline-flex items-center px-6 py-3 bg-[#0951fa] text-white font-semibold rounded-lg hover:bg-[#002b5e] transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email Marketing Team
          </a>
        </div>
      </div>
    </div>
  );
}
