import React from 'react';

/**
 * FontDisplay Component - Shows font examples with different weights and sizes
 */
export default function FontDisplay({ fonts }) {
  return (
    <div className="space-y-12">
      {fonts.map((font) => {
        // Only filter Lato font styles if font is Lato
        let weights = font.weights;
        let samples = font.samples;
        if (font.name === 'Lato') {
          weights = [
            { name: 'Regular', value: 400 },
            { name: 'Regular Italic', value: 400, italic: true },
            { name: 'Bold', value: 700 },
            { name: 'Bold Italic', value: 700, italic: true }
          ];
          samples = [
            { name: 'Normal', size: '1rem', weight: 400, text: 'The quick brown fox jumps over the lazy dog' },
            { name: 'Italic', size: '1rem', weight: 400, text: 'The quick brown fox jumps over the lazy dog', italic: true },
            { name: 'Bold', size: '1rem', weight: 700, text: 'The quick brown fox jumps over the lazy dog' },
            { name: 'Bold Italic', size: '1rem', weight: 700, text: 'The quick brown fox jumps over the lazy dog', italic: true }
          ];
        }
        return (
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
                  {weights.map((weight, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-baseline justify-between border-b border-gray-200 dark:border-gray-700 py-2"
                    >
                      <span className="text-gray-700 dark:text-gray-300">{weight.name} ({weight.value}){weight.italic ? ' Italic' : ''}</span>
                      <span 
                        className={`text-gray-900 dark:text-white ${font.name.includes('BOLD') ? 'font-switch-bold' : 
                                   font.name.includes('REG') ? 'font-switch-reg' : ''}`}
                        style={{ 
                          fontFamily: font.name.includes('SWITCH COMMERCE') ? undefined : font.cssFamily, 
                          fontWeight: weight.value,
                          fontStyle: weight.italic ? 'italic' : 'normal'
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
                  {samples.map((sample, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400">{sample.name} ({sample.size})</div>
                      <div 
                        className={`text-gray-900 dark:text-white ${font.name.includes('BOLD') ? 'font-switch-bold' : 
                                   font.name.includes('REG') ? 'font-switch-reg' : ''}`}
                        style={{ 
                          fontFamily: font.name.includes('SWITCH COMMERCE') ? undefined : font.cssFamily, 
                          fontSize: sample.size,
                          fontWeight: sample.weight || 'normal',
                          lineHeight: sample.lineHeight || 'normal',
                          fontStyle: sample.italic ? 'italic' : 'normal'
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
        );
      })}
    </div>
  );
}
