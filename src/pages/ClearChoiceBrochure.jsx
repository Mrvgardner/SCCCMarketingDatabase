import { useEffect } from 'react';
import PDFBrochureViewer from '../components/PDFBrochureViewer';

export default function ClearChoiceBrochurePage() {
  useEffect(() => {
    document.title = 'Clear Choice Brochure';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
      <PDFBrochureViewer 
        pdfUrl="/brochures/clearchoice-brochure.pdf" 
        title="Clear Choice Brochure"
        fallbackUrl="/brochures/clear-choice-brochure.pdf" 
      />
    </div>
  );
}
