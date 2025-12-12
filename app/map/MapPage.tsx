import React from 'react';
import ComingSoonBanner from '../../components/ComingSoonBanner';
import { Map as MapIcon, Navigation, Plus, Minus, Filter } from 'lucide-react';

const MapPage: React.FC = () => {
  return (
    <div className="relative w-full h-[calc(100vh-140px)] bg-slate-200 overflow-hidden">
        {/* Map Placeholder Graphic */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center"></div>
        
        {/* Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <button className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50"><Plus size={20} /></button>
            <button className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50"><Minus size={20} /></button>
            <button className="bg-blue-600 text-white p-3 rounded-lg shadow-lg mt-2"><Navigation size={20} /></button>
        </div>

        <div className="absolute top-4 left-4 z-10">
             <button className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
                <Filter size={16} />
                Filter: Political
             </button>
        </div>

        {/* Pin Mockups */}
        <div className="absolute top-1/3 left-1/4 animate-bounce duration-1000">
             <div className="bg-red-500 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap mb-1">Election Update</div>
             <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white mx-auto"></div>
        </div>

        <div className="absolute top-1/2 left-1/2 animate-bounce duration-1000 delay-300">
             <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap mb-1">Tech Summit</div>
             <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white mx-auto"></div>
        </div>

        {/* Overlay */}
        <div className="absolute bottom-0 w-full p-6">
             <ComingSoonBanner 
                title="Global News Map" 
                gradient="bg-gradient-to-r from-emerald-500 to-teal-700" 
                icon={<MapIcon size={32} />}
                description="Visualize headlines geographically. Zoom into your city for hyper-local updates."
                featureList={["City Pins", "Regional Alerts", "Travel Warnings"]}
            />
        </div>
    </div>
  );
};

export default MapPage;