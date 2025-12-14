import React from 'react';
import ParticleLoader from './ParticleLoader';
import ChatSkeleton from '../skeletons/ChatSkeleton';
import { Bot } from 'lucide-react';

const ChatContextLoader: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden">
      {/* 1. Particle Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <ParticleLoader count={10} className="h-full bg-transparent" />
      </div>

      {/* 2. Header Status */}
      <div className="shrink-0 h-[60px] border-b border-gray-100 bg-white/80 backdrop-blur-sm flex items-center px-4 gap-3 z-10">
         <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Bot size={18} className="text-indigo-600 animate-pulse" />
         </div>
         <div className="flex flex-col">
             <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mb-1"></div>
             <div className="h-2 w-20 bg-gray-100 rounded animate-pulse"></div>
         </div>
      </div>

      {/* 3. Center Mascot Animation */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 -mt-20">
         <div className="relative">
             <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
             <div className="w-24 h-24 bg-white rounded-full shadow-xl border-4 border-indigo-50 flex items-center justify-center relative z-10">
                <Bot size={48} className="text-indigo-600 animate-[bounce_2s_infinite]" />
                {/* Blinking Eye Effect Overlay */}
                <div className="absolute top-[38%] left-[35%] w-2 h-2 bg-indigo-600 rounded-full animate-[blink_3s_infinite]"></div>
                <div className="absolute top-[38%] right-[35%] w-2 h-2 bg-indigo-600 rounded-full animate-[blink_3s_infinite]"></div>
             </div>
         </div>
         <p className="mt-6 text-sm font-bold text-indigo-900 tracking-widest uppercase animate-pulse">Initializing AI Core...</p>
         
         {/* Typing Dots */}
         <div className="flex gap-1 mt-2">
             <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
             <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
             <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
         </div>
      </div>

      {/* 4. Bottom Skeleton Hint */}
      <div className="shrink-0 p-4 opacity-50 blur-[1px]">
         <ChatSkeleton />
      </div>
    </div>
  );
};

export default ChatContextLoader;