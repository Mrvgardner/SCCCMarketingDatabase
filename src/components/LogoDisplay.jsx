import React from 'react';

/**
 * LogoDisplay Component - Shows different logo variants with download options
 */
export default function LogoDisplay({ logos }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {logos.map((logo) => (
        <div key={logo.name} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className={`p-8 flex items-center justify-center ${logo.bgClass || 'bg-gray-100 dark:bg-gray-700'}`}>
            <img 
              src={logo.src} 
              alt={logo.name} 
              className={`${logo.maxWidth || 'max-w-xs'} ${logo.maxHeight || 'max-h-32'}`}
            />
          </div>
          
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{logo.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{logo.description}</p>
            
            <div className="mt-4 space-y-2">
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Available Formats:</div>
              <div className="flex flex-wrap gap-2">
                {logo.formats.map((format) => (
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
            
            {logo.usage && (
              <div className="mt-4">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Usage:</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{logo.usage}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
