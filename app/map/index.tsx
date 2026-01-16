import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Maximize2, Layers, MessageCircle, X, Send, Bot, MapPin, Loader2, Sparkles, Navigation } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useLoading } from '../../context/LoadingContext';
import { useNetwork } from '../../context/NetworkContext';
import UnderReviewBanner from '../../components/ui/UnderReviewBanner';

// Declare MapLibre global
declare var maplibregl: any;

export type WeatherLayerType = 'Temp' | 'Rain' | 'Wind' | 'Storm' | 'Heat' | 'Snow' | 'Cloud';

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeNews, setActiveNews] = useState<any>(null);
  
  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Load styles
    const style = document.createElement('style');
    style.innerHTML = `
      :root {
        --glass-bg: rgba(20, 20, 25, 0.65);
        --glass-border: rgba(255, 255, 255, 0.1);
        --glass-blur: 16px;
        --primary-color: #3b82f6;
        --text-primary: #ffffff;
        --text-secondary: #a1a1aa;
      }
      .glass-panel {
        background: var(--glass-bg);
        backdrop-filter: blur(var(--glass-blur));
        border: 1px solid var(--glass-border);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
      }
      .news-marker {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--primary-color);
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
        animation: pulse 2s infinite;
        cursor: pointer;
        border: 2px solid white;
      }
      .news-marker.breaking {
        background: #ef4444;
        animation: pulse-red 2s infinite;
      }
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
        100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
      }
      @keyframes pulse-red {
        0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
        100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
      }
    `;
    document.head.appendChild(style);

    const map = new maplibregl.Map({
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
      center: [20, 30],
      zoom: 1.5,
      pitch: 45,
      bearing: 0
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: false }), 'bottom-right');
    
    // Add Mock Data
    const MOCK_NEWS = [
      { id: 1, title: "Major Climate Summit in Paris", type: "breaking", lat: 48.8566, lng: 2.3522, summary: "Leaders gather for emergency talks on renewable goals." },
      { id: 2, title: "Tech Innovation in SF", type: "trending", lat: 37.7749, lng: -122.4194, summary: "Silicon Valley unveils new quantum processor." },
      { id: 3, title: "Tokyo Olympics Prep", type: "normal", lat: 35.6762, lng: 139.6503, summary: "Venues ready ahead of schedule." },
      { id: 4, title: "New Reef Found in Australia", type: "normal", lat: -16.9186, lng: 145.7781, summary: "Marine biologists discover massive coral system." },
      { id: 5, title: "New Delhi Heatwave", type: "breaking", lat: 28.6139, lng: 77.2090, summary: "Temperatures cross 45°C, advisory issued." }
    ];

    MOCK_NEWS.forEach((item: any) => {
        const el = document.createElement('div');
        el.className = `news-marker ${item.type}`;
        el.addEventListener('click', (e: any) => {
            e.stopPropagation();
            map.flyTo({ center: [item.lng, item.lat], zoom: 6, speed: 1.5, curve: 1 });
            setActiveNews(item);
        });

        new maplibregl.Marker({ element: el })
            .setLngLat([item.lng, item.lat])
            .addTo(map);
    });

    map.on('click', () => setActiveNews(null));

    mapInstanceRef.current = map;

    // Initial greeting
    setTimeout(() => {
        setMessages([{ role: 'bot', text: "Welcome to NewsMap! 🌍 Ask me to 'Go to London' or find specific news." }]);
    }, 1000);

    return () => {
        map.remove();
        document.head.removeChild(style);
    };
  }, []);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleReset = () => mapInstanceRef.current?.flyTo({ center: [20, 30], zoom: 1.5, pitch: 0 });
  
  const handleToggle3D = () => {
      const map = mapInstanceRef.current;
      if (!map) return;
      const currentPitch = map.getPitch();
      map.easeTo({ pitch: currentPitch < 30 ? 60 : 0, duration: 1000 });
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
                You are a GIS News Assistant controlling a map.
                User Request: "${userMsg}"
                
                If the user asks to go to a location, return JSON: {"action": "flyTo", "lat": number, "lng": number, "zoom": number, "reply": "Flying to..."}
                If the user asks about news, return JSON: {"action": "chat", "reply": "Detailed answer..."}
                
                Keep replies concise.
              `;
              
              const result = await ai.models.generateContent({
                  model: 'gemini-3-flash-preview',
                  contents: prompt,
                  config: { responseMimeType: 'application/json' }
              });
              
              const response = JSON.parse(result.text);
              
              if (response.action === 'flyTo') {
                  mapInstanceRef.current?.flyTo({ center: [response.lng, response.lat], zoom: response.zoom || 10, speed: 2 });
              }
              
              setMessages(prev => [...prev, { role: 'bot', text: response.reply }]);
          } else {
              // Fallback if no key
              setTimeout(() => {
                  setMessages(prev => [...prev, { role: 'bot', text: "AI unavailable. I can only show you the map for now." }]);
              }, 1000);
          }
      } catch (e) {
          setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I couldn't process that command." }]);
      } finally {
          setIsTyping(false);
      }
  };

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden font-sans">
        
        {/* Banner */}
        <UnderReviewBanner featureName="Satellite Map" />

        {/* Top Nav (Glass) */}
        <div className="absolute top-4 left-4 right-4 h-14 rounded-2xl glass-panel flex items-center justify-between px-4 z-20 pointer-events-auto">
            <div className="flex items-center gap-3 text-white font-bold cursor-pointer" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">NewsMap</span>
            </div>
            
            <div className="flex-1 max-w-sm mx-4 h-9 bg-black/20 rounded-full border border-white/10 flex items-center px-3">
                <Navigation size={14} className="text-gray-400 mr-2" />
                <input 
                    className="bg-transparent border-none outline-none text-white text-xs w-full placeholder:text-gray-400"
                    placeholder="Search locations..." 
                />
            </div>

            <div className="flex gap-2">
                <button className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"><Layers size={20} /></button>
            </div>
        </div>

        {/* Map Container */}
        <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-black" />

        {/* Right Controls */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20 pointer-events-auto">
            <button onClick={handleZoomIn} className="w-10 h-10 glass-panel rounded-xl flex items-center justify-center text-white hover:bg-white/10"><Plus size={20} /></button>
            <button onClick={handleZoomOut} className="w-10 h-10 glass-panel rounded-xl flex items-center justify-center text-white hover:bg-white/10"><Minus size={20} /></button>
            <button onClick={handleReset} className="w-10 h-10 glass-panel rounded-xl flex items-center justify-center text-white hover:bg-white/10"><Maximize2 size={18} /></button>
            <button onClick={handleToggle3D} className="w-10 h-10 glass-panel rounded-xl flex items-center justify-center text-white font-bold text-xs hover:bg-white/10">3D</button>
        </div>

        {/* Bottom Sheet (Active News) */}
        <div className={`absolute bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-96 glass-panel rounded-3xl p-5 z-30 transition-transform duration-300 ${activeNews ? 'translate-y-0' : 'translate-y-[150%]'}`}>
            {activeNews && (
                <div className="text-white">
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${activeNews.type === 'breaking' ? 'bg-red-600' : 'bg-blue-600'}`}>{activeNews.type}</span>
                        <button onClick={() => setActiveNews(null)} className="p-1 hover:bg-white/10 rounded-full"><X size={14} /></button>
                    </div>
                    <h3 className="text-lg font-bold leading-tight mb-2">{activeNews.title}</h3>
                    <p className="text-sm text-gray-300 line-clamp-2 mb-4">{activeNews.summary}</p>
                    <button onClick={() => navigate('/reel')} className="w-full py-2 bg-blue-600 rounded-xl font-bold text-sm hover:bg-blue-700">Read Story</button>
                </div>
            )}
        </div>

        {/* Chat FAB */}
        <button 
            onClick={() => setChatOpen(!chatOpen)}
            className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl z-30 hover:scale-110 transition-transform active:scale-95 border-2 border-white/20"
        >
            {chatOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </button>

        {/* Chat Window */}
        <div className={`absolute bottom-24 right-6 w-80 h-96 glass-panel rounded-2xl flex flex-col z-30 transition-all duration-300 origin-bottom-right overflow-hidden ${chatOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'}`}>
            <div className="p-3 border-b border-white/10 bg-white/5 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                <span className="text-xs font-bold text-white">News Assistant</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-2.5 rounded-2xl text-xs font-medium ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white/10 text-gray-200 rounded-bl-sm'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white/10 p-2 rounded-2xl rounded-bl-sm">
                            <Loader2 size={14} className="text-gray-400 animate-spin" />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-white/10 bg-black/20 flex gap-2">
                <input 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about news..."
                    className="flex-1 bg-white/10 border-none outline-none text-xs text-white rounded-xl px-3 py-2 placeholder:text-gray-500"
                />
                <button onClick={handleSendMessage} className="p-2 bg-blue-600 rounded-xl text-white hover:bg-blue-700 transition-colors">
                    <Send size={14} />
                </button>
            </div>
        </div>
    </div>
  );
};

export default MapPage;
