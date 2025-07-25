// Utility to ensure fonts are loaded before rendering
export function loadCustomFonts() {
  // Create a style element
  const style = document.createElement('style');
  
  // Define font faces directly in the style tag
  style.textContent = `
    @font-face {
      font-family: 'SWITCH COMMERCE BOLD';
      src: url('/fonts/SWITCHCOMMERCEBOLD.otf') format('opentype');
      font-weight: 700;
      font-style: normal;
      font-display: block;
    }
    
    @font-face {
      font-family: 'SWITCH COMMERCE REG';
      src: url('/fonts/SWITCHCOMMERCEREG.otf') format('opentype');
      font-weight: 400;
      font-style: normal;
      font-display: block;
    }

    /* Apply fonts to specific classes */
    .font-switch-bold {
      font-family: 'SWITCH COMMERCE BOLD', sans-serif !important;
      text-transform: uppercase;
    }
    
    .font-switch-reg {
      font-family: 'SWITCH COMMERCE REG', sans-serif !important;
      text-transform: uppercase;
    }
  `;
  
  // Append to document head
  document.head.appendChild(style);
}
