import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MarketingRequestPage() {
  useEffect(() => {
    document.title = 'Marketing Request Form - Switch Commerce';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="font-switch-bold text-5xl mb-4 bg-gradient-to-r from-[#9333ea] to-[#c084fc] bg-clip-text text-transparent">Marketing Request Form</h1>
          <p className="text-lg text-gray-300 max-w-3xl">
            Submit your marketing requests, campaign ideas, and project inquiries. Our team will review and get back to you promptly.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="rounded-2xl bg-gray-900/40 border border-white/10 backdrop-blur-md p-2 sm:p-4 shadow-xl overflow-hidden">
          <iframe
            src="https://lumioboards.netlify.app/f/marketing-request-cbkday"
            title="Marketing Request Form"
            className="w-full rounded-xl bg-white"
            style={{ height: '85vh', minHeight: '800px', border: 0 }}
            allow="clipboard-write"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-400">
        <p>Questions? <a href="mailto:marketing@switchcommerce.com" className="text-gray-200 hover:text-white underline transition-colors">Contact the marketing team</a> directly.</p>
      </div>
    </div>
  );
}
