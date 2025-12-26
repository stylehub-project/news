
import React, { useMemo } from 'react';
import { Flame, ArrowUp, Smile, Frown, Meh } from 'lucide-react';

interface HeatmapLayerProps {
  markers: any[];
  visible: boolean;
  mode: 'intensity' | 'sentiment';
  onZoneClick: (zoneData: any) => void;
}

const HeatmapLayer: React.FC<HeatmapLayerProps> = ({ markers, visible, mode, onZoneClick }) => {
  if (!visible) return null;

  // Advanced Clustering with Sentiment Calculation
  const clusters = useMemo(() => {
      const zones: any[] = [];
      const threshold = 15; // Distance threshold %

      markers.forEach(marker => {
          let added = false;
          
          // Convert text sentiment to numerical score for averaging
          let sentimentScore = 0;
          if (marker.sentiment === 'Positive') sentimentScore = 1;
          else if (marker.sentiment === 'Tense' || marker.sentiment === 'Negative') sentimentScore = -1;

          for (const zone of zones) {
              const dx = Math.abs(zone.x - marker.x);
              const dy = Math.abs(zone.y - marker.y);
              
              if (dx < threshold && dy < threshold) {
                  zone.markers.push(marker);
                  zone.intensity += marker.impactRadius;
                  zone.totalSentiment += sentimentScore;
                  
                  // Weighted re-centering of zone
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
                  totalSentiment: sentimentScore,
                  count: 1,
                  markers: [marker],
                  mainCategory: marker.category
              });
          }
      });
      return zones;
  }, [markers]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden animate-in fade-in duration-1000 pointer-events-none">
      {clusters.map((zone, idx) => {
        const isHot = zone.intensity > 10;
        const avgSentiment = zone.totalSentiment / zone.count;
        
        let colorClass = 'from-orange-500/40 via-red-500/20 to-transparent';
        let sentimentIcon = null;
        let labelText = '';

        if (mode === 'sentiment') {
            if (avgSentiment > 0.3) {
                colorClass = 'from-green-500/40 via-emerald-500/20 to-transparent';
                sentimentIcon = <Smile size={16} className="text-green-200" />;
                labelText = 'Positive Outlook';
            } else if (avgSentiment < -0.3) {
                colorClass = 'from-red-600/50 via-orange-600/30 to-transparent';
                sentimentIcon = <Frown size={16} className="text-red-200" />;
                labelText = 'High Tension';
            } else {
                colorClass = 'from-yellow-400/40 via-amber-500/20 to-transparent';
                sentimentIcon = <Meh size={16} className="text-yellow-200" />;
                labelText = 'Neutral';
            }
        } else {
            // Intensity Mode
            colorClass = isHot ? 'from-red-500/50 via-orange-500/30 to-transparent' : 'from-blue-500/40 via-cyan-500/20 to-transparent';
            sentimentIcon = <Flame size={16} className="fill-red-400 text-red-400" />;
            labelText = 'High Activity';
        }

        return (
            <div
                key={zone.id}
                className="absolute pointer-events-auto"
                style={{
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    transform: 'translate(-50%, -50%)',
                }}
            >
                {/* 1. Core Cloud (Static Blur) */}
                <div 
                    className={`absolute w-32 h-32 md:w-48 md:h-48 rounded-full bg-radial-gradient ${colorClass} blur-[40px] mix-blend-screen opacity-60`}
                    style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                />

                {/* 2. Pulsing Flow Ring (Animated) */}
                <div 
                    className={`absolute w-40 h-40 md:w-64 md:h-64 rounded-full border-[20px] border-transparent bg-radial-gradient ${colorClass} opacity-30 blur-[30px] animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]`}
                    style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', animationDelay: `${idx * 0.5}s` }}
                />

                {/* 3. Interactive Center (Only if significant) */}
                {(isHot || Math.abs(avgSentiment) > 0.3) && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onZoneClick(zone);
                        }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer"
                    >
                        <div className="bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-300">
                            {sentimentIcon}
                        </div>
                        
                        {/* Hover Label */}
                        <div className="absolute top-full mt-2 bg-black/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-1 rounded-lg border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-5px] group-hover:translate-y-0 whitespace-nowrap">
                            {labelText}
                        </div>
                    </button>
                )}
            </div>
        );
      })}
    </div>
  );
};

export default HeatmapLayer;
