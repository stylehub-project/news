
import React from 'react';

const ReelLoader = () => {
  return (
    <div className="h-full w-full bg-black flex flex-col p-6 pt-24 pb-32 relative overflow-hidden">
        {/* Background Pulse */}
        <div className="absolute inset-0 bg-gray-900 z-0 opacity-50">
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80"></div>
        </div>
        
        <div className="relative z-10 flex flex-col h-full gap-6 max-w-2xl mx-auto w-full">
            {/* Context Strip Skeleton */}
            <div className="flex justify-between items-center w-full mb-2">
                <div className="h-4 w-24 bg-gray-800 rounded animate-pulse"></div>
                <div className="flex gap-2">
                    <div className="h-4 w-12 bg-gray-800 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-800 rounded animate-pulse"></div>
                </div>
            </div>

            {/* Headline Skeleton */}
            <div className="space-y-3 mt-4">
                <div className="h-8 w-full bg-gray-800 rounded animate-pulse"></div>
                <div className="h-8 w-3/4 bg-gray-800 rounded animate-pulse"></div>
                <div className="h-8 w-1/2 bg-gray-800 rounded animate-pulse"></div>
            </div>

            {/* Text Body Skeleton - Staggered */}
            <div className="space-y-4 mt-8 flex-1">
                <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-800/60 rounded animate-pulse"></div>
                    <div className="h-4 w-full bg-gray-800/60 rounded animate-pulse"></div>
                    <div className="h-4 w-5/6 bg-gray-800/60 rounded animate-pulse"></div>
                </div>
                
                <div className="space-y-2 mt-6">
                    <div className="h-4 w-full bg-gray-800/60 rounded animate-pulse delay-100"></div>
                    <div className="h-4 w-full bg-gray-800/60 rounded animate-pulse delay-100"></div>
                    <div className="h-4 w-4/6 bg-gray-800/60 rounded animate-pulse delay-100"></div>
                </div>
            </div>

            {/* Audio Player Skeleton */}
            <div className="h-14 w-full bg-gray-800/80 rounded-2xl animate-pulse mt-auto border border-white/5"></div>
        </div>

        {/* Action Bar Skeleton */}
        <div className="absolute bottom-6 left-4 right-4 h-16 bg-gray-900/80 backdrop-blur-md rounded-2xl border border-white/10 animate-pulse z-20 flex items-center justify-between px-4">
             <div className="flex gap-2">
                 <div className="h-10 w-10 bg-gray-700 rounded-xl"></div>
                 <div className="h-10 w-10 bg-gray-700 rounded-xl"></div>
                 <div className="h-10 w-10 bg-gray-700 rounded-xl"></div>
             </div>
             <div className="h-10 w-32 bg-gray-700 rounded-xl"></div>
        </div>
    </div>
  );
};

export default ReelLoader;
