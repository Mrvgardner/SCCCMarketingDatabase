import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const LUMIO_STYLES = `
  #lumio-form {
    font-family: inherit;
    color: #f3f4f6;
  }
  #lumio-form h1,
  #lumio-form h2,
  #lumio-form h3 {
    display: none;
  }
  #lumio-form > p,
  #lumio-form form > p,
  #lumio-form > div > p:first-child {
    display: none;
  }
  #lumio-form label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #d1d5db;
    margin-bottom: 0.375rem;
  }
  #lumio-form input[type="text"],
  #lumio-form input[type="email"],
  #lumio-form input[type="date"],
  #lumio-form input[type="url"],
  #lumio-form textarea,
  #lumio-form select {
    width: 100%;
    background: rgba(31, 41, 55, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
    color: #f9fafb;
    font-size: 0.875rem;
    font-family: inherit;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
    appearance: none;
    -webkit-appearance: none;
    color-scheme: dark;
  }
  #lumio-form input::placeholder,
  #lumio-form textarea::placeholder {
    color: #6b7280;
  }
  #lumio-form input:focus,
  #lumio-form textarea:focus,
  #lumio-form select:focus {
    outline: none;
    border-color: rgba(147, 51, 234, 0.6);
    box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.15);
  }
  #lumio-form textarea {
    resize: vertical;
    min-height: 120px;
  }
  #lumio-form select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1rem;
    padding-right: 2.5rem;
    cursor: pointer;
  }
  #lumio-form select option {
    background: #1f2937;
    color: #f9fafb;
  }
  #lumio-form button[type="submit"],
  #lumio-form input[type="submit"],
  #lumio-form .lumio-submit,
  #lumio-form button:not([type]) {
    width: 100%;
    background: linear-gradient(135deg, #9333ea, #7c22d4);
    color: #ffffff;
    font-weight: 600;
    font-size: 0.9375rem;
    padding: 0.875rem 1.5rem;
    border: none;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
    margin-top: 0.5rem;
    font-family: inherit;
    box-shadow: 0 4px 20px rgba(147, 51, 234, 0.25);
  }
  #lumio-form button[type="submit"]:hover,
  #lumio-form input[type="submit"]:hover,
  #lumio-form button:not([type]):hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  #lumio-form button[type="submit"]:active,
  #lumio-form input[type="submit"]:active {
    transform: translateY(0);
  }
  #lumio-form > div,
  #lumio-form form > div {
    margin-bottom: 1.25rem;
  }
  #lumio-form .lumio-powered,
  #lumio-form [class*="powered"] {
    color: #4b5563;
    font-size: 0.75rem;
    text-align: right;
    margin-top: 1rem;
  }
  #lumio-form .lumio-error,
  #lumio-form [class*="error"] {
    color: #f87171;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
  #lumio-form .lumio-success,
  #lumio-form [class*="success"] {
    color: #86efac;
  }
`;

function FormLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="h-8 w-8 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
      <p className="text-sm text-gray-400">Loading Request Form</p>
    </div>
  );
}

export default function MarketingRequestPage() {
  const scriptRef = useRef(null);
  const [formLoaded, setFormLoaded] = useState(false);

  useEffect(() => {
    document.title = 'Marketing Request Form - Switch Commerce';
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = LUMIO_STYLES;
    document.head.appendChild(style);

    const formEl = document.getElementById('lumio-form');
    const observer = new MutationObserver(() => {
      if (formEl && formEl.children.length > 0) {
        setFormLoaded(true);
        observer.disconnect();
      }
    });
    if (formEl) {
      observer.observe(formEl, { childList: true, subtree: true });
    }

    const script = document.createElement('script');
    script.src = `https://lumioboards.netlify.app/embed.js?v=${Date.now()}`;
    script.setAttribute('data-form', 'marketing-requests-7proue');
    script.setAttribute('data-target', '#lumio-form');
    script.async = true;
    scriptRef.current.appendChild(script);

    return () => {
      observer.disconnect();
      document.head.removeChild(style);
      if (scriptRef.current?.contains(script)) {
        scriptRef.current.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <div className="py-6 sm:py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors text-sm"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="font-switch-bold text-2xl sm:text-3xl mb-2 bg-gradient-to-r from-[#9333ea] to-[#c084fc] bg-clip-text text-transparent">
            Marketing Request
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl">
            Submit your requests and our team will get back to you promptly.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <div className="rounded-2xl bg-gray-900/40 border border-white/10 backdrop-blur-md p-6 sm:p-8 shadow-xl">
          {!formLoaded && <FormLoader />}
          <div ref={scriptRef} style={formLoaded ? undefined : { display: 'none' }}>
            <div id="lumio-form" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-3xl mx-auto px-4 py-8 text-center text-gray-400 text-sm">
        <p>Questions? <a href="mailto:marketing@switchcommerce.com" className="text-gray-200 hover:text-white underline transition-colors">Contact the marketing team</a> directly.</p>
      </div>
    </div>
  );
}
