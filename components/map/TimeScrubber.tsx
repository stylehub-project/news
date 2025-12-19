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
  const steps = [
    { label: 'Live', val: 0 },
    { label: '24h', val: 1 },
    { label: '7d', val: 2 }
  ];

  const getCurrentLabel = () => {
    if (value < 0.5) return "Live Now";
    if (value < 1.5) return "Past 24h";
    return "Past Week";
  };

  return (
    <div className="absolute bottom-[105px] left-1/2 -translate-x-1/2 z-[45] w-[94%] max-w-sm bg-gray-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-10 duration-500 flex flex-col gap-3">
        {onClose && (
            <button 
                onClick={onClose}
                className="absolute -top-2 -right-2 bg-red-600 text-white p-1.5 rounded-full border-2 border-gray-900 shadow-lg active:scale-90 transition-transform"
                aria-label="Close timeline"
            >
                <X size={12} strokeWidth={3} />
            </button>
        )}

        <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                <span className="text-[11px] font-black text-white uppercase tracking-[0.15em]">{getCurrentLabel()}</span>
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">Intelligent Map</span>
        </div>

        <div className="flex items-center gap-4">
            <button 
                onClick={onTogglePlay}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-90 shrink-0 ${isPlaying ? 'bg-red-500 shadow-red-500/20' : 'bg-blue-600 shadow-blue-600/20 hover:bg-blue-500'}`}
            >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
            </button>
            
            <div className="flex-1 flex flex-col gap-2">
                <div className="relative h-6 flex items-center">
                    <input 
                        type="range" 
                        min="0" 
                        max="2" 
                        step="0.01"
                        value={value}
                        onChange={(e) => onChange(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                </div>
                
                <div className="flex justify-between px-0.5">
                    {steps.map((step) => (
                        <button 
                            key={step.label} 
                            onClick={() => onChange(step.val)}
                            className="flex flex-col items-center gap-1 group transition-all"
                        >
                            <div className={`w-1.5 h-1.5 rounded-full transition-all ${Math.abs(value - step.val) < 0.2 ? 'bg-blue-400 scale-150 shadow-[0_0_5px_rgba(96,165,250,0.8)]' : 'bg-gray-600 group-hover:bg-gray-400'}`}></div>
                            <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${Math.abs(value - step.val) < 0.2 ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                {step.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default TimeScrubber;