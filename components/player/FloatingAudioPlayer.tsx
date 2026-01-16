
import React from 'react';
import { Play, Pause, FastForward, Rewind, X, Download, Volume2 } from 'lucide-react';

interface FloatingAudioPlayerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClose: () => void;
  onSpeedChange: (speed: number) => void;
  speed: number;
  progress: number; // 0 to 100
  title?: string;
}

const FloatingAudioPlayer: React.FC<FloatingAudioPlayerProps> = ({
  isPlaying,
  onTogglePlay,
  onClose,
  onSpeedChange,
  speed,
  progress,
  title
}) => {
  return (
    <div className="fixed bottom-24 left-4 right-4 z-[60] animate-in slide-in-from-bottom-4 duration-500 pointer-events-none flex justify-center">
      <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-full py-3 px-5 shadow-2xl flex items-center gap-4 w-full max-w-md pointer-events-auto">
        
        {/* Play/Pause Main Control */}
        <button 
            onClick={onTogglePlay}
            className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0"
        >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>

        {/* Info & Progress */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-white pr-2">
                <span className="truncate">{title || "AI News Reader"}</span>
                <span className="text-gray-400 font-mono text-[10px]">{speed}x</span>
            </div>
            
            {/* Minimal Progress Bar */}
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 transition-all duration-300 ease-linear"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>

        {/* Secondary Actions */}
        <div className="flex items-center gap-2 shrink-0 border-l border-white/10 pl-3">
            <button 
                onClick={() => onSpeedChange(speed === 1 ? 1.5 : speed === 1.5 ? 2 : speed === 2 ? 0.75 : 1)}
                className="p-1.5 hover:bg-white/10 rounded-full text-gray-300 transition-colors"
                title="Speed"
            >
                <FastForward size={16} />
            </button>
            <button 
                onClick={onClose} 
                className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-full text-gray-400 transition-colors"
            >
                <X size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingAudioPlayer;
