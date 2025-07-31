import React from 'react';
import { Link } from 'react-router-dom';

/**
 * DirectPDFLink - Component to open PDF files in a new window
 * This component will help users view PDFs in their native browser PDF viewer
 */
export default function DirectPDFLink({ pdfUrl, title, children }) {
  // Open the PDF in a new window on component mount
  React.useEffect(() => {
    // Using window.open to open the PDF in a new tab/window
    window.open(pdfUrl, '_blank');
    
    // No need to redirect the current page, since we're opening in a new window
  }, [pdfUrl]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{title}</h1>
        
        <div className="animate-pulse flex space-x-4 mb-6 justify-center">
          <div className="rounded-full bg-blue-400 h-12 w-12 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Opening PDF in a new window...
        </p>
        
        <div className="flex flex-col space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If a new window didn't open automatically,{' '}
            <a 
              href={pdfUrl} 
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              click here
            </a>.
          </p>
          
          <Link
            to="/"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
