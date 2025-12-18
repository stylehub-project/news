import React from 'react';
import { Zap, TrendingUp, Star, Circle, Radio, Check } from 'lucide-react';

export type MarkerType = 'breaking' | 'trending' | 'top' | 'general';

interface LocationMarkerProps {
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  type?: MarkerType;
  title?: string;
  source?: string;
  onClick: () => void;
  isActive?: boolean;
  isCompareSelected?: boolean; // New: For comparison mode
  isCompareMode?: boolean; // New: If comparison mode is active generally
  zoomLevel: number;
  impactRadius?: number; // 0-100 scale of impact
  delay?: number; // Animation delay in ms
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
  impactRadius = 0,
  delay = 0
}) => {
  // Logic for detail visibility based on zoom
  const showLabel = zoomLevel > 1.8 || isActive;
  
  const styles = {
    breaking: { 
      bg: 'bg-red-600', 
      border: 'border-red-100',
      shadow: 'shadow-red-500/50', 
      icon: <Zap size={12} className="text-white fill-white" /> 
    },
    trending: { 
      bg: 'bg-yellow-500', 
      border: 'border-yellow-100',
      shadow: 'shadow-yellow-500/50', 
      icon: <TrendingUp size={12} className="text-white" /> 
    },
    top: { 
      bg: 'bg-blue-600', 
      border: 'border-blue-100',
      shadow: 'shadow-blue-500/50', 
      icon: <Star size={12} className="text-white fill-white" /> 
    },
    general: { 
      bg: 'bg-emerald-500', 
      border: 'border-emerald-100',
      shadow: 'shadow-emerald-500/50', 
      icon: <Circle size={8} className="text-white fill-white" /> 
    },
  };

  const currentStyle = styles[type] || styles.general;

  // 8.13.7 Shockwave Animation for Breaking News
  const Shockwave = () => (
      <>
        <div className="absolute inset-0 rounded-full border-2 border-red-500 opacity-0 animate-[shockwave_2s_infinite]" />
        <div className="absolute inset-0 rounded-full border-2 border-red-500 opacity-0 animate-[shockwave_2s_infinite_0.5s]" />
      </>
  );

  return (
    <div 
      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10 ${isActive || isCompareSelected ? 'z-50' : ''} animate-in zoom-in-50 fade-in fill-mode-backwards focus:outline-none`}
      style={{ 
        left: `${x}%`, 
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${1 / Math.sqrt(zoomLevel)})`,
        animationDelay: `${delay}ms`,
        animationDuration: '500ms'
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      role="button"
      tabIndex={0}
    >
      <div className="relative flex flex-col items-center">
        
        {/* 8.13.7 Shockwave for Breaking News */}
        {type === 'breaking' && !isCompareMode && <Shockwave />}

        {/* Compare Mode Selection Ring */}
        {isCompareMode && isCompareSelected && (
            <div className="absolute inset-0 -m-3 border-4 border-indigo-500 rounded-full animate-in zoom-in duration-200 bg-white/50" />
        )}

        {/* Marker Pin */}
        <div 
          className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-lg transition-all duration-300 ${currentStyle.bg} ${currentStyle.border} ${currentStyle.shadow} ${isActive ? 'scale-125 ring-4 ring-white/50' : 'group-hover:scale-110'}`}
        >
          {isCompareSelected ? <Check size={14} className="text-white font-bold" /> : currentStyle.icon}
        </div>

        {/* Label */}
        {(showLabel) && title && !isCompareMode && (
          <div className={`absolute top-full mt-2 bg-white/90 backdrop-blur-md rounded-lg shadow-xl border border-white/50 px-3 py-2 w-32 md:w-40 text-center pointer-events-none transition-all duration-300 origin-top ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'}`}>
             {source && <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">{source}</span>}
             <p className="text-[10px] md:text-xs font-bold text-gray-900 leading-tight line-clamp-2">{title}</p>
             
             {isActive && (
                 <div className="mt-1 flex items-center justify-center gap-1 text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                     <Radio size={8} className="animate-pulse" /> AI Intel Ready
                 </div>
             )}
             
             <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-white/90"></div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shockwave {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(3); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LocationMarker;