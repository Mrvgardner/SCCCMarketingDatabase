import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

/**
 * BookletPDFViewer - A PDF viewer that displays PDFs in a booklet-like format
 * This uses iframe with custom styling and navigation to create a book-like experience
 */
export default function SimpleFramePDFViewer({ pdfUrl, title }) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [viewMode, setViewMode] = useState('single'); // single, double
  const [pdfScale, setPdfScale] = useState(100); // percentage
  const iframeRef = useRef(null);
  
  // Function to handle page navigation
  const changePage = (direction) => {
    const step = viewMode === 'double' ? 2 : 1;
    const newPage = Math.max(1, Math.min(currentPage + (direction * step), totalPages));
    setCurrentPage(newPage);
    
    // Update iframe src with the new page
    if (iframeRef.current) {
      const baseUrl = pdfUrl.split('#')[0];
      iframeRef.current.src = `${baseUrl}#page=${newPage}&toolbar=0&navpanes=0&view=Fit`;
    }
  };
  
  // Function to handle zoom changes
  const changeZoom = (increment) => {
    const newScale = Math.max(50, Math.min(pdfScale + increment, 200));
    setPdfScale(newScale);
  };
  
  // Check if the PDF has loaded and get page count
  const handleIframeLoad = () => {
    setIsLoading(false);
    
    try {
      // Try to estimate page count from iframe height if possible
      // A full implementation would need a better way to get the exact page count
      setTimeout(() => {
        // Set a reasonable default if we can't determine the actual count
        setTotalPages(10);
      }, 500);
    } catch (err) {
      console.error("Error getting PDF page count", err);
      setTotalPages(1);
    }
  };
  
  // Effect to set initial page view
  useEffect(() => {
    if (iframeRef.current && !isLoading) {
      const baseUrl = pdfUrl.split('#')[0];
      iframeRef.current.src = `${baseUrl}#page=${currentPage}&toolbar=0&navpanes=0&view=Fit`;
    }
  }, [isLoading, pdfUrl, currentPage]);

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4 text-center">{title}</h1>
      
      {/* Top Navigation */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
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
      
      {/* Zoom Controls */}
      <div className="mb-4 flex items-center space-x-2">
        <button 
          onClick={() => changeZoom(-10)} 
          className="p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Zoom out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        
        <span className="text-sm">{pdfScale}%</span>
        
        <button 
          onClick={() => changeZoom(10)} 
          className="p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Zoom in"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
        
        <button 
          onClick={() => setViewMode(viewMode === 'single' ? 'double' : 'single')} 
          className="p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors ml-2"
          aria-label="Toggle view mode"
        >
          {viewMode === 'single' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 4a1 1 0 01.707.293l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L9.586 9 6.293 5.707a1 1 0 010-1.414A1 1 0 017 4z" />
              <path d="M13 4a1 1 0 01.707.293l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L15.586 9l-3.293-3.293a1 1 0 010-1.414A1 1 0 0113 4z" />
            </svg>
          )}
        </button>
      </div>
      
      {/* PDF Frame with Page Controls */}
      <div className="relative w-full max-w-5xl">
        <div className="flex items-center justify-between absolute -left-12 right-0 top-1/2 transform -translate-y-1/2 z-10 px-3">
          <button
            onClick={() => changePage(-1)}
            disabled={currentPage <= 1}
            className={`p-3 bg-gray-800 bg-opacity-50 hover:bg-opacity-70 rounded-full text-white ${
              currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label="Previous page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => changePage(1)}
            disabled={currentPage >= totalPages}
            className={`p-3 bg-gray-800 bg-opacity-50 hover:bg-opacity-70 rounded-full text-white ${
              currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label="Next page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="w-full bg-gray-100 dark:bg-gray-800 p-2 rounded-lg shadow-inner">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0951fa] border-t-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading PDF...</p>
            </div>
          )}
          
          <div className={`w-full bg-white rounded-lg shadow-lg overflow-hidden ${viewMode === 'double' ? 'aspect-[16/10]' : 'aspect-[8.5/11]'}`}>
            <iframe 
              ref={iframeRef}
              src={`${pdfUrl}#page=1&toolbar=0&navpanes=0&view=Fit`}
              className="w-full h-full rounded-lg"
              title={title}
              onLoad={handleIframeLoad}
              style={{ 
                display: isLoading ? 'none' : 'block',
                transform: `scale(${pdfScale / 100})`,
                transformOrigin: 'center top',
              }}
            />
          </div>
          
          {/* Page Number Indicator */}
          <div className="flex justify-center items-center mt-4 text-sm">
            <span>Page {currentPage} of {totalPages}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Having trouble viewing this PDF? <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Open in new tab</a> or <a href={pdfUrl} download className="text-blue-500 hover:underline">download</a> it.</p>
      </div>
    </div>
  );
}
