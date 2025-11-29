// components/admin/rules/recommendedRules/SearchHighlight.tsx
'use client';

interface SearchHighlightProps {
  text: string;
  searchQuery: string;
  className?: string;
}

/**
 * Highlights all occurrences of the search query in the text
 */
export default function SearchHighlight({ text, searchQuery, className = '' }: SearchHighlightProps) {
  if (!searchQuery || !text) {
    return <span className={className}>{text}</span>;
  }

  const query = searchQuery.trim();
  if (!query) {
    return <span className={className}>{text}</span>;
  }

  // Create a case-insensitive regex to find all occurrences
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part matches the search query (case-insensitive)
        const isMatch = part.toLowerCase() === query.toLowerCase();
        
        return isMatch ? (
          <mark
            key={index}
            className="bg-yellow-400/30 text-yellow-200 px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
}
