import React from 'react';

interface TickerLoaderProps {
  items?: string[];
  speed?: number; // seconds
}

const DEFAULT_ITEMS = [
  "Fetching latest headlines...",
  "Syncing with global servers...",
  "AI analyzing sentiment...",
  "Optimizing reading experience...",
  "Curating your personalized feed..."
];

const TickerLoader: React.FC<TickerLoaderProps> = ({ 
  items = DEFAULT_ITEMS,
  speed = 15
}) => {
  return (
    <div className="w-full overflow-hidden bg-gray-100 py-2 border-y border-gray-200 relative">
      <div className="flex items-center whitespace-nowrap animate-[marquee_20s_linear_infinite]" style={{ animationDuration: `${speed}s` }}>
        {[...items, ...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center mx-4 opacity-60">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 shrink-0"></span>
            <span className="text-xs font-mono text-gray-600 font-medium">{item}</span>
          </div>
        ))}
      </div>
      
      {/* Fade Edges */}
      <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-gray-100 to-transparent z-10"></div>
      <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-gray-100 to-transparent z-10"></div>
    </div>
  );
};

export default TickerLoader;