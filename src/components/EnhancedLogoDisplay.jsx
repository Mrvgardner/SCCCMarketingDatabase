import React from 'react';

/**
 * EnhancedLogoDisplay Component - Shows different logo variants with categories and thumbnails
 */
export default function EnhancedLogoDisplay({ logos }) {
  // Group logos by category
  const groupedLogos = logos.reduce((groups, logo) => {
    const category = logo.category || 'Other';
    
    if (!groups[category]) {
      groups[category] = [];
    }
    
    groups[category].push(logo);
    return groups;
  }, {});

  return (
    <div className="space-y-16">
      {Object.entries(groupedLogos).map(([category, logosInCategory]) => (
        <div key={category} className="space-y-6">
          <h3 className="text-2xl font-bold text-white mb-6">{category}</h3>
          
          {/* Main Logo (first in category) */}
          {logosInCategory[0] && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
              <div className={`p-8 flex items-center justify-center ${logosInCategory[0].bgClass || 'bg-gray-100 dark:bg-gray-700'}`}>
                <img 
                  src={logosInCategory[0].src} 
                  alt={logosInCategory[0].name} 
                  className="max-h-48 max-w-full"
                />
              </div>
              
              <div className="p-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{logosInCategory[0].name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{logosInCategory[0].description}</p>
                
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Available Formats:</div>
                  <div className="flex flex-wrap gap-2">
                    {logosInCategory[0].formats.map((format) => (
                      <a
                        key={format.type}
                        href={format.url}
                        download
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-sm font-medium text-gray-800 dark:text-gray-200 transition-colors"
                      >
                        {format.type}
                      </a>
                    ))}
                  </div>
                </div>
                
                {logosInCategory[0].clearSpace && (
                  <div className="mt-4">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Clear Space:</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{logosInCategory[0].clearSpace}</p>
                  </div>
                )}
                
                {logosInCategory[0].minSize && (
                  <div className="mt-4">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Minimum Size:</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{logosInCategory[0].minSize}</p>
                  </div>
                )}
                
                {logosInCategory[0].usage && (
                  <div className="mt-4">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Usage:</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{logosInCategory[0].usage}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Variations (thumbnails) */}
          {logosInCategory.length > 1 && (
            <div>
              <h4 className="text-lg font-medium text-white mb-4">Variations</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {logosInCategory.slice(1).map((logo) => (
                  <div key={logo.name} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <div className={`p-3 flex items-center justify-center ${logo.bgClass || 'bg-gray-100 dark:bg-gray-700'}`} style={{height: '120px'}}>
                      <img 
                        src={logo.src} 
                        alt={logo.name}
                        className="max-h-full max-w-full"
                      />
                    </div>
                    <div className="p-2">
                      <h5 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{logo.name}</h5>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {logo.formats.map((format) => (
                          <a
                            key={format.type}
                            href={format.url}
                            download
                            className="px-2 py-0.5 text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded font-medium text-gray-800 dark:text-gray-200 transition-colors"
                          >
                            {format.type}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
