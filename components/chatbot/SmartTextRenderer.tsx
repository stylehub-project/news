import React from 'react';
import { Quote } from 'lucide-react';

interface SmartTextRendererProps {
  content: string;
}

const SmartTextRenderer: React.FC<SmartTextRendererProps> = ({ content }) => {
  // Normalize newlines
  const lines = content.split('\n');

  const parseLine = (line: string, index: number) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={index} className="h-2" />;

    // 1. Markdown Images: ![Alt](URL)
    const imageMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imageMatch) {
        return (
            <div key={index} className="my-4 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 max-w-sm">
                <img src={imageMatch[2]} alt={imageMatch[1]} className="w-full h-auto object-cover" loading="lazy" />
                {imageMatch[1] && <div className="p-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-black/40 text-center">{imageMatch[1]}</div>}
            </div>
        );
    }

    // 2. Callouts / Summaries (Lines starting with >)
    if (trimmed.startsWith('>')) {
      const cleanLine = trimmed.substring(1).trim();
      return (
        <div key={index} className="my-3 flex gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 rounded-r-xl shadow-sm">
          <Quote size={18} className="text-indigo-400 shrink-0 mt-0.5 fill-indigo-200 dark:fill-indigo-900" />
          <p className="text-indigo-900 dark:text-indigo-200 italic font-medium text-sm leading-relaxed">
            {parseInline(cleanLine)}
          </p>
        </div>
      );
    }

    // 3. Bullet Points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
            <div key={index} className="flex gap-3 mb-2 pl-2 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-2 shrink-0"></span>
                <p className="text-gray-800 dark:text-slate-200 leading-relaxed">{parseInline(trimmed.substring(2))}</p>
            </div>
        )
    }

    // 4. Headers
    if (trimmed.startsWith('### ')) {
        return <h3 key={index} className="text-base font-bold text-gray-900 dark:text-white mt-5 mb-2">{parseInline(trimmed.substring(4))}</h3>;
    }
    if (trimmed.startsWith('## ')) {
        return <h2 key={index} className="text-lg font-black text-indigo-700 dark:text-indigo-300 mt-6 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">{parseInline(trimmed.substring(3))}</h2>;
    }

    // 5. Standard Paragraph
    return (
      <p key={index} className="mb-2 text-gray-800 dark:text-slate-200 leading-relaxed">
        {parseInline(line)}
      </p>
    );
  };

  const parseInline = (text: string) => {
    // Regex Logic:
    // Capture group 1: **bold** (lazy match)
    // Capture group 2: [[entity]] (lazy match)
    const regex = /(\*\*.*?\*\*|\[\[.*?\]\])/g;
    
    const parts = text.split(regex);
    
    return parts.map((part, i) => {
      // Handle Bold: **text**
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        const content = part.slice(2, -2);
        return (
            <strong key={i} className="font-extrabold text-gray-900 dark:text-white">
                {content}
            </strong>
        );
      }
      
      // Handle Entities: [[text]]
      if (part.startsWith('[[') && part.endsWith(']]') && part.length >= 4) {
        const content = part.slice(2, -2);
        return (
          <span key={i} className="inline-flex items-center bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 px-2 py-0.5 rounded-full text-xs font-bold mx-1 border border-blue-100 dark:border-blue-800 align-middle">
            {content}
          </span>
        );
      }

      // Return plain text
      return part;
    });
  };

  return <div className="text-sm">{lines.map(parseLine)}</div>;
};

export default SmartTextRenderer;