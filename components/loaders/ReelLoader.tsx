
import React, { useState, useEffect } from 'react';
import { ChevronsUp, User, Heart, MessageCircle, Share2, Lightbulb, Cloud } from 'lucide-react';

const FACTS = [
  "Did you know? The first printed newspaper appeared in 1605.",
  "News travels faster today than at any point in history.",
  "Reading distinct perspectives improves critical thinking.",
  "Gemini AI processes thousands of articles per second.",
  "Digital news consumption has tripled in the last decade."
];

const KEYWORDS = ["Economy", "Innovation", "Global", "Future", "Tech", "Society"];

const ReelLoader: React.FC = () => {
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % FACTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full bg-gray-900 relative flex flex-col overflow-hidden">
      {/* 1. Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800 via-gray-900 to-black animate-pulse"></div>
      
      {/* 2. Top Header Area */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-10">
         <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm animate-pulse"></div>
         <div className="flex gap-3">
             <div className="w-20 h-8 rounded-full bg-white/10 backdrop-blur-sm animate-pulse"></div>
             <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm animate-pulse"></div>
         </div>
      </div>

      {/* 3. Center "No-Wait" Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-0 px-8 text-center">
          
          {/* Keyword Cloud */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 opacity-60">
              {KEYWORDS.map((kw, i) => (
                  <span 
                    key={i} 
                    className="text-[10px] font-bold text-white/40 border border-white/10 px-2 py-1 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s`, animationDuration: '2s' }}
                  >
                      {kw}
                  </span>
              ))}
          </div>

          {/* Fact Display */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl max-w-xs transform transition-all duration-500">
              <Lightbulb size={24} className="text-yellow-400 mx-auto mb-3 animate-pulse" />
              <p key={factIndex} className="text-sm font-medium text-gray-200 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {FACTS[factIndex]}
              </p>
          </div>
      </div>

      {/* 4. Right Sidebar Actions */}
      <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-10">
         {[User, Heart, MessageCircle, Share2].map((Icon, i) => (
             <div key={i} className="flex flex-col items-center gap-1 opacity-30">
                 <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <Icon size={20} className="text-white" />
                 </div>
             </div>
         ))}
      </div>

      {/* 5. Bottom Info Area */}
      <div className="absolute left-0 bottom-0 w-full p-4 pb-8 z-10 bg-gradient-to-t from-black via-black/60 to-transparent">
         {/* Swipe Indicator */}
         <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce opacity-70">
            <ChevronsUp size={24} className="text-white/50" />
            <span className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Loading Next Story</span>
         </div>

         <div className="w-24 h-5 rounded-full bg-white/10 mb-3"></div>
         <div className="w-3/4 h-6 rounded bg-white/10 mb-2"></div>
         <div className="w-1/2 h-6 rounded bg-white/10 mb-4"></div>
      </div>
    </div>
  );
};

export default ReelLoader;
