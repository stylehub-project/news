import React, { useEffect, useRef } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of revealed content smoothly
  useEffect(() => {
    if (containerRef.current && revealedCount > 0) {
      const elements = containerRef.current.children;
      // Ensure we don't index out of bounds
      const targetIndex = Math.min(revealedCount - 1, elements.length - 1);
      if (targetIndex >= 0) {
        const lastElement = elements[targetIndex];
        lastElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [revealedCount]);

  const getSizeClass = () => {
    switch (fontSize) {
      case 'sm': return 'text-base leading-relaxed';
      case 'lg': return 'text-xl leading-relaxed';
      default: return 'text-lg leading-relaxed';
    }
  };

  return (
    <div 
      ref={containerRef}
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
              transition-all duration-700 transform will-change-transform
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