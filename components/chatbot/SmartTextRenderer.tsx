import React from 'react';

interface SmartTextRendererProps {
  content: string;
}

const SmartTextRenderer: React.FC<SmartTextRendererProps> = ({ content }) => {
  const lines = content.split('\n');

  const parseLine = (line: string, index: number) => {
    const trimmed = line.trim();

    // 1. Callouts / Quotes
    if (trimmed.startsWith('>')) {
      const cleanLine = trimmed.substring(1).trim();
      return (
        <div key={index} className="my-3 pl-4 border-l-4 border-indigo-500 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20 py-2 pr-2 rounded-r-lg">
          <p className="text-indigo-900 dark:text-indigo-200 italic font-medium">
            {parseInline(cleanLine)}
          </p>
        </div>
      );
    }

    // 2. Bullet Points (Handle both '- ' and '* ')
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
            <div key={index} className="flex gap-2 mb-1 pl-1 items-start">
                <span className="text-indigo-500 dark:text-indigo-400 font-bold mt-[7px] text-[6px] shrink-0">●</span>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{parseInline(trimmed.substring(2))}</p>
            </div>
        )
    }

    // 3. Headers (###)
    if (trimmed.startsWith('### ')) {
        return (
            <h3 key={index} className="text-base font-bold text-gray-900 dark:text-white mt-4 mb-2">
                {parseInline(trimmed.substring(4))}
            </h3>
        );
    }

    // 4. Headers (##)
    if (trimmed.startsWith('## ')) {
        return (
            <h2 key={index} className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mt-5 mb-2 border-b border-gray-100 dark:border-gray-700 pb-1">
                {parseInline(trimmed.substring(3))}
            </h2>
        );
    }

    // 5. Spacing
    if (trimmed === '') {
        return <div key={index} className="h-3"></div>;
    }

    return (
      <p key={index} className="mb-1 text-gray-800 dark:text-gray-200 leading-relaxed">
        {parseInline(line)}
      </p>
    );
  };

  const parseInline = (text: string) => {
    // Regex logic:
    // 1. Bold: **text**
    // 2. Italic: *text* (but ignore * if it was part of **)
    // 3. Entity: [[text]]
    
    // We split by tokens. Note: This simple splitter might be fragile with nested MD, but sufficient for GenAI output.
    const parts = text.split(/(\*\*.*?\*\*|\[\[.*?\]\]|\*.*?\*)/g);
    
    return parts.map((part, i) => {
      // Bold
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return <strong key={i} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      
      // Italic
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
         // check if it's not actually bold (handled above, but safety check)
         if (!part.startsWith('**')) {
             return <em key={i} className="italic text-gray-700 dark:text-gray-300">{part.slice(1, -1)}</em>;
         }
      }

      // Entity Chip
      if (part.startsWith('[[') && part.endsWith(']]')) {
        return (
          <span key={i} className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded text-xs font-bold mx-0.5 border border-blue-200 dark:border-blue-800 shadow-sm align-middle">
            {part.slice(2, -2)}
          </span>
        );
      }
      return part;
    });
  };

  return <div className="text-sm">{lines.map(parseLine)}</div>;
};

export default SmartTextRenderer;