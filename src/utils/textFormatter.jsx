// Utility function to format text content from Google Sheets
export function formatTextContent(text) {
  if (!text) return null;
  
  // Split by double newlines for major sections
  const sections = text.split('\n\n');
  
  return sections.map((section, sectionIndex) => {
    // Split each section by single newlines
    const lines = section.split('\n').filter(line => line.trim());
    
    return (
      <div key={sectionIndex} className={sectionIndex > 0 ? "mt-4" : ""}>
        {lines.map((line, lineIndex) => {
          const trimmedLine = line.trim();
          
          // Check if it's a bullet point (starts with •, -, *, ?, or number followed by .)
          const bulletMatch = trimmedLine.match(/^[•\-\*\?](.+)/) || trimmedLine.match(/^\d+\.\s*(.+)/) || trimmedLine.match(/^\d+\)\s*(.+)/);
          
          if (bulletMatch) {
            return (
              <div key={lineIndex} className="flex items-start gap-2 mb-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">•</span>
                <span className="flex-1">{bulletMatch[1].trim()}</span>
              </div>
            );
          }
          
          // Check if it's a heading (ends with :)
          if (trimmedLine.endsWith(':')) {
            return (
              <h4 key={lineIndex} className="font-semibold text-gray-900 dark:text-white mb-2 mt-3">
                {trimmedLine.slice(0, -1)}
              </h4>
            );
          }
          
          // Check if it's a section title (like "Top 3 Takeaways for Customers" or "With Watchdog, you get:")
          if (trimmedLine.match(/^(Top \d+|Key|Main|Primary|With .+, you get|Watchdog safeguards)/i) || trimmedLine.includes('Takeaways')) {
            return (
              <h4 key={lineIndex} className="font-bold text-gray-900 dark:text-white mb-3 mt-4 border-b border-gray-200 dark:border-gray-600 pb-1">
                {trimmedLine}
              </h4>
            );
          }
          
          // Regular paragraph
          return (
            <p key={lineIndex} className="mb-2 leading-relaxed">
              {trimmedLine}
            </p>
          );
        })}
      </div>
    );
  });
}