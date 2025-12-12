import React from 'react';
import PageHeader from '../../components/PageHeader';
import WorldMap from '../../components/map/WorldMap';
import MapTicker from '../../components/map/MapTicker';

const MapPage: React.FC = () => {
  return (
    // pb-[110px] allows space for BottomNav + MapTicker
    <div className="relative w-full h-full bg-slate-100 overflow-hidden flex flex-col pb-[70px]">
        <div className="absolute top-0 left-0 right-0 z-30">
             <PageHeader title="Global News Map" />
        </div>
        
        <div className="flex-1 w-full h-full mt-[52px] relative">
            <WorldMap />
            {/* 7.2 Live Update Ticker */}
            <MapTicker />
        </div>
    </div>
  );
};

export default MapPage;