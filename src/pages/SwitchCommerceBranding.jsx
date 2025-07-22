import React from 'react';
import { useEffect } from 'react';
import BrandGuidelines from '../components/BrandGuidelines';
import ColorPalette from '../components/ColorPalette';
import FontDisplay from '../components/FontDisplay';
import LogoDisplay from '../components/LogoDisplay';
import UsageGuidelines from '../components/UsageGuidelines';

export default function SwitchCommerceBrandingPage() {
  useEffect(() => {
    document.title = 'Switch Commerce Brand Guidelines';
  }, []);

  // Define Switch Commerce brand colors - Updated with official brand colors
  const switchColors = [
    {
      name: 'Primary Blue',
      hex: '#002b5e',
      rgb: 'rgb(0, 43, 94)',
      cmyk: 'C100 M80 Y35 K21',
      description: 'Main brand color, used for primary elements, headers, and key UI components'
    },
    {
      name: 'Secondary Blue',
      hex: '#0047ab',
      rgb: 'rgb(0, 71, 171)',
      cmyk: 'C100 M70 Y0 K0',
      description: 'Used for secondary elements, call-to-action buttons, and active states'
    },
    {
      name: 'Accent Blue',
      hex: '#1E90FF',
      rgb: 'rgb(30, 144, 255)',
      cmyk: 'C74 M35 Y0 K0',
      description: 'Used for highlights, links, and interactive elements'
    },
    {
      name: 'Dark Navy',
      hex: '#001133',
      rgb: 'rgb(0, 17, 51)',
      cmyk: 'C100 M95 Y45 K45',
      description: 'Used for dark backgrounds, footers, and text on light backgrounds'
    },
    {
      name: 'Light Blue',
      hex: '#E6F0FF',
      rgb: 'rgb(230, 240, 255)',
      cmyk: 'C10 M5 Y0 K0',
      description: 'Used for backgrounds, cards, and highlighting content areas'
    },
    {
      name: 'Gray',
      hex: '#6b7280',
      rgb: 'rgb(107, 114, 128)',
      cmyk: 'C16 M11 Y0 K50',
      description: 'Used for secondary text, borders, and dividers'
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

  // Define Switch Commerce typography - Updated with official brand fonts
  const switchFonts = [
    {
      name: 'Montserrat',
      family: 'Montserrat, sans-serif',
      cssFamily: "'Montserrat', sans-serif",
      description: 'Primary font for all headings, navigation, and key UI elements',
      usage: 'Used for all headings (H1-H4), navigation items, buttons, and high-emphasis text',
      weights: [
        { name: 'Regular', value: 400 },
        { name: 'Medium', value: 500 },
        { name: 'Semi-bold', value: 600 },
        { name: 'Bold', value: 700 },
        { name: 'Extra Bold', value: 800 }
      ],
      samples: [
        { name: 'Heading 1', size: '2.5rem', weight: 800, lineHeight: 1.2, text: 'Next Generation Payment Solutions' },
        { name: 'Heading 2', size: '2rem', weight: 700, lineHeight: 1.3, text: 'Enterprise Processing' },
        { name: 'Heading 3', size: '1.5rem', weight: 600, lineHeight: 1.4, text: 'Security & Compliance' },
        { name: 'Heading 4', size: '1.25rem', weight: 600, lineHeight: 1.4, text: 'Integration Options' },
        { name: 'Button', size: '0.875rem', weight: 600, lineHeight: 1.25, text: 'GET STARTED' }
      ]
    },
    {
      name: 'Open Sans',
      family: 'Open Sans, sans-serif',
      cssFamily: "'Open Sans', sans-serif",
      description: 'Secondary font used for body text and longer content',
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

  // Define Switch Commerce logos - Updated with official usage guidelines
  const switchLogos = [
    {
      name: 'Primary Logo (Full Color)',
      src: '/logos/switch-commerce-logo.png',
      description: 'Official full-color logo for standard brand applications',
      bgClass: 'bg-white',
      clearSpace: '30px (minimum) on all sides',
      minSize: 'Print: 1.5" wide; Digital: 120px wide',
      formats: [
        { type: 'PNG', url: '/downloads/switch-commerce-logo.png' },
        { type: 'SVG', url: '/downloads/switch-commerce-logo.svg' },
        { type: 'EPS', url: '/downloads/switch-commerce-logo.eps' }
      ],
      usage: 'Use the primary logo on white or light backgrounds. Always maintain proper clear space around the logo. Never distort, rotate, or alter the colors of the logo.'
    },
    {
      name: 'Inverted Logo (White)',
      src: '/logos/switch-commerce-logo-white.png',
      description: 'White version for use on dark backgrounds and colored backgrounds',
      bgClass: 'bg-[#002b5e]',
      clearSpace: '30px (minimum) on all sides',
      minSize: 'Print: 1.5" wide; Digital: 120px wide',
      formats: [
        { type: 'PNG', url: '/downloads/switch-commerce-logo-white.png' },
        { type: 'SVG', url: '/downloads/switch-commerce-logo-white.svg' },
        { type: 'EPS', url: '/downloads/switch-commerce-logo-white.eps' }
      ],
      usage: 'Use the white logo on dark backgrounds, colored backgrounds, or photographic backgrounds with sufficient contrast. Never place on backgrounds with inadequate contrast.'
    },
    {
      name: 'Icon Only (Mark)',
      src: '/logos/switch-commerce-icon.png',
      description: 'The Switch Commerce icon for space-constrained applications',
      bgClass: 'bg-gray-100',
      clearSpace: '20px (minimum) on all sides',
      minSize: 'Print: 0.5" tall; Digital: 48px tall',
      formats: [
        { type: 'PNG', url: '/downloads/switch-commerce-icon.png' },
        { type: 'SVG', url: '/downloads/switch-commerce-icon.svg' },
        { type: 'EPS', url: '/downloads/switch-commerce-icon.eps' }
      ],
      usage: 'Use the icon only when space is limited, for app icons, favicons, or when the full logo would be illegible at small sizes. The icon should only be used when the Switch Commerce name is already established in context.'
    },
    {
      name: 'Horizontal Logo',
      src: '/logos/switch-commerce-horizontal.png',
      description: 'For use in horizontal space constraints',
      bgClass: 'bg-white',
      clearSpace: '30px (minimum) on all sides',
      minSize: 'Print: 1.5" wide; Digital: 120px wide',
      formats: [
        { type: 'PNG', url: '/downloads/switch-commerce-horizontal.png' },
        { type: 'SVG', url: '/downloads/switch-commerce-horizontal.svg' },
        { type: 'EPS', url: '/downloads/switch-commerce-horizontal.eps' }
      ],
      usage: 'Use the horizontal logo when vertical space is limited, such as in website headers, email signatures, or narrow banner ads.'
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

  return (
    <BrandGuidelines 
      brandName="Switch Commerce"
      brandDescription="Switch Commerce delivers innovative payment processing solutions that prioritize security, reliability, and merchant success. Our brand identity projects professionalism, technological expertise, and trustworthiness in the financial technology sector."
      brandLogo="/logos/switch-commerce-logo.png"
      heroBackground="from-[#002b5e] to-[#001f44]"
      primaryColor="[#002b5e]"
      accentColor="[#0047ab]"
      styleKitDownload={{
        url: '/downloads/switch-commerce-brand-kit.zip',
        label: 'Download Brand Style Kit'
      }}
      colorSection={<ColorPalette colors={switchColors} />}
      typographySection={<FontDisplay fonts={switchFonts} />}
      logosSection={<LogoDisplay logos={switchLogos} />}
      usageGuidelinesSection={<UsageGuidelines guidelines={usageGuidelines} />}
    />
  );
}
