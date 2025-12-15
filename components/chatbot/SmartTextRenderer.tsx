import React from 'react';

interface SmartTextRendererProps {
  content: string;
}

const SmartTextRenderer: React.FC<SmartTextRendererProps> = ({ content }) => {
  // Split content by newlines to handle block-level elements like callouts
  const lines = content.split('\n');

  const parseLine = (line: string, index: number) => {
    // 1. Handle Callouts (lines starting with "> ")
    if (line.startsWith('> ')) {
      return (
        <div key={index} className="my-3 pl-4 border-l-4 border-indigo-500 bg-indigo-50/50 py-2 rounded-r-lg">
          <p className="text-indigo-900 italic font-medium">
            {parseInline(line.substring(2))}
          </p>
        </div>
      );
    }

    // 2. Handle Bullet Points
    if (line.trim().startsWith('- ')) {
        return (
            <div key={index} className="flex gap-2 mb-1 pl-1">
                <span className="text-indigo-500 font-bold">•</span>
                <p className="text-gray-800">{parseInline(line.substring(2))}</p>
            </div>
        )
    }

    // 3. Standard Paragraph
    if (line.trim() === '') {
        return <div key={index} className="h-2"></div>;
    }

    return (
      <p key={index} className="mb-1 text-gray-800 leading-relaxed">
        {parseInline(line)}
      </p>
    );
  };

  // Helper to parse inline formatting: **Bold** and [[Entity]]
  const parseInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\[\[.*?\]\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('[[') && part.endsWith(']]')) {
        return (
          <span key={i} className="inline-block bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs font-bold mx-0.5 border border-blue-200">
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