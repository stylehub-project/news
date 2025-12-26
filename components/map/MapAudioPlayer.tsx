
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, FastForward, Mic, Radio } from 'lucide-react';

interface MapAudioPlayerProps {
  region: string;
  summary: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSpeedChange: () => void;
  speed: number;
}

const MapAudioPlayer: React.FC<MapAudioPlayerProps> = ({ 
    region, 
    summary, 
    isPlaying, 
    onTogglePlay, 
    onSpeedChange, 
    speed 
}) => {
  const [volume, setVolume] = useState(1); // Visual only for now
  
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none animate-in slide-in-from-top-4 duration-500">
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-full py-2 px-4 shadow-2xl flex items-center gap-4 pointer-events-auto">
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                <div className={`relative flex items-center justify-center w-6 h-6 rounded-full ${isPlaying ? 'bg-red-500/20 text-red-500' : 'bg-gray-800 text-gray-500'}`}>
                    {isPlaying ? (
                        <>
                            <Radio size={12} className="relative z-10 animate-pulse" />
                            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20"></span>
                        </>
                    ) : (
                        <Radio size={12} />
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none">Scanning</span>
                    <span className="text-xs font-bold text-white leading-tight max-w-[100px] truncate">{region}</span>
                </div>
            </div>

            {/* Waveform Visualizer (CSS Animation) */}
            <div className="flex items-center gap-0.5 h-6 w-16">
                {[...Array(8)].map((_, i) => (
                    <div 
                        key={i}
                        className={`w-1 rounded-full bg-indigo-500 transition-all duration-300 ${isPlaying ? 'animate-[wave_1s_ease-in-out_infinite]' : 'h-1 opacity-20'}`}
                        style={{ 
                            height: isPlaying ? `${Math.random() * 100}%` : '20%',
                            animationDelay: `${i * 0.1}s` 
                        }}
                    ></div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <button 
                    onClick={onTogglePlay}
                    className="p-1.5 hover:bg-white/10 rounded-full text-white transition-colors"
                >
                    {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button 
                    onClick={onSpeedChange}
                    className="text-[10px] font-bold text-gray-400 hover:text-white bg-white/5 px-2 py-1 rounded hover:bg-white/10 transition-all min-w-[30px]"
                >
                    {speed}x
                </button>
            </div>
        </div>

        {/* Subtitle / Brief Text */}
        {isPlaying && (
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 max-w-sm text-center">
                <p className="text-xs text-gray-200 font-medium leading-relaxed">
                    {summary}
                </p>
            </div>
        )}
    </div>
  );
};

export default MapAudioPlayer;
