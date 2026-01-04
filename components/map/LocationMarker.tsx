
import React, { useMemo } from 'react';
import { CloudLightning, Sun, Snowflake, Wind, CloudRain, Cloud, Thermometer, AlertTriangle } from 'lucide-react';
import { WeatherLayerType } from '../../app/map/index';

export type MarkerType = 'severe' | 'warning' | 'forecast' | 'general';
export type DetailLevel = 'cluster' | 'region' | 'city' | 'street';

interface LocationMarkerProps {
  x: number; 
  y: number; 
  type?: MarkerType;
  title?: string;
  category?: string;
  temp?: string;
  isActive?: boolean;
  zoomLevel: number;
  onClick: () => void;
  delay?: number;
  viewMode?: '2d' | '3d';
  activeLayer?: WeatherLayerType;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({
  x,
  y,
  type = 'general',
  title,
  category,
  temp,
  isActive,
  zoomLevel,
  onClick,
  delay = 0,
  viewMode = '3d',
  activeLayer
}) => {
  // W3 - Severity Color Coding
  const styleConfig = useMemo(() => {
      let bg = 'bg-blue-500';
      let border = 'border-white';
      let shadow = 'shadow-blue-500/50';
      let Icon = Cloud;

      if (category === 'Heat' || category === 'Sun') {
          bg = 'bg-orange-500';
          shadow = 'shadow-orange-500/50';
          Icon = Sun;
      } else if (category === 'Storm' || type === 'severe') {
          bg = 'bg-red-600';
          shadow = 'shadow-red-600/50';
          Icon = CloudLightning;
      } else if (category === 'Rain' || category === 'Flood') {
          bg = 'bg-blue-600';
          shadow = 'shadow-blue-600/50';
          Icon = CloudRain;
      } else if (category === 'Snow' || category === 'Cold') {
          bg = 'bg-cyan-500';
          shadow = 'shadow-cyan-500/50';
          Icon = Snowflake;
      } else if (category === 'Wind') {
          bg = 'bg-gray-500';
          shadow = 'shadow-gray-500/50';
          Icon = Wind;
      }

      return { bg, border, shadow, Icon };
  }, [category, type]);

  // Optimization: Hide if zoomed out too far unless severe
  if (zoomLevel < 2 && type !== 'severe') return null;

  return (
    <button 
      className={`absolute cursor-pointer group z-10 ${isActive ? 'z-50' : ''} outline-none transition-transform duration-300`}
      style={{ 
        left: `${x}%`, 
        top: `${y}%`, 
        transform: `translate(-50%, -50%) scale(${isActive ? 1.5 : 1})`,
        animation: `fade-in 0.5s ease-out ${delay}ms forwards`,
        opacity: 0
      }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {/* W3 - Pulsing Effect for Severe Weather */}
      {(type === 'severe' || isActive) && (
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full ${styleConfig.bg} opacity-30 animate-ping`} style={{ transform: 'scale(1.8)' }} />
      )}

      <div className={`relative flex flex-col items-center`}>
          {/* Icon Circle */}
          <div className={`w-8 h-8 rounded-full border-2 ${styleConfig.border} ${styleConfig.bg} flex items-center justify-center shadow-lg ${styleConfig.shadow} text-white`}>
              <styleConfig.Icon size={14} />
          </div>

          {/* Label Tag */}
          <div className={`mt-1 flex flex-col items-center transition-opacity duration-200 ${zoomLevel < 3 && !isActive ? 'opacity-0' : 'opacity-100'}`}>
              <span className="bg-black/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-t border-t border-x border-white/20 whitespace-nowrap">
                  {title}
              </span>
              {temp && (
                  <span className="bg-white/90 text-black text-[9px] font-black px-2 py-0.5 rounded-b shadow-sm w-full text-center">
                      {temp}
                  </span>
              )}
          </div>
      </div>
    </button>
  );
};

export default LocationMarker;
