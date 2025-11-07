import React from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import BrandGuidelines from '../components/BrandGuidelines';
import ColorPalette from '../components/ColorPalette';
import FontDisplay from '../components/FontDisplay';
import EnhancedLogoDisplay from '../components/EnhancedLogoDisplay';
import UsageGuidelines from '../components/UsageGuidelines';

export default function SwitchCommerceBrandingPage() {
  useEffect(() => {
    document.title = 'Switch Commerce Brand Guidelines';
  }, []);

  // Define Switch Commerce brand colors - Official brand colors
  const switchColors = [
    {
      name: 'Primary Blue',
      hex: '#0951fa',
      rgb: 'rgb(9, 81, 250)',
      cmyk: 'C97 M68 Y0 K0',
      description: 'Main brand color, used to stand out in the design and for interactive elements'
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
      name: 'Warning Orange',
      hex: '#f59e0b',
      rgb: 'rgb(245, 158, 11)',
      cmyk: 'C0 M36 Y96 K4'
    }
  ];

  // Define Switch Commerce typography - Official brand fonts
  const switchFonts = [
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
        { name: 'Heading 1', size: '2.5rem', weight: 700, lineHeight: 1.2, text: 'GLOBAL TRANSACTIONS. CONNECTED.' },
        { name: 'Heading 2', size: '2rem', weight: 700, lineHeight: 1.3, text: 'ENTERPRISE PROCESSING' },
        { name: 'Heading 3', size: '1.5rem', weight: 700, lineHeight: 1.4, text: 'SECURITY & COMPLIANCE' }
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
        { name: 'Sub-heading', size: '1.25rem', weight: 400, lineHeight: 1.4, text: 'INNOVATIVE PAYMENT SOLUTIONS' },
        { name: 'Caption', size: '1rem', weight: 400, lineHeight: 1.5, text: 'CONNECTING BUSINESSES GLOBALLY' }
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
        { name: 'Medium', value: 500 },
        { name: 'Semi-bold', value: 600 }
      ],
      samples: [
        { name: 'Body Copy', size: '1rem', weight: 400, lineHeight: 1.5, text: 'Our payment solutions are designed to meet the needs of businesses of all sizes, from small startups to large enterprises.' },
        { name: 'UI Text', size: '0.875rem', weight: 400, lineHeight: 1.5, text: 'Configure your payment settings to match your business requirements.' },
        { name: 'Caption', size: '0.75rem', weight: 400, lineHeight: 1.5, text: 'Data refreshed: July 22, 2025' }
      ]
    }
  ];

  // Define Switch Commerce logos - Using actual logo files from the project
  const switchLogos = [
    // Main Logos
    {
      name: 'Primary Logo',
      src: '/logos/switch/Logo Main/SC Logo Main.png',
      description: 'Official logo for standard brand applications',
      bgClass: 'bg-white',
      clearSpace: '25px (minimum) on all sides',
      minSize: 'Print: 1.5" wide; Digital: 120px wide',
      formats: [
        { type: 'PNG', url: '/logos/switch/Logo Main/SC Logo Main.png' }
      ],
      usage: 'Use the main logo as the primary representation of our brand. Always maintain proper clear space around the logo.',
      category: 'Main Logos'
    },
    {
      name: 'Primary Logo (Blue)',
      src: '/logos/switch/Logo Main/SC Logo Main - Blue.png',
      description: 'Blue version of the main logo',
      bgClass: 'bg-[#75808d]',
      clearSpace: '25px (minimum) on all sides',
      minSize: 'Print: 1.5" wide; Digital: 120px wide',
      formats: [
        { type: 'PNG', url: '/logos/switch/Logo Main/SC Logo Main - Blue.png' }
      ],
      usage: 'Use the blue logo on white or light backgrounds.',
      category: 'Main Logos'
    },
    {
      name: 'Primary Logo (White)',
      src: '/logos/switch/Logo Main/SC Logo Main - White.png',
      description: 'White version for use on dark backgrounds',
      bgClass: 'bg-[#002b5e]',
      clearSpace: '25px (minimum) on all sides',
      minSize: 'Print: 1.5" wide; Digital: 120px wide',
      formats: [
        { type: 'PNG', url: '/logos/switch/Logo Main/SC Logo Main - White.png' }
      ],
      usage: 'Use the white logo on dark or colored backgrounds where sufficient contrast is ensured.',
      category: 'Main Logos'
    },
    
    // Icon Only Logos
    {
      name: 'Icon Only',
      src: '/logos/switch/Logo Icon/SC Logo.png',
      description: 'The Switch Commerce icon for space-constrained applications',
      bgClass: 'bg-white',
      clearSpace: '20px (minimum) on all sides',
      minSize: 'Print: 0.5" tall; Digital: 48px tall',
      formats: [
        { type: 'PNG', url: '/logos/switch/Logo Icon/SC Logo.png' }
      ],
      usage: 'Use the icon only when space is limited or when the brand is already well established in context.',
      category: 'Icon Logos'
    },
    {
      name: 'Icon Only (Blue)',
      src: '/logos/switch/Logo Icon/SC Logo - Blue.png',
      description: 'Blue version of the icon',
      bgClass: 'bg-[#75808d]',
      clearSpace: '20px (minimum) on all sides',
      minSize: 'Print: 0.5" tall; Digital: 48px tall',
      formats: [
        { type: 'PNG', url: '/logos/switch/Logo Icon/SC Logo - Blue.png' }
      ],
      usage: 'Use the blue icon on white or light backgrounds.',
      category: 'Icon Logos'
    },
    {
      name: 'Icon Only (White)',
      src: '/logos/switch/Logo Icon/SC Logo - White.png',
      description: 'White version of the icon for dark backgrounds',
      bgClass: 'bg-[#002b5e]',
      clearSpace: '20px (minimum) on all sides',
      minSize: 'Print: 0.5" tall; Digital: 48px tall',
      formats: [
        { type: 'PNG', url: '/logos/switch/Logo Icon/SC Logo - White.png' }
      ],
      usage: 'Use the white icon on dark or colored backgrounds.',
      category: 'Icon Logos'
    },
    
    // Stacked Logos
    {
      name: 'Stacked Logo',
      src: '/logos/switch/Logo Stacked/SC Logo Stacked large.png',
      description: 'Stacked version of the logo for vertical layouts',
      bgClass: 'bg-white',
      clearSpace: '25px (minimum) on all sides',
      minSize: 'Print: 1.25" wide; Digital: 100px wide',
      formats: [
        { type: 'PNG', url: '/logos/switch/Logo Stacked/SC Logo Stacked large.png' }
      ],
      usage: 'Use the stacked logo when vertical space is plentiful but horizontal space is limited.',
      category: 'Stacked Logos'
    },
    {
      name: 'Stacked Logo (Blue)',
      src: '/logos/switch/Logo Stacked/SC Logo Stacked large - Blue.png',
      description: 'Blue version of the stacked logo',
      bgClass: 'bg-[#75808d]',
      clearSpace: '25px (minimum) on all sides',
      minSize: 'Print: 1.25" wide; Digital: 100px wide',
      formats: [
        { type: 'PNG', url: '/logos/switch/Logo Stacked/SC Logo Stacked large - Blue.png' }
      ],
      usage: 'Use the blue stacked logo on white or light backgrounds.',
      category: 'Stacked Logos'
    },
    {
      name: 'Stacked Logo (White)',
      src: '/logos/switch/Logo Stacked/SC Logo Stacked large - White.png',
      description: 'White version of the stacked logo',
      bgClass: 'bg-[#002b5e]',
      clearSpace: '25px (minimum) on all sides',
      minSize: 'Print: 1.25" wide; Digital: 100px wide',
      formats: [
        { type: 'PNG', url: '/logos/switch/Logo Stacked/SC Logo Stacked large - White.png' }
      ],
      usage: 'Use the white stacked logo on dark or colored backgrounds.',
      category: 'Stacked Logos'
    },
    {
      name: 'Small Stacked Logo',
      src: '/logos/switch/Logo Stacked/SC Logo Stacked Smalll.png',
      description: 'Smaller version of the stacked logo',
      bgClass: 'bg-white',
      clearSpace: '20px (minimum) on all sides',
      minSize: 'Print: 1" wide; Digital: 80px wide',
      formats: [
        { type: 'PNG', url: '/logos/switch/Logo Stacked/SC Logo Stacked Smalll.png' }
      ],
      usage: 'Use the small stacked logo when space is more limited.',
      category: 'Stacked Logos'
    },
    {
      name: 'Small Stacked Logo (Blue)',
      src: '/logos/switch/Logo Stacked/SC Logo Stacked Smalll - Blue.png',
      description: 'Blue version of the small stacked logo',
      bgClass: 'bg-[#75808d]',
      clearSpace: '20px (minimum) on all sides',
      minSize: 'Print: 1" wide; Digital: 80px wide',
      formats: [
        { type: 'PNG', url: '/logos/switch/Logo Stacked/SC Logo Stacked Smalll - Blue.png' }
      ],
      usage: 'Use the blue small stacked logo on white or light backgrounds.',
      category: 'Stacked Logos'
    },
    {
      name: 'Small Stacked Logo (White)',
      src: '/logos/switch/Logo Stacked/SC Logo Stacked Smalll - White.png',
      description: 'White version of the small stacked logo',
      bgClass: 'bg-[#002b5e]',
      clearSpace: '20px (minimum) on all sides',
      minSize: 'Print: 1" wide; Digital: 80px wide',
      formats: [
        { type: 'PNG', url: '/logos/switch/Logo Stacked/SC Logo Stacked Smalll - White.png' }
      ],
      usage: 'Use the white small stacked logo on dark or colored backgrounds.',
      category: 'Stacked Logos'
    }
  ];

  // Usage guidelines and rules
  const usageGuidelines = [
    {
      title: 'Logo Spacing',
      content: 'Always maintain minimum clear space around the logo. This space should be at least equal to the height of the "S" in the logo.'
    },
    {
      title: 'Size Requirements',
      content: 'Never use the logo at sizes where legibility is compromised. Minimum sizes: Print: 1.5" wide; Digital: 120px wide.'
    },
    {
      title: 'Prohibited Modifications',
      content: 'Do not rotate, distort, add effects, change colors, rearrange elements, or alter the logo in any way.'
    },
    {
      title: 'Background Control',
      content: 'Ensure sufficient contrast between the logo and its background. Use the inverted logo on dark or colored backgrounds.'
    },
    {
      title: 'Co-branding',
      content: 'When displaying our logo alongside partners, maintain equal visual weight and proper spacing.'
    }
  ];

  const ActionButtons = () => (
    <div className="flex flex-wrap gap-4 mb-6">
      <a 
        href="/downloads/BrandingKit.zip" 
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0951fa] hover:bg-[#0038cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0951fa]"
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
      brandName="Switch Commerce"
      brandDescription="Switch Commerce delivers innovative payment processing solutions that prioritize security, reliability, and merchant success. Our brand tagline is 'Global Transactions. Connected.'"
      brandLogo="/logos/switch/Logo Main/SC Logo Main - White.png"
      heroBackground="from-[#002b5e] to-[#0951fa]"
      primaryColor="[#0951fa]"
      accentColor="[#002b5e]"
      actionButtons={<ActionButtons />}
      colorSection={<ColorPalette colors={switchColors} />}
      typographySection={<FontDisplay fonts={switchFonts} />}
      logosSection={<EnhancedLogoDisplay logos={switchLogos} />}
      usageGuidelinesSection={<UsageGuidelines guidelines={usageGuidelines} />}
    />
  );
}
