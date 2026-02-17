
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, FileText, Download } from 'lucide-react';

interface SipsPlayerProps {
  text: string;
  onHighlight: (index: number) => void;
  onComplete: () => void;
  voiceLang?: string;
  speed?: number;
  pitch?: number;
}

const SipsPlayer: React.FC<SipsPlayerProps> = ({ 
  text, 
  onHighlight, 
  onComplete, 
  voiceLang = 'en-US',
  speed = 1,
  pitch = 1
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const synth = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const sentences = React.useMemo(() => text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text], [text]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    cancel();
    setCurrentIndex(0);
    setProgress(0);
  }, [text]);

  // Update ongoing speech if parameters change while playing
  useEffect(() => {
    if (isPlaying) {
      // We can't update live utterance properties easily without restart in Web Speech API
      // For a smooth experience, changes usually apply to the *next* sentence automatically.
      // If immediate change is needed, we would need to cancel and restart at currentIndex.
    }
  }, [speed, pitch]);

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
    u.rate = speed;
    u.pitch = pitch;
    
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
      if (isPlaying) {
          setIsPlaying(true);
          speakSentence(newIndex); 
      } else {
          onHighlight(newIndex);
          setProgress((newIndex / sentences.length) * 100);
      }
  };

  const handleDownloadTranscript = () => {
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sips-transcript-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
                    onClick={handleDownloadTranscript}
                    className="hover:text-indigo-400 transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20"
                    title="Download Transcript"
                >
                    <FileText size={18} />
                </button>
            </div>
        </div>
    </div>
  );
};

export default SipsPlayer;
