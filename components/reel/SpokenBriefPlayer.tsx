import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';

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
  const synthRef = useRef<SpeechSynthesis | null>(window.speechSynthesis);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cleanup on unmount or inactive
  useEffect(() => {
    if (!isActive) {
      cancelSpeech();
    }
    return () => cancelSpeech();
  }, [isActive]);

  // Start logic
  useEffect(() => {
    if (isActive && autoPlay && text) {
      const timer = setTimeout(() => {
        playSpeech();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isActive, autoPlay, text]);

  const cancelSpeech = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      onProgress(0);
    }
  };

  const playSpeech = () => {
    if (!synthRef.current) return;
    
    // Stop any existing
    synthRef.current.cancel();

    const u = new SpeechSynthesisUtterance(text);
    
    // Voice Selection Strategy
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v => v.name === "Google US English") || 
                      voices.find(v => v.name.includes("Samantha")) || 
                      voices[0];
    
    if (preferred) u.voice = preferred;
    u.rate = speed;
    u.pitch = 1.0;

    u.onboundary = (e) => {
      const length = text.length;
      const current = e.charIndex;
      const percent = (current / length) * 100;
      onProgress(percent);
    };

    u.onend = () => {
      setIsPlaying(false);
      onProgress(100);
      if (onComplete) onComplete();
    };

    u.onerror = (e) => {
        console.warn("Speech synthesis error", e);
        setIsPlaying(false);
    }

    try {
        synthRef.current.speak(u);
        setIsPlaying(true);
        utteranceRef.current = u;
    } catch (e) {
        console.error("Speech start failed", e);
        setIsPlaying(false);
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isPlaying) {
      synthRef.current?.cancel(); // Cancel instead of pause for cleaner restart/stop
      setIsPlaying(false);
    } else {
      playSpeech();
    }
  };

  return (
    <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
      <button 
        onClick={togglePlay}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
      >
        {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
      </button>
      
      <div className="flex flex-col">
        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider">
          {isPlaying ? 'Speaking Brief' : 'Paused'}
        </span>
        <div className="w-20 h-1 bg-white/20 rounded-full mt-1 overflow-hidden">
           <div className={`h-full bg-indigo-400 rounded-full ${isPlaying ? 'animate-pulse' : ''}`} style={{ width: '100%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default SpokenBriefPlayer;