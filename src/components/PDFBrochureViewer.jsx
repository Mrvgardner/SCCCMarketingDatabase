import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BookletPDFViewer from './BookletPDFViewer';

/**
 * PDFBrochureViewer - A component that renders a brochure PDF with fallbacks
 * Now uses BookletPDFViewer for true booklet-style experience
 */
export default function PDFBrochureViewer({ pdfUrl, title, fallbackUrl = null }) {
  const [pdfError, setPdfError] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(pdfUrl);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if the PDF exists
  const checkPdfExists = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Error checking PDF existence:', error);
      return false;
    }
  };

  React.useEffect(() => {
    const validatePdf = async () => {
      setIsLoading(true);
      
      // Try primary URL
      const exists = await checkPdfExists(pdfUrl);
      
      if (!exists && fallbackUrl) {
        // Try fallback URL
        const fallbackExists = await checkPdfExists(fallbackUrl);
        if (fallbackExists) {
          console.log('Primary PDF not found, using fallback PDF');
          setCurrentUrl(fallbackUrl);
        } else {
          console.error('Neither primary nor fallback PDF could be found');
          setPdfError(true);
        }
      } else if (!exists) {
        console.error('PDF not found and no fallback provided');
        setPdfError(true);
      } else {
        // Primary PDF found
        setCurrentUrl(pdfUrl);
      }
      
      setIsLoading(false);
    };
    
    validatePdf();
  }, [pdfUrl, fallbackUrl]);

  if (pdfError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">PDF Not Available</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We're sorry, but the requested brochure could not be loaded. This could be due to:
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
            <li>The file may be temporarily unavailable</li>
            <li>The file path might be incorrect</li>
            <li>Your connection might be experiencing issues</li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              to="/"
              className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Return Home
            </Link>
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0951fa] border-t-transparent"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading brochure...</p>
      </div>
    );
  }

  return <BookletPDFViewer pdfUrl={currentUrl} title={title} />;
}
