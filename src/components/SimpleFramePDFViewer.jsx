import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * SimpleFramePDFViewer - A minimal PDF viewer that uses an iframe to display PDFs
 * This approach avoids the version compatibility issues with PDF.js
 */
export default function SimpleFramePDFViewer({ pdfUrl, title }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4 text-center">{title}</h1>
      
      {/* Navigation */}
      <div className="mb-4 flex items-center space-x-4">
        <Link 
          to="/"
          className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>
        
        <a 
          href={pdfUrl} 
          download 
          className="flex items-center px-4 py-2 bg-[#0951fa] text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download PDF
        </a>
        
        <button 
          onClick={() => window.print()} 
          className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
          Print
        </button>
      </div>
      
      {/* PDF Frame */}
      <div className="w-full max-w-5xl bg-gray-100 dark:bg-gray-800 p-2 rounded-lg shadow-inner">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0951fa] border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading PDF...</p>
          </div>
        )}
        
        <div className="aspect-[8.5/11] w-full bg-white rounded-lg shadow-md">
          <iframe 
            src={`${pdfUrl}#toolbar=0&navpanes=0`}
            className="w-full h-full rounded-lg"
            title={title}
            onLoad={() => setIsLoading(false)}
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Having trouble viewing this PDF? <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Open in new tab</a> or <a href={pdfUrl} download className="text-blue-500 hover:underline">download</a> it.</p>
      </div>
    </div>
  );
}
