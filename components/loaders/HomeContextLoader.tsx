import React from 'react';
import ParticleLoader from './ParticleLoader';
import TickerLoader from './TickerLoader';
import KeywordPulsingLoader from './KeywordPulsingLoader';
import NewsSkeleton from '../skeletons/NewsSkeleton';

const HomeContextLoader: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-screen bg-gray-50 overflow-hidden">
      {/* 1. Background Particles */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <ParticleLoader count={8} className="h-full bg-transparent" />
      </div>

      {/* 2. Top Ticker */}
      <div className="relative z-10 mb-4 bg-white/80 backdrop-blur-sm shadow-sm">
        <TickerLoader speed={10} items={["Initializing Feed...", "Personalizing Content...", "Fetching Global Headlines...", "Analyzing Trends..."]} />
      </div>

      {/* 3. Center AI Analysis */}
      <div className="relative z-10 mb-6">
         <KeywordPulsingLoader />
      </div>

      {/* 4. Skeleton Feed */}
      <div className="relative z-10 px-4 space-y-4 opacity-60">
         <div className="w-full h-48 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse mb-6"></div>
         <NewsSkeleton />
         <NewsSkeleton />
      </div>
    </div>
  );
};

export default HomeContextLoader;