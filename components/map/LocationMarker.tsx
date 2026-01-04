
import React, { useMemo } from 'react';
import { CloudLightning, Sun, Snowflake, Wind, Droplets, ThermometerSun, AlertTriangle, Circle, Check, Zap, Eye, CloudRain, Cloud } from 'lucide-react';

export type MarkerType = 'severe' | 'warning' | 'forecast' | 'general';
export type MapPerspective = 'Overview' | 'Temperature' | 'Precipitation' | 'Wind';
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
  category?: string;
  mapLayer?: 'satellite' | 'schematic';
  temp?: string;
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
  perspective = 'Overview',
  category,
  mapLayer = 'satellite',
  temp
}) => {
  // --- 1. Efficient Scaling & Declutter Logic ---
  const { finalScale, dynamicStyles } = useMemo(() => {
      const levelBaseScale = {
          cluster: 3.2, 
          region: 2.0,
          city: 1.2,
          street: 0.5
      };

      const scaleExponent = detailLevel === 'street' || detailLevel === 'city' ? 1.05 : 0.85;
      const counterScale = levelBaseScale[detailLevel] / Math.pow(Math.max(1, zoomLevel), scaleExponent);
      
      const scale = Math.max(0.05, Math.min(counterScale, 5));

      const styles = {
          opacity: zoomLevel > 12 ? 'opacity-90' : 'opacity-100',
          fontWeight: zoomLevel > 8 ? 'font-medium' : 'font-black',
          tracking: zoomLevel > 8 ? 'tracking-tight' : 'tracking-widest',
          textShadow: zoomLevel < 5 ? 'drop-shadow-md' : 'drop-shadow-none'
      };

      return { finalScale: scale, dynamicStyles: styles };
  }, [zoomLevel, detailLevel]);

  // --- Weather Style Logic ---
  const currentStyle = useMemo(() => {
      const isSchematic = mapLayer === 'schematic';

      // Base Configuration
      const base = { 
          bg: isSchematic ? 'bg-blue-600' : 'bg-blue-500/80', 
          border: 'border-blue-300', 
          text: 'text-blue-100', 
          glow: isSchematic ? 'shadow-[0_0_25px_rgba(37,99,235,0.8)]' : 'shadow-[0_0_15px_rgba(59,130,246,0.5)]', 
          icon: <Circle size={6} className="text-white fill-white" /> 
      };
      
      // Category based overrides (Primary visual driver)
      if (category === 'Storm' || type === 'severe') {
          return { 
              bg: isSchematic ? 'bg-purple-600' : 'bg-purple-600/80', 
              border: isSchematic ? 'border-purple-200' : 'border-purple-400', 
              text: 'text-purple-100', 
              glow: isSchematic ? 'shadow-[0_0_30px_rgba(147,51,234,0.9)]' : 'shadow-[0_0_20px_rgba(147,51,234,0.6)]', 
              icon: <CloudLightning size={12} className="text-white" /> 
          };
      }
      if (category === 'Heat' || category === 'Drought') {
          return { 
              bg: isSchematic ? 'bg-orange-600' : 'bg-orange-500/80', 
              border: 'border-orange-300', 
              text: 'text-orange-100', 
              glow: isSchematic ? 'shadow-[0_0_30px_rgba(249,115,22,0.9)]' : 'shadow-[0_0_20px_rgba(249,115,22,0.6)]', 
              icon: <Sun size={12} className="text-white" /> 
          };
      }
      if (category === 'Cold' || category === 'Snow') {
          return { 
              bg: isSchematic ? 'bg-cyan-600' : 'bg-cyan-500/80', 
              border: 'border-cyan-300', 
              text: 'text-cyan-100', 
              glow: isSchematic ? 'shadow-[0_0_30px_rgba(6,182,212,0.9)]' : 'shadow-[0_0_20px_rgba(6,182,212,0.6)]', 
              icon: <Snowflake size={12} className="text-white" /> 
          };
      }
      if (category === 'Rain' || category === 'Flood') {
          return { 
              bg: isSchematic ? 'bg-blue-700' : 'bg-blue-600/80', 
              border: 'border-blue-400', 
              text: 'text-blue-100', 
              glow: isSchematic ? 'shadow-[0_0_30px_rgba(29,78,216,0.9)]' : 'shadow-[0_0_20px_rgba(37,99,235,0.6)]', 
              icon: <CloudRain size={12} className="text-white" /> 
          };
      }
      if (category === 'Wind') {
          return { 
              bg: isSchematic ? 'bg-slate-600' : 'bg-slate-500/80', 
              border: 'border-slate-300', 
              text: 'text-slate-100', 
              glow: isSchematic ? 'shadow-[0_0_25px_rgba(148,163,184,0.8)]' : 'shadow-[0_0_15px_rgba(100,116,139,0.5)]', 
              icon: <Wind size={12} className="text-white" /> 
          };
      }
      if (category === 'Cloud') {
          return { 
              bg: isSchematic ? 'bg-gray-500' : 'bg-gray-500/80', 
              border: 'border-gray-300', 
              text: 'text-gray-100', 
              glow: isSchematic ? 'shadow-[0_0_25px_rgba(107,114,128,0.8)]' : 'shadow-[0_0_15px_rgba(107,114,128,0.5)]', 
              icon: <Cloud size={12} className="text-white" /> 
          };
      }

      return base;
  }, [perspective, category, type, mapLayer]);

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
      // 1. Cluster View (Orbit)
      if (detailLevel === 'cluster') {
          return (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 ${currentStyle.bg} ${currentStyle.border} ${currentStyle.glow} bg-opacity-90 backdrop-blur-md backface-hidden`}>
                  <span className={`text-[8px] text-white uppercase leading-none whitespace-nowrap ${dynamicStyles.fontWeight} ${dynamicStyles.tracking} ${dynamicStyles.textShadow}`}>
                      {title}
                  </span>
                  {isActive && <Eye size={8} className="text-white animate-pulse" />}
              </div>
          );
      }

      // 2. Region View (State) - Explicitly visible tags for countries/states
      if (detailLevel === 'region') {
          return (
              <div className="flex flex-col items-center backface-hidden group">
                  {/* Icon Circle */}
                  <div className={`w-8 h-8 rounded-full border-2 ${currentStyle.bg} ${currentStyle.border} ${currentStyle.glow} mb-1 flex items-center justify-center shadow-lg`}>
                      {currentStyle.icon}
                  </div>
                  
                  {/* Tag */}
                  <div className="flex flex-col items-center min-w-[60px] pointer-events-none">
                      <span className={`text-[8px] font-black text-white bg-black/70 px-2 py-1 rounded-t-md backdrop-blur-md whitespace-nowrap border-x border-t border-white/20 uppercase tracking-wider w-full text-center shadow-sm`}>
                          {title}
                      </span>
                      {temp && (
                          <span className={`text-[9px] font-bold text-black bg-white/90 px-2 py-0.5 rounded-b-md border-x border-b border-white/20 shadow-sm w-full text-center`}>
                              {temp}
                          </span>
                      )}
                  </div>
              </div>
          );
      }

      // 3. Street/City View - High Detail
      return (
          <div className="flex flex-col items-center group backface-hidden">
              {/* Pulse Ring for Severe Weather */}
              {(type === 'severe' || isActive) && (
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-full rounded-full border-2 ${type === 'severe' ? 'border-red-500' : 'border-white'} opacity-0 animate-[ping_2s_infinite]`} style={{ transform: 'scale(1.8)' }} />
              )}
              
              <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-2xl transition-all duration-300 ${currentStyle.bg} ${currentStyle.border} ${currentStyle.glow} ${isActive ? 'ring-2 ring-white scale-110 bg-opacity-100 border-white' : 'group-hover:scale-105'} ${dynamicStyles.opacity}`}>
                  {isCompareSelected ? <Check size={14} className="text-white" /> : currentStyle.icon}
              </div>

              {/* Tag - Always show if relevant zoom or active */}
              {(zoomLevel > 3 || isActive) && (
                  <div className={`absolute top-full mt-2 transition-all duration-300 ${isActive ? 'scale-110 z-50' : 'scale-100 z-10'} flex flex-col items-center min-w-[70px]`}>
                      <div className="bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-t-lg border-t border-x border-white/20 text-center w-full">
                          <p className={`text-[7px] text-white uppercase leading-none whitespace-nowrap ${dynamicStyles.fontWeight} ${dynamicStyles.tracking}`}>{title}</p>
                      </div>
                      <div className="bg-white px-3 py-0.5 rounded-b-lg border-b border-x border-white/20 text-center w-full shadow-lg">
                          <p className="text-[8px] font-black text-black leading-tight">{temp || category}</p>
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
        opacity: 0,
        willChange: 'transform'
      }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      aria-label={`View weather for ${title}`}
    >
      <div className="absolute inset-0 -m-4 bg-transparent rounded-full" />
      {viewMode === '3d' && detailLevel !== 'street' && (
          <div 
            className={`absolute top-1/2 left-1/2 w-[0.5px] -translate-x-1/2 bg-gradient-to-b ${isActive ? 'from-white h-[60px]' : 'from-white/30 h-[20px]'} to-transparent origin-top`} 
            style={{ transform: 'rotateX(90deg) translateY(50%)' }}
          ></div>
      )}
      {renderContent()}
    </button>
  );
};

export default LocationMarker;
