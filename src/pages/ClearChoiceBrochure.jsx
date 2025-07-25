import { useEffect } from 'react';
import DirectPDFLink from '../components/DirectPDFLink';

export default function ClearChoiceBrochurePage() {
  useEffect(() => {
    document.title = 'Clear Choice Brochure';
  }, []);

  return (
    <DirectPDFLink 
      pdfUrl="/brochures/clearchoice-brochure.pdf" 
      title="Clear Choice Brochure" 
    />
  );
}
