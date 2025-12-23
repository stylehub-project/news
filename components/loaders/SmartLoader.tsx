import React from 'react';
import { Loader2 } from 'lucide-react';
import SwipeableCardLoader from './SwipeableCardLoader';
import HomeContextLoader from './HomeContextLoader';
import ChatContextLoader from './ChatContextLoader';
import MapContextLoader from './MapContextLoader';
import ReelLoader from './ReelLoader';
import ProfileSetupLoader from './ProfileSetupLoader';

export type SmartLoaderType = 'home' | 'chat' | 'map' | 'reel' | 'profile' | 'article' | 'startup' | 'generic' | 'headlines';

interface SmartLoaderProps {
  type?: SmartLoaderType;
  message?: string;
  className?: string;
}

const SmartLoader: React.FC<SmartLoaderProps> = ({ type = 'generic', message, className = '' }) => {
  // Premium Minimalist Loader for generic/article states
  const renderPremiumLoader = (text: string) => (
    <div className={`flex flex-col items-center justify-center w-full h-full min-h-[300px] bg-white dark:bg-black ${className}`}>
        <div className="relative flex items-center justify-center">
            {/* Outer Ring */}
            <div className="w-16 h-16 border-4 border-gray-100 dark:border-gray-800 rounded-full"></div>
            {/* Spinning Indicator */}
            <div className="absolute w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
            {/* Inner Brand/Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
            </div>
        </div>
        <p className="text-xs font-bold text-gray-400 mt-6 tracking-[0.2em] uppercase animate-pulse">{text}</p>
    </div>
  );

  switch (type) {
    case 'startup':
        return (
             <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 text-white">
                 <div className="relative mb-8">
                     <div className="w-20 h-20 bg-indigo-600 rounded-3xl rotate-45 flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.6)] animate-in zoom-in duration-700">
                        <span className="text-4xl font-black text-white -rotate-45">N</span>
                     </div>
                 </div>
                 <p className="text-indigo-400 text-xs font-medium tracking-[0.3em] uppercase animate-pulse">Initializing</p>
             </div>
         );
    case 'home':
        return <HomeContextLoader />;
    case 'chat':
        return <ChatContextLoader />;
    case 'map':
        return <MapContextLoader />;
    case 'reel':
        return <ReelLoader />;
    case 'headlines':
        return <SwipeableCardLoader />;
    case 'profile':
        return <ProfileSetupLoader />;
    case 'article':
        return (
          <div className="p-6 space-y-6 max-w-2xl mx-auto w-full pt-20 bg-white dark:bg-black">
             <div className="space-y-4 animate-pulse">
                 <div className="h-3 w-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-full"></div>
                 <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl w-3/4"></div>
                 <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl w-1/2"></div>
                 <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl w-full mt-6"></div>
                 <div className="space-y-2 mt-6">
                     <div className="h-4 bg-gray-50 dark:bg-gray-900 rounded w-full"></div>
                     <div className="h-4 bg-gray-50 dark:bg-gray-900 rounded w-full"></div>
                     <div className="h-4 bg-gray-50 dark:bg-gray-900 rounded w-5/6"></div>
                 </div>
             </div>
          </div>
        );
    default:
        return renderPremiumLoader(message || "Loading");
  }
};

export default SmartLoader;