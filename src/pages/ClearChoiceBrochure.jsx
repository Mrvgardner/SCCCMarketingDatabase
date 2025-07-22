import { useEffect } from 'react';
import PDFViewer from '../components/PDFViewer';

export default function ClearChoiceBrochurePage() {
  useEffect(() => {
    document.title = 'Clear Choice Brochure';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
      <PDFViewer 
        pdfUrl="/brochures/clear-choice-brochure.pdf" 
        title="Clear Choice Brochure" 
      />
    </div>
  );
}
