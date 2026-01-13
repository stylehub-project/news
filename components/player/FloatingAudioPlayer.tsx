
import React, { useState, useEffect } from 'react';
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
    <div className="fixed bottom-24 left-4 right-4 z-[60] animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
        
        {/* Progress & Title */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className={`p-2 rounded-full ${isPlaying ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white'}`}>
                    <Volume2 size={16} className={isPlaying ? "animate-pulse" : ""} />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{title || "AI News Reader"}</p>
                    <p className="text-[10px] text-gray-400 font-medium">Listening to daily brief</p>
                </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                <X size={16} />
            </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-linear"
                style={{ width: `${progress}%` }}
            ></div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
            <button 
                onClick={() => onSpeedChange(speed === 1 ? 1.5 : speed === 1.5 ? 2 : speed === 2 ? 0.75 : 1)}
                className="text-[10px] font-bold text-gray-400 hover:text-white w-8"
            >
                {speed}x
            </button>

            <div className="flex items-center gap-4">
                <button className="text-gray-400 hover:text-white transition-colors">
                    <Rewind size={20} />
                </button>
                
                <button 
                    onClick={onTogglePlay}
                    className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                </button>

                <button className="text-gray-400 hover:text-white transition-colors">
                    <FastForward size={20} />
                </button>
            </div>

            <button className="text-gray-400 hover:text-white transition-colors">
                <Download size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingAudioPlayer;
