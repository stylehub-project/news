
import React, { useState, useEffect } from 'react';
import { Search, Flame, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WorldMap, { MARKERS } from '../../components/map/WorldMap';
import MapTicker from '../../components/map/MapTicker';
import SmartLoader from '../../components/loaders/SmartLoader';
import { useLoading } from '../../context/LoadingContext';
import MapFilterPanel, { MapFilters } from '../../components/map/MapFilterPanel';

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoaded, markAsLoaded } = useLoading();
  const [isLoading, setIsLoading] = useState(!isLoaded('map'));
  
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Audio Mode State
  const [isAudioMode, setIsAudioMode] = useState(false);
  
  // State to trigger map movement
  const [flyToLocation, setFlyToLocation] = useState<{ x: number, y: number, k: number } | null>(null);

  const [filters, setFilters] = useState<MapFilters>({
      category: 'All',
      time: 'Today',
      type: 'All',
      state: 'India', // Default to India context
      sentiment: 'All',
      source: 'All',
      impact: 'All'
  });

  useEffect(() => {
    if (isLoading) {
        const timer = setTimeout(() => {
            setIsLoading(false);
            markAsLoaded('map');
        }, 2500);
        return () => clearTimeout(timer);
    }
  }, [isLoading, markAsLoaded]);

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;

      const term = searchQuery.toLowerCase();
      
      const found = MARKERS.find(m => 
          m.locationName.toLowerCase().includes(term) || 
          m.title.toLowerCase().includes(term) ||
          m.category.toLowerCase() === term
      );

      if (found) {
          const k = 6;
          const targetX = -found.x * 10 + 200; 
          const targetY = -found.y * 5 + 100;
          
          setFlyToLocation({ x: targetX, y: targetY, k });
          setIsSearchOpen(false);
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
        {/* Transparent Glass Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none flex flex-col">
             <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-auto">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all active:scale-95">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-black text-white tracking-widest uppercase drop-shadow-lg flex flex-col leading-none">
                        News Map 
                        <span className="text-red-500 text-[9px] tracking-[0.2em] font-bold animate-pulse">LIVE SATELLITE</span>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    {/* Audio Mode Toggle (New 10.9) */}
                    <button 
                        onClick={() => setIsAudioMode(!isAudioMode)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-95 ${isAudioMode ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-black/40 text-gray-400 border-white/10 hover:bg-black/60'}`}
                        title="Map Audio Mode"
                    >
                        {isAudioMode ? <Volume2 size={18} className="animate-pulse" /> : <VolumeX size={18} />}
                    </button>

                    {/* Expanding Search */}
                    <form 
                        onSubmit={handleSearchSubmit}
                        className={`flex items-center bg-black/40 backdrop-blur-md rounded-full border border-white/10 transition-all duration-300 ease-out ${isSearchOpen ? 'w-40 md:w-48 px-3' : 'w-10 h-10 justify-center'}`}
                    >
                        {isSearchOpen ? (
                            <>
                                <input 
                                    type="text" 
                                    placeholder="Search..." 
                                    className="bg-transparent border-none outline-none text-white text-xs w-full placeholder:text-gray-400 font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onBlur={() => !searchQuery && setIsSearchOpen(false)}
                                    autoFocus
                                />
                                <button type="submit" className="text-gray-400 hover:text-white"><Search size={14} /></button>
                            </>
                        ) : (
                            <button type="button" onClick={() => setIsSearchOpen(true)} className="text-white hover:text-blue-400 transition-colors"><Search size={18} /></button>
                        )}
                    </form>

                    {/* Heatmap Toggle */}
                    <button 
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 transition-all active:scale-95 ${showHeatmap ? 'bg-orange-600/80 text-white shadow-[0_0_15px_rgba(234,88,12,0.5)]' : 'bg-black/40 text-gray-400'}`}
                        title="Toggle Heatmap"
                    >
                        <Flame size={18} className={showHeatmap ? 'fill-current animate-pulse' : ''} />
                    </button>

                    {/* Filter Panel */}
                    <MapFilterPanel 
                        filters={filters} 
                        onChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))} 
                    />
                </div>
             </div>
        </div>
        
        <div className="flex-1 w-full h-full mt-[0px] relative animate-in fade-in duration-700 bg-black">
            <WorldMap 
                filters={filters}
                onResetFilters={() => setFilters({ category: 'All', time: 'Today', type: 'All', state: 'India', sentiment: 'All', source: 'All', impact: 'All' })}
                showHeatmap={showHeatmap}
                flyToLocation={flyToLocation}
                isAudioMode={isAudioMode}
            />
            <MapTicker />
        </div>
    </div>
  );
};

export default MapPage;
