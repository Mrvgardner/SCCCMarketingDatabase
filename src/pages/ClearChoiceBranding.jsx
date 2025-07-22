import React from 'react';
import { useEffect } from 'react';
import BrandGuidelines from '../components/BrandGuidelines';
import ColorPalette from '../components/ColorPalette';
import FontDisplay from '../components/FontDisplay';
import LogoDisplay from '../components/LogoDisplay';

export default function ClearChoiceBrandingPage() {
  useEffect(() => {
    document.title = 'Clear Choice Brand Guidelines';
  }, []);

  // Define Clear Choice brand colors
  const clearChoiceColors = [
    {
      name: 'Primary Orange',
      hex: '#ff4f00',
      rgb: 'rgb(255, 79, 0)',
      cmyk: 'C0 M69 Y100 K0'
    },
    {
      name: 'Dark Orange',
      hex: '#e04600',
      rgb: 'rgb(224, 70, 0)',
      cmyk: 'C0 M69 Y100 K12'
    },
    {
      name: 'Light Orange',
      hex: '#ff7e40',
      rgb: 'rgb(255, 126, 64)',
      cmyk: 'C0 M51 Y75 K0'
    },
    {
      name: 'Charcoal',
      hex: '#333333',
      rgb: 'rgb(51, 51, 51)',
      cmyk: 'C0 M0 Y0 K80'
    },
    {
      name: 'Gray',
      hex: '#6b7280',
      rgb: 'rgb(107, 114, 128)',
      cmyk: 'C16 M11 Y0 K50'
    },
    {
      name: 'Light Gray',
      hex: '#f3f4f6',
      rgb: 'rgb(243, 244, 246)',
      cmyk: 'C2 M1 Y0 K4'
    },
    {
      name: 'Success Green',
      hex: '#10b981',
      rgb: 'rgb(16, 185, 129)',
      cmyk: 'C91 M0 Y30 K27'
    },
    {
      name: 'Alert Red',
      hex: '#ef4444',
      rgb: 'rgb(239, 68, 68)',
      cmyk: 'C0 M72 Y72 K6'
    }
  ];

  // Define Clear Choice typography
  const clearChoiceFonts = [
    {
      name: 'Poppins',
      family: 'Poppins, sans-serif',
      cssFamily: "'Poppins', sans-serif",
      weights: [
        { name: 'Regular', value: 400 },
        { name: 'Medium', value: 500 },
        { name: 'Semi-bold', value: 600 },
        { name: 'Bold', value: 700 }
      ],
      samples: [
        { name: 'Heading 1', size: '2.5rem', weight: 700, lineHeight: 1.2, text: 'Clear Choice Solutions' },
        { name: 'Heading 2', size: '2rem', weight: 600, lineHeight: 1.3, text: 'Service Offerings' },
        { name: 'Heading 3', size: '1.5rem', weight: 600, lineHeight: 1.4, text: 'Customer Success' },
        { name: 'Body', size: '1rem', weight: 400, lineHeight: 1.5, text: 'Clear Choice provides industry-leading solutions with transparent pricing and exceptional customer service.' },
        { name: 'Button', size: '0.875rem', weight: 600, lineHeight: 1.25, text: 'LEARN MORE' }
      ]
    },
    {
      name: 'Open Sans',
      family: 'Open Sans, sans-serif',
      cssFamily: "'Open Sans', sans-serif",
      weights: [
        { name: 'Regular', value: 400 },
        { name: 'Semi-bold', value: 600 }
      ],
      samples: [
        { name: 'Body Copy', size: '1rem', weight: 400, lineHeight: 1.5, text: 'We make it easy for businesses to understand their payment options and choose the right solution for their needs.' },
        { name: 'UI Text', size: '0.875rem', weight: 400, lineHeight: 1.5, text: 'Select your preferred payment method from the available options.' },
        { name: 'Caption', size: '0.75rem', weight: 400, lineHeight: 1.5, text: 'Last updated: July 22, 2025' }
      ]
    }
  ];

  // Define Clear Choice logos
  const clearChoiceLogos = [
    {
      name: 'Primary Logo',
      src: '/logos/clear-choice-logo.png',
      description: 'Official logo for all primary brand applications',
      bgClass: 'bg-white',
      formats: [
        { type: 'PNG', url: '/downloads/clear-choice-logo.png' },
        { type: 'SVG', url: '/downloads/clear-choice-logo.svg' },
        { type: 'EPS', url: '/downloads/clear-choice-logo.eps' }
      ],
      usage: 'Use the primary logo on white or light backgrounds for maximum visibility.'
    },
    {
      name: 'Inverted Logo',
      src: '/logos/clear-choice-logo-white.png',
      description: 'For use on dark backgrounds',
      bgClass: 'bg-[#333333]',
      formats: [
        { type: 'PNG', url: '/downloads/clear-choice-logo-white.png' },
        { type: 'SVG', url: '/downloads/clear-choice-logo-white.svg' },
        { type: 'EPS', url: '/downloads/clear-choice-logo-white.eps' }
      ],
      usage: 'Use the inverted logo on dark backgrounds or colored backgrounds for better visibility.'
    },
    {
      name: 'Icon Only',
      src: '/logos/clear-choice-icon.png',
      description: 'For use in space-constrained applications',
      bgClass: 'bg-gray-100',
      formats: [
        { type: 'PNG', url: '/downloads/clear-choice-icon.png' },
        { type: 'SVG', url: '/downloads/clear-choice-icon.svg' },
        { type: 'EPS', url: '/downloads/clear-choice-icon.eps' }
      ],
      usage: 'Use the icon only when space is limited or when the brand is already established in context.'
    },
    {
      name: 'Horizontal Logo',
      src: '/logos/clear-choice-horizontal.png',
      description: 'For use in horizontal space constraints',
      bgClass: 'bg-white',
      formats: [
        { type: 'PNG', url: '/downloads/clear-choice-horizontal.png' },
        { type: 'SVG', url: '/downloads/clear-choice-horizontal.svg' },
        { type: 'EPS', url: '/downloads/clear-choice-horizontal.eps' }
      ],
      usage: 'Use the horizontal logo when vertical space is limited.'
    }
  ];

  return (
    <BrandGuidelines 
      brandName="Clear Choice"
      brandDescription="Clear Choice offers transparent payment solutions with straightforward pricing. Our brand identity emphasizes clarity, simplicity, and trustworthiness."
      brandLogo="/logos/clear-choice-logo.png"
      heroBackground="from-[#333333] to-[#222222]"
      primaryColor="[#ff4f00]"
      accentColor="[#ff7e40]"
      styleKitDownload={{
        url: '/downloads/clear-choice-brand-kit.zip',
        label: 'Download Brand Style Kit'
      }}
      colorSection={<ColorPalette colors={clearChoiceColors} />}
      typographySection={<FontDisplay fonts={clearChoiceFonts} />}
      logosSection={<LogoDisplay logos={clearChoiceLogos} />}
    />
  );
}
