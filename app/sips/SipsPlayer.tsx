
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Mic, Settings, Download, Repeat } from 'lucide-react';

interface SipsPlayerProps {
  text: string;
  onHighlight: (index: number) => void; // Paragraph/Sentence index
  onComplete: () => void;
  voiceLang?: string;
}

const SipsPlayer: React.FC<SipsPlayerProps> = ({ text, onHighlight, onComplete, voiceLang = 'en-US' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [progress, setProgress] = useState(0);
  const synth = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Split text for granularity
  const sentences = React.useMemo(() => text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text], [text]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset when text changes
    cancel();
    setCurrentIndex(0);
    setProgress(0);
  }, [text]);

  const cancel = () => {
    synth.cancel();
    setIsPlaying(false);
  };

  const speakSentence = (index: number) => {
    if (index >= sentences.length) {
        setIsPlaying(false);
        onComplete();
        return;
    }

    setCurrentIndex(index);
    onHighlight(index);
    setProgress(((index) / sentences.length) * 100);

    const u = new SpeechSynthesisUtterance(sentences[index]);
    u.rate = rate;
    // Attempt to match requested lang or fallback to browser default
    const voices = synth.getVoices();
    const voice = voices.find(v => v.lang.startsWith(voiceLang.split('-')[0])) || voices[0];
    if (voice) u.voice = voice;

    u.onend = () => {
        if (isPlaying) speakSentence(index + 1);
    };
    
    u.onerror = () => setIsPlaying(false);

    utteranceRef.current = u;
    synth.speak(u);
  };

  const togglePlay = () => {
    if (isPlaying) {
        cancel();
        // We pause by cancelling and remembering index. 
        // Real pause/resume in speech synthesis API can be buggy on some browsers.
    } else {
        setIsPlaying(true);
        speakSentence(currentIndex);
    }
  };

  const handleSeek = (direction: 'prev' | 'next') => {
      cancel();
      let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
      newIndex = Math.max(0, Math.min(newIndex, sentences.length - 1));
      setCurrentIndex(newIndex);
      if (isPlaying) { // If was playing, resume immediately from new point
          setIsPlaying(true);
          speakSentence(newIndex); 
      } else {
          onHighlight(newIndex);
          setProgress((newIndex / sentences.length) * 100);
      }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 animate-in slide-in-from-bottom-10 fade-in duration-500">
        
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer">
            <div className="h-full bg-indigo-500 transition-all duration-300 ease-linear" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
                <span className="text-xs font-mono opacity-70">{currentIndex + 1} / {sentences.length}</span>
            </div>

            <div className="flex items-center gap-6">
                <button onClick={() => handleSeek('prev')} className="hover:text-indigo-400 transition-colors"><SkipBack size={20} /></button>
                <button 
                    onClick={togglePlay}
                    className={`w-14 h-14 rounded-full flex items-center justify-center bg-white text-black shadow-lg hover:scale-105 active:scale-95 transition-all ${isPlaying ? 'bg-indigo-400 text-white' : ''}`}
                >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>
                <button onClick={() => handleSeek('next')} className="hover:text-indigo-400 transition-colors"><SkipForward size={20} /></button>
            </div>

            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setRate(r => r === 1 ? 1.5 : r === 1.5 ? 0.75 : 1)} 
                    className="text-xs font-bold bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition-colors w-10 text-center"
                >
                    {rate}x
                </button>
                <button className="hover:text-indigo-400 transition-colors"><Download size={18} /></button>
            </div>
        </div>
    </div>
  );
};

export default SipsPlayer;
