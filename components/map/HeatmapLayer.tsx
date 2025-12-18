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

  const getSentimentColor = (totalScore: number, count: number) => {
      const avg = totalScore / count;
      if (avg > 0.3) return 'bg-green-500'; // Positive
      if (avg < -0.3) return 'bg-red-600'; // Negative/Tense
      return 'bg-yellow-400'; // Neutral
  };

  return (
    <div className="absolute inset-0 z-0 overflow-hidden animate-in fade-in duration-1000 pointer-events-none">
      {clusters.map((zone) => {
        const isHot = zone.intensity > 10;
        const avgSentiment = zone.totalSentiment / zone.count;
        
        let sizeClass = isHot ? 'w-48 h-48' : 'w-32 h-32';
        let colorClass = 'bg-orange-400';
        let opacityClass = isHot ? 'opacity-30' : 'opacity-20';

        // 8.13.6 Sentiment Map Logic
        if (mode === 'sentiment') {
            colorClass = getSentimentColor(zone.totalSentiment, zone.count);
            opacityClass = 'opacity-40'; // Slightly more opaque for color visibility
        } else {
            // Intensity Mode
            colorClass = isHot ? 'bg-red-500' : 'bg-orange-400';
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
                {/* Visual Blob */}
                <div 
                    className={`absolute rounded-full blur-[50px] mix-blend-screen transition-all duration-1000 ease-in-out ${colorClass} ${opacityClass} ${sizeClass}`}
                    style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                />

                {/* Interactive Trigger & Icon */}
                {isHot && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onZoneClick(zone);
                        }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center animate-in zoom-in duration-500 cursor-pointer group"
                    >
                        {mode === 'intensity' ? (
                            <>
                                <div className="bg-red-600 text-white p-2 rounded-full shadow-lg shadow-red-500/50 animate-bounce group-hover:scale-110 transition-transform">
                                    <Flame size={16} className="fill-white" />
                                </div>
                                <div className="mt-1 bg-black/70 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    <ArrowUp size={8} className="text-green-400" />
                                    Fast Rising
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={`p-2 rounded-full shadow-lg transition-transform hover:scale-110 ${avgSentiment > 0.3 ? 'bg-green-600' : avgSentiment < -0.3 ? 'bg-red-600' : 'bg-yellow-500'}`}>
                                    {avgSentiment > 0.3 ? <Smile size={16} className="text-white"/> : avgSentiment < -0.3 ? <Frown size={16} className="text-white"/> : <Meh size={16} className="text-white"/>}
                                </div>
                                <div className="mt-1 bg-black/70 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {avgSentiment > 0.3 ? 'Positive Outlook' : avgSentiment < -0.3 ? 'High Tension' : 'Neutral'}
                                </div>
                            </>
                        )}
                    </button>
                )}
            </div>
        );
      })}
    </div>
  );
};

export default HeatmapLayer;