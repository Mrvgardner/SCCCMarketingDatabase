import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * ObjectPDFViewer - A PDF viewer using the object tag for better compatibility
 * @param {string} pdfUrl - URL to the PDF file
 * @param {string} title - Title to display above the PDF
 */
export default function ObjectPDFViewer({ pdfUrl, title }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Verify the PDF exists
  useEffect(() => {
    const checkPdf = async () => {
      try {
        const response = await fetch(pdfUrl, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`PDF file not found (${response.status})`);
        }
      } catch (err) {
        console.error('Error checking PDF:', err);
        setError(err.message || 'Could not access the PDF file');
      } finally {
        setLoading(false);
      }
    };
    
    checkPdf();
  }, [pdfUrl]);

  return (
    <div className="flex flex-col items-center w-full max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4 text-center">{title}</h1>
      
      {/* Controls */}
      <div className="w-full flex justify-between items-center mb-4">
        <Link
          to="/"
          className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>
        
        <div className="flex space-x-2">
          <a 
            href={pdfUrl} 
            download
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download
          </a>
          
          <button
            onClick={() => window.print()}
            className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            Print
          </button>
        </div>
      </div>
      
      {/* PDF Viewer */}
      <div className="w-full h-[80vh] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <span className="ml-3">Loading PDF...</span>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 z-10 p-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Error Loading PDF</h3>
            <p className="text-red-600 dark:text-red-300 text-center">{error}</p>
            <div className="mt-4 flex space-x-4">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Try Again
              </button>
              <a 
                href={pdfUrl} 
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Open Directly
              </a>
            </div>
          </div>
        )}
        
        {/* Using object tag for better compatibility */}
        <object
          data={pdfUrl}
          type="application/pdf"
          className="w-full h-full"
        >
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <p className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
              Your browser does not support embedded PDFs.
            </p>
            <a 
              href={pdfUrl} 
              target="_blank"
              rel="noopener noreferrer" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Open PDF
            </a>
          </div>
        </object>
      </div>
      
      {/* Alternate access */}
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>
          Having trouble viewing this PDF? 
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-500 hover:underline">
            Open directly in your browser
          </a>
          {' or '}
          <a href={pdfUrl} download className="text-blue-500 hover:underline">
            download it
          </a>.
        </p>
      </div>
    </div>
  );
}
