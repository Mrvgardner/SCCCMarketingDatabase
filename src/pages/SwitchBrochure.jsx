import { useEffect } from 'react';
import DirectPDFLink from '../components/DirectPDFLink';

export default function SwitchBrochurePage() {
  useEffect(() => {
    document.title = 'Switch Commerce Brochure';
  }, []);

  return (
    <DirectPDFLink 
      pdfUrl="/brochures/SwitchCommerceClearChoiceBrochure.pdf" 
      title="Switch Commerce Brochure" 
    />
  );
}
