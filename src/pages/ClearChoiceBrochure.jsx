import { useEffect } from 'react';
import BrochurePage from '../components/BrochurePage';

export default function ClearChoiceBrochurePage() {
  useEffect(() => {
    document.title = 'Clear Choice Brochure';
  }, []);

  return (
    <BrochurePage 
      pdfUrl="/brochures/clearchoice-brochure.pdf" 
      title="Clear Choice Brochure" 
    />
  );
}
