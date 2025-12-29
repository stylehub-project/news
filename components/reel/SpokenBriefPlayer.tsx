
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Volume2, Pause, Play, AlertCircle, FastForward } from 'lucide-react';
import { useHistory } from '../../context/HistoryContext';

interface SpokenBriefPlayerProps {
  id?: string; // Content ID for tracking
  title?: string;
  text: string;
  isActive: boolean;
  autoPlay: boolean;
  onProgress: (progress: number) => void;
  onComplete?: () => void;
  speed?: number;
}

const SpokenBriefPlayer: React.FC<SpokenBriefPlayerProps> = ({ 
  id,
  title,
  text, 
  isActive, 
  autoPlay, 
  onProgress, 
  onComplete,
  speed = 1.0 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mountedRef = useRef(true);
  
  const { trackProgress, getHistoryItem } = useHistory();

  // Split text into sentences for resuming capability
  const sentences = useMemo(() => {
      if (!text) return [];
      // Simple regex split for sentences
      return text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  }, [text]);

  // Load Saved Progress (15.6)
  useEffect(() => {
      if (id) {
          const history = getHistoryItem(id);
          if (history && history.audioProgress && history.audioProgress < sentences.length - 1) {
              setCurrentSentenceIdx(history.audioProgress);
          }
      }
  }, [id, getHistoryItem, sentences.length]);

  // Initialize synth
  useEffect(() => {
    if (typeof window !== 'undefined') {
        synthRef.current = window.speechSynthesis;
    }
  }, []);

  const loadVoices = () => {
    if (!synthRef.current) return Promise.resolve([]);
    let voices = synthRef.current.getVoices();
    if (voices.length > 0) return Promise.resolve(voices);
    
    return new Promise<SpeechSynthesisVoice[]>((resolve) => {
        if (!synthRef.current) return resolve([]);
        const handler = () => {
            if (synthRef.current) resolve(synthRef.current.getVoices());
            if (typeof window !== 'undefined') window.speechSynthesis.removeEventListener('voiceschanged', handler);
        };
        if (typeof window !== 'undefined') window.speechSynthesis.addEventListener('voiceschanged', handler);
        setTimeout(() => resolve([]), 2000);
    });
  };

  // Cleanup
  useEffect(() => {
    mountedRef.current = true;
    if (!isActive) {
      cancelSpeech();
    }
    return () => {
      mountedRef.current = false;
      cancelSpeech();
    };
  }, [isActive]);

  // Auto-play
  useEffect(() => {
    if (isActive && autoPlay && text && !hasError) {
      const timer = setTimeout(() => {
        if (mountedRef.current && !isPlaying) playSpeech();
      }, 800); 
      return () => clearTimeout(timer);
    }
  }, [isActive, autoPlay, text, hasError]);

  const cancelSpeech = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      if (mountedRef.current) {
        setIsPlaying(false);
      }
    }
  };

  const speakSentence = async (index: number) => {
      if (!synthRef.current || index >= sentences.length || !mountedRef.current) {
          if (index >= sentences.length && onComplete) onComplete();
          setIsPlaying(false);
          return;
      }

      // Save Progress (15.6)
      setCurrentSentenceIdx(index);
      const progressPercent = Math.round((index / sentences.length) * 100);
      onProgress(progressPercent);
      
      if (id && title) {
          trackProgress(id, 'reel', title, progressPercent, undefined, undefined, index);
      }

      const chunk = sentences[index];
      const u = new SpeechSynthesisUtterance(chunk);
      utteranceRef.current = u;

      const voices = await loadVoices();
      // @ts-ignore
      const preferred = voices.find(v => v.name === "Google US English") || voices.find(v => v.name.includes("Samantha")) || voices[0];
      if (preferred) u.voice = preferred;
      
      u.rate = speed;
      u.pitch = 1.0;

      u.onend = () => {
          if (mountedRef.current && isPlaying) {
              speakSentence(index + 1);
          }
      };

      u.onerror = (e) => {
          console.warn("Speech Error", e);
          // @ts-ignore
          if (e.error !== 'interrupted') {
             setIsPlaying(false);
             setHasError(true);
          }
      };

      try {
          synthRef.current.speak(u);
      } catch (e) {
          setIsPlaying(false);
      }
  };

  const playSpeech = () => {
      if (!synthRef.current || !text) return;
      
      synthRef.current.cancel(); // Clear queue
      setHasError(false);
      setIsPlaying(true);
      
      // Start from current index
      speakSentence(currentSentenceIdx);
  };

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isPlaying) {
      // Pause actually cancels current utterance but keeps index
      synthRef.current?.cancel();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakSentence(currentSentenceIdx);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
      <button 
        onClick={togglePlay}
        className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${hasError ? 'bg-red-500/20 text-red-400' : 'bg-white/20 hover:bg-white/30 text-white'}`}
      >
        {isPlaying ? <Pause size={14} fill="currentColor" /> : hasError ? <AlertCircle size={14} /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
      </button>
      
      <div className="flex flex-col min-w-[80px]">
        <div className="flex justify-between items-end">
            <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider">
            {isPlaying ? 'Speaking' : hasError ? 'Error' : currentSentenceIdx > 0 ? 'Resume' : 'Listen'}
            </span>
            {currentSentenceIdx > 0 && (
                <span className="text-[8px] text-indigo-400 font-mono">{Math.round((currentSentenceIdx / sentences.length) * 100)}%</span>
            )}
        </div>
        <div className="w-full h-1 bg-white/20 rounded-full mt-1 overflow-hidden">
           <div 
             className={`h-full bg-indigo-400 rounded-full transition-all duration-300`} 
             style={{ width: `${(currentSentenceIdx / sentences.length) * 100}%` }}
           ></div>
        </div>
      </div>
    </div>
  );
};

export default SpokenBriefPlayer;
