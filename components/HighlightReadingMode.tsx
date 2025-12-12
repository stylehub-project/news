import React, { useState, useEffect } from 'react';

interface HighlightReadingModeProps {
  text: string;
  isPlaying?: boolean;
  onComplete?: () => void;
  speed?: number;
  theme?: 'light' | 'sepia' | 'dark';
}

const HighlightReadingMode: React.FC<HighlightReadingModeProps> = ({ 
    text, 
    isPlaying = false, 
    onComplete,
    speed = 1,
    theme = 'light'
}) => {
  const [wordIndex, setWordIndex] = useState(-1);
  const words = text.split(/(\s+)/); // Split keeping delimiters to preserve spacing
  
  // Highlight Colors based on theme
  const highlightColor = {
      light: 'bg-yellow-200 text-black',
      sepia: 'bg-[#e3d0b1] text-[#2c221b]',
      dark: 'bg-blue-900 text-white'
  }[theme];

  // Reset when text changes
  useEffect(() => {
      setWordIndex(-1);
  }, [text]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isPlaying) {
      // Base speed is 200ms per word, adjusted by speed multiplier
      const delay = 250 / speed;
      
      interval = setInterval(() => {
        setWordIndex(prev => {
          if (prev >= words.length - 1) {
            clearInterval(interval);
            onComplete?.();
            return prev;
          }
          // Skip whitespace only tokens for highlighting logic (just advance)
          return prev + 1;
        });
      }, delay);
    }

    return () => clearInterval(interval);
  }, [isPlaying, words.length, onComplete, speed]);

  return (
    <div className="leading-relaxed transition-all duration-300">
      {words.map((word, i) => {
         // Determine if this specific word is currently active
         // We check if it is not whitespace
         const isCurrent = i === wordIndex && word.trim().length > 0;
         // Past words are dimmed slightly in dark mode for focus? Optional.
         
         return (
            <span 
                key={i} 
                className={`transition-colors duration-100 rounded-sm ${isCurrent ? highlightColor : ''}`}
            >
                {word}
            </span>
         )
      })}
    </div>
  );
};

export default HighlightReadingMode;