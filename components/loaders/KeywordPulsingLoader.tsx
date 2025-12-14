import React, { useState, useEffect } from 'react';

interface KeywordPulsingLoaderProps {
  keywords?: string[];
  interval?: number;
  className?: string;
}

const DEFAULT_KEYWORDS = [
  "Breaking News", "AI Analysis", "Global Markets", "Tech Trends", "Live Updates", "Sports Highlights"
];

const KeywordPulsingLoader: React.FC<KeywordPulsingLoaderProps> = ({ 
  keywords = DEFAULT_KEYWORDS,
  interval = 2000,
  className = ''
}) => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % keywords.length);
        setFade(true);
      }, 300); // Duration of fade out
    }, interval);

    return () => clearInterval(timer);
  }, [keywords, interval]);

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="relative flex items-center justify-center h-20 w-full">
        {/* Pulse Rings */}
        <div className="absolute w-16 h-16 bg-blue-500/20 rounded-full animate-ping"></div>
        <div className="absolute w-12 h-12 bg-blue-500/30 rounded-full animate-ping delay-150"></div>
        
        {/* Core Dot */}
        <div className="w-3 h-3 bg-blue-600 rounded-full shadow-lg shadow-blue-500/50 z-10"></div>
      </div>
      
      <div className="h-8 flex items-center justify-center">
        <span 
          className={`text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
        >
          {keywords[index]}...
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-2 font-medium tracking-wide uppercase">Searching Knowledge Base</p>
    </div>
  );
};

export default KeywordPulsingLoader;