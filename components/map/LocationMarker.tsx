
import React, { useMemo } from 'react';
import { Zap, TrendingUp, Circle, Check, DollarSign, Users, Landmark, MapPin, ArrowRight } from 'lucide-react';

export type MarkerType = 'breaking' | 'trending' | 'top' | 'general';
export type MapPerspective = 'Standard' | 'Economic' | 'Human' | 'Political';
export type DetailLevel = 'cluster' | 'region' | 'city' | 'street';

interface LocationMarkerProps {
  x: number; 
  y: number; 
  type?: MarkerType;
  title?: string;
  subtitle?: string; 
  source?: string;
  onClick: () => void;
  isActive?: boolean;
  isCompareSelected?: boolean; 
  isCompareMode?: boolean; 
  zoomLevel: number;
  detailLevel?: DetailLevel; 
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
  // --- 1. Efficient Scaling & Declutter Logic ---
  // Memoize calculations to avoid layout trashing during rapid zoom
  const { finalScale, dynamicStyles } = useMemo(() => {
      // Base scales for hierarchy
      const levelBaseScale = {
          cluster: 3.2, 
          region: 2.0,
          city: 1.2,
          street: 0.5
      };

      // Exponent determines visual size behavior vs Zoom:
      // < 1.0: Marker grows visually as you zoom in (emphasize)
      // = 1.0: Marker stays constant screen size
      // > 1.0: Marker shrinks visually as you zoom in (declutter/reveal map)
      const scaleExponent = detailLevel === 'street' || detailLevel === 'city' ? 1.05 : 0.85;
      
      const counterScale = levelBaseScale[detailLevel] / Math.pow(Math.max(1, zoomLevel), scaleExponent);
      
      // Clamp values for safety
      const scale = Math.max(0.05, Math.min(counterScale, 5));

      // Visual Style Guardrails
      const styles = {
          opacity: zoomLevel > 12 ? 'opacity-90' : 'opacity-100', // Fade slightly at max zoom
          fontWeight: zoomLevel > 8 ? 'font-medium' : 'font-black',
          tracking: zoomLevel > 8 ? 'tracking-tight' : 'tracking-widest',
          textShadow: zoomLevel < 5 ? 'drop-shadow-md' : 'drop-shadow-none' // Remove shadow at high zoom for crispness
      };

      return { finalScale: scale, dynamicStyles: styles };
  }, [zoomLevel, detailLevel]);

  // --- Perspective Styling Logic ---
  const currentStyle = useMemo(() => {
      const base = { bg: 'bg-emerald-500', border: 'border-emerald-300', text: 'text-emerald-100', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]', icon: <Circle size={6} className="text-white fill-white" /> };
      
      switch (perspective) {
          case 'Economic':
              return { 
                  bg: 'bg-amber-500', 
                  border: 'border-amber-300', 
                  text: 'text-amber-100',
                  glow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]', 
                  icon: <DollarSign size={10} className="text-white" /> 
              };
          case 'Political':
              return { 
                  bg: 'bg-indigo-600', 
                  border: 'border-indigo-400',
                  text: 'text-indigo-100', 
                  glow: 'shadow-[0_0_15px_rgba(79,70,229,0.5)]', 
                  icon: <Landmark size={10} className="text-white" /> 
              };
          case 'Human':
              return { 
                  bg: 'bg-rose-500', 
                  border: 'border-rose-300', 
                  text: 'text-rose-100',
                  glow: 'shadow-[0_0_15px_rgba(244,63,94,0.5)]', 
                  icon: <Users size={10} className="text-white" /> 
              };
          default:
              if (type === 'breaking') return { bg: 'bg-red-600', border: 'border-red-400', text: 'text-red-100', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.6)]', icon: <Zap size={10} className="text-white fill-white" /> };
              if (type === 'trending') return { bg: 'bg-yellow-500', border: 'border-yellow-300', text: 'text-yellow-100', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.6)]', icon: <TrendingUp size={10} className="text-white" /> };
              return base;
      }
  }, [perspective, type]);

  // GPU Accelerated Transforms
  const transformStyle = useMemo(() => {
      const activeScale = isActive ? finalScale * 1.5 : finalScale;
      const zOffset = isActive && viewMode === '3d' ? 50 : (viewMode === '3d' && detailLevel !== 'street' ? 10 : 0);
      
      return {
          transform: `translate3d(-50%, -50%, ${zOffset}px) scale(${activeScale})`,
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      };
  }, [isActive, viewMode, finalScale, detailLevel]);

  // --- Render Content Based on Hierarchy ---
  const renderContent = () => {
      // 1. Cluster View (Orbit) - Massive Labels
      if (detailLevel === 'cluster') {
          return (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 ${currentStyle.bg} ${currentStyle.border} ${currentStyle.glow} bg-opacity-90 backdrop-blur-md backface-hidden`}>
                  <span className={`text-[8px] text-white uppercase leading-none whitespace-nowrap ${dynamicStyles.fontWeight} ${dynamicStyles.tracking} ${dynamicStyles.textShadow}`}>
                      {title}
                  </span>
                  {isActive && <ArrowRight size={8} className="text-white animate-pulse" />}
              </div>
          );
      }

      // 2. Region View (State) - Bubbles
      if (detailLevel === 'region') {
          return (
              <div className="flex flex-col items-center backface-hidden">
                  <div className={`w-4 h-4 rounded-full border-2 ${currentStyle.bg} ${currentStyle.border} shadow-lg mb-1 flex items-center justify-center`}>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <span className={`text-[6px] text-white bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm whitespace-nowrap border border-white/10 shadow-sm uppercase ${dynamicStyles.fontWeight} ${dynamicStyles.tracking}`}>
                      {title}
                  </span>
              </div>
          );
      }

      // 3. Street View (Tactical) - Minimalist Pins
      if (detailLevel === 'street') {
          return (
              <div className="flex flex-col items-center group backface-hidden">
                  <div className={`relative flex items-center justify-center w-6 h-6 ${dynamicStyles.opacity}`}>
                      <MapPin size={24} className={`${currentStyle.text} drop-shadow-md`} fill="currentColor" />
                  </div>
                  
                  {/* Street Label - Always visible but tiny, expands on hover */}
                  <div className={`mt-0.5 bg-white/90 text-black px-1.5 py-0.5 rounded shadow-sm border border-gray-200 transition-all duration-300 origin-top ${isActive ? 'scale-150 z-50' : 'scale-100'}`}>
                      <p className="text-[3px] font-bold uppercase leading-none whitespace-nowrap">{title}</p>
                  </div>

                  {isActive && subtitle && (
                      <div 
                        className="absolute top-full mt-2 bg-black/90 backdrop-blur-xl rounded-lg p-2 w-32 border border-white/20 text-left pointer-events-none z-50 origin-top animate-in zoom-in-95 duration-200"
                        style={{ transform: 'scale(0.5)' }} // Counter-scale further for readability popup
                      >
                          <p className="text-[4px] text-gray-300 leading-tight line-clamp-3">{subtitle}</p>
                      </div>
                  )}
              </div>
          );
      }

      // 4. City View (Default) - Standard Markers
      return (
          <div className="flex flex-col items-center group backface-hidden">
              {/* Pulse Ring */}
              {(type === 'breaking' || isActive) && (
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-full rounded-full border-2 ${type === 'breaking' ? 'border-red-500' : 'border-white'} opacity-0 animate-[ping_2s_infinite]`} style={{ transform: 'scale(1.8)' }} />
              )}
              
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-xl transition-all duration-300 ${currentStyle.bg} ${currentStyle.border} ${currentStyle.glow} ${isActive ? 'ring-2 ring-white scale-110 bg-opacity-100 border-white' : 'group-hover:scale-105'} ${dynamicStyles.opacity}`}>
                  {isCompareSelected ? <Check size={12} className="text-white" /> : currentStyle.icon}
              </div>

              {/* Label */}
              {(zoomLevel > 3 || isActive) && (
                  <div className={`absolute top-full mt-1.5 transition-all duration-300 ${isActive ? 'scale-110 z-50' : 'scale-100'}`}>
                      <div className="bg-black/70 backdrop-blur-md px-2 py-1 rounded border border-white/10 shadow-lg text-center min-w-[60px]">
                          <p className={`text-[5px] text-white uppercase leading-none whitespace-nowrap ${dynamicStyles.fontWeight} ${dynamicStyles.tracking}`}>{title}</p>
                          {isActive && <p className="text-[4px] text-cyan-400 font-bold mt-0.5 animate-pulse">Live Update</p>}
                      </div>
                  </div>
              )}
          </div>
      );
  };

  return (
    <button 
      className={`absolute cursor-pointer group z-10 ${isActive ? 'z-50' : ''} outline-none`}
      style={{ 
        left: `${x}%`, 
        top: `${y}%`, 
        ...transformStyle,
        transformStyle: 'preserve-3d',
        animation: `fade-in 0.5s ease-out ${delay}ms forwards`,
        opacity: 0, // Handled by animation
        willChange: 'transform' // Performance optimization hint
      }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      aria-label={`View news for ${title}`}
      aria-expanded={isActive}
    >
      {/* Hit Area */}
      <div className="absolute inset-0 -m-4 bg-transparent rounded-full" />

      {/* 3D Stem/Line for Floating Effect */}
      {viewMode === '3d' && detailLevel !== 'street' && (
          <div 
            className={`absolute top-1/2 left-1/2 w-[0.5px] -translate-x-1/2 bg-gradient-to-b ${isActive ? 'from-cyan-400 h-[60px]' : 'from-white/30 h-[20px]'} to-transparent origin-top`} 
            style={{ transform: 'rotateX(90deg) translateY(50%)' }}
          ></div>
      )}

      {renderContent()}
    </button>
  );
};

export default LocationMarker;
