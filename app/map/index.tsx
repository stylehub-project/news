
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Globe, Search, Sliders, Flame, Plus, Minus, Maximize2, 
    Box, X, Send, MessageCircle, Loader2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Declare MapLibre global
declare var maplibregl: any;

export type WeatherLayerType = 'Storm' | 'Heat' | 'Rain' | 'Snow' | 'Wind' | 'Temp';

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]); // Store marker instances
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

  // EXPANDED DATA (Layered Indian Context)
  const NEWS_DATA = [
    // --- INDIA SPECIFIC ---
    {
        id: "in-1", title: "New Tech Corridor Announced in Bangalore", summary: "Karnataka government approves a massive new IT park dedicated to AI startups in Whitefield.",
        type: "trending", location: { lat: 12.9716, lng: 77.5946 }, source: "Tech India", timestamp: "2 hours ago", category: "Technology",
        image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&q=80&w=300"
    },
    {
        id: "in-2", title: "Sensex Hits All-Time High", summary: "Mumbai Stock Exchange celebrates record breaking rally driven by banking sector.",
        type: "normal", location: { lat: 19.0760, lng: 72.8777 }, source: "Business Today", timestamp: "30 mins ago", category: "Business",
        image: "https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80&w=300"
    },
    {
        id: "in-3", title: "Parliament Session Begins", summary: "Key bills regarding digital data protection to be tabled in New Delhi today.",
        type: "breaking", location: { lat: 28.6139, lng: 77.2090 }, source: "National News", timestamp: "Live", category: "Politics",
        image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=300"
    },
    {
        id: "in-4", title: "Cyclone Alert for Chennai Coast", summary: "IMD issues orange alert for coastal Tamil Nadu as depression deepens over Bay of Bengal.",
        type: "breaking", location: { lat: 13.0827, lng: 80.2707 }, source: "Weather Bureau", timestamp: "1 hour ago", category: "Weather",
        image: "https://images.unsplash.com/photo-1514632542677-48fae74a01b2?auto=format&fit=crop&q=80&w=300"
    },
    {
        id: "in-5", title: "Literary Festival Kicks Off in Kolkata", summary: "Authors from around the world gather at the Victoria Memorial for the annual lit fest.",
        type: "normal", location: { lat: 22.5726, lng: 88.3639 }, source: "Culture Beat", timestamp: "5 hours ago", category: "Culture",
        image: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&q=80&w=300"
    },
    {
        id: "in-6", title: "Hyderabad Pharma City Expansion", summary: "Major investment secured for expanding the genome valley research facilities.",
        type: "trending", location: { lat: 17.3850, lng: 78.4867 }, source: "Health Wire", timestamp: "4 hours ago", category: "Health",
        image: "https://images.unsplash.com/photo-1563911302283-d2bc129e7c1f?auto=format&fit=crop&q=80&w=300"
    },
    
    // --- GLOBAL ---
    {
        id: "gl-1", title: "Major Climate Summit Begins in Paris", summary: "World leaders gather to discuss urgent climate action targets.",
        type: "breaking", location: { lat: 48.8566, lng: 2.3522 }, source: "Global News", timestamp: "10 mins ago", category: "World"
    },
    {
        id: "gl-2", title: "Tech Giant Unveils Quantum Processor", summary: "Silicon Valley sees the reveal of the first commercial-grade quantum processor.",
        type: "trending", location: { lat: 37.7749, lng: -122.4194 }, source: "TechDaily", timestamp: "2 hours ago", category: "Technology"
    },
    {
        id: "gl-3", title: "New Coral Reef Discovered", summary: "Massive new reef system found off the coast of Australia.",
        type: "normal", location: { lat: -16.9186, lng: 145.7781 }, source: "Nature Mag", timestamp: "5 hours ago", category: "Environment"
    },
    {
        id: "gl-4", title: "Tokyo Olympics Prep", summary: "Preparations for the next summer games are ahead of schedule.",
        type: "normal", location: { lat: 35.6762, lng: 139.6503 }, source: "Sports Asia", timestamp: "30 mins ago", category: "Sports"
    }
  ];

  // Initialize Map
  useEffect(() => {
    isMountedRef.current = true;
    if (mapInstanceRef.current) return;

    const loadMap = () => {
        if (!isMountedRef.current) return;
        
        if (!(window as any).maplibregl) {
            console.log("Waiting for MapLibre...");
            return false;
        }
        
        // Inject Custom Styles
        if (!document.getElementById('map-custom-styles')) {
            const style = document.createElement('style');
            style.id = 'map-custom-styles';
            style.innerHTML = `
                .news-marker {
                    width: 24px; height: 24px; cursor: pointer; border-radius: 50%;
                    background: #3b82f6; display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
                    animation: glow-pulse 2s infinite; border: 2px solid white;
                }
                .news-marker.breaking { background: #ef4444; animation: breaking-pulse 1.5s infinite; }
                .news-marker.trending { background: #f59e0b; }
                
                @keyframes glow-pulse {
                    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                }
                @keyframes breaking-pulse {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
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
                center: [78.9629, 20.5937], // Centered on India
                zoom: 3.5,
                pitch: 0,
                bearing: 0,
                validateStyle: false,
                cooperativeGestures: true
            });

            map.on('click', () => setActiveNews(null));
            map.on('load', () => {
                if (isMountedRef.current) setIsMapLoading(false);
                updateMarkers(NEWS_DATA); // Initial render
            });
            map.on('error', (e: any) => {
                console.warn("Map error", e);
            });
            
            mapInstanceRef.current = map;

            // Chat Greeting
            setTimeout(() => {
                if (isMountedRef.current) {
                    setMessages([{ role: 'bot', text: "Welcome to NewsMap! 🌍 Focusing on India and Global events. Ask me to 'Go to Mumbai'!" }]);
                }
            }, 1000);

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
    
    const timeout = setTimeout(() => {
        clearInterval(checkInterval);
        if (!mapInstanceRef.current && isMountedRef.current) {
            setMapError("Map engine unavailable.");
            setIsMapLoading(false);
        }
    }, 8000);

    return () => {
        isMountedRef.current = false;
        clearInterval(checkInterval);
        clearTimeout(timeout);
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
  }, []);

  // Filter Logic & Marker Updating
  const updateMarkers = (data: any[]) => {
      if (!mapInstanceRef.current) return;

      // Clear existing
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      data.forEach((item: any) => {
          const el = document.createElement('div');
          el.className = `news-marker ${item.type}`;
          el.title = item.title; // Tooltip on hover
          
          el.addEventListener('click', (e) => {
              e.stopPropagation();
              mapInstanceRef.current.flyTo({ center: [item.location.lng, item.location.lat], zoom: 6, speed: 1.2, curve: 1.4 });
              setActiveNews(item);
          });

          const marker = new (window as any).maplibregl.Marker({ element: el })
              .setLngLat([item.location.lng, item.location.lat])
              .addTo(mapInstanceRef.current);
          
          markersRef.current.push(marker);
      });
  };

  // Effect to filter markers when search changes
  useEffect(() => {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = NEWS_DATA.filter(item => 
          item.title.toLowerCase().includes(lowerQuery) ||
          item.category.toLowerCase().includes(lowerQuery) ||
          item.source.toLowerCase().includes(lowerQuery)
      );
      updateMarkers(filtered);
  }, [searchQuery]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleReset = () => mapInstanceRef.current?.flyTo({ center: [78.9629, 20.5937], zoom: 4, pitch: 0 });
  
  const handleToggle3D = () => {
      const map = mapInstanceRef.current;
      if (!map) return;
      const currentPitch = map.getPitch();
      const targetPitch = currentPitch < 30 ? 60 : 0;
      map.easeTo({ pitch: targetPitch, duration: 1000 });
      setIs3D(targetPitch > 0);
  };

  const handleSendMessage = async () => {
      if (!inputText.trim()) return;
      
      const userMsg = inputText;
      setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
      setInputText('');
      setIsTyping(true);

      try {
          // AI Logic
          // @ts-ignore
          const apiKey = (window as any).process?.env?.API_KEY || (import.meta as any).env?.VITE_API_KEY;
          
          if (apiKey) {
              const ai = new GoogleGenAI({ apiKey });
              const prompt = `
                You are a GIS News Assistant.
                User Request: "${userMsg}"
                
                If user asks to go to a place, return JSON: {"action": "flyTo", "lat": number, "lng": number, "zoom": number, "reply": "Flying to..."}
                If user asks general question, return JSON: {"action": "chat", "reply": "Answer..."}
                
                Return ONLY JSON.
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
                  response = { action: 'chat', reply: "I understood, but I'm having trouble processing the map command right now." };
              }
              
              if (response.action === 'flyTo' && mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo({ center: [response.lng, response.lat], zoom: response.zoom || 10, speed: 1.5 });
              }
              
              setMessages(prev => [...prev, { role: 'bot', text: response.reply }]);
          } else {
              await new Promise(r => setTimeout(r, 1000));
              setMessages(prev => [...prev, { role: 'bot', text: "AI unavailable. I can only show you the map for now." }]);
          }
      } catch (e) {
          console.error("Chat error", e);
          setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I couldn't process that command." }]);
      } finally {
          setIsTyping(false);
      }
  };

  return (
    <div className="relative w-full h-full bg-[#0f172a] overflow-hidden font-sans text-white">
        
        {/* Top Nav (Glass) */}
        <div className="absolute top-5 left-5 right-5 h-[60px] rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 flex items-center justify-between px-5 z-20 shadow-lg pointer-events-auto">
            <div className="flex items-center gap-2 font-bold text-lg cursor-pointer" onClick={() => navigate(-1)}>
                <Globe size={24} className="text-blue-500" />
                <span>NewsMap</span>
            </div>
            
            <div className="flex-1 max-w-[400px] h-[40px] bg-black/30 rounded-full border border-white/10 flex items-center px-4 mx-4 backdrop-blur-md">
                <Search size={18} className="text-gray-400 mr-2" />
                <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-gray-400 font-medium"
                    placeholder="Search cities, topics..." 
                />
                {searchQuery && <button onClick={() => setSearchQuery('')}><X size={14} className="text-gray-400" /></button>}
            </div>

            <div className="flex gap-3">
                <button className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"><Sliders size={20} /></button>
                <button className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"><Flame size={20} /></button>
            </div>
        </div>

        {/* Map Container */}
        <div className="absolute inset-0 z-0 bg-black">
            {isMapLoading && !mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                    <div className="text-center">
                        <Loader2 size={32} className="text-blue-500 animate-spin mx-auto mb-2" />
                        <p className="text-xs text-gray-400 uppercase tracking-widest">Initializing Satellite Link...</p>
                    </div>
                </div>
            )}
            {mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10 p-6 text-center">
                    <p className="text-red-400 font-bold mb-2">Map Error</p>
                    <p className="text-gray-400 text-sm mb-4">{mapError}</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white/10 rounded text-xs font-bold hover:bg-white/20">Retry</button>
                </div>
            )}
            <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* Right Controls */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20 pointer-events-auto">
            <button onClick={handleZoomIn} className="w-11 h-11 bg-slate-800/40 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/10 shadow-lg"><Plus size={20} /></button>
            <button onClick={handleZoomOut} className="w-11 h-11 bg-slate-800/40 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/10 shadow-lg"><Minus size={20} /></button>
            <button onClick={handleReset} className="w-11 h-11 bg-slate-800/40 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/10 shadow-lg"><Maximize2 size={18} /></button>
            <button onClick={handleToggle3D} className={`w-11 h-11 bg-slate-800/40 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center text-white font-bold text-xs hover:bg-white/10 shadow-lg ${is3D ? 'text-blue-400 border-blue-500/50' : ''}`}>3D</button>
        </div>

        {/* Bottom Sheet (Active News) */}
        <div className={`absolute bottom-5 left-5 right-5 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-white/10 p-5 z-30 transition-all duration-300 shadow-2xl ${activeNews ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0 pointer-events-none'}`}>
            {activeNews && (
                <div className="text-white">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className={`font-bold px-2 py-0.5 rounded uppercase text-[10px] ${activeNews.type === 'breaking' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                                {activeNews.type}
                            </span>
                            <span>{activeNews.source}</span>
                            <span>•</span>
                            <span>{activeNews.timestamp}</span>
                        </div>
                        <button onClick={() => setActiveNews(null)} className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"><X size={16} /></button>
                    </div>
                    
                    <h3 className="text-xl font-bold leading-tight mb-3">{activeNews.title}</h3>
                    
                    {activeNews.image && (
                        <div className="w-full h-40 rounded-xl overflow-hidden mb-3 relative bg-gray-800">
                            <img src={activeNews.image} alt={activeNews.title} className="w-full h-full object-cover opacity-90" />
                        </div>
                    )}
                    
                    <p className="text-sm text-gray-300 leading-relaxed mb-4">{activeNews.summary}</p>
                    
                    <div className="flex gap-3">
                        <button onClick={() => navigate('/reel')} className="flex-1 py-2.5 bg-blue-600 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/20">Read Full</button>
                        <button className="flex-1 py-2.5 bg-white/10 rounded-xl font-bold text-sm hover:bg-white/20 border border-white/10">AI Explain</button>
                    </div>
                </div>
            )}
        </div>

        {/* Chat FAB */}
        <button 
            onClick={() => setChatOpen(!chatOpen)}
            className="absolute bottom-6 right-6 w-[60px] h-[60px] bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] z-40 hover:scale-110 transition-transform active:scale-95 border border-white/10"
        >
            <MessageCircle size={28} />
        </button>

        {/* Chat Window */}
        <div className={`absolute bottom-[100px] right-6 w-[380px] h-[550px] max-h-[60vh] bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[20px] flex flex-col z-40 transition-all duration-400 origin-bottom-right shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden ${chatOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none translate-y-10'}`}>
            {/* Chat Header */}
            <div className="p-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></div>
                    <span className="font-semibold text-white">News Assistant</span>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"><X size={16} /></button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                        <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${
                            m.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-br-sm shadow-lg shadow-blue-500/20' 
                            : 'bg-white/10 text-white rounded-bl-sm border border-white/5'
                        }`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white/10 p-3 rounded-xl rounded-bl-sm flex gap-1">
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-100"></div>
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-200"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-black/20 flex gap-2.5">
                <input 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about news..."
                    className="flex-1 bg-black/20 border border-white/10 rounded-2xl px-4 py-2.5 text-white placeholder:text-white/40 outline-none focus:bg-black/40 focus:border-white/20 transition-all"
                />
                <button 
                    onClick={handleSendMessage} 
                    className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                    <Send size={18} className="ml-0.5" />
                </button>
            </div>
        </div>
    </div>
  );
};

export default MapPage;
