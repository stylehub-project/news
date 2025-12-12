import React from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Sparkles, Volume2 } from 'lucide-react';

const ReelPage: React.FC = () => {
  return (
    <div className="h-[calc(100vh-130px)] w-full overflow-y-scroll snap-y snap-mandatory bg-black">
      {/* Reel Item 1 */}
      <div className="h-full w-full snap-start relative bg-gray-900 flex items-center justify-center">
        {/* Placeholder for Video/Image */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90">
             <img src="https://picsum.photos/400/800?random=1" className="w-full h-full object-cover opacity-60" alt="News Background" />
        </div>
        
        {/* Right Sidebar Actions */}
        <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center text-white z-20">
            <button className="flex flex-col items-center gap-1 group">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-full group-hover:bg-red-500/20 transition-all">
                    <Heart size={28} className="group-hover:text-red-500" />
                </div>
                <span className="text-xs font-bold">4.5k</span>
            </button>
            <button className="flex flex-col items-center gap-1">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-full">
                    <MessageCircle size={28} />
                </div>
                <span className="text-xs font-bold">230</span>
            </button>
             <button className="flex flex-col items-center gap-1">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-full">
                    <Share2 size={28} />
                </div>
                <span className="text-xs font-bold">Share</span>
            </button>
            <button className="flex flex-col items-center gap-1">
                 <div className="p-3 bg-white/10 backdrop-blur-md rounded-full">
                    <Bookmark size={28} />
                </div>
            </button>
        </div>

        {/* Bottom Content Info */}
        <div className="absolute left-0 bottom-0 w-full p-4 pb-8 bg-gradient-to-t from-black via-black/60 to-transparent text-white z-10">
            <div className="flex items-center gap-2 mb-2">
                <span className="bg-red-600 text-xs px-2 py-0.5 rounded font-bold uppercase">Breaking</span>
                <span className="text-gray-300 text-xs">• 2 min ago</span>
            </div>
            <h2 className="text-xl font-bold leading-tight mb-2 line-clamp-2">Global Markets Rally as Tech Giants Announce New AI Partnership</h2>
            <p className="text-sm text-gray-200 line-clamp-2 mb-4 opacity-90">
                Major tech companies have agreed on a unified framework for AI development, causing stock markets to surge globally...
            </p>
            
            {/* AI Action Button */}
            <button className="w-full bg-indigo-600/90 hover:bg-indigo-600 backdrop-blur-md py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all">
                <Sparkles size={16} className="text-yellow-300" />
                AI Explain This
            </button>
        </div>
      </div>

       {/* Reel Item 2 (Skeleton) */}
       <div className="h-full w-full snap-start relative bg-gray-800 flex items-center justify-center">
            <div className="text-center text-gray-500 p-8">
                <Volume2 size={48} className="mx-auto mb-4 animate-pulse" />
                <h3 className="text-2xl font-bold text-white mb-2">Auto-Play Mode</h3>
                <p className="text-gray-400">Next story loading...</p>
            </div>
       </div>
    </div>
  );
};

export default ReelPage;