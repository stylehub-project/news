import React from 'react';
import { Play, Pause, Clock } from 'lucide-react';

interface TimeScrubberProps {
  value: number; // 0 (Today) to 2 (Week)
  onChange: (val: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const TimeScrubber: React.FC<TimeScrubberProps> = ({ value, onChange, isPlaying, onTogglePlay }) => {
  const steps = ['Live', '24 Hours', '7 Days'];

  // Calculate current label based on value
  const getCurrentLabel = () => {
      if (value < 0.5) return "Live Updates";
      if (value < 1.5) return "Past 24 Hours";
      return "Past Week";
  };

  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-sm bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-3 shadow-2xl animate-in slide-in-from-bottom-4 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-gray-400 px-1">
            <span className="flex items-center gap-1 text-blue-400"><Clock size={12}/> {getCurrentLabel()}</span>
            <span className="uppercase tracking-wider opacity-50">Timeline</span>
        </div>

        <div className="flex items-center gap-3">
            <button 
                onClick={onTogglePlay}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-95 ${isPlaying ? 'bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}
            >
                {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
            </button>
            
            <div className="flex-1 relative pt-1 group">
                <input 
                    type="range" 
                    min="0" 
                    max="2" 
                    step="0.05"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:h-1.5 transition-all"
                />
                
                {/* Ticks */}
                <div className="flex justify-between mt-2 px-1">
                    {steps.map((step, i) => (
                        <div key={step} className="flex flex-col items-center gap-1">
                            <div className={`w-0.5 h-1 ${Math.round(value) >= i ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
                            <span 
                                className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${Math.round(value) === i ? 'text-white' : 'text-gray-600'}`}
                            >
                                {step}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default TimeScrubber;