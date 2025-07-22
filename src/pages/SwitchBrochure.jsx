import { useEffect } from 'react';
import BrochurePage from '../components/BrochurePage';

export default function SwitchBrochurePage() {
  useEffect(() => {
    document.title = 'Switch Commerce Brochure';
  }, []);

  return (
    <BrochurePage 
      pdfUrl="/brochures/switch-brochure.pdf" 
      title="Switch Commerce Brochure" 
    />
  );
}
