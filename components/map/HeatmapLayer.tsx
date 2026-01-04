
import React, { useMemo } from 'react';
import { Flame, CloudRain, Wind, Snowflake, CloudLightning, Sun } from 'lucide-react';
import { WeatherLayerType } from '../../app/map/index';

interface HeatmapLayerProps {
  markers: any[];
  visible: boolean;
  mode: 'intensity' | 'sentiment';
  onZoneClick: (zoneData: any) => void;
  zoomLevel?: number;
  weatherLayer?: WeatherLayerType;
}

const HeatmapLayer: React.FC<HeatmapLayerProps> = ({ markers, visible, mode, onZoneClick, zoomLevel = 1, weatherLayer = 'Storm' }) => {
  if (!visible) return null;

  const labelScale = 1 / Math.pow(Math.max(1, zoomLevel), 1.05);

  const clusters = useMemo(() => {
      const zones: any[] = [];
      const threshold = 15;

      markers.forEach(marker => {
          let added = false;
          for (const zone of zones) {
              const dx = Math.abs(zone.x - marker.x);
              const dy = Math.abs(zone.y - marker.y);
              if (dx < threshold && dy < threshold) {
                  zone.markers.push(marker);
                  zone.intensity += marker.impactRadius;
                  zone.x = (zone.x * zone.count + marker.x) / (zone.count + 1);
                  zone.y = (zone.y * zone.count + marker.y) / (zone.count + 1);
                  zone.count += 1;
                  added = true;
                  break;
              }
          }
          if (!added) {
              zones.push({
                  id: `zone-${marker.id}`,
                  x: marker.x,
                  y: marker.y,
                  intensity: marker.impactRadius,
                  count: 1,
                  markers: [marker],
                  mainCategory: marker.category
              });
          }
      });
      return zones;
  }, [markers]);

  // W2 - Visual Logic based on Active Layer
  const getVisuals = (layer: WeatherLayerType) => {
      switch(layer) {
          case 'Rain': return { color: 'from-blue-600/40 via-blue-500/20', icon: <CloudRain size={16} className="text-blue-300" />, label: 'Heavy Rain' };
          case 'Heat': return { color: 'from-orange-600/40 via-red-500/20', icon: <Sun size={16} className="text-orange-300" />, label: 'Heatwave' };
          case 'Snow': return { color: 'from-cyan-500/40 via-blue-300/20', icon: <Snowflake size={16} className="text-cyan-200" />, label: 'Freezing' };
          case 'Wind': return { color: 'from-slate-500/40 via-gray-400/20', icon: <Wind size={16} className="text-gray-300" />, label: 'High Winds' };
          case 'Storm': return { color: 'from-purple-600/40 via-indigo-500/20', icon: <CloudLightning size={16} className="text-purple-300" />, label: 'Severe Storm' };
          default: return { color: 'from-blue-500/40 via-cyan-500/20', icon: <Flame size={16} />, label: 'Activity' };
      }
  };

  const visual = getVisuals(weatherLayer as WeatherLayerType);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden animate-in fade-in duration-1000 pointer-events-none">
      {clusters.map((zone, idx) => {
        return (
            <div
                key={zone.id}
                className="absolute pointer-events-auto"
                style={{
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    transform: 'translate3d(-50%, -50%, 0)', 
                }}
            >
                <div 
                    className={`absolute w-32 h-32 md:w-48 md:h-48 rounded-full bg-radial-gradient ${visual.color} to-transparent blur-[40px] mix-blend-screen opacity-60`}
                    style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                />
                
                {/* W2 - Animated Ripple for Storms */}
                {weatherLayer === 'Storm' && (
                    <div 
                        className={`absolute w-40 h-40 rounded-full border-[10px] border-transparent bg-radial-gradient from-purple-500/30 to-transparent opacity-30 blur-[20px] animate-[ping_3s_infinite]`}
                        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                    />
                )}

                <button
                    onClick={(e) => { e.stopPropagation(); onZoneClick(zone); }}
                    className="absolute top-1/2 left-1/2 z-20 flex flex-col items-center group cursor-pointer"
                    style={{ transform: `translate(-50%, -50%) scale(${labelScale})` }}
                >
                    <div className="bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {visual.icon}
                    </div>
                </button>
            </div>
        );
      })}
    </div>
  );
};

export default HeatmapLayer;
