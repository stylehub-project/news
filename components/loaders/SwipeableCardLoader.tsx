import React from 'react';
import Shimmer from '../ui/Shimmer';

const SwipeableCardLoader: React.FC = () => {
  return (
    <div className="relative w-full max-w-md aspect-[3/5] md:aspect-[3/4] mx-auto p-4">
      <div className="w-full h-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden relative border border-gray-100 dark:border-gray-700">
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
        
        {/* Shimmer Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite] skew-x-12"></div>

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
            <Shimmer className="w-20 h-6 rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-md" />
            <Shimmer className="w-16 h-6 rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-md" />
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 w-full p-6 z-10 flex flex-col gap-4 bg-gradient-to-t from-black via-black/60 to-transparent pt-32">
            <div className="flex items-center gap-3">
                <Shimmer className="w-8 h-8 rounded-full bg-white/20" />
                <Shimmer className="w-32 h-4 rounded bg-white/20" />
            </div>
            <Shimmer className="w-full h-8 rounded bg-white/20" />
            <Shimmer className="w-3/4 h-8 rounded bg-white/20" />
            <div className="space-y-2 mt-2">
                <Shimmer className="w-full h-3 rounded bg-white/10" />
                <Shimmer className="w-full h-3 rounded bg-white/10" />
            </div>
            
            <div className="flex gap-3 mt-4">
                <Shimmer className="flex-1 h-12 rounded-xl bg-white/20" />
                <Shimmer className="w-12 h-12 rounded-xl bg-white/20" />
                <Shimmer className="w-12 h-12 rounded-xl bg-white/20" />
            </div>
        </div>
      </div>
    </div>
  );
};

export default SwipeableCardLoader;