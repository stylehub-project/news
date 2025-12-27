
import React, { useEffect, useRef, useState } from 'react';
import { Volume2, Pause, Play, AlertCircle } from 'lucide-react';

interface SpokenBriefPlayerProps {
  text: string;
  isActive: boolean;
  autoPlay: boolean;
  onProgress: (progress: number) => void;
  onComplete?: () => void;
  speed?: number;
}

const SpokenBriefPlayer: React.FC<SpokenBriefPlayerProps> = ({ 
  text, 
  isActive, 
  autoPlay, 
  onProgress, 
  onComplete,
  speed = 1.0 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(window.speechSynthesis);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mountedRef = useRef(true);

  // Ensure voices are loaded before trying to speak
  const loadVoices = () => {
    if (!synthRef.current) return Promise.resolve([]);
    let voices = synthRef.current.getVoices();
    if (voices.length > 0) return Promise.resolve(voices);
    
    return new Promise<SpeechSynthesisVoice[]>((resolve) => {
        const handler = () => {
            resolve(window.speechSynthesis.getVoices());
            window.speechSynthesis.removeEventListener('voiceschanged', handler);
        };
        window.speechSynthesis.addEventListener('voiceschanged', handler);
        // Timeout just in case
        setTimeout(() => resolve([]), 2000);
    });
  };

  // Cleanup on unmount or inactive
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

  // Auto-play Logic with safety delay
  useEffect(() => {
    if (isActive && autoPlay && text && !hasError) {
      const timer = setTimeout(() => {
        if (mountedRef.current) playSpeech().catch(() => {});
      }, 1000); // 1s delay to allow page transition to settle
      return () => clearTimeout(timer);
    }
  }, [isActive, autoPlay, text, hasError]);

  const cancelSpeech = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      if (mountedRef.current) {
        setIsPlaying(false);
        onProgress(0);
      }
    }
  };

  const playSpeech = async () => {
    if (!synthRef.current || !text) return;
    
    // Reset state
    synthRef.current.cancel();
    setHasError(false);

    // Wait for voices
    const voices = await loadVoices();
    if (!mountedRef.current) return;

    const u = new SpeechSynthesisUtterance(text);
    
    // Voice Selection
    // @ts-ignore
    const preferred = voices.find(v => v.name === "Google US English") || 
                      // @ts-ignore
                      voices.find(v => v.name.includes("Samantha")) || 
                      voices[0];
    
    if (preferred) u.voice = preferred;
    u.rate = speed;
    u.pitch = 1.0;
    u.volume = 1.0;

    u.onboundary = (e) => {
      if (!mountedRef.current) return;
      const length = text.length;
      const percent = (e.charIndex / length) * 100;
      onProgress(percent);
    };

    u.onend = () => {
      if (mountedRef.current) {
          setIsPlaying(false);
          onProgress(100);
          if (onComplete) onComplete();
      }
    };

    u.onerror = (e) => {
        if (!mountedRef.current) return;
        console.warn("Speech playback warning:", e);
        setIsPlaying(false);
        if (e.error === 'not-allowed' || e.error === 'network') {
            setHasError(true); // Show manual play button if auto-play was blocked
        }
    }

    try {
        synthRef.current.speak(u);
        setIsPlaying(true);
        utteranceRef.current = u;
    } catch (e) {
        console.error("Speech start failed", e);
        if (mountedRef.current) {
            setIsPlaying(false);
            setHasError(true);
        }
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isPlaying) {
      synthRef.current?.cancel();
      setIsPlaying(false);
    } else {
      playSpeech();
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
      
      <div className="flex flex-col">
        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider">
          {isPlaying ? 'Speaking Brief' : hasError ? 'Tap to Speak' : 'Paused'}
        </span>
        <div className="w-20 h-1 bg-white/20 rounded-full mt-1 overflow-hidden">
           <div className={`h-full bg-indigo-400 rounded-full ${isPlaying ? 'animate-pulse' : ''}`} style={{ width: '100%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default SpokenBriefPlayer;
