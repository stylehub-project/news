import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff, Settings, Volume2, FastForward, Pause } from 'lucide-react';
import HighlightReadingMode from '../HighlightReadingMode';

interface VoiceModeProps {
  onClose: () => void;
}

const VoiceMode: React.FC<VoiceModeProps> = ({ onClose }) => {
  const [isListening, setIsListening] = useState(true);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("Listening...");
  const [aiText, setAiText] = useState("");

  // Simulation of conversation flow
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    if (isListening) {
      setTranscript("Listening...");
      setAiText("");
      timeout = setTimeout(() => {
        setIsListening(false);
        setTranscript("What's the latest on the Mars mission?");
        // Simulate AI processing then speaking
        setTimeout(() => {
            setAiSpeaking(true);
            setAiText("SpaceX has successfully launched the Starship rocket. The booster separation was confirmed 3 minutes after liftoff, marking a major milestone for interplanetary travel.");
        }, 1000);
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [isListening]);

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-white font-bold text-sm tracking-widest uppercase">Live Voice</span>
        </div>
        <button 
            onClick={onClose}
            className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
        >
            <X size={24} />
        </button>
      </div>

      {/* Main Visualizer */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Orb Animation */}
        <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Outer Rings */}
            <div className={`absolute inset-0 border-2 border-indigo-500/30 rounded-full transition-all duration-1000 ${aiSpeaking ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`}></div>
            <div className={`absolute inset-0 border-2 border-blue-500/30 rounded-full transition-all duration-1000 delay-100 ${aiSpeaking ? 'scale-125 opacity-0' : 'scale-90 opacity-100'}`}></div>
            
            {/* Core Orb */}
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 shadow-[0_0_50px_rgba(79,70,229,0.5)] flex items-center justify-center transition-all duration-300 ${aiSpeaking ? 'animate-pulse scale-110' : ''}`}>
                {aiSpeaking ? (
                    <Volume2 size={48} className="text-white" />
                ) : (
                    <Mic size={48} className="text-white" />
                )}
            </div>

            {/* Waveform Lines (Mock) */}
            {aiSpeaking && (
                <div className="absolute inset-0 flex items-center justify-center gap-1 pointer-events-none">
                    {[...Array(10)].map((_, i) => (
                        <div 
                            key={i} 
                            className="w-1.5 bg-white/50 rounded-full animate-[wave_1s_ease-in-out_infinite]"
                            style={{ 
                                height: `${Math.random() * 100 + 50}%`,
                                animationDelay: `${i * 0.1}s`
                            }}
                        ></div>
                    ))}
                </div>
            )}
        </div>

        {/* Text Output */}
        <div className="mt-12 px-8 text-center max-w-md h-32 flex items-center justify-center">
            {aiSpeaking ? (
                <div className="text-xl font-medium text-white leading-relaxed">
                    <HighlightReadingMode text={aiText} isPlaying={true} theme="dark" />
                </div>
            ) : (
                <p className="text-2xl font-light text-gray-400 italic">"{transcript}"</p>
            )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-8 pb-12 flex justify-center items-center gap-6">
         <button className="p-4 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <Settings size={24} />
         </button>
         
         <button 
            onClick={() => {
                if (aiSpeaking) {
                    setAiSpeaking(false);
                    setIsListening(true);
                } else {
                    setIsListening(!isListening);
                }
            }}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${isListening ? 'bg-red-500 text-white' : 'bg-white text-black'}`}
         >
            {isListening ? <Pause size={32} /> : <Mic size={32} />}
         </button>

         <button className="p-4 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <FastForward size={24} />
         </button>
      </div>

      <style>{`
        @keyframes wave {
            0%, 100% { height: 20%; opacity: 0.5; }
            50% { height: 100%; opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default VoiceMode;