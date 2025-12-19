import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import WorldMap from '../../components/map/WorldMap';
import MapTicker from '../../components/map/MapTicker';
import SmartLoader from '../../components/loaders/SmartLoader';
import { useLoading } from '../../context/LoadingContext';
import MapFilterPanel, { MapFilters } from '../../components/map/MapFilterPanel';

const MapPage: React.FC = () => {
  const { isLoaded, markAsLoaded } = useLoading();
  const [isLoading, setIsLoading] = useState(!isLoaded('map'));
  
  // Lifted state for filters to be used in Header and Map
  const [filters, setFilters] = useState<MapFilters>({
      category: 'All',
      time: 'Today',
      type: 'All'
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

  if (isLoading) {
      return (
          <div className="h-screen w-full bg-slate-900">
              <SmartLoader type="map" />
          </div>
      );
  }

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden flex flex-col pb-[70px]">
        {/* Navbar with Integrated Filter Dropside */}
        <div className="absolute top-0 left-0 right-0 z-30">
             <PageHeader 
                title="Global News Map" 
                action={
                    <MapFilterPanel 
                        filters={filters} 
                        onChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))} 
                    />
                }
             />
        </div>
        
        <div className="flex-1 w-full h-full mt-[52px] relative animate-in fade-in duration-700">
            <WorldMap 
                filters={filters}
                onResetFilters={() => setFilters({ category: 'All', time: 'Today', type: 'All' })}
            />
            <MapTicker />
        </div>
    </div>
  );
};

export default MapPage;