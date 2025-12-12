import React from 'react';
import Shimmer from '../ui/Shimmer';

const ChatSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-4 w-full">
        {/* Bot Bubble Skeleton */}
        <div className="flex gap-3 max-w-[80%]">
             <Shimmer circle width={32} height={32} className="shrink-0" />
             <div className="space-y-2 w-full">
                <Shimmer className="rounded-2xl rounded-tl-none h-12 w-full" />
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-200"></span>
                    <span className="text-xs text-gray-400 font-medium ml-1">AI is thinking...</span>
                </div>
             </div>
        </div>

        {/* User Bubble Skeleton */}
        <div className="flex flex-row-reverse gap-3 max-w-[80%] self-end">
             <Shimmer circle width={32} height={32} className="shrink-0" />
             <Shimmer className="rounded-2xl rounded-tr-none h-10 w-32" />
        </div>
        
         {/* Bot Bubble Skeleton 2 */}
         <div className="flex gap-3 max-w-[80%]">
             <Shimmer circle width={32} height={32} className="shrink-0" />
             <Shimmer className="rounded-2xl rounded-tl-none h-24 w-64" />
        </div>
    </div>
  );
};
export default ChatSkeleton;