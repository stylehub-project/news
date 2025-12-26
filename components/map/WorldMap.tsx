
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

// Mock Data distributed across Indian States and Global hubs
const MARKERS = [
  // India States Data Points
  { id: 'in1', x: 68.5, y: 41, type: 'breaking', title: 'Delhi: Air Quality Crisis', source: 'NDTV', time: '10m ago', timestamp: 0.1, imageUrl: 'https://picsum.photos/200/150?random=101', category: 'Environment', locationName: 'New Delhi', impactRadius: 9, momentum: 'High', sentiment: 'Tense' },
  { id: 'in2', x: 67.2, y: 46, type: 'trending', title: 'Mumbai: Tech Summit', source: 'TechCrunch', time: '1h ago', timestamp: 0.2, imageUrl: 'https://picsum.photos/200/150?random=102', category: 'Tech', locationName: 'Maharashtra', impactRadius: 8, momentum: 'High', sentiment: 'Positive' },
  { id: 'in3', x: 69.5, y: 49, type: 'general', title: 'Bangalore: Startup Boom', source: 'Economic Times', time: '3h ago', timestamp: 0.3, imageUrl: 'https://picsum.photos/200/150?random=103', category: 'Business', locationName: 'Karnataka', impactRadius: 7, momentum: 'Medium', sentiment: 'Positive' },
  { id: 'in4', x: 73, y: 44, type: 'general', title: 'Kolkata: Cultural Fest', source: 'The Hindu', time: '5h ago', timestamp: 0.4, imageUrl: 'https://picsum.photos/200/150?random=104', category: 'Entertainment', locationName: 'West Bengal', impactRadius: 5, momentum: 'Low', sentiment: 'Positive' },
  { id: 'in5', x: 66, y: 40, type: 'top', title: 'Jaipur: Tourism Surge', source: 'Travel Daily', time: '1d ago', timestamp: 0.5, imageUrl: 'https://picsum.photos/200/150?random=105', category: 'Business', locationName: 'Rajasthan', impactRadius: 6, momentum: 'Medium', sentiment: 'Positive' },
  { id: 'in6', x: 70, y: 51, type: 'general', title: 'Chennai: Cyclone Alert', source: 'Weather.com', time: '20m ago', timestamp: 0.1, imageUrl: 'https://picsum.photos/200/150?random=106', category: 'Environment', locationName: 'Tamil Nadu', impactRadius: 8, momentum: 'High', sentiment: 'Tense' },
  { id: 'in7', x: 67, y: 37, type: 'general', title: 'Punjab: Agri-Tech Expo', source: 'AgriNews', time: '6h ago', timestamp: 0.6, imageUrl: 'https://picsum.photos/200/150?random=107', category: 'Science', locationName: 'Punjab', impactRadius: 4, momentum: 'Low', sentiment: 'Positive' },
  { id: 'in8', x: 70.5, y: 46, type: 'trending', title: 'Hyderabad: Pharma Hub', source: 'BioWorld', time: '2h ago', timestamp: 0.25, imageUrl: 'https://picsum.photos/200/150?random=108', category: 'Science', locationName: 'Telangana', impactRadius: 7, momentum: 'Medium', sentiment: 'Positive' },
  { id: 'in9', x: 65, y: 44, type: 'general', title: 'Ahmedabad: Trade Fair', source: 'GujSamachar', time: '4h ago', timestamp: 0.4, imageUrl: 'https://picsum.photos/200/150?random=109', category: 'Business', locationName: 'Gujarat', impactRadius: 6, momentum: 'Medium', sentiment: 'Positive' },
  { id: 'in10', x: 74, y: 38, type: 'breaking', title: 'Guwahati: Flood Warning', source: 'NE News', time: '15m ago', timestamp: 0.15, imageUrl: 'https://picsum.photos/200/150?random=110', category: 'Environment', locationName: 'Assam', impactRadius: 8, momentum: 'High', sentiment: 'Tense' },

  // Global Context (Scaled relatively)
  { id: '1', x: 22, y: 38, type: 'breaking', title: 'New York: Market High', source: 'Bloomberg', time: '10m ago', timestamp: 0.1, imageUrl: 'https://picsum.photos/200/150?random=1', category: 'Business', locationName: 'USA', impactRadius: 9, momentum: 'High', sentiment: 'Positive' },
  { id: '2', x: 48, y: 28, type: 'trending', title: 'Brussels: AI Act', source: 'BBC', time: '1h ago', timestamp: 0.3, imageUrl: 'https://picsum.photos/200/150?random=2', category: 'Politics', locationName: 'Europe', impactRadius: 6, momentum: 'Medium', sentiment: 'Neutral' },
  { id: '3', x: 80, y: 40, type: 'top', title: 'Tokyo: Robotics Expo', source: 'Nikkei', time: '3h ago', timestamp: 0.5, imageUrl: 'https://picsum.photos/200/150?random=3', category: 'Tech', locationName: 'Japan', impactRadius: 8, momentum: 'High', sentiment: 'Positive' },
  { id: '5', x: 85, y: 75, type: 'breaking', title: 'Sydney: Wildfire', source: 'ABC News', time: '5m ago', timestamp: 0.05, imageUrl: 'https://picsum.photos/200/150?random=5', category: 'Environment', locationName: 'Australia', impactRadius: 7, momentum: 'High', sentiment: 'Tense' },
];

interface WorldMapProps {
    filters: MapFilters;
    onResetFilters: () => void;
    showHeatmap?: boolean;
}

const WorldMap: React.FC<WorldMapProps> = ({ filters, onResetFilters, showHeatmap = true }) => {
  // View State
  const [transform, setTransform] = useState({ x: -180, y: -120, k: 3.5 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isMapReady, setIsMapReady] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'error' | 'info'} | null>(null);
  
  // Modes
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
  const [mapLayer, setMapLayer] = useState<'satellite' | 'schematic'>('satellite');
  
  // Interaction State
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
          if (filters.state !== 'All') {
              if (filters.state === 'India' && !['India', 'Maharashtra', 'Karnataka', 'New Delhi', 'West Bengal', 'Rajasthan', 'Tamil Nadu', 'Punjab', 'Telangana', 'Gujarat', 'Assam'].includes(m.locationName)) return false;
              if (filters.state !== 'India' && !m.locationName.includes(filters.state)) return false;
          }
          if (filters.sentiment !== 'All' && m.sentiment !== filters.sentiment) return false;
          
          if (timeValue < 0.2 && m.timestamp > 0.2) return false;
          if (m.timestamp > timeValue + 0.5) return false;
          return true;
      });
  }, [filters, transform.k, activeMarkerId, timeValue, compareSelection]);

  const handleZoomIn = () => setTransform(prev => ({ ...prev, k: Math.min(prev.k * 1.5, 12) }));
  const handleZoomOut = () => setTransform(prev => {
      const newK = Math.max(prev.k / 1.5, 1);
      return { ...prev, k: newK, x: newK <= 1.2 ? 0 : prev.x, y: newK <= 1.2 ? 0 : prev.y };
  });

  const handleWheel = (e: React.WheelEvent) => {
    if ((e.target as HTMLElement).closest('.overscroll-contain')) return;
    e.preventDefault();
    const scaleFactor = 0.001;
    const delta = -e.deltaY * scaleFactor;
    const newK = Math.min(Math.max(1, transform.k + delta), 12);
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
          setToast({ message: "Aligning satellite to your location...", type: 'info' });
          setTimeout(() => {
              setTransform({ x: -180, y: -120, k: 5 }); 
              setToast(null);
          }, 1500);
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
        className="relative w-full h-full bg-[#050505] overflow-hidden group select-none outline-none"
        onWheel={handleWheel}
        style={{ perspective: '1000px' }}
    >
       {/* Background Atmosphere */}
       <div className="absolute inset-0 bg-radial-gradient from-indigo-900/10 via-black to-black pointer-events-none z-0"></div>
       
       {toast && (
           <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs px-4">
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
              summary={activeZone?.summary || "Significant activity detected in this sector."}
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
        style={{
            transformStyle: 'preserve-3d',
            transform: viewMode === '3d' ? 'rotateX(30deg) scale(1.1)' : 'rotateX(0deg)',
            transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
      >
        <div 
            className="relative w-full max-w-[1400px] aspect-[2/1] transition-transform duration-100 ease-out origin-center will-change-transform"
            style={{ 
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
                transformStyle: 'preserve-3d'
            }}
        >
           {/* Map Layer */}
           {mapLayer === 'satellite' ? (
                <div className="absolute inset-0 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-[#0a0a0a]">
                    {/* Dark Satellite Texture */}
                    <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/c/cd/Land_ocean_ice_2048.jpg" 
                        className="w-full h-full object-cover opacity-80 filter contrast-125 brightness-75 grayscale-[30%]"
                        alt="Satellite Map"
                        draggable={false}
                    />
                    {/* Digital Grid Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                    <div className="absolute inset-0 bg-radial-gradient from-transparent to-black opacity-60"></div>
                </div>
           ) : (
                <div className="absolute inset-0 bg-[#111] border border-gray-800 rounded-lg">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center invert filter"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                </div>
           )}
           
           {/* Heatmap (Flat on map surface) */}
           <div style={{ transform: 'translateZ(1px)' }}>
                <HeatmapLayer 
                    markers={filteredMarkers} 
                    visible={showHeatmap} 
                    mode='intensity'
                    onZoneClick={setActiveZone}
                />
           </div>

           {/* Markers (Floating above surface) */}
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
               viewMode={viewMode}
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

      {/* Map News Sheet (Modal) */}
      <MapNewsSheet 
        isOpen={!!activeMarkerId && !isCompareMode} 
        onClose={() => setActiveMarkerId(null)}
        data={activeMarkerData ? { 
            ...activeMarkerData, 
            description: activeMarkerData.title + ". Deep analysis available via AI Explain.",
            type: activeMarkerData.type
        } : null}
      />

      <MapToolbar 
        onZoomIn={handleZoomIn} 
        onZoomOut={handleZoomOut} 
        onRecenter={handleRecenter}
        onLocateMe={handleLocateMe}
        onToggleCompare={() => { if (isCompareMode) setCompareSelection([]); setIsCompareMode(!isCompareMode); }}
        isCompareMode={isCompareMode}
        viewMode={viewMode}
        onToggleView={() => setViewMode(prev => prev === '2d' ? '3d' : '2d')}
        mapLayer={mapLayer}
        onToggleLayer={() => setMapLayer(prev => prev === 'satellite' ? 'schematic' : 'satellite')}
      />
    </div>
  );
};

export default WorldMap;
