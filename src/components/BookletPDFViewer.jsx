import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Link } from 'react-router-dom';

// Set up the pdf.js worker source with multiple fallbacks
try {
  // Try CDN first with version match
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  
  // Add error handler to fallback to local
  window.addEventListener('error', function(e) {
    if (e.target.src && e.target.src.includes('pdf.worker')) {
      console.log('PDF worker failed to load from CDN, using local fallback');
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
    }
  }, true);
} catch (error) {
  console.error('Error setting up PDF worker:', error);
  // Fallback to local
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
}

/**
 * BookletPDFViewer - A PDF viewer that displays PDFs in a true booklet-like format
 * Using react-pdf to have complete control over rendering
 */
export default function BookletPDFViewer({ pdfUrl, title }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset when URL changes
    setPageNumber(1);
    setIsLoading(true);
    setError(null);
  }, [pdfUrl]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = (error) => {
    console.error("Failed to load PDF:", error);
    setError(`Failed to load PDF: ${error.message || 'Unknown error'}`);
    setIsLoading(false);
    
    // Try to diagnose the error
    fetch(pdfUrl, { method: 'HEAD' })
      .then(response => {
        if (!response.ok) {
          console.error(`PDF file not accessible: ${response.status} ${response.statusText}`);
          setError(`PDF not accessible (${response.status}). Please check if the file exists.`);
        }
      })
      .catch(fetchError => {
        console.error("Error checking PDF existence:", fetchError);
        setError("Network error. Please check your connection.");
      });
  };

  const changePage = (offset) => {
    setPageNumber((prevPageNumber) => {
      const nextPage = prevPageNumber + offset;
      return Math.max(1, Math.min(nextPage, numPages || 1));
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const adjustZoom = (delta) => {
    setScale((prevScale) => {
      const newScale = prevScale + delta;
      return Math.max(0.5, Math.min(newScale, 2.0)); // Limit scale between 0.5 and 2.0
    });
  };

  const zoomIn = () => adjustZoom(0.1);
  const zoomOut = () => adjustZoom(-0.1);

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
          onClick={zoomOut} 
          className="p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Zoom out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        
        <span className="text-sm">{Math.round(scale * 100)}%</span>
        
        <button 
          onClick={zoomIn} 
          className="p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Zoom in"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* PDF Document with Page Controls */}
      <div className="relative w-full max-w-5xl">
        {/* Side navigation arrows */}
        <div className="flex items-center justify-between absolute -left-12 right-0 top-1/2 transform -translate-y-1/2 z-10 px-3">
          <button
            onClick={previousPage}
            disabled={pageNumber <= 1}
            className={`p-3 bg-gray-800 bg-opacity-50 hover:bg-opacity-70 rounded-full text-white ${
              pageNumber <= 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label="Previous page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            className={`p-3 bg-gray-800 bg-opacity-50 hover:bg-opacity-70 rounded-full text-white ${
              pageNumber >= numPages ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label="Next page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* PDF Document */}
        <div className="w-full bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-inner">
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0951fa] border-t-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading PDF...</p>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="flex flex-col items-center justify-center p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-600 dark:text-red-400">Failed to load PDF</p>
            </div>
          )}
          
          {/* PDF Document */}
          <div className="flex justify-center overflow-hidden rounded-lg bg-white shadow-lg">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0951fa] border-t-transparent"></div>
                </div>
              }
              error={
                <div className="flex flex-col items-center justify-center h-96 bg-red-100 dark:bg-red-900/30">
                  <p className="text-red-600 dark:text-red-400">Failed to load PDF. Please try again.</p>
                </div>
              }
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale}
                className="shadow-lg mx-auto"
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          </div>
          
          {/* Page indicator */}
          {numPages > 0 && (
            <div className="flex justify-center items-center mt-4 text-sm">
              <span>Page {pageNumber} of {numPages}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Having trouble viewing this PDF? <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Open in new tab</a> or <a href={pdfUrl} download className="text-blue-500 hover:underline">download</a> it.</p>
      </div>
    </div>
  );
}
