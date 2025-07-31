import React from 'react';
import { useNavigate } from 'react-router-dom';
import SwitchCommerceBranding from '../pages/SwitchCommerceBranding';
import PrintableGuidelines from '../components/PrintableGuidelines';

export default function SwitchCommercePrintable() {
  const navigate = useNavigate();
  
  // Go back to regular branding page after print dialog closes or is canceled
  const handleAfterPrint = () => {
    setTimeout(() => {
      navigate('/switch-commerce/branding');
    }, 1000);
  };
  
  React.useEffect(() => {
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);
  
  return (
    <PrintableGuidelines title="Switch Commerce Brand Guidelines">
      <SwitchCommerceBranding printMode={true} />
    </PrintableGuidelines>
  );
}
