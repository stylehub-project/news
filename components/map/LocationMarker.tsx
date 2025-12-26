
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
  viewMode?: '2d' | '3d';
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
  delay = 0,
  viewMode = '3d'
}) => {
  const showLabel = zoomLevel > 4.5 || isActive;
  const showIcon = zoomLevel > 2;
  
  // Dynamic scale - shrinks as you zoom in to reveal precision
  const dynamicScale = Math.max(0.3, 0.8 / Math.sqrt(zoomLevel));

  const styles = {
    breaking: { bg: 'bg-red-600', border: 'border-red-400', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.8)]', icon: <Zap size={10} className="text-white fill-white" /> },
    trending: { bg: 'bg-yellow-500', border: 'border-yellow-300', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.8)]', icon: <TrendingUp size={10} className="text-white" /> },
    top: { bg: 'bg-blue-600', border: 'border-blue-400', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.8)]', icon: <Star size={10} className="text-white fill-white" /> },
    general: { bg: 'bg-emerald-500', border: 'border-emerald-300', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.8)]', icon: <Circle size={6} className="text-white fill-white" /> },
  };

  const currentStyle = styles[type] || styles.general;

  // 3D Billboard Transform logic with expansion on active
  // Active state lifts higher and scales up
  const activeTransform = isActive ? `translate(-50%, -50%) scale(${dynamicScale * 1.5}) translateZ(50px) rotateX(-30deg)` : '';
  const inactiveTransform = viewMode === '3d' 
    ? `translate(-50%, -50%) scale(${dynamicScale}) translateZ(20px) rotateX(-30deg)` 
    : `translate(-50%, -50%) scale(${dynamicScale}) translateZ(10px)`;

  const transformStyle = isActive && viewMode === '3d' ? activeTransform : inactiveTransform;

  return (
    <div 
      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10 ${isActive ? 'z-50' : ''} animate-in zoom-in-50 fade-in`}
      style={{ 
        left: `${x}%`, 
        top: `${y}%`,
        transform: transformStyle,
        transformStyle: 'preserve-3d',
        animationDelay: `${delay}ms`,
        transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' // Bouncy transition
      }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      <div className="relative flex flex-col items-center">
        
        {/* Pulse Ring for active/breaking */}
        {(type === 'breaking' || isActive) && !isCompareMode && (
             <div className={`absolute inset-0 rounded-full border-4 ${type === 'breaking' ? 'border-red-500' : 'border-white'} opacity-0 animate-[ping_2s_infinite]`} style={{ transform: 'scale(1.5)' }} />
        )}

        {/* 3D Connector (Stem) - Hidden when active (lift off) */}
        {viewMode === '3d' && !isActive && (
            <div className={`absolute top-full left-1/2 w-[2px] h-[30px] -translate-x-1/2 bg-gradient-to-b from-white/80 to-transparent origin-top`} style={{ transform: 'rotateX(30deg)' }}></div>
        )}
        {viewMode === '3d' && isActive && (
            <div className={`absolute top-full left-1/2 w-[1px] h-[60px] -translate-x-1/2 bg-gradient-to-b from-cyan-400 to-transparent origin-top`} style={{ transform: 'rotateX(30deg)' }}></div>
        )}

        {/* Main Marker Orb */}
        <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-2xl transition-all duration-300 ${currentStyle.bg} ${currentStyle.border} ${currentStyle.glow} ${isActive ? 'ring-4 ring-white scale-125 bg-opacity-100 border-white' : 'hover:scale-110'}`}>
          {isCompareSelected ? <Check size={12} className="text-white" /> : (showIcon ? currentStyle.icon : null)}
        </div>

        {/* Labels with Zoom-Based Visibility */}
        {(showLabel || isActive) && title && !isCompareMode && (
          <div 
            className={`absolute top-full mt-3 bg-black/80 backdrop-blur-md rounded-lg shadow-2xl border border-white/20 px-3 py-2 w-32 text-center pointer-events-none origin-top transition-all duration-300 ${isActive ? 'scale-110 bg-black/90 border-cyan-500/50' : 'scale-100'}`}
            style={{ transform: 'translateZ(30px)' }}
          >
             <div className="flex flex-col gap-1">
                 {/* Source Badge */}
                 {source && zoomLevel > 6 && (
                     <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">{source}</span>
                 )}
                 <p className="text-[9px] font-bold text-white leading-tight line-clamp-2 uppercase tracking-wide drop-shadow-md">{title}</p>
                 {isActive && <p className="text-[8px] text-cyan-400 font-bold uppercase mt-1 animate-pulse">Tap for Intel</p>}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationMarker;
