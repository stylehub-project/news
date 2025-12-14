import React from 'react';
import { ChevronsUp, Hand } from 'lucide-react';

const SwipeHint: React.FC = () => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-end pb-32 pointer-events-none z-50 animate-out fade-out duration-700 delay-[3000ms] fill-mode-forwards">
      <div className="flex flex-col items-center gap-3 opacity-80">
        <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-md flex items-center justify-center animate-bounce">
                <ChevronsUp size={24} className="text-white" />
            </div>
            {/* Hand gesture simulation */}
            <div className="absolute top-8 left-4 animate-[ping_2s_infinite]">
               <div className="w-8 h-8 bg-white/20 rounded-full"></div>
            </div>
        </div>
        <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
            <span className="text-white text-[10px] font-bold uppercase tracking-widest">Swipe to explore</span>
        </div>
      </div>
    </div>
  );
};

export default SwipeHint;