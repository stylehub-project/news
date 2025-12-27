
import React from 'react';

interface ReelReaderCanvasProps {
  content: string[];
  revealedCount: number;
  fontSize: 'sm' | 'md' | 'lg';
  perspective: string;
  onTextTap: () => void;
}

const ReelReaderCanvas: React.FC<ReelReaderCanvasProps> = ({ 
  content, 
  revealedCount, 
  fontSize, 
  perspective,
  onTextTap 
}) => {
  const getSizeClass = () => {
    switch (fontSize) {
      case 'sm': return 'text-base leading-relaxed';
      case 'lg': return 'text-xl leading-loose';
      default: return 'text-lg leading-relaxed';
    }
  };

  return (
    <div 
      className={`space-y-6 transition-all duration-500 ease-in-out ${getSizeClass()}`}
      onClick={(e) => { e.stopPropagation(); onTextTap(); }}
    >
      {content.map((paragraph, idx) => {
        const isRevealed = idx < revealedCount;
        const isLastRevealed = idx === revealedCount - 1;
        
        return (
          <p
            key={`${perspective}-${idx}`}
            className={`
              transition-all duration-700 transform will-change-transform font-medium
              ${isRevealed 
                ? 'opacity-100 translate-y-0 filter-none' 
                : 'opacity-0 translate-y-4 blur-sm'}
              ${isLastRevealed ? 'text-white' : 'text-gray-300'}
            `}
            style={{ 
              transitionDelay: isRevealed ? '0ms' : '0ms',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)' // Stronger shadow for visibility
            }}
          >
            {paragraph}
          </p>
        );
      })}
    </div>
  );
};

export default ReelReaderCanvas;
