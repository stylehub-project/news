
import React, { useState, useRef, useMemo, useEffect } from 'react';
import LocationMarker, { MarkerType, DetailLevel } from './LocationMarker';
import MapNewsSheet from './MapNewsSheet';
import MapToolbar from './MapToolbar';
import MapAIOverlay from './MapAIOverlay';
import HeatmapLayer from './HeatmapLayer';
import TimeScrubber from './TimeScrubber';
import MapComparisonOverlay from './MapComparisonOverlay';
import MapSmartInsights from './MapSmartInsights';
import { TrendingUp, Wind, CloudRain, Thermometer } from 'lucide-react';
import Toast from '../ui/Toast';
import { useNetwork } from '../../context/NetworkContext';
import { useNavigate } from 'react-router-dom';
import { getLiveWeather } from '../../utils/weatherService';
import { MapFilters } from './MapFilterPanel';
import { WeatherLayerType } from '../../app/map/index';

// W3 - Location-Based Weather News Markers
export const MARKERS = [
  { id: 'in_delhi', x: 68.5, y: 40, lat: 28.6139, lng: 77.2090, type: 'severe', title: 'Delhi', category: 'Heat', locationName: 'New Delhi', minZoom: 2, maxZoom: 20, impactRadius: 15, momentum: 'High', sentiment: 'Negative', detailLevel: 'city', temp: '45°C', wind: '10 km/h', humidity: '15%', precip: '0%' },
  { id: 'in_mumbai', x: 67.2, y: 45, lat: 19.0760, lng: 72.8777, type: 'warning', title: 'Mumbai', category: 'Rain', locationName: 'Mumbai', minZoom: 2, maxZoom: 20, impactRadius: 20, momentum: 'Medium', sentiment: 'Neutral', detailLevel: 'city', temp: '29°C', wind: '45 km/h', humidity: '88%', precip: '120mm' },
  { id: 'jp_tokyo', x: 82, y: 38, lat: 35.6762, lng: 139.6503, type: 'severe', title: 'Tokyo', category: 'Storm', locationName: 'Tokyo', minZoom: 2, maxZoom: 20, impactRadius: 25, momentum: 'High', sentiment: 'Tense', detailLevel: 'city', temp: '22°C', wind: '95 km/h', humidity: '80%', precip: '200mm' },
  { id: 'us_nyc', x: 22, y: 38, lat: 40.7128, lng: -74.0060, type: 'warning', title: 'NYC', category: 'Snow', locationName: 'New York', minZoom: 2, maxZoom: 20, impactRadius: 15, momentum: 'Medium', sentiment: 'Neutral', detailLevel: 'city', temp: '-5°C', wind: '30 km/h', humidity: '60%', precip: '10cm' },
  { id: 'uk_ldn', x: 48, y: 28, lat: 51.5074, lng: -0.1278, type: 'general', title: 'London', category: 'Cloud', locationName: 'London', minZoom: 2, maxZoom: 20, impactRadius: 10, momentum: 'Low', sentiment: 'Positive', detailLevel: 'city', temp: '14°C', wind: '20 km/h', humidity: '70%', precip: '5mm' },
  { id: 'au_syd', x: 88, y: 75, lat: -33.8688, lng: 151.2093, type: 'general', title: 'Sydney', category: 'Sun', locationName: 'Sydney', minZoom: 2, maxZoom: 20, impactRadius: 12, momentum: 'Low', sentiment: 'Positive', detailLevel: 'city', temp: '26°C', wind: '15 km/h', humidity: '50%', precip: '0%' },
];

interface WorldMapProps {
    filters: MapFilters;
    onResetFilters: () => void;
    activeLayer: WeatherLayerType;
    flyToLocation?: { x: number, y: number, k: number } | null;
    isAudioMode?: boolean;
}

const WorldMap: React.FC<WorldMapProps> = ({ filters, onResetFilters, activeLayer, flyToLocation, isAudioMode }) => {
  const navigate = useNavigate();
  const { isOnline } = useNetwork();
  
  // W1 - Smooth Zoom & Pan
  const [transform, setTransform] = useState({ x: -550, y: 80, k: 5.5 }); 
  const [isDragging, setIsDragging] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isMapReady, setIsMapReady] = useState(false);
  
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
  const [timeValue, setTimeValue] = useState(0); 
  const [isPlayingHistory, setIsPlayingHistory] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);
  
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [activeZone, setActiveZone] = useState<any>(null); 
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  const [toast, setToast] = useState<{message: string, type: 'error'|'info'}|null>(null);
  const lastTouchRef = useRef<{ dist: number; center: { x: number; y: number } } | null>(null);

  // Live Weather Fetching
  const [liveWeatherData, setLiveWeatherData] = useState<any>(null);

  useEffect(() => {
      setTimeout(() => setIsMapReady(true), 100);
  }, []);

  // W6 - Time Slider Animation Logic
  useEffect(() => {
      let interval: any;
      if (isPlayingHistory) {
          interval = setInterval(() => {
              setTimeValue(prev => {
                  if (prev >= 2) return 0;
                  return prev + 0.05;
              });
          }, 100);
      }
      return () => clearInterval(interval);
  }, [isPlayingHistory]);

  // Handle Fly To
  useEffect(() => {
      if (flyToLocation) {
          setIsFlying(true);
          setTransform(prev => ({ ...prev, x: flyToLocation.x, y: flyToLocation.y, k: flyToLocation.k }));
          setTimeout(() => setIsFlying(false), 1200); 
      }
  }, [flyToLocation]);

  const handleMarkerClick = async (marker: any) => {
      if (isDragging) return;
      setActiveMarkerId(marker.id);
      setLiveWeatherData(null);
      
      // Fetch real data
      if (marker.lat && marker.lng && isOnline) {
          const weather = await getLiveWeather(marker.lat, marker.lng);
          if (weather) setLiveWeatherData(weather);
      }
  };

  const filteredMarkers = useMemo(() => {
      return MARKERS.filter(m => {
          if (filters.category !== 'All' && m.category !== filters.category) return false;
          // Filter by active layer context if needed, or show all relevant
          return true;
      });
  }, [filters, activeLayer]);

  // Touch & Mouse Handlers (Pinch Zoom / Pan)
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

  const activeMarkerData = MARKERS.find(m => m.id === activeMarkerId);
  
  // W4 - Weather News Card Data
  const popupData = activeMarkerData ? {
      id: activeMarkerData.id,
      title: liveWeatherData ? `${liveWeatherData.category} Alert in ${activeMarkerData.locationName}` : `${activeMarkerData.category} Alert`,
      source: "Global Weather Network",
      time: "Live Update",
      type: liveWeatherData ? liveWeatherData.type : activeMarkerData.type,
      imageUrl: `https://picsum.photos/seed/${activeMarkerData.id}/600/400`,
      temp: liveWeatherData ? liveWeatherData.temp : activeMarkerData.temp,
      wind: liveWeatherData ? liveWeatherData.wind : activeMarkerData.wind,
      humidity: liveWeatherData ? liveWeatherData.humidity : activeMarkerData.humidity,
      precip: liveWeatherData ? liveWeatherData.precip : activeMarkerData.precip,
      description: "Severe weather patterns detected in this region. AI analysis suggests potential impact on local transport and infrastructure over the next 24 hours.",
      locationName: activeMarkerData.locationName,
      category: activeMarkerData.category
  } : null;

  return (
    <div 
        className="relative w-full h-full bg-[#050505] overflow-hidden select-none touch-none"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
        style={{ perspective: '1000px' }}
    >
       {toast && <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50"><Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} /></div>}

       <MapSmartInsights />

       {isCompareMode && <MapComparisonOverlay itemA={null} itemB={null} onClose={() => setIsCompareMode(false)} />}

       {(showAIAnalysis || activeZone) && (
           <MapAIOverlay 
              region={activeZone?.mainCategory || "Weather System"}
              summary="High intensity cell detected. Pressure dropping."
              momentum="High"
              sentiment="Tense"
              stats={[
                  { label: 'Pressure', value: '980 hPa', icon: TrendingUp }, 
                  { label: 'Wind', value: '120 km/h', icon: Wind }
              ]}
              categories={[{ label: 'Risk', percentage: 85, color: '#ef4444' }]}
              onClose={() => { setShowAIAnalysis(false); setActiveZone(null); }}
           />
       )}

       <div 
            className={`relative w-full max-w-[1400px] aspect-[2/1] ease-out origin-center will-change-transform ${isFlying ? 'transition-transform duration-1000' : 'transition-transform duration-75'}`}
            style={{ 
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k}) ${viewMode === '3d' ? 'rotateX(20deg)' : ''}`,
                transformStyle: 'preserve-3d'
            }}
       >
           {/* W1 - Satellite Map Layer */}
           <div className="absolute inset-0 rounded-lg overflow-hidden bg-[#050505] shadow-2xl">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/c/cd/Land_ocean_ice_2048.jpg" 
                    className="absolute inset-0 w-full h-full object-cover filter contrast-125 brightness-[0.4] grayscale-[30%]"
                    alt="Satellite Map"
                    draggable={false}
                />
                <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay"></div>
           </div>
           
           {/* W2 - Weather Layers (Heatmap visualization) */}
           {isOnline && (
                <div style={{ transform: 'translateZ(1px)' }}>
                    <HeatmapLayer 
                        markers={filteredMarkers} 
                        visible={true}
                        mode={activeLayer === 'Temp' || activeLayer === 'Heat' ? 'intensity' : 'sentiment'} // Reuse sentiment logic for 'cool' colors
                        weatherLayer={activeLayer}
                        onZoneClick={setActiveZone}
                        zoomLevel={transform.k}
                    />
                </div>
           )}

           {/* W3 - Smart Markers */}
           {isMapReady && filteredMarkers.map((marker, index) => (
             <LocationMarker
               key={marker.id}
               x={marker.x}
               y={marker.y}
               type={marker.type as MarkerType}
               title={marker.title}
               category={marker.category}
               temp={marker.temp}
               isActive={activeMarkerId === marker.id}
               zoomLevel={transform.k}
               onClick={() => handleMarkerClick(marker)}
               delay={index * 50}
               viewMode={viewMode}
               activeLayer={activeLayer}
             />
           ))}
       </div>

       {/* W6 - Time Slider */}
       {showTimeline && !isCompareMode && isOnline && (
          <TimeScrubber 
            value={timeValue}
            onChange={setTimeValue}
            isPlaying={isPlayingHistory}
            onTogglePlay={() => setIsPlayingHistory(!isPlayingHistory)}
            onClose={() => setShowTimeline(false)}
          />
       )}

       {/* W4 - Weather News Card */}
       <MapNewsSheet 
          isOpen={!!activeMarkerId}
          onClose={() => setActiveMarkerId(null)}
          data={popupData}
       />

       {/* W2 - Toolbar */}
       <MapToolbar 
          onZoomIn={() => setTransform(prev => ({ ...prev, k: Math.min(prev.k * 1.5, 20) }))}
          onZoomOut={() => setTransform(prev => ({ ...prev, k: Math.max(prev.k / 1.5, 1) }))}
          onRecenter={() => setTransform({ x: -180, y: -120, k: 2.5 })}
          viewMode={viewMode}
          onToggleView={() => setViewMode(prev => prev === '2d' ? '3d' : '2d')}
       />
    </div>
  );
};

export default WorldMap;
