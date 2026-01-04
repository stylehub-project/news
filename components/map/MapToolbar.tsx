
import React from 'react';
import { Plus, Minus, Navigation, Box } from 'lucide-react';

interface MapToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  viewMode?: '2d' | '3d';
  onToggleView?: () => void;
}

const MapToolbar: React.FC<MapToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenter,
  viewMode,
  onToggleView
}) => {
  return (
    <div className="absolute bottom-32 right-4 flex flex-col gap-3 z-20 pointer-events-auto items-end">
        <button onClick={onRecenter} className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700" title="Locate">
            <Navigation size={20} />
        </button>

        <button 
            onClick={onToggleView}
            className={`p-3 rounded-full shadow-lg transition-all ${viewMode === '3d' ? 'bg-indigo-600 text-white' : 'bg-black/60 backdrop-blur-md text-white border border-white/20'}`}
            title="Toggle 3D"
        >
            <Box size={20} />
        </button>

        <div className="flex flex-col bg-black/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <button onClick={onZoomIn} className="p-3 hover:bg-white/10 border-b border-white/10 text-white" title="Zoom In"><Plus size={20} /></button>
            <button onClick={onZoomOut} className="p-3 hover:bg-white/10 text-white" title="Zoom Out"><Minus size={20} /></button>
        </div>
    </div>
  );
};

export default MapToolbar;
