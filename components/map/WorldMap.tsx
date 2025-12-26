
import React, { useState, useRef, useMemo, useEffect } from 'react';
import LocationMarker, { MarkerType, MapPerspective, DetailLevel } from './LocationMarker';
import MapNewsSheet from './MapNewsSheet';
import MapToolbar from './MapToolbar';
import { MapFilters } from './MapFilterPanel';
import MapAIOverlay from './MapAIOverlay';
import HeatmapLayer from './HeatmapLayer';
import TimeScrubber from './TimeScrubber';
import MapComparisonOverlay from './MapComparisonOverlay';
import MapSmartInsights from './MapSmartInsights';
import MapAudioPlayer from './MapAudioPlayer';
import { TrendingUp, AlertTriangle, Globe, WifiOff, Maximize, ZoomIn } from 'lucide-react';
import Toast from '../ui/Toast';

// 10.14 Hierarchical Data Structure
// Coordinates (x,y) are relative % on the map image
export const MARKERS = [
  // --- LEVEL 1: GLOBAL CLUSTERS (Zoom 1 - 3.5) ---
  { id: 'g_asia', x: 70, y: 45, type: 'trending', title: 'Asia: Tech Surge', category: 'Tech', locationName: 'Asia', minZoom: 1, maxZoom: 3.5, impactRadius: 15, momentum: 'High', sentiment: 'Positive', detailLevel: 'cluster' },
  { id: 'g_eu', x: 48, y: 28, type: 'general', title: 'Europe: Policy Shift', category: 'Politics', locationName: 'Europe', minZoom: 1, maxZoom: 3.5, impactRadius: 12, momentum: 'Medium', sentiment: 'Neutral', detailLevel: 'cluster' },
  { id: 'g_usa', x: 22, y: 38, type: 'breaking', title: 'North America: Market Alert', category: 'Business', locationName: 'North America', minZoom: 1, maxZoom: 3.5, impactRadius: 14, momentum: 'High', sentiment: 'Tense', detailLevel: 'cluster' },

  // --- LEVEL 2: REGIONAL/STATE (Zoom 3.5 - 6) ---
  // India Regions
  { id: 'r_in_north', x: 68.5, y: 38, type: 'breaking', title: 'North India: Climate Emergency', category: 'Environment', locationName: 'North India', minZoom: 3.5, maxZoom: 6, impactRadius: 10, momentum: 'High', sentiment: 'Tense', detailLevel: 'region' },
  { id: 'r_in_west', x: 67, y: 46, type: 'trending', title: 'Maharashtra: Investment Hub', category: 'Business', locationName: 'Maharashtra', minZoom: 3.5, maxZoom: 6, impactRadius: 9, momentum: 'High', sentiment: 'Positive', detailLevel: 'region' },
  { id: 'r_in_south', x: 70, y: 50, type: 'general', title: 'Karnataka: Startups', category: 'Tech', locationName: 'Karnataka', minZoom: 3.5, maxZoom: 6, impactRadius: 8, momentum: 'Medium', sentiment: 'Positive', detailLevel: 'region' },
  { id: 'r_in_south_east', x: 71, y: 48, type: 'general', title: 'Tamil Nadu: Manufacturing', category: 'Business', locationName: 'Tamil Nadu', minZoom: 3.5, maxZoom: 6, impactRadius: 8, momentum: 'Medium', sentiment: 'Positive', detailLevel: 'region' },
  { id: 'r_in_east', x: 73, y: 42, type: 'breaking', title: 'Bengal: Cultural Fest', category: 'Entertainment', locationName: 'West Bengal', minZoom: 3.5, maxZoom: 6, impactRadius: 7, momentum: 'High', sentiment: 'Positive', detailLevel: 'region' },
  
  // Global Regions
  { id: 'r_us_east', x: 24, y: 39, type: 'breaking', title: 'US East Coast: Finance', category: 'Business', locationName: 'East Coast', minZoom: 3.5, maxZoom: 6, impactRadius: 8, momentum: 'High', sentiment: 'Tense', detailLevel: 'region' },
  { id: 'r_jp_kanto', x: 80, y: 40, type: 'trending', title: 'Kanto Region: Robotics', category: 'Tech', locationName: 'Japan', minZoom: 3.5, maxZoom: 6, impactRadius: 7, momentum: 'Medium', sentiment: 'Positive', detailLevel: 'region' },

  // --- LEVEL 3: CITY (Zoom 6 - 9) ---
  { id: 'c_delhi', x: 68.5, y: 41, type: 'breaking', title: 'New Delhi: Air Quality Index hits 450', source: 'NDTV', time: '10m ago', timestamp: 0.1, category: 'Environment', locationName: 'New Delhi', minZoom: 6, maxZoom: 9, impactRadius: 6, momentum: 'High', sentiment: 'Negative', detailLevel: 'city' },
  { id: 'c_mumbai', x: 67.2, y: 46, type: 'trending', title: 'Mumbai: Sensex Crosses 75k', source: 'Mint', time: '1h ago', timestamp: 0.2, category: 'Business', locationName: 'Mumbai', minZoom: 6, maxZoom: 9, impactRadius: 7, momentum: 'High', sentiment: 'Positive', detailLevel: 'city' },
  { id: 'c_blr', x: 69.5, y: 49, type: 'general', title: 'Bengaluru: AI Summit 2025', source: 'TechCrunch', time: '3h ago', timestamp: 0.3, category: 'Tech', locationName: 'Bengaluru', minZoom: 6, maxZoom: 9, impactRadius: 5, momentum: 'Medium', sentiment: 'Positive', detailLevel: 'city' },
  { id: 'c_hyd', x: 69.8, y: 47, type: 'trending', title: 'Hyderabad: BioAsia Summit', source: 'TelanganaToday', time: '2h ago', timestamp: 0.15, category: 'Science', locationName: 'Hyderabad', minZoom: 6, maxZoom: 9, impactRadius: 6, momentum: 'High', sentiment: 'Positive', detailLevel: 'city' },
  { id: 'c_chennai', x: 70.5, y: 49.5, type: 'general', title: 'Chennai: Chess Olympiad', source: 'TheHindu', time: '5h ago', timestamp: 0.25, category: 'Sports', locationName: 'Chennai', minZoom: 6, maxZoom: 9, impactRadius: 5, momentum: 'Medium', sentiment: 'Neutral', detailLevel: 'city' },
  { id: 'c_kolkata', x: 73.2, y: 43.5, type: 'general', title: 'Kolkata: Metro Expansion', source: 'Telegraph', time: '12h ago', timestamp: 0.4, category: 'Business', locationName: 'Kolkata', minZoom: 6, maxZoom: 9, impactRadius: 6, momentum: 'Medium', sentiment: 'Positive', detailLevel: 'city' },
  { id: 'c_pune', x: 67.5, y: 46.5, type: 'trending', title: 'Pune: EV Startups Rise', source: 'PuneMirror', time: '1h ago', timestamp: 0.1, category: 'Tech', locationName: 'Pune', minZoom: 6, maxZoom: 9, impactRadius: 5, momentum: 'High', sentiment: 'Positive', detailLevel: 'city' },
  
  { id: 'c_nyc', x: 22, y: 38, type: 'breaking', title: 'NYC: UN General Assembly', source: 'Reuters', time: '10m ago', timestamp: 0.1, category: 'Politics', locationName: 'New York', minZoom: 6, maxZoom: 9, impactRadius: 8, momentum: 'High', sentiment: 'Neutral', detailLevel: 'city' },

  // --- LEVEL 4: STREET/LOCAL (Zoom 9+) ---
  // Using slightly offset coordinates to simulate "drilling down" into the city
  { id: 's_del_cp', x: 68.52, y: 41.02, type: 'breaking', title: 'Connaught Place: Traffic Advisory due to Protest', subtitle: 'Heavy congestion reported near inner circle. Police advising alternate routes.', source: 'TrafficAlert', time: '5m ago', timestamp: 0.05, category: 'Politics', locationName: 'Connaught Place', minZoom: 9, maxZoom: 20, impactRadius: 3, momentum: 'High', sentiment: 'Negative', detailLevel: 'street' },
  { id: 's_mum_bkc', x: 67.22, y: 46.02, type: 'trending', title: 'BKC: Apple Store Opening Queue', subtitle: 'Thousands gathered overnight for the new flagship store launch. Tim Cook expected to visit.', source: 'LocalNews', time: '30m ago', timestamp: 0.1, category: 'Tech', locationName: 'Bandra Kurla Complex', minZoom: 9, maxZoom: 20, impactRadius: 4, momentum: 'High', sentiment: 'Positive', detailLevel: 'street' },
  { id: 's_hyd_hitech', x: 69.82, y: 47.02, type: 'trending', title: 'Hitech City: 5G Lab Launch', subtitle: 'New innovation center opens.', source: 'TechNews', time: '30m ago', timestamp: 0.1, category: 'Tech', locationName: 'Hitech City', minZoom: 9, maxZoom: 20, impactRadius: 4, momentum: 'High', sentiment: 'Positive', detailLevel: 'street' },
  { id: 's_blr_koramangala', x: 69.52, y: 49.02, type: 'breaking', title: 'Koramangala: Food Fest', subtitle: 'Huge crowds expected.', source: 'WhatsUpBlr', time: '10m ago', timestamp: 0.05, category: 'Entertainment', locationName: 'Koramangala', minZoom: 9, maxZoom: 20, impactRadius: 3, momentum: 'Medium', sentiment: 'Positive', detailLevel: 'street' },
  { id: 's_nyc_wall', x: 22.02, y: 38.02, type: 'general', title: 'Wall St: Opening Bell Ceremony', subtitle: 'Tech sector leads early gains as trading begins.', source: 'Bloomberg', time: '15m ago', timestamp: 0.1, category: 'Business', locationName: 'Wall Street', minZoom: 9, maxZoom: 20, impactRadius: 4, momentum: 'Medium', sentiment: 'Positive', detailLevel: 'street' },
];

interface WorldMapProps {
    filters: MapFilters;
    onResetFilters: () => void;
    showHeatmap?: boolean;
    flyToLocation?: { x: number, y: number, k: number } | null;
    isAudioMode?: boolean;
}

const WorldMap: React.FC<WorldMapProps> = ({ filters, onResetFilters, showHeatmap = true, flyToLocation, isAudioMode = false }) => {
  // View State - Initialized to focus on India
  const [transform, setTransform] = useState({ x: -550, y: 80, k: 5.5 }); 
  const [isDragging, setIsDragging] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isMapReady, setIsMapReady] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'error' | 'info'} | null>(null);
  const [mapError, setMapError] = useState(false);
  
  // Touch State
  const lastTouchRef = useRef<{ dist: number; center: { x: number; y: number } } | null>(null);
  
  // Modes
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
  const [mapLayer, setMapLayer] = useState<'satellite' | 'schematic'>('satellite');
  const [perspective, setPerspective] = useState<MapPerspective>('Standard');
  
  // Interaction State
  const [timeValue, setTimeValue] = useState(0); 
  const [isPlayingHistory, setIsPlayingHistory] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);
  
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [activeZone, setActiveZone] = useState<any>(null); 
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);

  // Audio State
  const [audioSpeed, setAudioSpeed] = useState(1.0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioRegion, setAudioRegion] = useState("Global System");
  const [audioSummary, setAudioSummary] = useState("Monitoring feed...");
  const audioIdleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Zoom Level Label for UI logic (Internal use only, display removed)
  const currentLevelLabel = useMemo(() => {
      if (transform.k < 3.5) return "Orbit View (Global)";
      if (transform.k < 6) return "Regional View";
      if (transform.k < 9) return "City View";
      return "Tactical View (Street)";
  }, [transform.k]);

  useEffect(() => {
      const timer = setTimeout(() => setIsMapReady(true), 100);
      return () => clearTimeout(timer);
  }, []);

  // Update Visible Bounds & Audio Trigger
  useEffect(() => {
      const calculateBounds = () => {
          if (isAudioMode && !isDragging && !isFlying) {
              if (audioIdleTimer.current) clearTimeout(audioIdleTimer.current);
              audioIdleTimer.current = setTimeout(triggerAudioUpdate, 1500); 
          }
      };
      
      calculateBounds();
      return () => { if (audioIdleTimer.current) clearTimeout(audioIdleTimer.current); };
  }, [transform, isDragging, isFlying, isAudioMode]);

  const triggerAudioUpdate = () => {
      if (!isAudioMode) return;
      const randomActive = filteredMarkers[Math.floor(Math.random() * filteredMarkers.length)];
      if (randomActive) {
          setAudioRegion(randomActive.locationName);
          setAudioSummary(`Activity detected: ${randomActive.title}. Level: ${currentLevelLabel}.`);
          setIsAudioPlaying(true);
          speak(randomActive.title); 
      }
  };

  const speak = (text: string) => {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = audioSpeed;
      u.onend = () => setIsAudioPlaying(false);
      window.speechSynthesis.speak(u);
  };

  const handleAudioToggle = () => {
      if (isAudioPlaying) {
          window.speechSynthesis.cancel();
          setIsAudioPlaying(false);
      } else {
          speak(audioSummary);
          setIsAudioPlaying(true);
      }
  };

  // Handle Fly To Prop Change
  useEffect(() => {
      if (flyToLocation) {
          setIsFlying(true);
          setTransform(prev => ({
              ...prev,
              x: flyToLocation.x,
              y: flyToLocation.y,
              k: flyToLocation.k
          }));
          setTimeout(() => setIsFlying(false), 1200); 
      }
  }, [flyToLocation]);

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
          // 1. Zoom Level Filtering (Hierarchical Data)
          if (transform.k < m.minZoom || transform.k >= m.maxZoom) return false;

          // 2. Perspective Filtering
          if (perspective === 'Economic' && !['Business', 'Tech'].includes(m.category)) return false;
          if (perspective === 'Political' && !['Politics', 'World'].includes(m.category)) return false;
          if (perspective === 'Human' && !['Environment', 'Health', 'Entertainment'].includes(m.category)) return false;

          // 3. User Filters
          if (filters.category !== 'All' && m.category !== filters.category) return false;
          if (filters.impact !== 'All' && m.momentum !== filters.impact) return false;
          
          // State Filter Logic (Simplified for Hierarchy)
          // If zoomed out, we might show clusters regardless of exact state match to guide user
          if (filters.state !== 'All' && m.detailLevel !== 'cluster') {
              // Basic fuzzy match
              if (!m.locationName.includes(filters.state) && filters.state !== 'India') return false; 
          }

          if (filters.sentiment !== 'All' && m.sentiment !== filters.sentiment) return false;
          
          // Time Scrubber Logic (Mock timestamp)
          if (m.timestamp && (timeValue < 0.2 && m.timestamp > 0.2)) return false;
          
          return true;
      });
  }, [filters, transform.k, activeMarkerId, timeValue, compareSelection, perspective]);

  const handleZoomIn = () => setTransform(prev => ({ ...prev, k: Math.min(prev.k * 1.5, 20) }));
  const handleZoomOut = () => setTransform(prev => {
      const newK = Math.max(prev.k / 1.5, 1);
      return { ...prev, k: newK, x: newK <= 1.2 ? 0 : prev.x, y: newK <= 1.2 ? 0 : prev.y };
  });

  const handleWheel = (e: React.WheelEvent) => {
    if ((e.target as HTMLElement).closest('.overscroll-contain')) return;
    e.preventDefault();
    const scaleFactor = 0.001;
    const delta = -e.deltaY * scaleFactor;
    const newK = Math.min(Math.max(1, transform.k + delta), 20); // Max Zoom 20
    setTransform(prev => ({ ...prev, k: newK }));
  };
  
  const handleRecenter = () => {
    setIsFlying(true);
    setTransform({ x: -180, y: -120, k: 2.5 }); 
    setActiveMarkerId(null);
    setActiveZone(null);
    setShowAIAnalysis(false);
    setIsCompareMode(false);
    setCompareSelection([]);
    setShowTimeline(true);
    setTimeout(() => setIsFlying(false), 1200);
  };

  const handleLocateMe = () => {
      if ("geolocation" in navigator) {
          setToast({ message: "Aligning satellite to your location...", type: 'info' });
          setTimeout(() => {
              setIsFlying(true);
              setTransform({ x: -180, y: -120, k: 9 }); // Zoom straight to street level
              setTimeout(() => setIsFlying(false), 1200);
              setToast(null);
          }, 1000);
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

  // --- Touch Logic ---
  const getTouchDistance = (t1: React.Touch, t2: React.Touch) => {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;

      if (e.touches.length === 1) {
          setIsDragging(true);
          const t = e.touches[0];
          setStartPan({ x: t.clientX - transform.x, y: t.clientY - transform.y });
      } else if (e.touches.length === 2) {
          setIsDragging(false); // Switch to pinch
          const dist = getTouchDistance(e.touches[0], e.touches[1]);
          lastTouchRef.current = { dist, center: { x: 0, y: 0 } };
      }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (e.touches.length === 1 && isDragging) {
          const t = e.touches[0];
          setTransform(prev => ({
              ...prev,
              x: t.clientX - startPan.x,
              y: t.clientY - startPan.y
          }));
      } else if (e.touches.length === 2 && lastTouchRef.current) {
          const dist = getTouchDistance(e.touches[0], e.touches[1]);
          const scaleFactor = dist / lastTouchRef.current.dist;
          
          const newK = Math.min(Math.max(1, transform.k * scaleFactor), 20);
          
          setTransform(prev => ({ ...prev, k: newK }));
          
          lastTouchRef.current = { 
              dist, 
              center: { x: 0, y: 0 } 
          };
      }
  };

  const handleTouchEnd = () => {
      setIsDragging(false);
      lastTouchRef.current = null;
  };
  
  const handleMarkerClick = (marker: any) => {
      // If clicking a cluster/region, zoom in automatically
      if (marker.detailLevel === 'cluster' || marker.detailLevel === 'region') {
          setIsFlying(true);
          const newK = marker.detailLevel === 'cluster' ? 5 : 9;
          setTransform(prev => ({ ...prev, k: newK })); 
          setTimeout(() => setIsFlying(false), 800);
          return;
      }

      // City/Street Logic
      if (isCompareMode) {
          if (compareSelection.includes(marker.id)) {
              setCompareSelection(prev => prev.filter(mid => mid !== marker.id));
          } else if (compareSelection.length < 2) {
              setCompareSelection(prev => [...prev, marker.id]);
          }
      } else {
          setActiveMarkerId(marker.id);
          if (isAudioMode) {
              setAudioRegion(marker.locationName);
              setAudioSummary(marker.title);
              setIsAudioPlaying(true);
              speak(marker.title + ". " + (marker.subtitle || marker.category + " update."));
          }
      }
  };

  const activeMarkerData = MARKERS.find(m => m.id === activeMarkerId);

  const getComparisonData = (id: string) => {
      const m = MARKERS.find(marker => marker.id === id);
      if (!m) return null;
      return { id: m.id, name: m.locationName, sentiment: m.sentiment, volume: m.impactRadius * 1240, momentum: m.momentum };
  };

  const handlePerspectiveChange = () => {
      const options: MapPerspective[] = ['Standard', 'Economic', 'Human', 'Political'];
      const currentIdx = options.indexOf(perspective);
      setPerspective(options[(currentIdx + 1) % options.length]);
      setToast({ message: `Switched to ${options[(currentIdx + 1) % options.length]} View`, type: 'info' });
  };

  return (
    <div 
        className="relative w-full h-full bg-[#050505] overflow-hidden group select-none outline-none touch-none"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ perspective: '1000px' }}
    >
       {/* 10.13 Earth Pulse Background (Subtle animated glow) */}
       <div className="absolute inset-0 bg-radial-gradient from-indigo-900/10 via-black to-black pointer-events-none z-0 animate-[pulse_8s_infinite] opacity-50"></div>
       
       {toast && (
           <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs px-4">
               <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
           </div>
       )}

       {/* Audio Player Overlay */}
       {isAudioMode && (
           <MapAudioPlayer 
               region={audioRegion}
               summary={audioSummary}
               isPlaying={isAudioPlaying}
               onTogglePlay={handleAudioToggle}
               speed={audioSpeed}
               onSpeedChange={() => setAudioSpeed(prev => prev === 1 ? 1.5 : 1)}
           />
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
              summary={activeZone?.summary || "Significant activity detected in this sector. Conflict probability low, trade volume high."}
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
            className={`relative w-full max-w-[1400px] aspect-[2/1] ease-out origin-center will-change-transform ${isFlying ? 'transition-transform duration-1000' : 'transition-transform duration-75'}`}
            style={{ 
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
                transformStyle: 'preserve-3d',
                willChange: isDragging ? 'transform' : 'auto' 
            }}
        >
           {/* Map Layer with Fallback (10.12) */}
           {mapLayer === 'satellite' && !mapError ? (
                <div className="absolute inset-0 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-[#050505]">
                    {/* Base Satellite Texture */}
                    <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/c/cd/Land_ocean_ice_2048.jpg" 
                        className="w-full h-full object-cover opacity-60 filter contrast-125 brightness-75 grayscale-[40%]"
                        alt="Satellite Map"
                        draggable={false}
                        loading="lazy"
                        onError={() => setMapError(true)}
                    />
                    
                    {/* Vector Overlay for Sharp Borders at High Zoom */}
                    <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-overlay">
                         <img 
                            src="https://upload.wikimedia.org/wikipedia/commons/0/03/BlankMap-World6.svg"
                            className="w-full h-full object-cover filter invert drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]"
                            draggable={false}
                         />
                    </div>

                    {/* Tech Grid Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                    
                    {/* Atmosphere Glow */}
                    <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/80"></div>
                </div>
           ) : (
                <div className="absolute inset-0 bg-[#111] border border-gray-800 rounded-lg">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center invert filter"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                </div>
           )}
           
           <div style={{ transform: 'translateZ(1px)' }}>
                <HeatmapLayer 
                    markers={filteredMarkers} 
                    visible={showHeatmap} 
                    mode={perspective === 'Human' ? 'sentiment' : 'intensity'}
                    onZoneClick={setActiveZone}
                    zoomLevel={transform.k}
                />
           </div>

           {/* Empty State (10.12) */}
           {isMapReady && filteredMarkers.length === 0 && (
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20 pointer-events-none">
                   <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                       <WifiOff size={24} className="text-gray-500 mx-auto mb-2" />
                       <p className="text-xs text-gray-400 font-medium">No activity detected at this zoom level.</p>
                       <p className="text-[10px] text-gray-600 mt-1">Try zooming out or changing filters.</p>
                   </div>
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
            description: activeMarkerData.subtitle || activeMarkerData.title + ". Deep analysis available via AI Explain.",
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
        onSwitchPerspective={handlePerspectiveChange}
        currentPerspective={perspective}
      />
    </div>
  );
};

export default WorldMap;
