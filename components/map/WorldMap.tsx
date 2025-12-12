import React, { useState } from 'react';
import LocationMarker, { MarkerType } from './LocationMarker';
import NewsPopup from './NewsPopup';
import MapToolbar from './MapToolbar';
import { Filter } from 'lucide-react';

// Mock Data
const MARKERS = [
  { id: '1', x: 25, y: 35, type: 'politics' as MarkerType, title: 'Election Results Updated', source: 'CNN', time: '10m ago', imageUrl: 'https://picsum.photos/200/150?random=1' },
  { id: '2', x: 48, y: 28, type: 'breaking' as MarkerType, title: 'Major Summit in Brussels', source: 'BBC', time: '1h ago', imageUrl: 'https://picsum.photos/200/150?random=2' },
  { id: '3', x: 75, y: 45, type: 'tech' as MarkerType, title: 'AI Conference Tokyo', source: 'TechCrunch', time: '3h ago', imageUrl: 'https://picsum.photos/200/150?random=3' },
  { id: '4', x: 22, y: 55, type: 'general' as MarkerType, title: 'Rainforest Conservation Deal', source: 'NatGeo', time: '5h ago', imageUrl: 'https://picsum.photos/200/150?random=4' },
];

const WorldMap: React.FC = () => {
  const [zoom, setZoom] = useState(1);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 1));
  const handleRecenter = () => {
    setZoom(1);
    setActiveMarkerId(null);
  };

  const activeMarkerData = MARKERS.find(m => m.id === activeMarkerId);

  return (
    <div className="relative w-full h-full bg-slate-200 overflow-hidden group">
       {/* Filter Header */}
       <div className="absolute top-20 left-4 z-20">
             <button className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium border border-white/20">
                <Filter size={16} className="text-blue-600" />
                <span>All Topics</span>
             </button>
        </div>

      {/* Map Container - Simulating pan/zoom with transform */}
      <div 
        className="w-full h-full transition-transform duration-500 ease-out origin-center flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ transform: `scale(${zoom})` }}
        onClick={() => setActiveMarkerId(null)}
      >
        <div className="relative w-full h-full max-w-[1000px] aspect-[16/9]">
           {/* Background Map Graphic */}
           <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-contain bg-no-repeat bg-center pointer-events-none"></div>

           {/* Markers */}
           {MARKERS.map((marker) => (
             <LocationMarker
               key={marker.id}
               x={marker.x}
               y={marker.y}
               type={marker.type}
               label={zoom > 1.5 ? marker.title : undefined}
               isActive={activeMarkerId === marker.id}
               onClick={() => setActiveMarkerId(marker.id)}
             />
           ))}
        </div>
      </div>

      {/* Popup Overlay */}
      {activeMarkerData && (
        <NewsPopup 
          data={activeMarkerData} 
          onClose={() => setActiveMarkerId(null)}
          onRead={(id) => console.log('Read', id)}
        />
      )}

      {/* Toolbar */}
      <MapToolbar 
        onZoomIn={handleZoomIn} 
        onZoomOut={handleZoomOut} 
        onRecenter={handleRecenter}
      />
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-10"></div>
    </div>
  );
};

export default WorldMap;