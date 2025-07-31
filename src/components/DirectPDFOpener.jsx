import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// This component renders nothing but triggers PDF opening in a new window
// and then redirects back to the home page
export default function DirectPDFOpener({ pdfUrl }) {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Open the PDF in a new window/tab
    window.open(pdfUrl, '_blank');
    
    // Immediately navigate back to the homepage
    navigate('/');
  }, [pdfUrl, navigate]);
  
  // Return null because this component doesn't render anything
  return null;
}
