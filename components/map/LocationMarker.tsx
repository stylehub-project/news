
import React from 'react';
import { Zap, TrendingUp, Star, Circle, Check, DollarSign, Users, Landmark, MapPin, ArrowRight } from 'lucide-react';

export type MarkerType = 'breaking' | 'trending' | 'top' | 'general';
export type MapPerspective = 'Standard' | 'Economic' | 'Human' | 'Political';
export type DetailLevel = 'cluster' | 'region' | 'city' | 'street';

interface LocationMarkerProps {
  x: number; 
  y: number; 
  type?: MarkerType;
  title?: string;
  subtitle?: string; // Summary or extra info
  source?: string;
  onClick: () => void;
  isActive?: boolean;
  isCompareSelected?: boolean; 
  isCompareMode?: boolean; 
  zoomLevel: number;
  detailLevel?: DetailLevel; // New prop for hierarchical rendering
  delay?: number;
  viewMode?: '2d' | '3d';
  perspective?: MapPerspective;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({
  x,
  y,
  type = 'general',
  title,
  subtitle,
  source,
  onClick,
  isActive,
  isCompareSelected,
  isCompareMode,
  zoomLevel,
  detailLevel = 'city',
  delay = 0,
  viewMode = '3d',
  perspective = 'Standard'
}) => {
  const showLabel = isActive || detailLevel !== 'cluster';
  
  // Dynamic scale calculation
  const baseScale = detailLevel === 'cluster' ? 1.2 : detailLevel === 'street' ? 0.8 : 1;
  const dynamicScale = Math.max(0.3, (baseScale * 0.8) / Math.sqrt(Math.max(1, zoomLevel * 0.1)));

  // --- Perspective Styling Logic ---
  const getPerspectiveStyles = () => {
      const base = { bg: 'bg-emerald-500', border: 'border-emerald-300', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.8)]', icon: <Circle size={6} className="text-white fill-white" /> };
      
      switch (perspective) {
          case 'Economic':
              return { 
                  bg: 'bg-amber-500', 
                  border: 'border-amber-300', 
                  glow: 'shadow-[0_0_15px_rgba(245,158,11,0.8)]', 
                  icon: <DollarSign size={10} className="text-white" /> 
              };
          case 'Political':
              return { 
                  bg: 'bg-indigo-600', 
                  border: 'border-indigo-400', 
                  glow: 'shadow-[0_0_15px_rgba(79,70,229,0.8)]', 
                  icon: <Landmark size={10} className="text-white" /> 
              };
          case 'Human':
              return { 
                  bg: 'bg-rose-500', 
                  border: 'border-rose-300', 
                  glow: 'shadow-[0_0_15px_rgba(244,63,94,0.8)]', 
                  icon: <Users size={10} className="text-white" /> 
              };
          default:
              // Standard Logic
              if (type === 'breaking') return { bg: 'bg-red-600', border: 'border-red-400', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.8)]', icon: <Zap size={10} className="text-white fill-white" /> };
              if (type === 'trending') return { bg: 'bg-yellow-500', border: 'border-yellow-300', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.8)]', icon: <TrendingUp size={10} className="text-white" /> };
              if (type === 'top') return { bg: 'bg-blue-600', border: 'border-blue-400', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.8)]', icon: <Star size={10} className="text-white fill-white" /> };
              return base;
      }
  };

  const currentStyle = getPerspectiveStyles();

  // 3D Billboard Transform logic
  const activeTransform = isActive 
    ? `translate(-50%, -50%) scale(${dynamicScale * 1.5}) translateZ(100px) rotateX(-20deg)` 
    : '';
    
  const inactiveTransform = viewMode === '3d' 
    ? `translate(-50%, -50%) scale(${dynamicScale}) translateZ(${detailLevel === 'street' ? 5 : 20}px) rotateX(-30deg)` 
    : `translate(-50%, -50%) scale(${dynamicScale}) translateZ(10px)`;

  const transformStyle = isActive && viewMode === '3d' ? activeTransform : inactiveTransform;

  // Determine Content Layout based on Detail Level
  const renderContent = () => {
      // 1. Cluster View (Global)
      if (detailLevel === 'cluster') {
          return (
              <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-4 shadow-2xl ${currentStyle.bg} ${currentStyle.border} ${currentStyle.glow}`}>
                  <span className="text-[10px] font-black text-white">{title?.split(':')[0] || 'Region'}</span>
              </div>
          );
      }

      // 2. Region View (State)
      if (detailLevel === 'region') {
          return (
              <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full border-2 ${currentStyle.bg} ${currentStyle.border} shadow-lg mb-1`} />
                  <span className="text-[8px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm whitespace-nowrap border border-white/10">
                      {title}
                  </span>
              </div>
          );
      }

      // 3. City/Street View (Detailed)
      return (
          <div className="flex flex-col items-center group">
              {/* Pulse Ring */}
              {(type === 'breaking' || isActive) && (
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-full rounded-full border-4 ${type === 'breaking' ? 'border-red-500' : 'border-white'} opacity-0 animate-[ping_2s_infinite]`} style={{ transform: 'scale(1.5)' }} />
              )}
              
              {/* Marker Orb */}
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-2xl transition-all duration-300 ${currentStyle.bg} ${currentStyle.border} ${currentStyle.glow} ${isActive ? 'ring-4 ring-white scale-125 bg-opacity-100 border-white' : 'group-hover:scale-110'}`}>
                  {isCompareSelected ? <Check size={12} className="text-white" /> : currentStyle.icon}
              </div>

              {/* Label Card */}
              {(isActive || detailLevel === 'street') && (
                  <div 
                    className={`absolute top-full mt-2 bg-black/80 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-3 w-48 text-left pointer-events-none origin-top transition-all duration-300 ${isActive ? 'scale-100 opacity-100 z-50' : 'scale-95 opacity-90'}`}
                    style={{ transform: 'translateZ(30px)' }}
                  >
                     {source && <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">{source}</span>}
                     <p className="text-[10px] font-bold text-white leading-tight uppercase tracking-wide mb-1">{title}</p>
                     
                     {/* Expanded Summary for Street Level */}
                     {detailLevel === 'street' && subtitle && (
                         <p className="text-[9px] text-gray-300 leading-snug font-medium border-t border-white/10 pt-1 mt-1 line-clamp-3">
                             {subtitle}
                         </p>
                     )}
                     
                     {isActive && (
                         <div className="flex items-center gap-1 mt-2 text-[8px] text-cyan-400 font-bold uppercase animate-pulse">
                             <span>Analyzing Sector</span> <ArrowRight size={8} />
                         </div>
                     )}
                  </div>
              )}
          </div>
      );
  };

  return (
    <button 
      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10 ${isActive ? 'z-50' : ''} animate-in zoom-in-50 fade-in outline-none focus:scale-125 transition-transform`}
      style={{ 
        left: `${x}%`, 
        top: `${y}%`, 
        transform: transformStyle,
        transformStyle: 'preserve-3d',
        animationDelay: `${delay}ms`,
        transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      aria-label={`View news for ${title}`}
      aria-expanded={isActive}
    >
      {/* Accessibility hit area */}
      <div className="absolute inset-0 -m-6 bg-transparent rounded-full" />

      {/* 3D Stem */}
      {viewMode === '3d' && (
          <div 
            className={`absolute top-1/2 left-1/2 w-[1px] -translate-x-1/2 bg-gradient-to-b ${isActive ? 'from-cyan-400 h-[100px]' : 'from-white/50 h-[30px]'} to-transparent origin-top`} 
            style={{ transform: 'rotateX(90deg) translateY(50%)' }}
          ></div>
      )}

      {renderContent()}
    </button>
  );
};

export default LocationMarker;
