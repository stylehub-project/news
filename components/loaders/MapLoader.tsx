import React from 'react';
import { Globe, MapPin, Radio } from 'lucide-react';

interface MapLoaderProps {
  className?: string;
  text?: string;
}

const MapLoader: React.FC<MapLoaderProps> = ({ 
  className = '',
  text = "Locating global updates..."
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 overflow-hidden relative ${className}`}>
      {/* Radar Scan Effect Container */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Static Globe Grid (Background) */}
        <div className="absolute inset-0 border-2 border-blue-200/30 rounded-full"></div>
        <div className="absolute inset-4 border border-blue-200/20 rounded-full"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
             <Globe size={160} className="text-blue-400" strokeWidth={0.5} />
        </div>

        {/* Rotating Radar */}
        <div className="absolute inset-0 rounded-full animate-[spin_3s_linear_infinite] bg-gradient-to-tr from-transparent via-transparent to-blue-500/10 z-0"></div>
        
        {/* Blinking Cities */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-red-500 rounded-full animate-ping delay-300"></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-green-500 rounded-full animate-ping delay-700"></div>
        
        {/* Center Indicator */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
             <div className="bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-white/50 animate-bounce">
                <MapPin size={24} className="text-blue-600 fill-blue-100" />
             </div>
        </div>
      </div>

      {/* Text Indicator */}
      <div className="mt-8 text-center space-y-2 relative z-10">
         <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100 shadow-sm">
            <Radio size={12} className="animate-pulse" />
            Live Feed
         </div>
         <p className="text-sm font-medium text-gray-500">{text}</p>
      </div>
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
};

export default MapLoader;