import React, { useState } from 'react';

/**
 * ColorPalette Component - Displays a color swatch with copy functionality
 */
export default function ColorPalette({ colors }) {
  const [copiedColor, setCopiedColor] = useState(null);

  const handleCopyColor = (colorCode) => {
    navigator.clipboard.writeText(colorCode);
    setCopiedColor(colorCode);
    
    setTimeout(() => {
      setCopiedColor(null);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {colors.map((color) => (
        <div 
          key={color.name} 
          className="flex flex-col rounded-lg overflow-hidden shadow-lg transition-all hover:shadow-xl"
        >
          <div 
            className="h-32 w-full relative cursor-pointer"
            style={{ backgroundColor: color.hex }}
            onClick={() => handleCopyColor(color.hex)}
          >
            {copiedColor === color.hex && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center transition-opacity">
                <span className="text-white font-semibold">Copied!</span>
              </div>
            )}
          </div>
          <div className="p-4 bg-white dark:bg-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">{color.name}</h3>
            <div className="flex flex-col mt-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Hex</span>
                <span 
                  className="text-sm font-mono text-gray-800 dark:text-gray-200 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => handleCopyColor(color.hex)}
                >
                  {color.hex}
                </span>
              </div>
              {color.rgb && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">RGB</span>
                  <span 
                    className="text-sm font-mono text-gray-800 dark:text-gray-200 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => handleCopyColor(color.rgb)}
                  >
                    {color.rgb}
                  </span>
                </div>
              )}
              {color.cmyk && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">CMYK</span>
                  <span className="text-sm font-mono text-gray-800 dark:text-gray-200">
                    {color.cmyk}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
