import React from 'react';
import HomeContextLoader from './HomeContextLoader';
import ChatContextLoader from './ChatContextLoader';
import MapContextLoader from './MapContextLoader';
import ReelLoader from './ReelLoader';
import ProfileSetupLoader from './ProfileSetupLoader';
import ParticleLoader from './ParticleLoader';
import FactLoader from './FactLoader';
import NewsSkeleton from '../skeletons/NewsSkeleton';

export type SmartLoaderType = 'home' | 'chat' | 'map' | 'reel' | 'profile' | 'article' | 'startup' | 'generic';

interface SmartLoaderProps {
  type?: SmartLoaderType;
  message?: string;
  className?: string;
}

const SmartLoader: React.FC<SmartLoaderProps> = ({ type = 'generic', message, className = '' }) => {
  const renderContent = () => {
    switch (type) {
      case 'home':
        return <HomeContextLoader />;
      case 'chat':
        return <ChatContextLoader />;
      case 'map':
        return <MapContextLoader />;
      case 'reel':
        return <ReelLoader />;
      case 'profile':
        return <ProfileSetupLoader />;
      case 'article':
        return (
          <div className="p-4 space-y-4 max-w-2xl mx-auto w-full pt-20">
             <div className="space-y-3">
                 <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                 <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse mb-6"></div>
                 <NewsSkeleton />
                 <div className="space-y-2">
                     <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
                     <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
                     <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse"></div>
                 </div>
             </div>
          </div>
        );
      case 'startup':
         return (
             <div className="fixed inset-0 bg-blue-600 flex flex-col items-center justify-center z-50 text-white">
                 <ParticleLoader count={20} className="absolute inset-0 bg-transparent opacity-50" />
                 <div className="relative z-10 w-full max-w-sm px-6">
                     <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-2xl animate-bounce">
                        <span className="text-3xl font-black text-blue-600">N</span>
                     </div>
                     <FactLoader type="general" className="bg-white/10 border-white/20 text-white" />
                 </div>
             </div>
         );
      case 'generic':
      default:
        return (
            <div className={`flex flex-col items-center justify-center w-full h-full min-h-[300px] bg-gray-50 ${className}`}>
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                    <ParticleLoader count={5} className="w-32 h-32 bg-transparent" />
                </div>
                {message && <p className="text-gray-500 font-medium mt-4 animate-pulse">{message}</p>}
            </div>
        );
    }
  };

  return (
    <div className={`w-full h-full ${className}`}>
        {renderContent()}
    </div>
  );
};

export default SmartLoader;