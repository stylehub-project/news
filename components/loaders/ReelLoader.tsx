import React from 'react';

const ReelLoader: React.FC = () => {
  return (
    <div className="h-full w-full bg-gray-900 relative flex flex-col overflow-hidden">
      {/* 1. Shimmering Background (Simulates video loading) */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800 via-gray-900 to-black animate-pulse"></div>
      
      {/* 2. Top Header Area */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-10">
         <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm animate-pulse"></div>
         <div className="flex gap-3">
             <div className="w-20 h-8 rounded-full bg-white/10 backdrop-blur-sm animate-pulse"></div>
             <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm animate-pulse"></div>
         </div>
      </div>

      {/* 3. Right Sidebar Actions (User, Like, Comment, Share, More) */}
      <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-10">
         {[1, 2, 3, 4, 5].map((i) => (
             <div key={i} className="flex flex-col items-center gap-1">
                 <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/5 animate-pulse"></div>
                 <div className="w-8 h-2 rounded bg-white/10 animate-pulse"></div>
             </div>
         ))}
      </div>

      {/* 4. Bottom Info Area (Text Content) */}
      <div className="absolute left-0 bottom-0 w-full p-4 pb-8 z-10 bg-gradient-to-t from-black via-black/60 to-transparent">
         {/* Category Tag */}
         <div className="w-24 h-5 rounded-full bg-white/20 mb-3 animate-pulse"></div>
         
         {/* Title Lines */}
         <div className="w-3/4 h-6 rounded bg-white/20 mb-2 animate-pulse"></div>
         <div className="w-1/2 h-6 rounded bg-white/20 mb-4 animate-pulse"></div>
         
         {/* Description Lines */}
         <div className="w-full h-3 rounded bg-white/10 mb-1.5 animate-pulse"></div>
         <div className="w-full h-3 rounded bg-white/10 mb-1.5 animate-pulse"></div>
         <div className="w-2/3 h-3 rounded bg-white/10 mb-4 animate-pulse"></div>

         {/* CTA Button */}
         <div className="w-full h-10 rounded-lg bg-blue-600/30 border border-blue-500/30 animate-pulse mt-2"></div>
      </div>

      {/* 5. Center Loading Icon */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
          <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-white/50 animate-spin"></div>
      </div>
    </div>
  );
};

export default ReelLoader;