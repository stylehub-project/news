
import React, { useState, useRef, useMemo, useEffect } from 'react';
import LocationMarker, { MarkerType, MapPerspective, DetailLevel } from './LocationMarker';
import NewsPopup from './NewsPopup';
import MapToolbar from './MapToolbar';
import { MapFilters } from './MapFilterPanel';
import MapAIOverlay from './MapAIOverlay';
import HeatmapLayer from './HeatmapLayer';
import TimeScrubber from './TimeScrubber';
import MapComparisonOverlay from './MapComparisonOverlay';
import MapSmartInsights from './MapSmartInsights';
import { TrendingUp, Wind, Radio, WifiOff } from 'lucide-react';
import Toast from '../ui/Toast';
import { useNetwork } from '../../context/NetworkContext';
import { useNavigate } from 'react-router-dom';
import { getLiveWeather } from '../../utils/weatherService';

// Updated Markers with real coordinates for API fetching
export const MARKERS = [
  // --- INDIA STATES & CITIES ---
  { id: 'in_delhi', x: 68.5, y: 40, lat: 28.6139, lng: 77.2090, type: 'severe', title: 'Delhi', category: 'Heat', locationName: 'New Delhi, India', minZoom: 3, maxZoom: 20, impactRadius: 10, momentum: 'High', sentiment: 'Negative', detailLevel: 'city', temp: '44°C', wind: '15 km/h', humidity: '20%', precip: '0%' },
  { id: 'in_mumbai', x: 67.2, y: 45, lat: 19.0760, lng: 72.8777, type: 'warning', title: 'Mumbai', category: 'Rain', locationName: 'Mumbai, MH', minZoom: 3, maxZoom: 20, impactRadius: 12, momentum: 'Medium', sentiment: 'Neutral', detailLevel: 'city', temp: '28°C', wind: '35 km/h', humidity: '85%', precip: '40mm' },
  { id: 'in_chennai', x: 69.5, y: 48.5, lat: 13.0827, lng: 80.2707, type: 'severe', title: 'Chennai', category: 'Storm', locationName: 'Chennai, TN', minZoom: 3, maxZoom: 20, impactRadius: 15, momentum: 'High', sentiment: 'Tense', detailLevel: 'city', temp: '29°C', wind: '80 km/h', humidity: '90%', precip: '120mm' },
  { id: 'in_blr', x: 68, y: 48, lat: 12.9716, lng: 77.5946, type: 'general', title: 'Bengaluru', category: 'Cloud', locationName: 'Bengaluru, KA', minZoom: 3, maxZoom: 20, impactRadius: 8, momentum: 'Low', sentiment: 'Positive', detailLevel: 'city', temp: '24°C', wind: '20 km/h', humidity: '60%', precip: '10%' },
  { id: 'in_kolkata', x: 71, y: 43, lat: 22.5726, lng: 88.3639, type: 'warning', title: 'Kolkata', category: 'Storm', locationName: 'Kolkata, WB', minZoom: 3, maxZoom: 20, impactRadius: 10, momentum: 'Medium', sentiment: 'Negative', detailLevel: 'city', temp: '30°C', wind: '45 km/h', humidity: '75%', precip: '25mm' },
  
  // --- GLOBAL HUBS ---
  { id: 'us_nyc', x: 22, y: 38, lat: 40.7128, lng: -74.0060, type: 'forecast', title: 'NYC', category: 'Snow', locationName: 'New York, USA', minZoom: 2, maxZoom: 20, impactRadius: 10, momentum: 'Medium', sentiment: 'Neutral', detailLevel: 'city', temp: '-2°C', wind: '25 km/h', humidity: '50%', precip: '5cm' },
  { id: 'uk_ldn', x: 48, y: 28, lat: 51.5074, lng: -0.1278, type: 'general', title: 'London', category: 'Wind', locationName: 'London, UK', minZoom: 2, maxZoom: 20, impactRadius: 8, momentum: 'Low', sentiment: 'Neutral', detailLevel: 'city', temp: '12°C', wind: '55 km/h', humidity: '70%', precip: '0mm' },
  { id: 'jp_tokyo', x: 82, y: 38, lat: 35.6762, lng: 139.6503, type: 'warning', title: 'Tokyo', category: 'Storm', locationName: 'Tokyo, Japan', minZoom: 2, maxZoom: 20, impactRadius: 15, momentum: 'High', sentiment: 'Tense', detailLevel: 'city', temp: '25°C', wind: '110 km/h', humidity: '85%', precip: '80mm' },
];

interface WorldMapProps {
    filters: MapFilters;
    onResetFilters: () => void;
    showHeatmap?: boolean;
    flyToLocation?: { x: number, y: number, k: number } | null;
    isAudioMode?: boolean;
}

const WorldMap: React.FC<WorldMapProps> = ({ filters, onResetFilters, showHeatmap = true, flyToLocation, isAudioMode = false }) => {
  const navigate = useNavigate();
  const { isOnline } = useNetwork();
  const [transform, setTransform] = useState({ x: -550, y: 80, k: 5.5 }); 
  const [isDragging, setIsDragging] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isMapReady, setIsMapReady] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'error' | 'info'} | null>(null);
  const [mapError, setMapError] = useState(false);
  const lastTouchRef = useRef<{ dist: number; center: { x: number; y: number } } | null>(null);
  
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
  const [mapLayer, setMapLayer] = useState<'satellite' | 'schematic'>('satellite');
  const [perspective, setPerspective] = useState<MapPerspective>('Overview');
  
  const [timeValue, setTimeValue] = useState(0); 
  const [isPlayingHistory, setIsPlayingHistory] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);
  
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [activeZone, setActiveZone] = useState<any>(null); 
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  
  // Weather Data State
  const [liveWeatherData, setLiveWeatherData] = useState<any>(null);

  useEffect(() => {
      const timer = setTimeout(() => setIsMapReady(true), 100);
      return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
      if (!isOnline) {
          setMapLayer('schematic');
          setToast({ message: "Offline Mode: Showing cached forecasts", type: 'info' });
      }
  }, [isOnline]);

  useEffect(() => {
      if (flyToLocation) {
          setIsFlying(true);
          setTransform(prev => ({ ...prev, x: flyToLocation.x, y: flyToLocation.y, k: flyToLocation.k }));
          setTimeout(() => setIsFlying(false), 1200); 
      }
  }, [flyToLocation]);

  // Marker Click Handler with Real Data Fetch
  const handleMarkerClick = async (marker: any) => {
      if (isDragging) return;
      
      setActiveMarkerId(marker.id);
      
      // Reset live data while fetching
      setLiveWeatherData(null);

      // Fetch Real Weather if coordinates exist
      if (marker.lat && marker.lng) {
          const weather = await getLiveWeather(marker.lat, marker.lng);
          if (weather) {
              setLiveWeatherData(weather);
          }
      }
  };

  const filteredMarkers = useMemo(() => {
      return MARKERS.filter(m => {
          if (transform.k < m.minZoom || transform.k >= m.maxZoom) return false;
          if (filters.category !== 'All' && m.category !== filters.category) return false;
          return true;
      });
  }, [filters, transform.k, perspective]);

  const handleZoomIn = () => setTransform(prev => ({ ...prev, k: Math.min(prev.k * 1.5, 20) }));
  const handleZoomOut = () => setTransform(prev => {
      const newK = Math.max(prev.k / 1.5, 1);
      return { ...prev, k: newK, x: newK <= 1.2 ? 0 : prev.x, y: newK <= 1.2 ? 0 : prev.y };
  });

  const handleRecenter = () => {
    setIsFlying(true);
    setTransform({ x: -180, y: -120, k: 2.5 }); 
    setTimeout(() => setIsFlying(false), 1200);
  };

  const handlePerspectiveChange = () => {
      const options: MapPerspective[] = ['Overview', 'Temperature', 'Precipitation', 'Wind'];
      const currentIdx = options.indexOf(perspective);
      const next = options[(currentIdx + 1) % options.length];
      setPerspective(next);
      setToast({ message: `Switched to ${next} View`, type: 'info' });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if ((e.target as HTMLElement).closest('.overscroll-contain')) return;
    const delta = -e.deltaY * 0.001;
    setTransform(prev => ({ ...prev, k: Math.min(Math.max(1, prev.k + delta), 20) }));
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setStartPan({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform(prev => ({ ...prev, x: e.clientX - startPan.x, y: e.clientY - startPan.y }));
  };
  const handleMouseUp = () => setIsDragging(false);
  const handleTouchStart = (e: React.TouchEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
      if (e.touches.length === 1) {
          setIsDragging(true);
          const t = e.touches[0];
          setStartPan({ x: t.clientX - transform.x, y: t.clientY - transform.y });
      } else if (e.touches.length === 2) {
          setIsDragging(false);
          const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
          lastTouchRef.current = { dist, center: { x: 0, y: 0 } };
      }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
      if (e.touches.length === 1 && isDragging) {
          setTransform(prev => ({ ...prev, x: e.touches[0].clientX - startPan.x, y: e.touches[0].clientY - startPan.y }));
      } else if (e.touches.length === 2 && lastTouchRef.current) {
          const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
          const scaleFactor = dist / lastTouchRef.current.dist;
          setTransform(prev => ({ ...prev, k: Math.min(Math.max(1, prev.k * scaleFactor), 20) }));
          lastTouchRef.current = { dist, center: { x: 0, y: 0 } };
      }
  };
  const handleTouchEnd = () => setIsDragging(false);

  const activeMarkerData = MARKERS.find(m => m.id === activeMarkerId);

  // Merge static marker data with live fetched weather data
  const popupData = activeMarkerData ? {
      id: activeMarkerData.id,
      title: `${activeMarkerData.category} Alert in ${activeMarkerData.locationName}`,
      source: "Global Weather Network",
      time: "Live Update",
      type: liveWeatherData ? liveWeatherData.type : activeMarkerData.type,
      imageUrl: `https://picsum.photos/seed/${activeMarkerData.id}/400/200`,
      // Enriched Data
      temp: liveWeatherData ? liveWeatherData.temp : activeMarkerData.temp,
      humidity: liveWeatherData ? liveWeatherData.humidity : activeMarkerData.humidity,
      wind: liveWeatherData ? liveWeatherData.wind : activeMarkerData.wind
  } : null;

  return (
    <div 
        className="relative w-full h-full bg-[#050505] overflow-hidden group select-none touch-none"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ perspective: '1000px' }}
    >
       {/* LIVE RADAR INDICATOR */}
       <div className="absolute top-24 left-4 z-20 flex flex-col gap-2 pointer-events-none">
           <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-in slide-in-from-left-4 fade-in duration-700">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-[10px] font-black text-red-100 tracking-widest uppercase flex items-center gap-1">
                  LIVE RADAR <Radio size={10} />
              </span>
           </div>
       </div>

       <div className="absolute inset-0 bg-radial-gradient from-blue-900/10 via-black to-black pointer-events-none z-0 animate-[pulse_8s_infinite] opacity-50"></div>
       
       {toast && (
           <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs px-4">
               <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
           </div>
       )}

       {!isOnline && (
           <div className="absolute top-32 left-1/2 -translate-x-1/2 z-30 bg-black/80 text-gray-300 px-4 py-1.5 rounded-full border border-gray-700 flex items-center gap-2 text-xs font-bold animate-in fade-in">
               <WifiOff size={14} /> Offline Weather Mode
           </div>
       )}

       <MapSmartInsights />

       {isCompareMode && (
           <MapComparisonOverlay 
              itemA={null} itemB={null}
              onClose={() => { setIsCompareMode(false); setCompareSelection([]); }}
           />
       )}

       {(showAIAnalysis || activeZone) && (
           <MapAIOverlay 
              region={activeZone?.region || "Weather System"}
              summary={activeZone?.summary || "High intensity storm cell detected. Pressure dropping significantly."}
              momentum={activeZone?.momentum || "High"}
              sentiment={activeZone?.sentiment || "Tense"}
              stats={[{ label: 'Pressure', value: '980 hPa', icon: TrendingUp }, { label: 'Wind', value: '120 km/h', icon: Wind }]}
              categories={[{ label: 'Rain', percentage: 80, color: '#3b82f6' }, { label: 'Wind', percentage: 60, color: '#6366f1' }]}
              onClose={() => { setShowAIAnalysis(false); setActiveZone(null); }}
           />
       )}

      <div 
        className={`w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing ${isDragging ? 'cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => { if (!isDragging) { setActiveMarkerId(null); setShowAIAnalysis(false); setActiveZone(null); } }}
        style={{
            transformStyle: 'preserve-3d',
            transform: viewMode === '3d' ? 'rotateX(30deg) scale(1.1)' : 'rotateX(0deg)',
            transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
      >
        <div 
            className={`relative w-full max-w-[1400px] aspect-[2/1] ease-out origin-center will-change-transform ${isFlying ? 'transition-transform duration-1000' : 'transition-transform duration-75'}`}
            style={{ 
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
                transformStyle: 'preserve-3d'
            }}
        >
           {/* Map Layer with Smooth Transition */}
           <div className="absolute inset-0 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-[#050505]">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/c/cd/Land_ocean_ice_2048.jpg" 
                    className={`absolute inset-0 w-full h-full object-cover filter contrast-125 brightness-75 grayscale-[20%] transition-opacity duration-1000 ${mapLayer === 'satellite' ? 'opacity-60' : 'opacity-0'}`}
                    alt="Satellite Map"
                    draggable={false}
                    onError={() => setMapError(true)}
                />
                
                <div className={`absolute inset-0 bg-[#0a0a0a] transition-opacity duration-1000 ${mapLayer === 'schematic' ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                    <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center invert filter"></div>
                </div>

                <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/80 pointer-events-none"></div>
           </div>
           
           {isOnline && (
                <div style={{ transform: 'translateZ(1px)' }}>
                    <HeatmapLayer 
                        markers={filteredMarkers} 
                        visible={showHeatmap} 
                        mode={'intensity'}
                        onZoneClick={setActiveZone}
                        zoomLevel={transform.k}
                    />
                </div>
           )}

           {isMapReady && filteredMarkers.map((marker, index) => (
             <LocationMarker
               key={marker.id}
               x={marker.x}
               y={marker.y}
               type={marker.type as MarkerType}
               title={marker.title}
               subtitle={marker.subtitle}
               category={marker.category}
               source={marker.source}
               isActive={activeMarkerId === marker.id}
               isCompareSelected={compareSelection.includes(marker.id)}
               isCompareMode={isCompareMode}
               zoomLevel={transform.k}
               detailLevel={marker.detailLevel as DetailLevel}
               onClick={() => handleMarkerClick(marker)}
               delay={index * 50}
               viewMode={viewMode}
               perspective={perspective}
               mapLayer={mapLayer}
               temp={marker.temp}
             />
           ))}
        </div>
      </div>

      {showTimeline && !isCompareMode && isOnline && (
          <TimeScrubber 
            value={timeValue}
            onChange={setTimeValue}
            isPlaying={isPlayingHistory}
            onTogglePlay={() => setIsPlayingHistory(!isPlayingHistory)}
            onClose={() => setShowTimeline(false)}
          />
      )}

      {/* Enhanced Popup for Weather News with Real Data */}
      {activeMarkerId && !isCompareMode && popupData && (
          <NewsPopup 
            data={popupData}
            onClose={() => setActiveMarkerId(null)}
            onRead={(id) => navigate(`/news/${id}`)}
          />
      )}

      <MapToolbar 
        onZoomIn={handleZoomIn} 
        onZoomOut={handleZoomOut} 
        onRecenter={handleRecenter}
        onLocateMe={() => {}}
        onToggleCompare={() => { if (isCompareMode) setCompareSelection([]); setIsCompareMode(!isCompareMode); }}
        isCompareMode={isCompareMode}
        viewMode={viewMode}
        onToggleView={() => setViewMode(prev => prev === '2d' ? '3d' : '2d')}
        mapLayer={mapLayer}
        onToggleLayer={() => setMapLayer(prev => prev === 'satellite' ? 'schematic' : 'satellite')}
        onSwitchPerspective={handlePerspectiveChange}
        currentPerspective={perspective}
      />
    </div>
  );
};

export default WorldMap;
