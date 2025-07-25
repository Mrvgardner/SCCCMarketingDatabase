import React from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import BrandGuidelines from '../components/BrandGuidelines';
import ColorPalette from '../components/ColorPalette';
import FontDisplay from '../components/FontDisplay';
import EnhancedLogoDisplay from '../components/EnhancedLogoDisplay';
import UsageGuidelines from '../components/UsageGuidelines';

export default function ClearChoiceBrandingPage() {
  useEffect(() => {
    document.title = 'Clear Choice Brand Guidelines';
  }, []);

  // Define Clear Choice brand colors - Official brand colors
  const clearChoiceColors = [
    {
      name: 'Primary Orange',
      hex: '#ff4f00',
      rgb: 'rgb(255, 79, 0)',
      cmyk: 'C0 M80 Y100 K0',
      description: 'Main brand color, used for primary elements, logo, and key UI components'
    },
    {
      name: 'Dark Blue',
      hex: '#002b5e',
      rgb: 'rgb(0, 43, 94)',
      cmyk: 'C100 M80 Y35 K21',
      description: 'Used for heavy titles, backgrounds, and areas needing visual weight'
    },
    {
      name: 'Light Gray',
      hex: '#e8e7e7',
      rgb: 'rgb(232, 231, 231)',
      cmyk: 'C0 M0 Y0 K10',
      description: 'Used for backgrounds, cards, and subtle separations'
    },
    {
      name: 'Medium Gray',
      hex: '#c2c2c2',
      rgb: 'rgb(194, 194, 194)',
      cmyk: 'C0 M0 Y0 K24',
      description: 'Used for borders, dividers, and secondary UI elements'
    },
    {
      name: 'Dark Gray',
      hex: '#75808d',
      rgb: 'rgb(117, 128, 141)',
      cmyk: 'C17 M9 Y0 K45',
      description: 'Used for text, icons, and UI elements requiring subtle emphasis'
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

  // Define Clear Choice typography - Official brand fonts
  const clearChoiceFonts = [
    {
      name: 'SWITCH COMMERCE BOLD',
      family: 'SWITCH COMMERCE BOLD, sans-serif',
      cssFamily: "SWITCH COMMERCE BOLD, sans-serif",
      description: 'Primary font for all headings and titles',
      usage: 'Used for all primary headings, titles, and high-emphasis text',
      weights: [
        { name: 'Bold', value: 700 }
      ],
      samples: [
        { name: 'Heading 1', size: '2.5rem', weight: 700, lineHeight: 1.2, text: 'PAYMENTS WITHOUT LIMITS' },
        { name: 'Heading 2', size: '2rem', weight: 700, lineHeight: 1.3, text: 'TRANSPARENT SOLUTIONS' },
        { name: 'Heading 3', size: '1.5rem', weight: 700, lineHeight: 1.4, text: 'NO HIDDEN FEES, EVER' }
      ]
    },
    {
      name: 'SWITCH COMMERCE REG',
      family: 'SWITCH COMMERCE REG, sans-serif',
      cssFamily: "SWITCH COMMERCE REG, sans-serif",
      description: 'Font for sub-titles and secondary headings',
      usage: 'Used for sub-titles, secondary headings, and medium-emphasis text',
      weights: [
        { name: 'Regular', value: 400 }
      ],
      samples: [
        { name: 'Sub-heading', size: '1.25rem', weight: 400, lineHeight: 1.4, text: 'CLEAR PRICING. CLEAR CHOICE.' },
        { name: 'Caption', size: '1rem', weight: 400, lineHeight: 1.5, text: 'HELPING BUSINESSES GROW WITH TRANSPARENT SOLUTIONS' }
      ]
    },
    {
      name: 'Lato',
      family: 'Lato, sans-serif',
      cssFamily: "'Lato', sans-serif",
      description: 'Body text font',
      usage: 'Used for paragraphs, descriptions, tables, form labels, and general content',
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

  // Define Clear Choice logos - Using actual logo files from the project
  const clearChoiceLogos = [
    // Main Logos
    {
      name: 'Primary Logo (Full Color)',
      src: '/logos/clearchoice/Logo Main/CC Logo Full.png',
      description: 'Official full-color logo for primary brand applications',
      bgClass: 'bg-white',
      clearSpace: '25px (minimum) on all sides',
      minSize: 'Print: 1.25" wide; Digital: 100px wide',
      formats: [
        { type: 'PNG', url: '/logos/clearchoice/Logo Main/CC Logo Full.png' }
      ],
      usage: 'Use the primary logo on white or light backgrounds. Do not place on complex patterns or busy backgrounds.',
      category: 'Logo Main'
    },
    {
      name: 'White & Orange Logo',
      src: '/logos/clearchoice/Logo Main/CC Logo Full White & Orange.png',
      description: 'White and orange version for use on dark backgrounds',
      bgClass: 'bg-[#002b5e]',
      clearSpace: '25px (minimum) on all sides',
      minSize: 'Print: 1.25" wide; Digital: 100px wide',
      formats: [
        { type: 'PNG', url: '/logos/clearchoice/Logo Main/CC Logo Full White & Orange.png' }
      ],
      usage: 'Use the white logo on dark backgrounds, the brand orange background, or any colored background with sufficient contrast.',
      category: 'Logo Main'
    },
    {
      name: 'Blue & White Logo',
      src: '/logos/clearchoice/Logo Main/CC Logo Full Blue & White.png',
      description: 'Blue and white version for specific applications',
      bgClass: 'bg-[#75808d]',
      clearSpace: '25px (minimum) on all sides',
      minSize: 'Print: 1.25" wide; Digital: 100px wide',
      formats: [
        { type: 'PNG', url: '/logos/clearchoice/Logo Main/CC Logo Full Blue & White.png' }
      ],
      usage: 'Use this version for specific applications where the brand blue needs to be emphasized.',
      category: 'Logo Main'
    },
    {
      name: 'All White Logo',
      src: '/logos/clearchoice/Logo Main/CC Logo Full White.png',
      description: 'All white version for dark backgrounds',
      bgClass: 'bg-[#002b5e]',
      clearSpace: '25px (minimum) on all sides',
      minSize: 'Print: 1.25" wide; Digital: 100px wide',
      formats: [
        { type: 'PNG', url: '/logos/clearchoice/Logo Main/CC Logo Full White.png' }
      ],
      usage: 'Use the all white logo on dark or colored backgrounds where a monochromatic look is desired.',
      category: 'Logo Main'
    },
    
    // Logo No Tag
    {
      name: 'Logo without Tagline',
      src: '/logos/clearchoice/Logo No Tag/CC Logo No Tag.png',
      description: 'Standard logo without tagline',
      bgClass: 'bg-white',
      clearSpace: '25px (minimum) on all sides',
      minSize: 'Print: 1.25" wide; Digital: 100px wide',
      formats: [
        { type: 'PNG', url: '/logos/clearchoice/Logo No Tag/CC Logo No Tag.png' }
      ],
      usage: 'Use this version when the tagline would be too small to read or when the brand is already well established in context.',
      category: 'Logo No Tag'
    },
    {
      name: 'White & Orange (No Tag)',
      src: '/logos/clearchoice/Logo No Tag/CC Logo No Tag White & Orange.png',
      description: 'White and orange version without tagline',
      bgClass: 'bg-[#002b5e]',
      clearSpace: '25px (minimum) on all sides',
      minSize: 'Print: 1.25" wide; Digital: 100px wide',
      formats: [
        { type: 'PNG', url: '/logos/clearchoice/Logo No Tag/CC Logo No Tag White & Orange.png' }
      ],
      usage: 'Use on dark backgrounds when the tagline is not needed.',
      category: 'Logo No Tag'
    },
    {
      name: 'Blue & White (No Tag)',
      src: '/logos/clearchoice/Logo No Tag/CC Logo No Tag Blue & White.png',
      description: 'Blue and white version without tagline',
      bgClass: 'bg-[#75808d]',
      clearSpace: '25px (minimum) on all sides',
      minSize: 'Print: 1.25" wide; Digital: 100px wide',
      formats: [
        { type: 'PNG', url: '/logos/clearchoice/Logo No Tag/CC Logo No Tag Blue & White.png' }
      ],
      usage: 'Use this version when emphasizing brand blue without the tagline.',
      category: 'Logo No Tag'
    },
    {
      name: 'All White (No Tag)',
      src: '/logos/clearchoice/Logo No Tag/CC Logo No Tag White.png',
      description: 'All white version without tagline',
      bgClass: 'bg-[#002b5e]',
      clearSpace: '25px (minimum) on all sides',
      minSize: 'Print: 1.25" wide; Digital: 100px wide',
      formats: [
        { type: 'PNG', url: '/logos/clearchoice/Logo No Tag/CC Logo No Tag White.png' }
      ],
      usage: 'Use on dark backgrounds when a monochromatic look is desired without the tagline.',
      category: 'Logo No Tag'
    },
    
    // Icon Only
    {
      name: 'Icon Only',
      src: '/logos/clearchoice/Logo Icon/CC Logo Only.png',
      description: 'The Clear Choice icon for space-constrained applications',
      bgClass: 'bg-white',
      clearSpace: '20px (minimum) on all sides',
      minSize: 'Print: 0.5" tall; Digital: 48px tall',
      formats: [
        { type: 'PNG', url: '/logos/clearchoice/Logo Icon/CC Logo Only.png' }
      ],
      usage: 'Use the icon only when space is limited or when the brand is already established in context.',
      category: 'Logo Icon'
    },
    {
      name: 'Blue & White Icon',
      src: '/logos/clearchoice/Logo Icon/CC Logo Only- Blue & Whi.png',
      description: 'Blue and white version of the icon',
      bgClass: 'bg-[#75808d]',
      clearSpace: '20px (minimum) on all sides',
      minSize: 'Print: 0.5" tall; Digital: 48px tall',
      formats: [
        { type: 'PNG', url: '/logos/clearchoice/Logo Icon/CC Logo Only- Blue & Whi.png' }
      ],
      usage: 'Use the blue and white icon on light backgrounds.',
      category: 'Logo Icon'
    },
    {
      name: 'Orange & White Icon',
      src: '/logos/clearchoice/Logo Icon/CC Logo Only- Orange & W.png',
      description: 'Orange and white version of the icon',
      bgClass: 'bg-[#002b5e]',
      clearSpace: '20px (minimum) on all sides',
      minSize: 'Print: 0.5" tall; Digital: 48px tall',
      formats: [
        { type: 'PNG', url: '/logos/clearchoice/Logo Icon/CC Logo Only- Orange & W.png' }
      ],
      usage: 'Use the orange and white icon on dark backgrounds.',
      category: 'Logo Icon'
    },
    {
      name: 'All White Icon',
      src: '/logos/clearchoice/Logo Icon/CC Logo Only- White.png',
      description: 'All white version of the icon',
      bgClass: 'bg-[#002b5e]',
      clearSpace: '20px (minimum) on all sides',
      minSize: 'Print: 0.5" tall; Digital: 48px tall',
      formats: [
        { type: 'PNG', url: '/logos/clearchoice/Logo Icon/CC Logo Only- White.png' }
      ],
      usage: 'Use the white icon on dark backgrounds when a monochromatic look is desired.',
      category: 'Logo Icon'
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

  const ActionButtons = () => (
    <div className="flex flex-wrap gap-4 mb-6">
      <a 
        href="/downloads/BrandingKit.zip" 
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#ff4f00] hover:bg-[#e24600] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff4f00]"
        download
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download Brand Kit
      </a>
    </div>
  );

  return (
    <BrandGuidelines 
      brandName="Clear Choice"
      brandDescription="Clear Choice is the transparent alternative in payment processing, offering straightforward solutions with no hidden fees. Our brand tagline is 'Clear Pricing. Clear Choice.'"
      brandLogo="/logos/clearchoice/Logo Icon/CC Logo Only- Orange & W.png"
      heroBackground="from-[#002b5e] to-[#ff4f00]"
      primaryColor="[#ff4f00]"
      accentColor="[#002b5e]"
      actionButtons={<ActionButtons />}
      colorSection={<ColorPalette colors={clearChoiceColors} />}
      typographySection={<FontDisplay fonts={clearChoiceFonts} />}
      logosSection={<EnhancedLogoDisplay logos={clearChoiceLogos} />}
      usageGuidelinesSection={<UsageGuidelines guidelines={usageGuidelines} />}
    />
  );
}
