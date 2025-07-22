import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PDFViewer from '../components/PDFViewer';

export default function ClearChoiceBrochurePage() {
  useEffect(() => {
    document.title = 'Clear Choice Brochure';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center">
        <Link to="/" className="inline-flex items-center text-gray-300 hover:text-white transition-colors">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
          </svg>
          Back to Home
        </Link>
        
        <a href="/brochures/clearchoice-brochure.pdf" download className="inline-flex items-center px-4 py-2 bg-[#0951fa] text-white rounded-full hover:bg-blue-700 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"></path>
          </svg>
          Download PDF
        </a>
      </div>
      
      <PDFViewer 
        pdfUrl="/brochures/clearchoice-brochure.pdf" 
        title="Clear Choice Brochure" 
      />
    </div>
  );
}
