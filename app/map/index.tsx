
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Globe, Search, Sliders, Flame, Plus, Minus, Maximize2, 
    Box, X, Send, MessageCircle, Loader2, MapPin, RotateCw, Navigation
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { fetchNewsFeed } from '../../utils/aiService';

// Declare MapLibre global
declare var maplibregl: any;

export type WeatherLayerType = 'Storm' | 'Heat' | 'Rain' | 'Snow' | 'Wind' | 'Temp';

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]); 
  const isMountedRef = useRef(true);
  
  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNews, setActiveNews] = useState<any>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [is3D, setIs3D] = useState(false);
  const [showScanButton, setShowScanButton] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // BASE DATA
  const [newsData, setNewsData] = useState<any[]>([
    {
        id: "in-1", title: "New Tech Corridor in Bangalore", summary: "Government approves massive IT park in Whitefield.",
        type: "trending", location: { lat: 12.9716, lng: 77.5946 }, source: "Tech India", timestamp: "2h ago", category: "Technology",
        image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&q=80&w=300"
    },
    {
        id: "in-2", title: "Sensex Hits Record High", summary: "Market rally driven by banking sector.",
        type: "normal", location: { lat: 19.0760, lng: 72.8777 }, source: "Business Today", timestamp: "30m ago", category: "Business",
        image: "https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80&w=300"
    },
    {
        id: "in-3", title: "Parliament Session Begins", summary: "Key bills to be tabled in New Delhi today.",
        type: "breaking", location: { lat: 28.6139, lng: 77.2090 }, source: "National News", timestamp: "Live", category: "Politics",
        image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=300"
    },
    {
        id: "gl-1", title: "Climate Summit in Paris", summary: "World leaders discuss climate targets.",
        type: "breaking", location: { lat: 48.8566, lng: 2.3522 }, source: "Global News", timestamp: "10m ago", category: "World"
    },
    {
        id: "gl-2", title: "Quantum Processor Reveal", summary: "Silicon Valley tech giant unveils new chip.",
        type: "trending", location: { lat: 37.7749, lng: -122.4194 }, source: "TechDaily", timestamp: "2h ago", category: "Technology"
    }
  ]);

  // Initialize Map
  useEffect(() => {
    isMountedRef.current = true;
    if (mapInstanceRef.current) return;

    const loadMap = () => {
        if (!isMountedRef.current) return;
        
        if (!(window as any).maplibregl) {
            return false;
        }
        
        // Inject Custom Marker Styles
        if (!document.getElementById('map-custom-styles')) {
            const style = document.createElement('style');
            style.id = 'map-custom-styles';
            style.innerHTML = `
                .news-marker {
                    width: 32px; height: 32px; cursor: pointer; border-radius: 50%;
                    background: #3b82f6; display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2px solid white;
                    transition: transform 0.2s, background-color 0.2s;
                    font-size: 14px; color: white;
                }
                .news-marker:hover { transform: scale(1.1); z-index: 10; }
                .news-marker.breaking { background: #ef4444; animation: breaking-pulse 2s infinite; }
                .news-marker.trending { background: #f59e0b; }
                .news-marker.local { background: #10b981; width: 24px; height: 24px; }
                
                @keyframes breaking-pulse {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
            `;
            document.head.appendChild(style);
        }

        try {
            if (!mapContainerRef.current) return false;

            const map = new (window as any).maplibregl.Map({
                container: mapContainerRef.current,
                style: {
                    'version': 8,
                    'sources': {
                        'raster-tiles': {
                            'type': 'raster',
                            'tiles': ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                            'tileSize': 256,
                            'attribution': 'Tiles &copy; Esri'
                        }
                    },
                    'layers': [{ 'id': 'simple-tiles', 'type': 'raster', 'source': 'raster-tiles', 'minzoom': 0, 'maxzoom': 22 }]
                },
                center: [78.9629, 20.5937],
                zoom: 3.5,
                pitch: 0,
                bearing: 0,
                attributionControl: false
            });

            map.on('click', () => setActiveNews(null));
            map.on('load', () => {
                if (isMountedRef.current) {
                    setIsMapLoading(false);
                    updateMarkers(newsData);
                }
            });
            
            // Show Scan Button on Move
            map.on('moveend', () => {
                if (isMountedRef.current) setShowScanButton(true);
            });

            // Dynamic Density on Zoom
            map.on('zoomend', () => {
                // Logic to show/hide smaller markers could go here
                // For now, we rely on Scan Button to fetch more data
            });
            
            mapInstanceRef.current = map;
            return true;
        } catch (e) {
            console.error("Map Init Error", e);
            if (isMountedRef.current) {
                setMapError("Failed to initialize map engine.");
                setIsMapLoading(false);
            }
            return true; 
        }
    };

    const checkInterval = setInterval(() => {
        if (loadMap()) clearInterval(checkInterval);
    }, 300);
    
    return () => {
        isMountedRef.current = false;
        clearInterval(checkInterval);
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
  }, []);

  // Update Markers
  const updateMarkers = (data: any[]) => {
      if (!mapInstanceRef.current) return;

      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      data.forEach((item: any) => {
          const el = document.createElement('div');
          el.className = `news-marker ${item.type}`;
          // Use icon based on category or type
          el.innerHTML = item.type === 'breaking' ? '⚡' : item.type === 'trending' ? '🔥' : '📰';
          
          el.addEventListener('click', (e) => {
              e.stopPropagation();
              mapInstanceRef.current.flyTo({ center: [item.location.lng, item.location.lat], zoom: 7, speed: 1.2, curve: 1.2 });
              setActiveNews(item);
          });

          const marker = new (window as any).maplibregl.Marker({ element: el })
              .setLngLat([item.location.lng, item.location.lat])
              .addTo(mapInstanceRef.current);
          
          markersRef.current.push(marker);
      });
  };

  // Search Filter
  useEffect(() => {
      if (searchQuery.trim()) {
          const lowerQuery = searchQuery.toLowerCase();
          const filtered = newsData.filter(item => 
              item.title.toLowerCase().includes(lowerQuery) ||
              item.category.toLowerCase().includes(lowerQuery) ||
              item.source.toLowerCase().includes(lowerQuery)
          );
          updateMarkers(filtered);
      } else {
          updateMarkers(newsData);
      }
  }, [searchQuery, newsData]);

  // Scan Logic
  const handleScanArea = async () => {
      if (!mapInstanceRef.current) return;
      setIsScanning(true);
      setShowScanButton(false);

      const center = mapInstanceRef.current.getCenter();
      const zoom = mapInstanceRef.current.getZoom();
      
      // Simulate Fetching Local News
      setTimeout(() => {
          const newMarkers = [];
          const count = zoom > 6 ? 5 : 2; // More markers if zoomed in
          
          for (let i = 0; i < count; i++) {
              newMarkers.push({
                  id: `local-${Date.now()}-${i}`,
                  title: `Local Update #${i+1}`,
                  summary: "Community event and local developments reported in this area.",
                  type: zoom > 8 ? "local" : "normal",
                  location: {
                      lat: center.lat + (Math.random() - 0.5) * (10 / zoom),
                      lng: center.lng + (Math.random() - 0.5) * (10 / zoom)
                  },
                  source: "Local Source",
                  timestamp: "Just now",
                  category: "Local"
              });
          }
          
          const updatedData = [...newsData, ...newMarkers];
          setNewsData(updatedData);
          updateMarkers(updatedData);
          setIsScanning(false);
      }, 1500);
  };

  // Controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleRecenter = () => mapInstanceRef.current?.flyTo({ center: [78.9629, 20.5937], zoom: 4 });
  const handleToggle3D = () => {
      const map = mapInstanceRef.current;
      if (!map) return;
      const targetPitch = map.getPitch() < 30 ? 60 : 0;
      map.easeTo({ pitch: targetPitch, duration: 1000 });
      setIs3D(targetPitch > 0);
  };

  return (
    <div className="relative w-full h-full bg-[#0f172a] overflow-hidden font-sans text-white">
        
        {/* Top Nav - High Z-Index to stay above map */}
        <div className="absolute top-4 left-4 right-4 z-50 flex items-center gap-3 pointer-events-none">
            {/* Search Bar Container */}
            <div className="flex-1 max-w-md h-[50px] bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex items-center px-4 pointer-events-auto">
                <button onClick={() => navigate(-1)} className="mr-3 text-gray-400 hover:text-white transition-colors">
                    <Globe size={20} />
                </button>
                <Search size={18} className="text-gray-400 mr-2 shrink-0" />
                <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-gray-400 font-medium h-full"
                    placeholder="Search cities, topics..." 
                />
                {searchQuery && <button onClick={() => setSearchQuery('')}><X size={16} className="text-gray-400" /></button>}
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 pointer-events-auto">
                <button className="h-[50px] w-[50px] bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center justify-center hover:bg-gray-800 transition-colors">
                    <Sliders size={20} />
                </button>
            </div>
        </div>

        {/* Scan Area Button */}
        {(showScanButton || isScanning) && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
                <button 
                    onClick={handleScanArea}
                    disabled={isScanning}
                    className="bg-white text-blue-600 px-5 py-2 rounded-full font-bold text-xs shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-80"
                >
                    {isScanning ? (
                        <> <Loader2 size={14} className="animate-spin" /> Scanning... </>
                    ) : (
                        <> <RotateCw size={14} /> Scan this area </>
                    )}
                </button>
            </div>
        )}

        {/* Map Canvas */}
        <div className="absolute inset-0 z-0 bg-black">
            {isMapLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                    <div className="text-center">
                        <Loader2 size={32} className="text-blue-500 animate-spin mx-auto mb-2" />
                        <p className="text-xs text-gray-400 uppercase tracking-widest">Initializing Satellite Link...</p>
                    </div>
                </div>
            )}
            <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* Right Controls - Positioned above Bottom Nav */}
        <div className="absolute right-4 bottom-24 flex flex-col gap-3 z-30 pointer-events-auto">
            <button onClick={handleRecenter} className="w-12 h-12 bg-gray-900/80 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-gray-800 shadow-lg transition-colors"><Navigation size={20} /></button>
            <button onClick={handleToggle3D} className={`w-12 h-12 bg-gray-900/80 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center text-white font-bold text-xs hover:bg-gray-800 shadow-lg transition-colors ${is3D ? 'text-blue-400' : ''}`}>3D</button>
            <div className="flex flex-col bg-gray-900/80 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden shadow-lg">
                <button onClick={handleZoomIn} className="w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 border-b border-white/10"><Plus size={20} /></button>
                <button onClick={handleZoomOut} className="w-12 h-12 flex items-center justify-center text-white hover:bg-white/10"><Minus size={20} /></button>
            </div>
        </div>

        {/* Bottom Sheet (Active News) - Z-Index 40 to be above controls but below nav if needed */}
        <div className={`absolute bottom-20 left-4 right-4 z-40 transition-all duration-300 ${activeNews ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0 pointer-events-none'}`}>
            {activeNews && (
                <div className="bg-gray-900/90 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-2xl text-white">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${activeNews.type === 'breaking' ? 'bg-red-600' : 'bg-blue-600'}`}>
                                {activeNews.category}
                            </span>
                            <span className="text-xs text-gray-400">{activeNews.timeAgo || activeNews.timestamp}</span>
                        </div>
                        <button onClick={() => setActiveNews(null)} className="p-1 hover:bg-white/10 rounded-full"><X size={16} /></button>
                    </div>
                    
                    <h3 className="text-lg font-bold leading-tight mb-2 pr-4">{activeNews.title}</h3>
                    
                    <div className="flex gap-3 mt-4">
                        <button onClick={() => navigate(`/news/${activeNews.id}`)} className="flex-1 bg-white text-black py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
                            Read Story
                        </button>
                        <button className="flex-1 bg-white/10 py-2.5 rounded-xl font-bold text-sm hover:bg-white/20 border border-white/10 transition-colors">
                            AI Summary
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Chat FAB */}
        <button 
            onClick={() => setChatOpen(!chatOpen)}
            className="absolute bottom-24 left-4 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl z-30 hover:scale-110 transition-transform active:scale-95 border-2 border-white/20 pointer-events-auto"
        >
            <MessageCircle size={26} />
        </button>

        {/* Chat Window */}
        <div className={`absolute bottom-40 left-4 w-[320px] max-h-[50vh] bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-3xl flex flex-col z-40 transition-all duration-300 shadow-2xl overflow-hidden ${chatOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none translate-y-10'}`}>
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <span className="font-bold text-sm flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> News Assistant</span>
                <button onClick={() => setChatOpen(false)}><X size={16} className="text-gray-400" /></button>
            </div>
            <div className="h-64 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                <div className="flex justify-start"><div className="bg-white/10 p-3 rounded-2xl rounded-tl-none text-xs leading-relaxed max-w-[90%]">Welcome to NewsMap! Ask me to find news in a city.</div></div>
            </div>
            <div className="p-3 border-t border-white/10 flex gap-2">
                <input placeholder="Type a message..." className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 text-xs text-white outline-none focus:border-blue-500 transition-colors" />
                <button className="p-2 bg-blue-600 rounded-xl text-white"><Send size={16} /></button>
            </div>
        </div>
    </div>
  );
};

export default MapPage;
