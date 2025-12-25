
import React from 'react';
import { Play, Pause, Rewind, FastForward } from 'lucide-react';

interface AudioPlayerStripProps {
  isPlaying: boolean;
  progress: number;
  onTogglePlay: (e: React.MouseEvent) => void;
}

const AudioPlayerStrip: React.FC<AudioPlayerStripProps> = ({ isPlaying, progress, onTogglePlay }) => {
  return (
    <div className="bg-gray-800/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center gap-4 shadow-lg animate-in slide-in-from-bottom-2 duration-500">
        <button 
            onClick={onTogglePlay}
            className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-all shadow-md"
        >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>

        <div className="flex-1 flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                <span>Audio Brief</span>
                <span>{isPlaying ? 'Listening...' : 'Paused'}</span>
            </div>
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-indigo-500 transition-all duration-300 ease-linear rounded-full"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>

        <div className="flex items-center gap-1">
             <button className="p-1.5 text-gray-500 hover:text-white transition-colors">
                 <Rewind size={16} />
             </button>
             <button className="p-1.5 text-gray-500 hover:text-white transition-colors">
                 <FastForward size={16} />
             </button>
        </div>
    </div>
  );
};

export default AudioPlayerStrip;
