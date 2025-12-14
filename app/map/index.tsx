import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import WorldMap from '../../components/map/WorldMap';
import MapTicker from '../../components/map/MapTicker';
import SmartLoader from '../../components/loaders/SmartLoader';
import { useLoading } from '../../context/LoadingContext';

const MapPage: React.FC = () => {
  const { isLoaded, markAsLoaded } = useLoading();
  const [isLoading, setIsLoading] = useState(!isLoaded('map'));

  useEffect(() => {
    if (isLoading) {
        // Simulate initial map data fetch and satellite connection
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
    // pb-[110px] allows space for BottomNav + MapTicker
    <div className="relative w-full h-full bg-slate-100 overflow-hidden flex flex-col pb-[70px]">
        <div className="absolute top-0 left-0 right-0 z-30">
             <PageHeader title="Global News Map" />
        </div>
        
        <div className="flex-1 w-full h-full mt-[52px] relative animate-in fade-in duration-700">
            <WorldMap />
            {/* 7.2 Live Update Ticker */}
            <MapTicker />
        </div>
    </div>
  );
};

export default MapPage;