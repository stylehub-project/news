import React, { useState, useRef, useMemo, useEffect } from 'react';
import LocationMarker, { MarkerType } from './LocationMarker';
import MapNewsSheet from './MapNewsSheet';
import MapToolbar from './MapToolbar';
import { MapFilters } from './MapFilterPanel';
import MapAIOverlay from './MapAIOverlay';
import HeatmapLayer from './HeatmapLayer';
import TimeScrubber from './TimeScrubber';
import MapComparisonOverlay from './MapComparisonOverlay';
import MapSmartInsights from './MapSmartInsights';
import { Sparkles, TrendingUp, Users, AlertTriangle, MapPinOff } from 'lucide-react';
import Toast from '../ui/Toast';

const MARKERS = [
  { id: '1', x: 22, y: 38, type: 'breaking', title: 'Market Hits All-Time High', source: 'Bloomberg', time: '10m ago', timestamp: 0.1, imageUrl: 'https://picsum.photos/200/150?random=1', category: 'Business', locationName: 'New York, USA', impactRadius: 9, momentum: 'High', sentiment: 'Positive' },
  { id: '2', x: 48, y: 28, type: 'trending', title: 'EU AI Act Finalized', source: 'BBC', time: '1h ago', timestamp: 0.3, imageUrl: 'https://picsum.photos/200/150?random=2', category: 'Politics', locationName: 'Brussels, Belgium', impactRadius: 6, momentum: 'Medium', sentiment: 'Neutral' },
  { id: '3', x: 75, y: 45, type: 'top', title: 'Tech Giant Unveils VR Headset', source: 'The Verge', time: '3h ago', timestamp: 0.5, imageUrl: 'https://picsum.photos/200/150?random=3', category: 'Tech', locationName: 'Shenzhen, China', impactRadius: 8, momentum: 'High', sentiment: 'Positive' },
  { id: '4', x: 30, y: 55, type: 'general', title: 'Rainforest Conservation Deal', source: 'NatGeo', time: '5h ago', timestamp: 0.8, imageUrl: 'https://picsum.photos/200/150?random=4', category: 'Environment', locationName: 'Amazonas, Brazil', impactRadius: 4, momentum: 'Low', sentiment: 'Positive' },
  { id: '5', x: 85, y: 75, type: 'breaking', title: 'Australian Wildfire Update', source: 'ABC News', time: '5m ago', timestamp: 0.05, imageUrl: 'https://picsum.photos/200/150?random=5', category: 'Environment', locationName: 'Sydney, Australia', impactRadius: 7, momentum: 'High', sentiment: 'Tense' },
  { id: '6', x: 60, y: 35, type: 'trending', title: 'Startups booming in Middle East', source: 'TechCrunch', time: '2h ago', timestamp: 0.4, imageUrl: 'https://picsum.photos/200/150?random=6', category: 'Business', locationName: 'Dubai, UAE', impactRadius: 5, momentum: 'Medium', sentiment: 'Positive' },
  { id: '7', x: 15, y: 30, type: 'general', title: 'Silicon Valley layoffs continue', source: 'TechCrunch', time: '1d ago', timestamp: 1.2, imageUrl: 'https://picsum.photos/200/150?random=7', category: 'Tech', locationName: 'San Francisco, USA', impactRadius: 6, momentum: 'Medium', sentiment: 'Tense' },
  { id: '8', x: 52, y: 20, type: 'general', title: 'Nordic renewable energy surplus', source: 'Reuters', time: '3d ago', timestamp: 2.5, imageUrl: 'https://picsum.photos/200/150?random=8', category: 'Environment', locationName: 'Oslo, Norway', impactRadius: 3, momentum: 'Low', sentiment: 'Positive' },
];

interface WorldMapProps {
    filters: MapFilters;
    onResetFilters: () => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ filters, onResetFilters }) => {
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isMapReady, setIsMapReady] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'error' | 'info'} | null>(null);
  
  const [timeValue, setTimeValue] = useState(0); 
  const [isPlayingHistory, setIsPlayingHistory] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);
  
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [activeZone, setActiveZone] = useState<any>(null); 
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);

  useEffect(() => {
      const timer = setTimeout(() => setIsMapReady(true), 100);
      return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (isPlayingHistory) {
          interval = setInterval(() => {
              setTimeValue(prev => {
                  if (prev >= 2) {
                      setIsPlayingHistory(false);
                      return 0;
                  }
                  return prev + 0.02; // Slower, smoother autoplay
              });
          }, 50);
      }
      return () => clearInterval(interval);
  }, [isPlayingHistory]);

  const filteredMarkers = useMemo(() => {
      return MARKERS.filter(m => {
          if (filters.category !== 'All' && m.category !== filters.category) return false;
          if (filters.type !== 'All' && m.type !== filters.type.toLowerCase()) return false;
          if (timeValue < 0.2 && m.timestamp > 0.2) return false;
          if (m.timestamp > timeValue + 0.5) return false;
          if (transform.k < 1.5 && m.type === 'general' && activeMarkerId !== m.id && !compareSelection.includes(m.id)) return false;
          return true;
      });
  }, [filters, transform.k, activeMarkerId, timeValue, compareSelection]);

  const handleZoomIn = () => setTransform(prev => ({ ...prev, k: Math.min(prev.k * 1.5, 6) }));
  const handleZoomOut = () => setTransform(prev => {
      const newK = Math.max(prev.k / 1.5, 1);
      return { ...prev, k: newK, x: newK <= 1.2 ? 0 : prev.x, y: newK <= 1.2 ? 0 : prev.y };
  });

  const handleWheel = (e: React.WheelEvent) => {
    // Check if we are hovering over an interactive element that should scroll itself
    if ((e.target as HTMLElement).closest('.overscroll-contain')) return;
    
    e.preventDefault();
    const scaleFactor = 0.001;
    const delta = -e.deltaY * scaleFactor;
    const newK = Math.min(Math.max(1, transform.k + delta), 6);
    setTransform(prev => ({ ...prev, k: newK }));
  };
  
  const handleRecenter = () => {
    setTransform({ x: 0, y: 0, k: 1 });
    setActiveMarkerId(null);
    setActiveZone(null);
    setShowAIAnalysis(false);
    setIsCompareMode(false);
    setCompareSelection([]);
    setShowTimeline(true);
  };

  const handleLocateMe = () => {
      if ("geolocation" in navigator) {
          setToast({ message: "Locating news near you...", type: 'info' });
          setTimeout(() => {
              setTransform({ x: 150, y: 50, k: 3 });
              setToast(null);
          }, 1200);
      }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setStartPan({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - startPan.x;
    const newY = e.clientY - startPan.y;
    setTransform(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => setIsDragging(false);
  
  const handleMarkerClick = (id: string) => {
      if (isCompareMode) {
          if (compareSelection.includes(id)) {
              setCompareSelection(prev => prev.filter(mid => mid !== id));
          } else if (compareSelection.length < 2) {
              setCompareSelection(prev => [...prev, id]);
          }
      } else {
          setActiveMarkerId(id);
      }
  };

  const activeMarkerData = MARKERS.find(m => m.id === activeMarkerId);

  const getComparisonData = (id: string) => {
      const m = MARKERS.find(marker => marker.id === id);
      if (!m) return null;
      return { id: m.id, name: m.locationName, sentiment: m.sentiment, volume: m.impactRadius * 1240, momentum: m.momentum };
  };

  return (
    <div 
        className="relative w-full h-full bg-[#1a1d21] overflow-hidden group select-none outline-none"
        onWheel={handleWheel}
    >
       {toast && (
           <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs px-4">
               <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
           </div>
       )}

       <MapSmartInsights />

       {isCompareMode && compareSelection.length > 0 && (
           <MapComparisonOverlay 
              itemA={compareSelection[0] ? getComparisonData(compareSelection[0]) : null}
              itemB={compareSelection[1] ? getComparisonData(compareSelection[1]) : null}
              onClose={() => { setIsCompareMode(false); setCompareSelection([]); }}
           />
       )}

       {(showAIAnalysis || activeZone) && (
           <MapAIOverlay 
              region={activeZone?.region || "Global View"}
              summary={activeZone?.summary || "Significant activity detected in Western Markets."}
              momentum={activeZone?.momentum || "Medium"}
              sentiment={activeZone?.sentiment || "Neutral"}
              stats={activeZone?.stats || [{ label: 'Trending', value: 'Technology', icon: TrendingUp }, { label: 'Impact', value: 'High', icon: AlertTriangle }]}
              categories={activeZone?.categories || [{ label: 'Tech', percentage: 45, color: '#4f46e5' }, { label: 'Biz', percentage: 30, color: '#0ea5e9' }]}
              onClose={() => { setShowAIAnalysis(false); setActiveZone(null); }}
           />
       )}

      <div 
        className={`w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing ${isDragging ? 'cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => { 
            if (!isDragging) {
                setActiveMarkerId(null); 
                setShowAIAnalysis(false); 
                setActiveZone(null); 
            }
        }}
      >
        <div 
            className="relative w-full max-w-[1200px] aspect-[16/9] transition-transform duration-200 ease-out origin-center will-change-transform"
            style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})` }}
        >
           <div className="absolute inset-0 opacity-40 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-contain bg-no-repeat bg-center pointer-events-none filter invert contrast-125"></div>
           
           <HeatmapLayer 
                markers={filteredMarkers} 
                visible={true} 
                mode='intensity'
                onZoneClick={setActiveZone}
           />

           {isMapReady && filteredMarkers.map((marker, index) => (
             <LocationMarker
               key={marker.id}
               x={marker.x}
               y={marker.y}
               type={marker.type as MarkerType}
               title={marker.title}
               source={marker.source}
               isActive={activeMarkerId === marker.id}
               isCompareSelected={compareSelection.includes(marker.id)}
               isCompareMode={isCompareMode}
               zoomLevel={transform.k}
               onClick={() => handleMarkerClick(marker.id)}
               delay={index * 100}
             />
           ))}
        </div>
      </div>

      {showTimeline && !isCompareMode && (
          <TimeScrubber 
            value={timeValue}
            onChange={setTimeValue}
            isPlaying={isPlayingHistory}
            onTogglePlay={() => setIsPlayingHistory(!isPlayingHistory)}
            onClose={() => setShowTimeline(false)}
          />
      )}

      <MapNewsSheet 
        isOpen={!!activeMarkerId && !isCompareMode} 
        onClose={() => setActiveMarkerId(null)}
        data={activeMarkerData ? { ...activeMarkerData, description: `Analyzing ${activeMarkerData.locationName}: This event has a regional impact score of ${activeMarkerData.impactRadius}/10.` } : null}
      />

      <MapToolbar 
        onZoomIn={handleZoomIn} 
        onZoomOut={handleZoomOut} 
        onRecenter={handleRecenter}
        onLocateMe={handleLocateMe}
        onToggleCompare={() => { if (isCompareMode) setCompareSelection([]); setIsCompareMode(!isCompareMode); }}
        isCompareMode={isCompareMode}
      />
    </div>
  );
};

export default WorldMap;