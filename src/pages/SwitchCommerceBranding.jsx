import React from 'react';
import { useEffect } from 'react';
import BrandGuidelines from '../components/BrandGuidelines';
import ColorPalette from '../components/ColorPalette';
import FontDisplay from '../components/FontDisplay';
import LogoDisplay from '../components/LogoDisplay';

export default function SwitchCommerceBrandingPage() {
  useEffect(() => {
    document.title = 'Switch Commerce Brand Guidelines';
  }, []);

  // Define Switch Commerce brand colors
  const switchColors = [
    {
      name: 'Primary Blue',
      hex: '#0951fa',
      rgb: 'rgb(9, 81, 250)',
      cmyk: 'C96 M68 Y0 K2'
    },
    {
      name: 'Dark Blue',
      hex: '#002b5e',
      rgb: 'rgb(0, 43, 94)',
      cmyk: 'C100 M54 Y0 K63'
    },
    {
      name: 'Light Blue',
      hex: '#4c8bf5',
      rgb: 'rgb(76, 139, 245)',
      cmyk: 'C69 M43 Y0 K4'
    },
    {
      name: 'Navy',
      hex: '#001f44',
      rgb: 'rgb(0, 31, 68)',
      cmyk: 'C100 M54 Y0 K73'
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
      name: 'Warning Orange',
      hex: '#f59e0b',
      rgb: 'rgb(245, 158, 11)',
      cmyk: 'C0 M36 Y96 K4'
    }
  ];

  // Define Switch Commerce typography
  const switchFonts = [
    {
      name: 'Montserrat',
      family: 'Montserrat, sans-serif',
      cssFamily: "'Montserrat', sans-serif",
      weights: [
        { name: 'Regular', value: 400 },
        { name: 'Medium', value: 500 },
        { name: 'Semi-bold', value: 600 },
        { name: 'Bold', value: 700 }
      ],
      samples: [
        { name: 'Heading 1', size: '2.5rem', weight: 700, lineHeight: 1.2, text: 'Switch Commerce Heading' },
        { name: 'Heading 2', size: '2rem', weight: 600, lineHeight: 1.3, text: 'Product Solutions' },
        { name: 'Heading 3', size: '1.5rem', weight: 600, lineHeight: 1.4, text: 'Feature Spotlight' },
        { name: 'Body', size: '1rem', weight: 400, lineHeight: 1.5, text: 'Switch Commerce provides payment solutions that are secure, reliable, and easy to integrate with your business operations.' },
        { name: 'Button', size: '0.875rem', weight: 600, lineHeight: 1.25, text: 'GET STARTED' }
      ]
    },
    {
      name: 'Inter',
      family: 'Inter, sans-serif',
      cssFamily: "'Inter', sans-serif",
      weights: [
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

  // Define Switch Commerce logos
  const switchLogos = [
    {
      name: 'Primary Logo',
      src: '/logos/switch-commerce-logo.png',
      description: 'Official logo for all primary brand applications',
      bgClass: 'bg-white',
      formats: [
        { type: 'PNG', url: '/downloads/switch-commerce-logo.png' },
        { type: 'SVG', url: '/downloads/switch-commerce-logo.svg' },
        { type: 'EPS', url: '/downloads/switch-commerce-logo.eps' }
      ],
      usage: 'Use the primary logo on white or light backgrounds for maximum visibility.'
    },
    {
      name: 'Inverted Logo',
      src: '/logos/switch-commerce-logo-white.png',
      description: 'For use on dark backgrounds',
      bgClass: 'bg-[#002b5e]',
      formats: [
        { type: 'PNG', url: '/downloads/switch-commerce-logo-white.png' },
        { type: 'SVG', url: '/downloads/switch-commerce-logo-white.svg' },
        { type: 'EPS', url: '/downloads/switch-commerce-logo-white.eps' }
      ],
      usage: 'Use the inverted logo on dark backgrounds or colored backgrounds for better visibility.'
    },
    {
      name: 'Icon Only',
      src: '/logos/switch-commerce-icon.png',
      description: 'For use in space-constrained applications',
      bgClass: 'bg-gray-100',
      formats: [
        { type: 'PNG', url: '/downloads/switch-commerce-icon.png' },
        { type: 'SVG', url: '/downloads/switch-commerce-icon.svg' },
        { type: 'EPS', url: '/downloads/switch-commerce-icon.eps' }
      ],
      usage: 'Use the icon only when space is limited or when the brand is already established in context.'
    },
    {
      name: 'Horizontal Logo',
      src: '/logos/switch-commerce-horizontal.png',
      description: 'For use in horizontal space constraints',
      bgClass: 'bg-white',
      formats: [
        { type: 'PNG', url: '/downloads/switch-commerce-horizontal.png' },
        { type: 'SVG', url: '/downloads/switch-commerce-horizontal.svg' },
        { type: 'EPS', url: '/downloads/switch-commerce-horizontal.eps' }
      ],
      usage: 'Use the horizontal logo when vertical space is limited.'
    }
  ];

  return (
    <BrandGuidelines 
      brandName="Switch Commerce"
      brandDescription="Switch Commerce is a leading provider of payment solutions. Our brand identity reflects our commitment to innovation, reliability, and customer-centric service."
      brandLogo="/logos/switch-commerce-logo.png"
      heroBackground="from-[#002b5e] to-[#001f44]"
      primaryColor="[#0951fa]"
      accentColor="[#4c8bf5]"
      styleKitDownload={{
        url: '/downloads/switch-commerce-brand-kit.zip',
        label: 'Download Brand Style Kit'
      }}
      colorSection={<ColorPalette colors={switchColors} />}
      typographySection={<FontDisplay fonts={switchFonts} />}
      logosSection={<LogoDisplay logos={switchLogos} />}
    />
  );
}
