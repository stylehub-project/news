import React from 'react';
import { Zap, TrendingUp, Star, Circle, Check } from 'lucide-react';

export type MarkerType = 'breaking' | 'trending' | 'top' | 'general';

interface LocationMarkerProps {
  x: number; 
  y: number; 
  type?: MarkerType;
  title?: string;
  source?: string;
  onClick: () => void;
  isActive?: boolean;
  isCompareSelected?: boolean; 
  isCompareMode?: boolean; 
  zoomLevel: number;
  delay?: number;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({
  x,
  y,
  type = 'general',
  title,
  source,
  onClick,
  isActive,
  isCompareSelected,
  isCompareMode,
  zoomLevel,
  delay = 0
}) => {
  const showLabel = zoomLevel > 2.5 || isActive;
  
  // As per request: Reduce size of news content (markers) when zooming in
  // We use 0.9 / Math.sqrt(zoomLevel) to make them physically smaller as zoom increases
  // Adjusted constant to prevent them disappearing
  const dynamicScale = Math.max(0.4, 1.2 / Math.sqrt(zoomLevel));

  const styles = {
    breaking: { bg: 'bg-red-600', border: 'border-red-100', icon: <Zap size={12} className="text-white fill-white" /> },
    trending: { bg: 'bg-yellow-500', border: 'border-yellow-100', icon: <TrendingUp size={12} className="text-white" /> },
    top: { bg: 'bg-blue-600', border: 'border-blue-100', icon: <Star size={12} className="text-white fill-white" /> },
    general: { bg: 'bg-emerald-500', border: 'border-emerald-100', icon: <Circle size={8} className="text-white fill-white" /> },
  };

  const currentStyle = styles[type] || styles.general;

  return (
    <div 
      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10 ${isActive ? 'z-50' : ''} animate-in zoom-in-50 fade-in`}
      style={{ 
        left: `${x}%`, 
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${dynamicScale})`,
        animationDelay: `${delay}ms`
      }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      <div className="relative flex flex-col items-center">
        {type === 'breaking' && !isCompareMode && (
             <div className="absolute inset-0 rounded-full border-2 border-red-500 opacity-0 animate-[ping_2s_infinite]" />
        )}

        <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-lg transition-transform ${currentStyle.bg} ${currentStyle.border} ${isActive ? 'ring-4 ring-white/50 scale-110' : ''}`}>
          {isCompareSelected ? <Check size={14} className="text-white" /> : currentStyle.icon}
        </div>

        {showLabel && title && !isCompareMode && (
          <div className="absolute top-full mt-2 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-white/50 px-3 py-2 w-36 text-center pointer-events-none animate-in fade-in zoom-in-95 duration-200 origin-top">
             <span className="text-[8px] font-black text-gray-500 uppercase block mb-0.5">{source}</span>
             <p className="text-[10px] font-bold text-gray-900 leading-tight line-clamp-2">{title}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationMarker;