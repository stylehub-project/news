import React from 'react';
import { PlayCircle, ChevronRight, Zap } from 'lucide-react';
import ComingSoonBanner from '../../components/ComingSoonBanner';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      
      {/* Stories / Highlights */}
      <div className="flex gap-3 overflow-x-auto p-4 scrollbar-hide">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1 min-w-[70px]">
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600">
              <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-200">
                <img src={`https://picsum.photos/100/100?random=${i}`} alt="Story" className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="text-[10px] text-gray-600 font-medium">Update {i}</span>
          </div>
        ))}
      </div>

      {/* Trending Header */}
      <div className="px-4 mb-2 flex justify-between items-center">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Zap size={18} className="text-yellow-500 fill-yellow-500" />
          Trending Now
        </h2>
        <span className="text-xs text-blue-600 font-medium">See All</span>
      </div>

      {/* Main News Card */}
      <div className="mx-4 mb-6 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="h-48 relative">
           <img src="https://picsum.photos/600/300?random=10" alt="Main News" className="w-full h-full object-cover" />
           <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
             AI Summary Available
           </div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Technology</span>
            <span className="text-gray-400 text-xs">4h ago</span>
          </div>
          <h3 className="text-lg font-bold mb-2 leading-tight">Artificial Intelligence Regulations: What You Need to Know Today</h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            Governments worldwide are preparing new frameworks for AI safety, impacting everything from startups to tech giants...
          </p>
          <div className="flex justify-between items-center border-t border-gray-100 pt-3">
             <div className="flex gap-[-8px]">
               {/* Avatars */}
               <div className="w-6 h-6 rounded-full bg-gray-300 border border-white"></div>
               <div className="w-6 h-6 rounded-full bg-gray-400 border border-white -ml-2"></div>
               <span className="text-xs text-gray-500 ml-2 mt-1">2.5k reads</span>
             </div>
             <button className="text-blue-600 text-xs font-bold flex items-center gap-1">
               Read More <ChevronRight size={14} />
             </button>
          </div>
        </div>
      </div>

      {/* Latest AI News Placeholder */}
      <div className="px-4">
        <ComingSoonBanner 
          title="Top Stories" 
          gradient="bg-gradient-to-r from-blue-600 to-indigo-700"
          icon={<PlayCircle size={40} />}
          description="A dedicated feed for high-impact journalism is being curated."
        />
      </div>

      {/* Infinite Scroll Hint */}
      <div className="mt-8 text-center opacity-50">
        <LoadingSkeleton />
      </div>
    </div>
  );
};

export default HomePage;