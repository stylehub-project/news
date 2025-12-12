import React from 'react';
import { Plus, Minus, Navigation, Layers } from 'lucide-react';

interface MapToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onToggleLayers?: () => void;
}

const MapToolbar: React.FC<MapToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onToggleLayers
}) => {
  return (
    <div className="absolute top-20 right-4 flex flex-col gap-3 z-20">
      <div className="flex flex-col bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20 overflow-hidden">
        <button 
          onClick={onZoomIn}
          className="p-3 hover:bg-gray-100 active:bg-gray-200 transition-colors border-b border-gray-100 text-gray-700"
          aria-label="Zoom In"
        >
          <Plus size={20} />
        </button>
        <button 
          onClick={onZoomOut}
          className="p-3 hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-700"
          aria-label="Zoom Out"
        >
          <Minus size={20} />
        </button>
      </div>

      <button 
        onClick={onRecenter}
        className="p-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
        aria-label="Recenter"
      >
        <Navigation size={20} />
      </button>

      <button 
        onClick={onToggleLayers}
        className="p-3 bg-white/90 backdrop-blur-md text-gray-700 rounded-xl shadow-lg hover:bg-gray-50 active:scale-95 transition-all"
        aria-label="Layers"
      >
        <Layers size={20} />
      </button>
    </div>
  );
};

export default MapToolbar;