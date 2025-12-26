
import React, { useState, useEffect, useRef } from 'react';

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
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  // We split by capturing the separator so we can reconstruct the text layout perfectly
  // This results in ['Word', ' ', 'Word', ' ', ...]
  const words = React.useMemo(() => text.split(/(\s+)/), [text]);

  // Load voices on mount
  useEffect(() => {
    const loadVoices = () => {
        const vs = window.speechSynthesis.getVoices();
        setVoices(vs);
    };
    loadVoices();
    // Chrome requires this event to load voices
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const getReporterVoice = () => {
      // Consistent News Anchor Selection
      return voices.find(v => v.name === "Google US English") || 
             voices.find(v => v.name === "Microsoft Zira - English (United States)") ||
             voices.find(v => v.name.includes("Samantha")) ||
             voices.find(v => v.lang === 'en-US' && !v.name.includes("Zira")) || 
             voices[0];
  };

  useEffect(() => {
    // Reset when text changes
    window.speechSynthesis.cancel();
    setWordIndex(-1);
  }, [text]);

  useEffect(() => {
    if (isPlaying) {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        } else if (!window.speechSynthesis.speaking) {
            const u = new SpeechSynthesisUtterance(text);
            u.voice = getReporterVoice();
            u.pitch = 1.0; 
            u.rate = speed * 0.95; // Default slightly measured for explanatory feel, multiplied by user speed
            u.volume = 1;
            
            u.onboundary = (event) => {
                if (event.name === 'word') {
                    // Map character index to word array index
                    const charIndex = event.charIndex;
                    let count = 0;
                    for (let i = 0; i < words.length; i++) {
                        if (count >= charIndex) {
                            setWordIndex(i);
                            break;
                        }
                        count += words[i].length;
                    }
                }
            };

            u.onend = () => {
                setWordIndex(-1);
                onComplete?.();
            };

            window.speechSynthesis.speak(u);
        }
    } else {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
        }
    }

    return () => {
        // Cleanup handled by parent unmount or explicit stop
    };
  }, [isPlaying, speed, text, voices, words, onComplete]);

  // Force stop on unmount
  useEffect(() => {
      return () => {
          window.speechSynthesis.cancel();
      };
  }, []);

  const highlightColor = {
      light: 'bg-yellow-200 text-black',
      sepia: 'bg-[#e3d0b1] text-[#2c221b]',
      dark: 'bg-blue-600 text-white shadow-sm'
  }[theme];

  return (
    <div className="leading-relaxed transition-all duration-300 font-serif md:font-sans text-lg text-justify">
      {words.map((word, i) => {
         // Only highlight non-whitespace tokens
         const isCurrent = i === wordIndex && word.trim().length > 0;
         return (
            <span 
                key={i} 
                className={`transition-colors duration-200 rounded-sm px-0.5 ${isCurrent ? highlightColor : ''}`}
            >
                {word}
            </span>
         )
      })}
    </div>
  );
};

export default HighlightReadingMode;
