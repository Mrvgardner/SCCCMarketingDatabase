import React from 'react';
import { useEffect } from 'react';
import BrandGuidelines from '../components/BrandGuidelines';
import ColorPalette from '../components/ColorPalette';
import FontDisplay from '../components/FontDisplay';
import LogoDisplay from '../components/LogoDisplay';
import UsageGuidelines from '../components/UsageGuidelines';

export default function ClearChoiceBrandingPage() {
  useEffect(() => {
    document.title = 'Clear Choice Brand Guidelines';
  }, []);

  // Define Clear Choice brand colors - Updated with official brand colors
  const clearChoiceColors = [
    {
      name: 'Primary Orange',
      hex: '#ff4f00',
      rgb: 'rgb(255, 79, 0)',
      cmyk: 'C0 M80 Y100 K0',
      description: 'Main brand color, used for primary elements, logo, and key UI components'
    },
    {
      name: 'Dark Orange',
      hex: '#e04600',
      rgb: 'rgb(224, 70, 0)',
      cmyk: 'C0 M80 Y100 K12',
      description: 'Used for buttons, active states, and interactive elements'
    },
    {
      name: 'Light Orange',
      hex: '#ff7e40',
      rgb: 'rgb(255, 126, 64)',
      cmyk: 'C0 M60 Y75 K0',
      description: 'Used for highlights, accents, and secondary elements'
    },
    {
      name: 'Charcoal',
      hex: '#333333',
      rgb: 'rgb(51, 51, 51)',
      cmyk: 'C0 M0 Y0 K80',
      description: 'Used for text, headers, and dark UI elements'
    },
    {
      name: 'White',
      hex: '#ffffff',
      rgb: 'rgb(255, 255, 255)',
      cmyk: 'C0 M0 Y0 K0',
      description: 'Used for backgrounds, text on dark colors, and clean UI elements'
    },
    {
      name: 'Light Gray',
      hex: '#f3f4f6',
      rgb: 'rgb(243, 244, 246)',
      cmyk: 'C2 M1 Y0 K4',
      description: 'Used for subtle backgrounds, cards, and form elements'
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

  // Define Clear Choice typography - Updated with official brand fonts
  const clearChoiceFonts = [
    {
      name: 'Poppins',
      family: 'Poppins, sans-serif',
      cssFamily: "'Poppins', sans-serif",
      description: 'Primary font for all headings and display text',
      usage: 'Used for all headings, navigation, buttons, and key brand messages',
      weights: [
        { name: 'Regular', value: 400 },
        { name: 'Medium', value: 500 },
        { name: 'Semi-bold', value: 600 },
        { name: 'Bold', value: 700 },
        { name: 'Black', value: 900 }
      ],
      samples: [
        { name: 'Heading 1', size: '2.75rem', weight: 700, lineHeight: 1.2, text: 'Clear Pricing. Clear Choice.' },
        { name: 'Heading 2', size: '2rem', weight: 600, lineHeight: 1.3, text: 'Transparent Payment Solutions' },
        { name: 'Heading 3', size: '1.5rem', weight: 600, lineHeight: 1.4, text: 'No Hidden Fees, Ever' },
        { name: 'Heading 4', size: '1.25rem', weight: 500, lineHeight: 1.4, text: 'Customer-First Support' },
        { name: 'Button', size: '0.875rem', weight: 600, lineHeight: 1.25, text: 'GET STARTED TODAY' }
      ]
    },
    {
      name: 'Open Sans',
      family: 'Open Sans, sans-serif',
      cssFamily: "'Open Sans', sans-serif",
      description: 'Secondary font for body text and UI elements',
      usage: 'Used for all body copy, paragraphs, lists, form labels, and general content',
      weights: [
        { name: 'Light', value: 300 },
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

  // Define Clear Choice logos - Updated with official usage guidelines
  const clearChoiceLogos = [
    {
      name: 'Primary Logo (Full Color)',
      src: '/logos/clear-choice-logo.png',
      description: 'Official full-color logo for primary brand applications',
      bgClass: 'bg-white',
      clearSpace: '25px (minimum) on all sides',
      minSize: 'Print: 1.25" wide; Digital: 100px wide',
      formats: [
        { type: 'PNG', url: '/downloads/clear-choice-logo.png' },
        { type: 'SVG', url: '/downloads/clear-choice-logo.svg' },
        { type: 'EPS', url: '/downloads/clear-choice-logo.eps' }
      ],
      usage: 'Use the primary logo on white or light backgrounds. Do not place on complex patterns or busy backgrounds. Always maintain minimum clear space around all sides of the logo.'
    },
    {
      name: 'Inverted Logo (White)',
      src: '/logos/clear-choice-logo-white.png',
      description: 'White version for use on dark or colored backgrounds',
      bgClass: 'bg-[#333333]',
      clearSpace: '25px (minimum) on all sides',
      minSize: 'Print: 1.25" wide; Digital: 100px wide',
      formats: [
        { type: 'PNG', url: '/downloads/clear-choice-logo-white.png' },
        { type: 'SVG', url: '/downloads/clear-choice-logo-white.svg' },
        { type: 'EPS', url: '/downloads/clear-choice-logo-white.eps' }
      ],
      usage: 'Use the white logo on dark backgrounds, the brand orange background, or any colored background with sufficient contrast. Never use on light backgrounds or where contrast is poor.'
    },
    {
      name: 'Icon Only ("CC" Mark)',
      src: '/logos/clear-choice-icon.png',
      description: 'The Clear Choice "CC" icon for applications where space is limited',
      bgClass: 'bg-gray-100',
      clearSpace: '15px (minimum) on all sides',
      minSize: 'Print: 0.5" tall; Digital: 40px tall',
      formats: [
        { type: 'PNG', url: '/downloads/clear-choice-icon.png' },
        { type: 'SVG', url: '/downloads/clear-choice-icon.svg' },
        { type: 'EPS', url: '/downloads/clear-choice-icon.eps' }
      ],
      usage: 'Use the CC icon for favicons, app icons, social media profiles, and other space-constrained applications. Always ensure the icon is clearly visible and not crowded by other elements.'
    },
    {
      name: 'Horizontal Logo',
      src: '/logos/clear-choice-horizontal.png',
      description: 'For use in horizontal space constraints',
      bgClass: 'bg-white',
      clearSpace: '25px (minimum) on all sides',
      minSize: 'Print: 1.25" wide; Digital: 100px wide',
      formats: [
        { type: 'PNG', url: '/downloads/clear-choice-horizontal.png' },
        { type: 'SVG', url: '/downloads/clear-choice-horizontal.svg' },
        { type: 'EPS', url: '/downloads/clear-choice-horizontal.eps' }
      ],
      usage: 'Use the horizontal logo for website headers, email signatures, letterheads, and other applications with horizontal space constraints.'
    }
  ];
  
  // Usage guidelines and rules
  const usageGuidelines = [
    {
      title: 'Brand Positioning',
      content: 'Clear Choice is positioned as the transparent, straightforward alternative in payment processing. All communications should reflect our commitment to clarity and honesty.'
    },
    {
      title: 'Logo Protection',
      content: 'Always maintain the integrity of the logo. Never stretch, distort, change colors, or rearrange the elements of the logo.'
    },
    {
      title: 'Color Application',
      content: 'The primary orange should be used consistently and prominently in all brand communications to build recognition.'
    },
    {
      title: 'Typography Hierarchy',
      content: 'Maintain the proper hierarchy of fonts: Poppins for headlines and important content, Open Sans for body text and supporting information.'
    },
    {
      title: 'Imagery Style',
      content: 'Use bright, clean imagery that conveys transparency and simplicity. Avoid overly complex or cluttered visuals.'
    }
  ];

  return (
    <BrandGuidelines 
      brandName="Clear Choice"
      brandDescription="Clear Choice is the transparent alternative in payment processing, offering straightforward solutions with no hidden fees. Our brand identity emphasizes clarity, honesty, and simplicity—core values that guide everything we do."
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
      usageGuidelinesSection={<UsageGuidelines guidelines={usageGuidelines} />}
    />
  );
}
