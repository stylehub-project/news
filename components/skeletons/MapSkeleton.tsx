import React from 'react';
import MapLoader from '../loaders/MapLoader';

const MapSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
        {/* Placeholder Map Background */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center grayscale"></div>
        
        {/* The Smart Loader */}
        <div className="relative z-10">
            <MapLoader text="Analyzing regional data..." />
        </div>
    </div>
  );
};
export default MapSkeleton;