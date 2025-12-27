
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
  // REMOVED: Auto-scroll useEffect logic causing layout thrashing.
  // The user should manually scroll if the text is long, preserving stability.

  const getSizeClass = () => {
    switch (fontSize) {
      case 'sm': return 'text-base leading-relaxed';
      case 'lg': return 'text-xl leading-relaxed';
      default: return 'text-lg leading-relaxed';
    }
  };

  return (
    <div 
      className={`space-y-6 pb-32 transition-all duration-500 ease-in-out ${getSizeClass()}`}
      onClick={(e) => { e.stopPropagation(); onTextTap(); }}
    >
      {content.map((paragraph, idx) => {
        const isRevealed = idx < revealedCount;
        const isLastRevealed = idx === revealedCount - 1;
        
        return (
          <p
            key={`${perspective}-${idx}`}
            className={`
              transition-all duration-700 transform will-change-transform backface-hidden
              ${isRevealed 
                ? 'opacity-100 translate-y-0 filter-none' 
                : 'opacity-0 translate-y-8 blur-sm'}
              ${isLastRevealed ? 'text-white' : 'text-gray-300'}
            `}
            style={{ 
              transitionDelay: isRevealed ? '0ms' : '0ms',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}
          >
            {paragraph}
          </p>
        );
      })}
      
      {/* Spacer for bottom controls */}
      <div className="h-20" />
    </div>
  );
};

export default ReelReaderCanvas;
