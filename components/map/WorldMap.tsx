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
import { TrendingUp, AlertTriangle } from 'lucide-react';
import Toast from '../ui/Toast';

// Mock Data focused on India + Global
const MARKERS = [
  // India Dense Cluster
  { id: 'in1', x: 68, y: 42, type: 'breaking', title: 'Delhi Election Update', source: 'NDTV', time: '10m ago', timestamp: 0.1, imageUrl: 'https://picsum.photos/200/150?random=101', category: 'Politics', locationName: 'New Delhi, India', impactRadius: 9, momentum: 'High', sentiment: 'Tense' },
  { id: 'in2', x: 67, y: 45, type: 'trending', title: 'Mumbai Tech Summit', source: 'TechCrunch', time: '1h ago', timestamp: 0.2, imageUrl: 'https://picsum.photos/200/150?random=102', category: 'Tech', locationName: 'Mumbai, India', impactRadius: 8, momentum: 'High', sentiment: 'Positive' },
  { id: 'in3', x: 69, y: 48, type: 'general', title: 'Bangalore Startup Boom', source: 'Economic Times', time: '3h ago', timestamp: 0.3, imageUrl: 'https://picsum.photos/200/150?random=103', category: 'Business', locationName: 'Bangalore, India', impactRadius: 7, momentum: 'Medium', sentiment: 'Positive' },
  { id: 'in4', x: 72, y: 43, type: 'general', title: 'Kolkata Cultural Fest', source: 'The Hindu', time: '5h ago', timestamp: 0.4, imageUrl: 'https://picsum.photos/200/150?random=104', category: 'Entertainment', locationName: 'Kolkata, India', impactRadius: 5, momentum: 'Low', sentiment: 'Positive' },
  { id: 'in5', x: 66, y: 40, type: 'top', title: 'Rajasthan Tourism Surge', source: 'Travel Daily', time: '1d ago', timestamp: 0.5, imageUrl: 'https://picsum.photos/200/150?random=105', category: 'Business', locationName: 'Jaipur, India', impactRadius: 6, momentum: 'Medium', sentiment: 'Positive' },
  { id: 'in6', x: 70, y: 50, type: 'general', title: 'Chennai Weather Alert', source: 'Weather.com', time: '20m ago', timestamp: 0.1, imageUrl: 'https://picsum.photos/200/150?random=106', category: 'Environment', locationName: 'Chennai, India', impactRadius: 8, momentum: 'High', sentiment: 'Tense' },
  { id: 'in7', x: 65, y: 38, type: 'general', title: 'Punjab Agriculture Tech', source: 'AgriNews', time: '6h ago', timestamp: 0.6, imageUrl: 'https://picsum.photos/200/150?random=107', category: 'Science', locationName: 'Amritsar, India', impactRadius: 4, momentum: 'Low', sentiment: 'Positive' },
  { id: 'in8', x: 71, y: 45, type: 'trending', title: 'Hyderabad Biotech Innovation', source: 'BioWorld', time: '2h ago', timestamp: 0.25, imageUrl: 'https://picsum.photos/200/150?random=108', category: 'Science', locationName: 'Hyderabad, India', impactRadius: 7, momentum: 'Medium', sentiment: 'Positive' },

  // Global Context
  { id: '1', x: 22, y: 38, type: 'breaking', title: 'US Market Hits All-Time High', source: 'Bloomberg', time: '10m ago', timestamp: 0.1, imageUrl: 'https://picsum.photos/200/150?random=1', category: 'Business', locationName: 'New York, USA', impactRadius: 9, momentum: 'High', sentiment: 'Positive' },
  { id: '2', x: 48, y: 28, type: 'trending', title: 'EU AI Act Finalized', source: 'BBC', time: '1h ago', timestamp: 0.3, imageUrl: 'https://picsum.photos/200/150?random=2', category: 'Politics', locationName: 'Brussels, Belgium', impactRadius: 6, momentum: 'Medium', sentiment: 'Neutral' },
  { id: '3', x: 75, y: 45, type: 'top', title: 'China Tech Unveil', source: 'The Verge', time: '3h ago', timestamp: 0.5, imageUrl: 'https://picsum.photos/200/150?random=3', category: 'Tech', locationName: 'Shenzhen, China', impactRadius: 8, momentum: 'High', sentiment: 'Positive' },
  { id: '5', x: 85, y: 75, type: 'breaking', title: 'Australian Wildfire Update', source: 'ABC News', time: '5m ago', timestamp: 0.05, imageUrl: 'https://picsum.photos/200/150?random=5', category: 'Environment', locationName: 'Sydney, Australia', impactRadius: 7, momentum: 'High', sentiment: 'Tense' },
];

interface WorldMapProps {
    filters: MapFilters;
    onResetFilters: () => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ filters, onResetFilters }) => {
  // Default Zoom to India (Centered roughly on India coordinates in our SVG map space)
  const [transform, setTransform] = useState({ x: -180, y: -120, k: 3.5 });
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
                  return prev + 0.02; 
              });
          }, 50);
      }
      return () => clearInterval(interval);
  }, [isPlayingHistory]);

  const filteredMarkers = useMemo(() => {
      return MARKERS.filter(m => {
          if (filters.category !== 'All' && m.category !== filters.category) return false;
          if (filters.state !== 'All' && filters.state === 'India' && !m.locationName.includes('India')) return false;
          if (filters.sentiment !== 'All' && m.sentiment !== filters.sentiment) return false;
          
          if (timeValue < 0.2 && m.timestamp > 0.2) return false;
          if (m.timestamp > timeValue + 0.5) return false;
          return true;
      });
  }, [filters, transform.k, activeMarkerId, timeValue, compareSelection]);

  const handleZoomIn = () => setTransform(prev => ({ ...prev, k: Math.min(prev.k * 1.5, 8) }));
  const handleZoomOut = () => setTransform(prev => {
      const newK = Math.max(prev.k / 1.5, 1);
      return { ...prev, k: newK, x: newK <= 1.2 ? 0 : prev.x, y: newK <= 1.2 ? 0 : prev.y };
  });

  const handleWheel = (e: React.WheelEvent) => {
    if ((e.target as HTMLElement).closest('.overscroll-contain')) return;
    e.preventDefault();
    const scaleFactor = 0.001;
    const delta = -e.deltaY * scaleFactor;
    const newK = Math.min(Math.max(1, transform.k + delta), 8);
    setTransform(prev => ({ ...prev, k: newK }));
  };
  
  const handleRecenter = () => {
    setTransform({ x: -180, y: -120, k: 3.5 }); // Reset to India
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
              setTransform({ x: -180, y: -120, k: 5 }); // Zoom deeper into India
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
              summary={activeZone?.summary || "Significant activity detected."}
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
               delay={index * 50}
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
