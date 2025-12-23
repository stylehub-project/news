import React, { useState } from 'react';
import { Radio, X } from 'lucide-react';

const UPDATES = [
    "BREAKING: Market hits record high",
    "TECH: AI Regulations passed in EU",
    "SPORTS: Local team wins championship",
    "WEATHER: Storm warning for East Coast",
    "SCIENCE: Mars mission successful"
];

const MapTicker: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-0 left-0 w-full bg-black/80 backdrop-blur-md text-white z-40 border-t border-white/10 h-8 flex items-center overflow-hidden pr-8">
        <div className="bg-red-600 h-full px-2 flex items-center gap-1 shrink-0 z-10 shadow-lg">
            <Radio size={10} className="animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest">Live</span>
        </div>
        <div className="flex items-center whitespace-nowrap animate-shimmer w-full">
            <div className="flex items-center animate-[marquee_25s_linear_infinite]">
                {/* Duplicate for seamless loop */}
                {[...UPDATES, ...UPDATES].map((update, i) => (
                    <div key={i} className="flex items-center px-4">
                        <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
                        <span className="text-[10px] font-mono text-gray-300">{update}</span>
                    </div>
                ))}
            </div>
        </div>
        
        {/* Close Button */}
        <button 
            onClick={() => setIsVisible(false)}
            className="absolute right-0 top-0 h-full px-2 bg-black/80 flex items-center justify-center hover:text-red-400 transition-colors z-20 border-l border-white/10"
            aria-label="Close updates"
        >
            <X size={12} />
        </button>
    </div>
  );
};

export default MapTicker;