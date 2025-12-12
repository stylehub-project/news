import React from 'react';
import { Globe } from 'lucide-react';
import Shimmer from '../ui/Shimmer';

const MapSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
        {/* Map Shimmer Background */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>

        <div className="relative z-10 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl text-center max-w-xs">
            <div className="relative w-16 h-16 mx-auto mb-4">
                 <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
                 <Globe className="w-16 h-16 text-blue-600 animate-spin-slow" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Locating Headlines</h3>
            <p className="text-sm text-gray-500 mb-4">Loading news from your region...</p>
            
            <div className="space-y-2">
                <Shimmer height="0.5rem" width="100%" />
                <Shimmer height="0.5rem" width="80%" className="mx-auto" />
            </div>
        </div>
    </div>
  );
};
export default MapSkeleton;