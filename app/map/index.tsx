
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Globe, Search, Sliders, Flame, Plus, Minus, Maximize2, 
    Box, X, Send, MessageCircle, Loader2, MapPin, RotateCw, Navigation,
    ArrowRight, Filter, ChevronDown, Check
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
  
  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  // Data State
  const [newsData, setNewsData] = useState<any[]>([]);

  // Coordinate Mapping for "Real" feel (Simulated Lat/Lngs for fetched news)
  const getRandomCoords = (baseLat: number, baseLng: number, spread: number) => {
      return {
          lat: baseLat + (Math.random() - 0.5) * spread,
          lng: baseLng + (Math.random() - 0.5) * spread
      };
  };

  // Initialize Map & Fetch Data
  useEffect(() => {
    isMountedRef.current = true;
    
    const init = async () => {
        if (!mapInstanceRef.current && mapContainerRef.current && (window as any).maplibregl) {
            try {
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

                map.on('click', () => {
                    setActiveNews(null);
                    setShowFilters(false);
                });
                
                map.on('load', () => {
                    if (isMountedRef.current) {
                        setIsMapLoading(false);
                        fetchRealNews(); // Load news once map is ready
                    }
                });
                
                map.on('moveend', () => {
                    if (isMountedRef.current) setShowScanButton(true);
                });

                mapInstanceRef.current = map;
                
                // Inject Styles
                if (!document.getElementById('map-custom-styles')) {
                    const style = document.createElement('style');
                    style.id = 'map-custom-styles';
                    style.innerHTML = `
                        .news-marker {
                            width: 32px; height: 32px; cursor: pointer; border-radius: 50%;
                            background: #3b82f6; display: flex; align-items: center; justify-content: center;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.5); border: 2px solid white;
                            transition: transform 0.2s, background-color 0.2s;
                            font-size: 14px; color: white;
                        }
                        .news-marker:hover { transform: scale(1.1); z-index: 10; }
                        .news-marker.breaking { background: #ef4444; animation: breaking-pulse 2s infinite; }
                        .news-marker.Tech { background: #8b5cf6; }
                        .news-marker.Politics { background: #f59e0b; }
                        .news-marker.Business { background: #10b981; }
                        @keyframes breaking-pulse {
                            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                            70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                        }
                    `;
                    document.head.appendChild(style);
                }

            } catch (e) {
                console.error("Map Init Error", e);
                setMapError("Failed to initialize map engine.");
                setIsMapLoading(false);
            }
        }
    };

    init();

    return () => {
        isMountedRef.current = false;
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
  }, []);

  const fetchRealNews = async () => {
      setIsScanning(true);
      try {
          // Fetch diverse news to populate the map
          const [indiaNews, worldNews] = await Promise.all([
              fetchNewsFeed(1, { category: 'India', sort: 'Latest' }),
              fetchNewsFeed(1, { category: 'World', sort: 'Top' })
          ]);

          const combined = [
              ...mapToLocations(indiaNews, 20.5937, 78.9629, 15), // India Spread
              ...mapToLocations(worldNews, 40.0, -30.0, 60)       // World Spread
          ];

          setNewsData(combined);
          updateMarkers(combined);
      } catch (e) {
          console.error("Failed to fetch map news", e);
      } finally {
          setIsScanning(false);
          setShowScanButton(false);
      }
  };

  const mapToLocations = (news: any[], baseLat: number, baseLng: number, spread: number) => {
      return news.map((item: any) => {
          // Simple keyword matching for better placement, else random
          let lat = baseLat, lng = baseLng;
          const text = (item.title + item.description).toLowerCase();
          
          if (text.includes('delhi')) { lat = 28.61; lng = 77.20; spread = 1; }
          else if (text.includes('mumbai')) { lat = 19.07; lng = 72.87; spread = 1; }
          else if (text.includes('bangalore') || text.includes('bengaluru')) { lat = 12.97; lng = 77.59; spread = 1; }
          else if (text.includes('london')) { lat = 51.50; lng = -0.12; spread = 1; }
          else if (text.includes('york')) { lat = 40.71; lng = -74.00; spread = 1; }
          
          const coords = getRandomCoords(lat, lng, spread);
          
          return {
              ...item,
              type: item.title.toLowerCase().includes('breaking') ? 'breaking' : 'normal',
              location: coords
          };
      });
  };

  const updateMarkers = (data: any[]) => {
      if (!mapInstanceRef.current) return;

      // Clear existing
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      data.forEach((item: any) => {
          // Filter Logic
          if (activeFilter !== 'All' && item.category !== activeFilter) return;

          const el = document.createElement('div');
          el.className = `news-marker ${item.category} ${item.type}`;
          el.innerHTML = item.type === 'breaking' ? '⚡' : '';
          
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

  // Re-run markers when filter changes
  useEffect(() => {
      updateMarkers(newsData);
  }, [activeFilter]);

  const handleSearchSubmit = () => {
      if (!searchQuery.trim()) return;
      // Filter visible markers by search query
      const filtered = newsData.filter(item => 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      updateMarkers(filtered);
      
      if (filtered.length > 0 && mapInstanceRef.current) {
          const first = filtered[0];
          mapInstanceRef.current.flyTo({ center: [first.location.lng, first.location.lat], zoom: 6 });
          setActiveNews(first);
      }
  };

  const handleChatSendMessage = async () => {
      if (!inputText.trim()) return;
      
      const userMsg = inputText;
      setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
      setInputText('');
      setIsTyping(true);

      try {
          // @ts-ignore
          const apiKey = (window as any).process?.env?.API_KEY || (import.meta as any).env?.VITE_API_KEY;
          
          if (apiKey) {
              const ai = new GoogleGenAI({ apiKey });
              const prompt = `
                You are a News Map Assistant.
                User Request: "${userMsg}"
                
                You have two jobs:
                1. Locate the news geographically if a place is mentioned.
                2. Explain or summarize the news about that topic/place.

                Return strictly JSON:
                {
                    "action": "flyTo" | "chat",
                    "lat": number | null, 
                    "lng": number | null,
                    "zoom": number,
                    "reply": "Your conversational answer here explaining the news."
                }
              `;
              
              const result = await ai.models.generateContent({
                  model: 'gemini-3-flash-preview',
                  contents: prompt,
                  config: { responseMimeType: 'application/json' }
              });
              
              let response;
              try {
                  const cleanText = result.text.replace(/```json|```/g, '').trim();
                  response = JSON.parse(cleanText);
              } catch (e) {
                  response = { action: 'chat', reply: "I can tell you about the news, but I'm having trouble locating it on the map right now." };
              }
              
              if (response.action === 'flyTo' && mapInstanceRef.current && response.lat && response.lng) {
                  mapInstanceRef.current.flyTo({ center: [response.lng, response.lat], zoom: response.zoom || 6, speed: 1.5 });
              }
              
              setMessages(prev => [...prev, { role: 'bot', text: response.reply }]);
          } else {
              await new Promise(r => setTimeout(r, 1000));
              setMessages(prev => [...prev, { role: 'bot', text: "AI is currently offline. Please check your API key." }]);
          }
      } catch (e) {
          console.error("Chat error", e);
          setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I couldn't process that. Try asking 'What's happening in Mumbai?'" }]);
      } finally {
          setIsTyping(false);
      }
  };

  return (
    <div className="relative w-full h-full bg-[#0f172a] overflow-hidden font-sans text-white">
        
        {/* Top Nav */}
        <div className="absolute top-4 left-4 right-4 z-50 flex items-center gap-3 pointer-events-none">
            {/* Search Bar */}
            <div className="flex-1 max-w-md h-[50px] bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex items-center px-4 pointer-events-auto transition-all focus-within:ring-2 focus-within:ring-blue-500/50">
                <button onClick={() => navigate(-1)} className="mr-2 text-gray-400 hover:text-white transition-colors">
                    <Globe size={20} />
                </button>
                <Search size={18} className="text-gray-400 mr-2 shrink-0" />
                <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                    className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-gray-400 font-medium h-full"
                    placeholder="Search locations or topics..." 
                />
                <button 
                    onClick={handleSearchSubmit}
                    className="ml-2 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-colors"
                >
                    <ArrowRight size={16} />
                </button>
            </div>

            {/* Filter Toggle */}
            <div className="relative pointer-events-auto">
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`h-[50px] w-[50px] bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center justify-center hover:bg-gray-800 transition-colors ${showFilters ? 'bg-blue-600/20 border-blue-500 text-blue-400' : ''}`}
                >
                    <Sliders size={20} />
                </button>

                {/* Filter Dropdown */}
                {showFilters && (
                    <div className="absolute top-14 right-0 w-40 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-2 flex flex-col gap-1 animate-in slide-in-from-top-2 fade-in">
                        {['All', 'Politics', 'Tech', 'Business', 'World'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => { setActiveFilter(cat); setShowFilters(false); }}
                                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${activeFilter === cat ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-gray-300'}`}
                            >
                                {cat}
                                {activeFilter === cat && <Check size={12} />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Scan Area Button */}
        {(showScanButton || isScanning) && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
                <button 
                    onClick={fetchRealNews}
                    disabled={isScanning}
                    className="bg-white text-blue-900 px-5 py-2 rounded-full font-bold text-xs shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-80"
                >
                    {isScanning ? (
                        <> <Loader2 size={14} className="animate-spin" /> Scanning Region... </>
                    ) : (
                        <> <RotateCw size={14} /> Scan Area for News </>
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
                        <p className="text-xs text-gray-400 uppercase tracking-widest">Establishing Uplink...</p>
                    </div>
                </div>
            )}
            <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* Right Controls */}
        <div className="absolute right-4 bottom-24 flex flex-col gap-3 z-30 pointer-events-auto">
            <button onClick={() => mapInstanceRef.current?.flyTo({ center: [78.9629, 20.5937], zoom: 4 })} className="w-12 h-12 bg-gray-900/80 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-gray-800 shadow-lg transition-colors"><Navigation size={20} /></button>
            <button onClick={() => {
                if(!mapInstanceRef.current) return;
                const pitch = mapInstanceRef.current.getPitch() < 30 ? 60 : 0;
                mapInstanceRef.current.easeTo({ pitch, duration: 1000 });
                setIs3D(pitch > 0);
            }} className={`w-12 h-12 bg-gray-900/80 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center text-white font-bold text-xs hover:bg-gray-800 shadow-lg transition-colors ${is3D ? 'text-blue-400' : ''}`}>3D</button>
            <div className="flex flex-col bg-gray-900/80 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden shadow-lg">
                <button onClick={() => mapInstanceRef.current?.zoomIn()} className="w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 border-b border-white/10"><Plus size={20} /></button>
                <button onClick={() => mapInstanceRef.current?.zoomOut()} className="w-12 h-12 flex items-center justify-center text-white hover:bg-white/10"><Minus size={20} /></button>
            </div>
        </div>

        {/* Bottom Sheet (Active News) */}
        <div className={`absolute bottom-20 left-4 right-4 z-40 transition-all duration-300 ${activeNews ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0 pointer-events-none'}`}>
            {activeNews && (
                <div className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-2xl text-white relative overflow-hidden">
                    {/* Background Blur Image */}
                    <div className="absolute inset-0 z-0 opacity-20">
                        <img src={activeNews.imageUrl} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${activeNews.type === 'breaking' ? 'bg-red-600' : 'bg-blue-600'}`}>
                                    {activeNews.category}
                                </span>
                                <span className="text-xs text-gray-300">{activeNews.timeAgo}</span>
                            </div>
                            <button onClick={() => setActiveNews(null)} className="p-1 hover:bg-white/10 rounded-full"><X size={16} /></button>
                        </div>
                        
                        <h3 className="text-lg font-bold leading-tight mb-2 pr-4">{activeNews.title}</h3>
                        <p className="text-sm text-gray-300 line-clamp-2 mb-4">{activeNews.description}</p>
                        
                        <div className="flex gap-3">
                            <button onClick={() => navigate(`/news/${activeNews.id}`)} className="flex-1 bg-white text-black py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors shadow-lg">
                                Read Story
                            </button>
                            <button 
                                onClick={() => {
                                    setChatOpen(true);
                                    setInputText(`Tell me more about "${activeNews.title}"`);
                                    handleChatSendMessage();
                                }}
                                className="flex-1 bg-white/10 py-2.5 rounded-xl font-bold text-sm hover:bg-white/20 border border-white/10 transition-colors"
                            >
                                AI Chat
                            </button>
                        </div>
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
        <div className={`absolute bottom-40 left-4 w-[340px] max-h-[50vh] bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-3xl flex flex-col z-40 transition-all duration-300 shadow-2xl overflow-hidden ${chatOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none translate-y-10'}`}>
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <span className="font-bold text-sm flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> News Assistant</span>
                <button onClick={() => setChatOpen(false)}><X size={16} className="text-gray-400" /></button>
            </div>
            
            <div className="h-72 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                <div className="flex justify-start"><div className="bg-white/10 p-3 rounded-2xl rounded-tl-none text-xs leading-relaxed max-w-[90%] text-gray-200">
                    I'm connected to the live feed. Ask me "What's happening in London?" or "Show me tech news".
                </div></div>
                
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[90%] ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/10 text-gray-200 rounded-tl-none'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {isTyping && <div className="text-xs text-gray-500 ml-2">AI is thinking...</div>}
            </div>
            
            <div className="p-3 border-t border-white/10 flex gap-2 bg-black/20">
                <input 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChatSendMessage()}
                    placeholder="Ask about news..." 
                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 text-xs text-white outline-none focus:border-blue-500 transition-colors" 
                />
                <button 
                    onClick={handleChatSendMessage}
                    className="p-2 bg-blue-600 rounded-xl text-white hover:bg-blue-500"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    </div>
  );
};

export default MapPage;
