import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PDFViewer({ pdfUrl, title }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);

  // Handle document load success
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  // Page navigation
  const goToPreviousPage = () => {
    setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages || 1));
  };

  // Zoom controls
  const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.2, 2.5));
  const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  const resetZoom = () => setScale(1.0);

  // Rotation controls
  const rotateClockwise = () => setRotation(prevRotation => (prevRotation + 90) % 360);
  const rotateCounterClockwise = () => setRotation(prevRotation => (prevRotation - 90 + 360) % 360);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') goToNextPage();
      else if (e.key === 'ArrowLeft') goToPreviousPage();
      else if (e.key === '+') zoomIn();
      else if (e.key === '-') zoomOut();
      else if (e.key === '0') resetZoom();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [numPages]);

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4 text-center">{title}</h1>
      
      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={goToPreviousPage} 
            disabled={pageNumber <= 1}
            className="px-4 py-2 bg-[#0951fa] text-white rounded-full disabled:opacity-50"
          >
            ← Previous
          </button>
          <p className="text-gray-600 dark:text-gray-300">
            Page <span className="font-medium">{pageNumber}</span> of <span className="font-medium">{numPages || '--'}</span>
          </p>
          <button 
            onClick={goToNextPage} 
            disabled={pageNumber >= numPages}
            className="px-4 py-2 bg-[#0951fa] text-white rounded-full disabled:opacity-50"
          >
            Next →
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button onClick={zoomOut} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <span className="sr-only">Zoom Out</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <span className="sr-only">Zoom In</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button onClick={resetZoom} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <span className="sr-only">Reset Zoom</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button onClick={rotateCounterClockwise} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <span className="sr-only">Rotate Counter-Clockwise</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
          <span className="text-sm">{rotation}°</span>
          <button onClick={rotateClockwise} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <span className="sr-only">Rotate Clockwise</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16 3a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0 010-2h2.586l-4.293-4.293a1 1 0 011.414-1.414L15 6.586V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* PDF Document */}
      <div className="max-w-full overflow-auto bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-inner">
        <div className="flex justify-center">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0951fa] border-t-transparent"></div></div>}
            error={<div className="text-red-500 py-4">Failed to load PDF. Please make sure the URL is correct.</div>}
            className="shadow-xl"
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="pdf-page"
              loading={<div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-[800px] w-[600px]"></div>}
              error="An error occurred while loading the page."
              canvasBackground="transparent"
            />
          </Document>
        </div>
      </div>

      {/* Page controls for mobile/touch */}
      <div className="mt-4 flex justify-between w-full max-w-lg px-4">
        <button
          onClick={goToPreviousPage}
          disabled={pageNumber <= 1}
          className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={goToNextPage}
          disabled={pageNumber >= numPages}
          className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
        Use arrow keys for page navigation, + and - for zoom, 0 to reset zoom
      </p>
    </div>
  );
}
