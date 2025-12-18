import React, { useState, useRef, useMemo, useEffect } from 'react';
import LocationMarker, { MarkerType } from './LocationMarker';
import MapNewsSheet from './MapNewsSheet';
import MapToolbar from './MapToolbar';
import MapFilterPanel, { MapFilters } from './MapFilterPanel';
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

const WorldMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Map State
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isMapReady, setIsMapReady] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'error' | 'info'} | null>(null);
  
  // Feature State
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [heatmapMode, setHeatmapMode] = useState<'intensity' | 'sentiment'>('intensity'); // 8.13.6
  const [timeValue, setTimeValue] = useState(0); 
  const [isPlayingHistory, setIsPlayingHistory] = useState(false);
  
  // Selection & Filters
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [activeZone, setActiveZone] = useState<any>(null); 
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  
  // 8.13.8 Comparison Mode State
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<MapFilters>({
      category: 'All',
      time: 'Today',
      type: 'All'
  });

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
                  return prev + 0.05;
              });
          }, 100);
      }
      return () => clearInterval(interval);
  }, [isPlayingHistory]);

  // Filtering Logic
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

  // Zoom Handlers
  const handleZoomIn = () => setTransform(prev => ({ ...prev, k: Math.min(prev.k * 1.5, 6) }));
  const handleZoomOut = () => setTransform(prev => {
      const newK = Math.max(prev.k / 1.5, 1);
      return { ...prev, k: newK, x: newK <= 1.2 ? 0 : prev.x, y: newK <= 1.2 ? 0 : prev.y };
  });
  
  const handleRecenter = () => {
    setTransform({ x: 0, y: 0, k: 1 });
    setActiveMarkerId(null);
    setActiveZone(null);
    setShowAIAnalysis(false);
    setIsCompareMode(false);
    setCompareSelection([]);
  };

  const handleLocateMe = () => {
      if ("geolocation" in navigator) {
          setToast({ message: "Locating...", type: 'info' });
          setTimeout(() => {
              const success = Math.random() > 0.3; 
              if (success) {
                  setTransform({ x: 200, y: 100, k: 3 });
                  setToast(null);
              } else {
                  setToast({ message: "Location access denied.", type: 'error' });
              }
          }, 1000);
      }
  };

  // Keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
      const PAN_STEP = 50;
      if (e.key === 'ArrowUp') setTransform(prev => ({ ...prev, y: prev.y + PAN_STEP }));
      if (e.key === 'ArrowDown') setTransform(prev => ({ ...prev, y: prev.y - PAN_STEP }));
      if (e.key === 'ArrowLeft') setTransform(prev => ({ ...prev, x: prev.x + PAN_STEP }));
      if (e.key === 'ArrowRight') setTransform(prev => ({ ...prev, x: prev.x - PAN_STEP }));
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
  };

  // Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPan({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const newX = e.clientX - startPan.x;
    const newY = e.clientY - startPan.y;
    setTransform(prev => ({ ...prev, x: newX, y: newY }));
  };
  const handleMouseUp = () => setIsDragging(false);
  
  // Marker Interaction
  const handleMarkerClick = (id: string) => {
      if (isCompareMode) {
          if (compareSelection.includes(id)) {
              setCompareSelection(prev => prev.filter(mid => mid !== id));
          } else if (compareSelection.length < 2) {
              setCompareSelection(prev => [...prev, id]);
          } else {
              setToast({ message: "Max 2 regions for comparison", type: 'info' });
          }
      } else {
          setActiveMarkerId(id);
      }
  };

  const activeMarkerData = MARKERS.find(m => m.id === activeMarkerId);

  // Global AI Analyze
  const handleAIAnalyze = () => {
      setShowAIAnalysis(true);
      setActiveMarkerId(null);
      setActiveZone(null);
  };

  // Zone Click
  const handleZoneClick = (zone: any) => {
      if (isCompareMode) return;
      setActiveZone({
          region: "Regional Hotspot",
          summary: `Activity is spiking due to ${zone.mainCategory} events.`,
          momentum: 'High',
          sentiment: 'Tense',
          stats: [
              { label: 'Events', value: zone.markers.length.toString(), icon: Users },
              { label: 'Intensity', value: Math.round(zone.intensity).toString(), icon: AlertTriangle },
          ],
          categories: [
              { label: zone.mainCategory || 'General', percentage: 70, color: '#4f46e5' },
              { label: 'Other', percentage: 30, color: '#94a3b8' }
          ]
      });
      setActiveMarkerId(null);
      setShowAIAnalysis(false);
  };

  // Helper for Comparison Data
  const getComparisonData = (id: string) => {
      const m = MARKERS.find(marker => marker.id === id);
      if (!m) return null;
      return {
          id: m.id,
          name: m.locationName,
          sentiment: m.sentiment,
          volume: m.impactRadius * 1240,
          momentum: m.momentum
      };
  };

  return (
    <div 
        className="relative w-full h-full bg-[#1a1d21] overflow-hidden group select-none outline-none"
        tabIndex={0}
        onKeyDown={handleKeyDown}
    >
       {toast && (
           <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs px-4">
               <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
           </div>
       )}

       <MapFilterPanel 
          filters={filters} 
          onChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))} 
       />

       {/* 8.13.9 Smart Insights */}
       <MapSmartInsights />

       {/* 8.13.8 Comparison Overlay */}
       {isCompareMode && compareSelection.length > 0 && (
           <MapComparisonOverlay 
              itemA={compareSelection[0] ? getComparisonData(compareSelection[0]) : null}
              itemB={compareSelection[1] ? getComparisonData(compareSelection[1]) : null}
              onClose={() => {
                  setIsCompareMode(false);
                  setCompareSelection([]);
              }}
           />
       )}

       {/* Global AI Overlay */}
       {showAIAnalysis && (
           <MapAIOverlay 
              region="Global View"
              summary="Significant activity detected in Western Markets."
              momentum="Medium"
              sentiment="Neutral"
              stats={[
                  { label: 'Trending', value: 'Technology', icon: TrendingUp },
                  { label: 'Impact', value: 'High', icon: AlertTriangle },
              ]}
              categories={[
                  { label: 'Technology', percentage: 45, color: '#4f46e5' },
                  { label: 'Business', percentage: 30, color: '#0ea5e9' },
                  { label: 'Politics', percentage: 25, color: '#f59e0b' }
              ]}
              onClose={() => setShowAIAnalysis(false)}
           />
       )}

       {/* Zone Specific AI Overlay */}
       {activeZone && (
           <MapAIOverlay 
              region={activeZone.region}
              summary={activeZone.summary}
              momentum={activeZone.momentum}
              sentiment={activeZone.sentiment}
              stats={activeZone.stats}
              categories={activeZone.categories}
              onClose={() => setActiveZone(null)}
           />
       )}

       {!activeMarkerId && !showAIAnalysis && !activeZone && !isCompareMode && filteredMarkers.length > 0 && (
           <button 
              onClick={handleAIAnalyze}
              className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 bg-indigo-600 text-white px-5 py-2.5 rounded-full shadow-lg shadow-indigo-500/30 flex items-center gap-2 font-bold text-xs animate-in slide-in-from-bottom-10 hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-white"
           >
               <Sparkles size={14} className="text-yellow-300 animate-pulse" />
               Analyze View
           </button>
       )}

      <div 
        className={`w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing ${isDragging ? 'cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => { 
            setActiveMarkerId(null); 
            setShowAIAnalysis(false); 
            setActiveZone(null); 
        }}
      >
        <div 
            className="relative w-full max-w-[1200px] aspect-[16/9] transition-transform duration-200 ease-out origin-center will-change-transform"
            style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})` }}
        >
           <div className="absolute inset-0 opacity-40 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-contain bg-no-repeat bg-center pointer-events-none filter invert contrast-125"></div>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-10 pointer-events-none"></div>

           {/* 8.13.6 Sentiment Layer Integration */}
           <HeatmapLayer 
                markers={filteredMarkers} 
                visible={showHeatmap} 
                mode={heatmapMode}
                onZoneClick={handleZoneClick}
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
               impactRadius={marker.impactRadius}
               onClick={() => handleMarkerClick(marker.id)}
               delay={index * 100}
             />
           ))}
        </div>
      </div>

      {/* Empty State */}
      {isMapReady && filteredMarkers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-gray-900/80 backdrop-blur-md p-6 rounded-2xl border border-gray-700 text-center max-w-xs animate-in zoom-in-95 pointer-events-auto">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MapPinOff size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-white font-bold mb-1">No News Found</h3>
                  <p className="text-gray-400 text-sm mb-4">Try adjusting time slider or filters.</p>
                  <button 
                    onClick={() => {
                        setFilters({ category: 'All', time: 'Today', type: 'All' });
                        setTimeValue(2);
                    }}
                    className="text-blue-400 text-sm font-bold hover:text-blue-300"
                  >
                      Reset All
                  </button>
              </div>
          </div>
      )}

      {/* Time Scrubber - Hide in Compare Mode */}
      {!isCompareMode && (
          <TimeScrubber 
            value={timeValue}
            onChange={setTimeValue}
            isPlaying={isPlayingHistory}
            onTogglePlay={() => setIsPlayingHistory(!isPlayingHistory)}
          />
      )}

      <MapNewsSheet 
        isOpen={!!activeMarkerId && !isCompareMode} 
        onClose={() => setActiveMarkerId(null)}
        data={activeMarkerData ? {
            ...activeMarkerData,
            description: `Analyzing ${activeMarkerData.locationName}: This event has a regional impact score of ${activeMarkerData.impactRadius}/10. Local sources report significant engagement.`
        } : null}
      />

      <MapToolbar 
        onZoomIn={handleZoomIn} 
        onZoomOut={handleZoomOut} 
        onRecenter={handleRecenter}
        onLocateMe={handleLocateMe}
        onToggleHeatmapMode={() => setHeatmapMode(prev => prev === 'intensity' ? 'sentiment' : 'intensity')}
        heatmapMode={heatmapMode}
        onToggleCompare={() => {
            if (isCompareMode) setCompareSelection([]); // clear on exit
            setIsCompareMode(!isCompareMode);
        }}
        isCompareMode={isCompareMode}
      />
      
      <div className="absolute bottom-1 right-2 text-[8px] text-gray-600 pointer-events-none">
          Powered by NewsClub GeoEngine
      </div>
    </div>
  );
};

export default WorldMap;