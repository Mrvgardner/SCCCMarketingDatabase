# PDF Viewer Implementation

## Current Implementation

We now use a booklet-style iframe-based PDF viewer that avoids PDF.js compatibility issues:

1. `SimpleFramePDFViewer`: Uses browser's built-in PDF rendering via iframe with booklet-like experience
   - Advantages: Works across all browsers, no version mismatches
   - Page-by-page navigation with previous/next controls
   - Zoom controls for better readability
   - Single/double page view options
   - Download and print functionality

2. `PDFBrochureViewer`: A wrapper for `SimpleFramePDFViewer` that adds:
   - PDF existence validation
   - Fallback URL support
   - Error handling UI
   - Automatic PDF detection
   - Loading state management

## How It Works

1. When a PDF is requested, the component first validates if it exists
2. If primary PDF is not found, tries loading the fallback PDF
3. If neither exists, shows a user-friendly error
4. Uses the browser's native PDF viewing capabilities through an iframe
5. Enhances the experience with custom navigation and viewing controls:
   - Page navigation buttons to move forward/backward
   - Zoom in/out buttons
   - Single/double page toggle
   - Page number indicator

## Available PDF Files

- `/brochures/switch-brochure.pdf`: Switch Commerce brochure
- `/brochures/clearchoice-brochure.pdf`: Clear Choice brochure
- Fallbacks: 
  - `/brochures/switch-commerce-brochure.pdf`
  - `/brochures/clear-choice-brochure.pdf`

## Benefits of the New Approach

1. No dependency on PDF.js or its worker files
2. No version compatibility issues
3. Works consistently across browsers
4. Booklet-style viewing experience for marketing materials
5. Responsive design that works on mobile and desktop
6. Better error handling and fallbacks
7. Page-by-page navigation for a more natural reading experience
8. Reduced bundle size (removed multiple PDF.js related packages)

## Future Enhancements

Possible future enhancements include:
1. Thumbnails sidebar for quick navigation
2. Page flip animation for more realistic booklet feel
3. Table of contents extraction
4. Analytics for PDF viewing/downloading
5. Annotation capabilities for team collaboration
