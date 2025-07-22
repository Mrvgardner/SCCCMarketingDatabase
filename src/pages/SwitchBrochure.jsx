import { useEffect } from 'react';
import PDFBrochureViewer from '../components/PDFBrochureViewer';

export default function SwitchBrochurePage() {
  useEffect(() => {
    document.title = 'Switch Commerce Brochure';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
      <PDFBrochureViewer 
        pdfUrl="/brochures/switch-brochure.pdf" 
        title="Switch Commerce Brochure"
        fallbackUrl="/brochures/switch-commerce-brochure.pdf" 
      />
    </div>
  );
}
