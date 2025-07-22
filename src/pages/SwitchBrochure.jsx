import { useEffect } from 'react';
import PDFViewer from '../components/PDFViewer';

export default function SwitchBrochurePage() {
  useEffect(() => {
    document.title = 'Switch Commerce Brochure';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
      <PDFViewer 
        pdfUrl="/brochures/switch-brochure.pdf" 
        title="Switch Commerce Brochure" 
      />
    </div>
  );
}
