import React from 'react';
import { Play, Pause, Clock, X } from 'lucide-react';

interface TimeScrubberProps {
  value: number; 
  onChange: (val: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClose?: () => void;
}

const TimeScrubber: React.FC<TimeScrubberProps> = ({ value, onChange, isPlaying, onTogglePlay, onClose }) => {
  const steps = ['Live', '24h', '7d'];

  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-sm bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-3 shadow-2xl animate-in slide-in-from-bottom-4 flex flex-col gap-2 relative">
        {onClose && (
            <button 
                onClick={onClose}
                className="absolute -top-2 -right-2 bg-gray-800 text-gray-400 hover:text-white p-1 rounded-full border border-gray-600 shadow-lg hover:bg-red-500 transition-colors z-50"
            >
                <X size={12} />
            </button>
        )}

        <div className="flex items-center justify-between text-xs font-bold text-gray-400 px-1">
            <span className="flex items-center gap-1 text-blue-400"><Clock size={12}/> Live Intelligence</span>
            <span className="uppercase tracking-widest text-[9px] opacity-50">Timeline</span>
        </div>

        <div className="flex items-center gap-3">
            <button 
                onClick={onTogglePlay}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-95 ${isPlaying ? 'bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}
            >
                {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
            </button>
            
            <div className="flex-1 relative pt-1">
                <input 
                    type="range" 
                    min="0" 
                    max="2" 
                    step="0.05"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between mt-2 px-1">
                    {steps.map((step, i) => (
                        <span key={step} className={`text-[8px] font-black uppercase tracking-widest ${Math.round(value) === i ? 'text-blue-400' : 'text-gray-600'}`}>{step}</span>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default TimeScrubber;