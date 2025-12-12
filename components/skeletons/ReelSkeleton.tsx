import React from 'react';
import { Smartphone, ArrowUp } from 'lucide-react';

const ReelSkeleton: React.FC = () => {
  return (
    <div className="h-full w-full bg-gray-900 relative flex flex-col items-center justify-center overflow-hidden">
      {/* Shimmer Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-shimmer" />
      
      <div className="z-10 text-center text-gray-500 space-y-4">
        <div className="w-16 h-16 rounded-full border-2 border-gray-700 flex items-center justify-center mx-auto animate-pulse">
            <Smartphone size={32} />
        </div>
        <div>
            <h3 className="text-gray-300 font-bold text-lg">Curating Reels</h3>
            <p className="text-xs">Finding the most viral stories...</p>
        </div>
      </div>

      <div className="absolute bottom-20 flex flex-col items-center gap-2 animate-bounce opacity-50">
         <ArrowUp size={20} className="text-white" />
         <span className="text-[10px] text-white font-medium uppercase tracking-widest">Swipe for next</span>
      </div>
    </div>
  );
};
export default ReelSkeleton;