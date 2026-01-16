
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
  const [activeIndex, setActiveIndex] = useState(-1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const synth = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentIndexRef = useRef(-1);

  // Split into sentences for better reading flow
  const sentences = React.useMemo(() => {
      if (!text) return [];
      // Robust sentence splitting preserving delimiters
      return text.match(/[^.!?\n]+[.!?\n]+["']?|[^.!?\n]+$/g) || [text];
  }, [text]);

  useEffect(() => {
    const loadVoices = () => {
        setVoices(synth.getVoices());
    };
    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices;
    }
  }, []);

  const getReporterVoice = () => {
      return voices.find(v => v.name === "Google US English") || 
             voices.find(v => v.name.includes("Samantha")) ||
             voices.find(v => v.lang === 'en-US') || 
             voices[0];
  };

  useEffect(() => {
      if (isPlaying) {
          // If just starting or resuming
          if (currentIndexRef.current === -1) {
              speakSentence(0);
          } else {
              // If already reading, do nothing, let recursion handle it
              // Unless synth was paused/cancelled externally
              if (!synth.speaking) speakSentence(0);
          }
      } else {
          synth.cancel();
          setActiveIndex(-1);
          currentIndexRef.current = -1;
      }
      return () => { 
          // Don't cancel on unmount immediately to allow seamless navigation if needed, 
          // but for this component, usually we want to stop.
          synth.cancel(); 
      };
  }, [isPlaying]);

  const speakSentence = (index: number) => {
      if (index >= sentences.length) {
          setActiveIndex(-1);
          currentIndexRef.current = -1;
          onComplete?.();
          return;
      }

      // Update Highlight
      setActiveIndex(index);
      currentIndexRef.current = index;

      const u = new SpeechSynthesisUtterance(sentences[index]);
      const voice = getReporterVoice();
      if (voice) u.voice = voice;
      u.rate = speed;
      
      u.onend = () => {
          // Check if still supposed to be playing
          if (currentIndexRef.current !== -1) {
              speakSentence(index + 1);
          }
      };
      
      u.onerror = (e) => {
          console.error("Speech Error", e);
          // Attempt to skip to next
          if (currentIndexRef.current !== -1) {
              speakSentence(index + 1);
          }
      }
      
      utteranceRef.current = u;
      synth.speak(u);
  };

  const highlightColor = {
      light: 'bg-yellow-200 text-black shadow-sm',
      sepia: 'bg-[#dcb] text-[#2c221b] shadow-sm',
      dark: 'bg-indigo-900/60 text-white shadow-sm ring-1 ring-indigo-500/50'
  }[theme];

  return (
    <div className="leading-relaxed transition-all duration-300 font-serif md:font-sans text-lg text-justify">
      {sentences.map((sentence, i) => (
         <span 
            key={i} 
            className={`transition-all duration-300 rounded px-1 py-0.5 box-decoration-clone ${i === activeIndex ? highlightColor : ''}`}
         >
            {sentence}{' '}
         </span>
      ))}
    </div>
  );
};

export default HighlightReadingMode;
