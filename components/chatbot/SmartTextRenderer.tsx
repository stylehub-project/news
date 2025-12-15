import React from 'react';

interface SmartTextRendererProps {
  content: string;
}

const SmartTextRenderer: React.FC<SmartTextRendererProps> = ({ content }) => {
  const lines = content.split('\n');

  const parseLine = (line: string, index: number) => {
    // 1. Callouts / Quotes
    if (line.trim().startsWith('>')) {
      const cleanLine = line.trim().substring(1).trim();
      return (
        <div key={index} className="my-3 pl-4 border-l-4 border-indigo-500 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20 py-2 pr-2 rounded-r-lg">
          <p className="text-indigo-900 dark:text-indigo-200 italic font-medium">
            {parseInline(cleanLine)}
          </p>
        </div>
      );
    }

    // 2. Bullet Points
    if (line.trim().startsWith('- ')) {
        return (
            <div key={index} className="flex gap-2 mb-1 pl-1">
                <span className="text-indigo-500 dark:text-indigo-400 font-bold">•</span>
                <p className="text-gray-800 dark:text-gray-200">{parseInline(line.substring(2))}</p>
            </div>
        )
    }

    // 3. Spacing
    if (line.trim() === '') {
        return <div key={index} className="h-3"></div>;
    }

    return (
      <p key={index} className="mb-1 text-gray-800 dark:text-gray-200 leading-relaxed">
        {parseInline(line)}
      </p>
    );
  };

  const parseInline = (text: string) => {
    // Split by Bold **text** and entities [[text]]
    const parts = text.split(/(\*\*.*?\*\*|\[\[.*?\]\])/g);
    return parts.map((part, i) => {
      // Bold
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
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