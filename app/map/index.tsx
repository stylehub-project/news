
import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Volume2, VolumeX, CloudRain, Thermometer, Wind, CloudLightning, Waves, Snowflake, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WorldMap, { MARKERS } from '../../components/map/WorldMap';
import MapTicker from '../../components/map/MapTicker';
import SmartLoader from '../../components/loaders/SmartLoader';
import { useLoading } from '../../context/LoadingContext';
import MapFilterPanel, { MapFilters } from '../../components/map/MapFilterPanel';

export type WeatherLayerType = 'Rain' | 'Temp' | 'Wind' | 'Storm' | 'Snow' | 'Heat';

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoaded, markAsLoaded } = useLoading();
  const [isLoading, setIsLoading] = useState(!isLoaded('map'));
  
  // Weather System State
  const [activeLayer, setActiveLayer] = useState<WeatherLayerType>('Storm');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAudioMode, setIsAudioMode] = useState(false);
  const [flyToLocation, setFlyToLocation] = useState<{ x: number, y: number, k: number } | null>(null);

  const [filters, setFilters] = useState<MapFilters>({
      category: 'All',
      time: 'Now',
      type: 'All',
      state: 'All', 
      sentiment: 'All',
      source: 'All',
      impact: 'All'
  });

  useEffect(() => {
    if (isLoading) {
        const timer = setTimeout(() => {
            setIsLoading(false);
            markAsLoaded('map');
        }, 2000);
        return () => clearTimeout(timer);
    }
  }, [isLoading, markAsLoaded]);

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;

      const term = searchQuery.toLowerCase();
      const found = MARKERS.find(m => 
          m.locationName.toLowerCase().includes(term) || 
          m.title.toLowerCase().includes(term)
      );

      if (found) {
          const k = 6;
          const targetX = -found.x * 10 + 200; 
          const targetY = -found.y * 5 + 100;
          setFlyToLocation({ x: targetX, y: targetY, k });
          setIsSearchOpen(false);
      }
  };

  const getLayerIcon = (layer: WeatherLayerType) => {
      switch(layer) {
          case 'Rain': return <CloudRain size={16} />;
          case 'Temp': return <Thermometer size={16} />;
          case 'Wind': return <Wind size={16} />;
          case 'Storm': return <CloudLightning size={16} />;
          case 'Snow': return <Snowflake size={16} />;
          case 'Heat': return <Sun size={16} />;
          default: return <Waves size={16} />;
      }
  };

  if (isLoading) {
      return (
          <div className="h-screen w-full bg-black">
              <SmartLoader type="map" />
          </div>
      );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col pb-[70px] transition-colors duration-300">
        
        {/* W1/W2 Top Bar & Layer Selector */}
        <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none flex flex-col">
             <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-auto">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all active:scale-95">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-white tracking-widest uppercase drop-shadow-lg leading-none">
                            Weather Map
                        </h1>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-blue-400 uppercase tracking-wider mt-0.5">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                            Live Satellite
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsAudioMode(!isAudioMode)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-95 ${isAudioMode ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-black/40 text-gray-400 border-white/10 hover:bg-black/60'}`}
                    >
                        {isAudioMode ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>

                    <form 
                        onSubmit={handleSearchSubmit}
                        className={`flex items-center bg-black/40 backdrop-blur-md rounded-full border border-white/10 transition-all duration-300 ease-out ${isSearchOpen ? 'w-40 px-3' : 'w-10 h-10 justify-center'}`}
                    >
                        {isSearchOpen ? (
                            <>
                                <input 
                                    type="text" 
                                    placeholder="Find city..." 
                                    className="bg-transparent border-none outline-none text-white text-xs w-full placeholder:text-gray-400 font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onBlur={() => !searchQuery && setIsSearchOpen(false)}
                                    autoFocus
                                />
                            </>
                        ) : (
                            <button type="button" onClick={() => setIsSearchOpen(true)} className="text-white"><Search size={18} /></button>
                        )}
                    </form>
                </div>
             </div>

             {/* W2 Floating Layer Selector */}
             <div className="pointer-events-auto px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
                {['Storm', 'Rain', 'Temp', 'Wind', 'Snow', 'Heat'].map((layer) => (
                    <button
                        key={layer}
                        onClick={() => setActiveLayer(layer as WeatherLayerType)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase backdrop-blur-md border transition-all ${
                            activeLayer === layer 
                            ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                            : 'bg-black/40 text-gray-400 border-white/10 hover:bg-black/60'
                        }`}
                    >
                        {getLayerIcon(layer as WeatherLayerType)}
                        {layer}
                    </button>
                ))}
             </div>
        </div>
        
        {/* Main Map Container */}
        <div className="flex-1 w-full h-full mt-[0px] relative animate-in fade-in duration-700 bg-black">
            <WorldMap 
                filters={filters}
                onResetFilters={() => setFilters({ ...filters, category: 'All' })}
                activeLayer={activeLayer}
                flyToLocation={flyToLocation}
                isAudioMode={isAudioMode}
            />
            <MapTicker />
        </div>
    </div>
  );
};

export default MapPage;
