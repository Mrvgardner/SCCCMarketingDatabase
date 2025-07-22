# PDF Viewer Implementation

## Current Implementation

We now use a simplified iframe-based PDF viewer that avoids PDF.js compatibility issues:

1. `SimpleFramePDFViewer`: Uses browser's built-in PDF rendering via iframe
   - Advantages: Works across all browsers, no version mismatches
   - Has download and print functionality
   - Simple, lightweight implementation

2. `PDFBrochureViewer`: A wrapper for `SimpleFramePDFViewer` that adds:
   - PDF existence validation
   - Fallback URL support
   - Error handling UI
   - Automatic PDF detection

## How It Works

1. When a PDF is requested, the component first validates if it exists
2. If primary PDF is not found, tries loading the fallback PDF
3. If neither exists, shows a user-friendly error
4. Uses the browser's native PDF viewing capabilities through an iframe

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
4. Simpler implementation and maintenance
5. Removed complex build configurations
6. Better error handling and fallbacks
7. Reduced bundle size (removed multiple PDF.js related packages)

## Future Enhancements

If needed, we could add:
1. Custom PDF viewer controls
2. PDF thumbnails via HTML5 Canvas
3. Analytics for PDF viewing/downloading
