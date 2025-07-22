import React from 'react';

export default function UsageGuidelines({ guidelines }) {
  if (!guidelines || guidelines.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {guidelines.map((guideline, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{guideline.title}</h4>
          <p className="text-gray-700 dark:text-gray-300">{guideline.content}</p>
          {guideline.examples && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {guideline.examples.map((example, exIndex) => (
                <div key={exIndex} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{example.title}</div>
                  {example.image && (
                    <img 
                      src={example.image} 
                      alt={example.title} 
                      className="w-full h-auto mb-2 rounded"
                    />
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-300">{example.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
