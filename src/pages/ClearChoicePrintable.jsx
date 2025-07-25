import React from 'react';
import { useNavigate } from 'react-router-dom';
import ClearChoiceBranding from '../pages/ClearChoiceBranding';
import PrintableGuidelines from '../components/PrintableGuidelines';

export default function ClearChoicePrintable() {
  const navigate = useNavigate();
  
  // Go back to regular branding page after print dialog closes or is canceled
  const handleAfterPrint = () => {
    setTimeout(() => {
      navigate('/clear-choice/branding');
    }, 1000);
  };
  
  React.useEffect(() => {
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);
  
  return (
    <PrintableGuidelines title="Clear Choice Brand Guidelines">
      <ClearChoiceBranding printMode={true} />
    </PrintableGuidelines>
  );
}
