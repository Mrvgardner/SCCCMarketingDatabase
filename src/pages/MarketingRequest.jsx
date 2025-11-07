import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MarketingRequestPage() {
  useEffect(() => {
    document.title = 'Marketing Request Form - Switch Commerce';
    
    // Load Typeform embed script
    const script = document.createElement('script');
    script.src = '//embed.typeform.com/next/embed.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0951fa] to-[#002b5e]">
      {/* Header */}
      <div className="text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-4">Marketing Request Form</h1>
          <p className="text-xl text-white/90 max-w-3xl">
            Submit your marketing requests, campaign ideas, and project inquiries. 
            Our team will review and get back to you promptly.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Typeform Embed */}
        <div 
          data-tf-live="01K9DD51ZAQBYYXREMECWSSXJB"
          style={{ minHeight: '700px', width: '100%' }}
        ></div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-white/60">
        <p>Questions? <a href="mailto:marketing@switchcommerce.com" className="text-white/80 hover:text-white underline transition-colors">Contact the marketing team</a> directly.</p>
      </div>
    </div>
  );
}
