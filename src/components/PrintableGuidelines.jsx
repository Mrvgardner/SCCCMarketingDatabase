import React, { useEffect } from 'react';

/**
 * PrintableGuidelines Component
 * Creates a printable version of the brand guidelines
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to be printed
 * @param {string} props.title - The title of the document
 */
export default function PrintableGuidelines({ children, title }) {
  useEffect(() => {
    // Set the document title for printing
    document.title = title || 'Brand Guidelines';
    
    // Auto-trigger print dialog when the component mounts
    setTimeout(() => {
      window.print();
    }, 1000);
    
    return () => {
      // Reset the title when the component unmounts
      document.title = 'Switch Team Portal';
    };
  }, [title]);
  
  return (
    <div className="print-container max-w-6xl mx-auto p-8">
      <style type="text/css" media="print">{`
        @page {
          size: letter;
          margin: 1cm;
        }
        body {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .no-print {
          display: none !important;
        }
      `}</style>
      
      {children}
    </div>
  );
}
