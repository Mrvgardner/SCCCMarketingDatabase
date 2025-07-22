import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * BrandGuidelines - Component for displaying brand guidelines including colors, typography, logos
 */
export default function BrandGuidelines({ 
  brandName, 
  brandDescription, 
  brandColors,
  brandLogo,
  brandTagline,
  colorSection,
  typographySection,
  logosSection,
  styleKitDownload,
  heroBackground = "from-gray-900 to-gray-800",
  primaryColor,
  accentColor
}) {
  const [activeSection, setActiveSection] = useState('colors');
  
  const sections = [
    { id: 'colors', label: 'Colors' },
    { id: 'typography', label: 'Typography' },
    { id: 'logos', label: 'Logos & Assets' },
    { id: 'usage', label: 'Usage Guidelines' },
  ];
  
  return (
    <div className={`min-h-screen bg-gradient-to-b ${heroBackground} text-white`}>
      {/* Hero Section */}
      <div className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-10 md:mb-0 md:mr-10">
              <Link 
                to="/"
                className="inline-flex items-center text-sm font-medium text-gray-300 hover:text-white mb-6"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Home
              </Link>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {brandName} <span className={`text-${primaryColor}`}>Brand Guidelines</span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-2xl">
                {brandDescription}
              </p>
              
              {styleKitDownload && (
                <a
                  href={styleKitDownload.url}
                  download
                  className={`mt-8 inline-flex items-center px-6 py-3 bg-${primaryColor} hover:bg-opacity-90 text-white font-medium rounded-lg transition-colors shadow-lg`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  {styleKitDownload.label}
                </a>
              )}
            </div>
            
            {brandLogo && (
              <div className="w-64 h-64 flex items-center justify-center">
                <img 
                  src={brandLogo} 
                  alt={`${brandName} Logo`}
                  className="max-w-full max-h-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="bg-gray-800 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex overflow-x-auto no-scrollbar">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeSection === section.id
                    ? `border-b-2 border-${primaryColor} text-white`
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Colors Section */}
        {activeSection === 'colors' && (
          <div className="space-y-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4">Brand Colors</h2>
              <p className="text-gray-300 max-w-3xl">
                Our color palette reinforces our brand identity. These colors should be used consistently across all materials.
              </p>
            </div>
            
            {colorSection}
          </div>
        )}
        
        {/* Typography Section */}
        {activeSection === 'typography' && (
          <div className="space-y-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4">Typography</h2>
              <p className="text-gray-300 max-w-3xl">
                Typography plays a crucial role in our brand identity. Consistent use of our brand fonts ensures recognition and reinforces our brand values.
              </p>
            </div>
            
            {typographySection}
          </div>
        )}
        
        {/* Logos Section */}
        {activeSection === 'logos' && (
          <div className="space-y-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4">Logos & Brand Assets</h2>
              <p className="text-gray-300 max-w-3xl">
                Our logo is the most visible element of our brand identity. Follow these guidelines to ensure consistent and proper usage.
              </p>
            </div>
            
            {logosSection}
          </div>
        )}
        
        {/* Usage Guidelines Section */}
        {activeSection === 'usage' && (
          <div className="space-y-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4">Usage Guidelines</h2>
              <p className="text-gray-300 max-w-3xl">
                Proper application of our brand elements is crucial for maintaining brand integrity and recognition.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Do's and Don'ts</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-green-500 font-semibold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Do's
                  </h4>
                  <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2">
                    <li>Use the approved color palette consistently</li>
                    <li>Maintain proper spacing around the logo</li>
                    <li>Use the recommended font pairings</li>
                    <li>Follow the sizing guidelines for the logo</li>
                    <li>Request approval for new design applications</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-red-500 font-semibold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Don'ts
                  </h4>
                  <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2">
                    <li>Alter the logo colors or proportions</li>
                    <li>Add effects like shadows or outlines to the logo</li>
                    <li>Use unapproved fonts in official communications</li>
                    <li>Crowd the logo with other elements</li>
                    <li>Use outdated versions of brand assets</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Minimum Size Requirements</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                To ensure legibility and brand integrity, follow these minimum size requirements when using our logo.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                  <div className="text-center mb-2 text-gray-700 dark:text-gray-300 text-sm">Print</div>
                  <div className="font-semibold text-center text-gray-900 dark:text-gray-100">25mm width</div>
                </div>
                
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                  <div className="text-center mb-2 text-gray-700 dark:text-gray-300 text-sm">Digital</div>
                  <div className="font-semibold text-center text-gray-900 dark:text-gray-100">100px width</div>
                </div>
                
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                  <div className="text-center mb-2 text-gray-700 dark:text-gray-300 text-sm">Social Media</div>
                  <div className="font-semibold text-center text-gray-900 dark:text-gray-100">60px width</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
