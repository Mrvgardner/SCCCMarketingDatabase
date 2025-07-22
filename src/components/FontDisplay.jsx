import React from 'react';

/**
 * FontDisplay Component - Shows font examples with different weights and sizes
 */
export default function FontDisplay({ fonts }) {
  return (
    <div className="space-y-12">
      {fonts.map((font) => (
        <div key={font.name} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{font.name}</h3>
          <div className="space-y-6">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Font Family:</div>
              <div className="font-mono text-gray-800 dark:text-gray-200">{font.family}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Weights:</div>
              <div className="space-y-2">
                {font.weights.map((weight) => (
                  <div 
                    key={weight.value} 
                    className="flex items-baseline justify-between border-b border-gray-200 dark:border-gray-700 py-2"
                  >
                    <span className="text-gray-700 dark:text-gray-300">{weight.name} ({weight.value})</span>
                    <span 
                      className="text-gray-900 dark:text-white" 
                      style={{ 
                        fontFamily: font.cssFamily, 
                        fontWeight: weight.value 
                      }}
                    >
                      The quick brown fox jumps over the lazy dog
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Sample Sizes:</div>
              <div className="space-y-6">
                {font.samples.map((sample) => (
                  <div key={sample.name} className="space-y-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400">{sample.name} ({sample.size})</div>
                    <div 
                      className="text-gray-900 dark:text-white" 
                      style={{ 
                        fontFamily: font.cssFamily, 
                        fontSize: sample.size,
                        fontWeight: sample.weight || 'normal',
                        lineHeight: sample.lineHeight || 'normal'
                      }}
                    >
                      {sample.text || "The quick brown fox jumps over the lazy dog"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
