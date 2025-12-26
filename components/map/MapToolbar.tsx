
import React, { useState } from 'react';
import { Plus, Minus, Navigation, Crosshair, GitCompare, ChevronUp, Layers, Box } from 'lucide-react';

interface MapToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onLocateMe?: () => void;
  onToggleCompare?: () => void;
  isCompareMode?: boolean;
  viewMode?: '2d' | '3d';
  onToggleView?: () => void;
  mapLayer?: 'satellite' | 'schematic';
  onToggleLayer?: () => void;
}

const MapToolbar: React.FC<MapToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onLocateMe,
  onToggleCompare,
  isCompareMode,
  viewMode,
  onToggleView,
  mapLayer,
  onToggleLayer
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute bottom-32 right-4 flex flex-col-reverse gap-3 z-20 pointer-events-auto items-end">
      
      {/* Main FAB Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3.5 rounded-full shadow-2xl transition-all active:scale-95 flex items-center justify-center ${isOpen ? 'bg-gray-900 text-white rotate-180 border-gray-700' : 'bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-black/80'}`}
        title="Map Controls"
      >
        <ChevronUp size={24} />
      </button>

      {/* Expanded Tools Menu (Expands UPWARDS) */}
      {isOpen && (
        <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-4 duration-300">
            <button onClick={onRecenter} className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700" title="Recenter">
                <Navigation size={20} />
            </button>

            <button 
                onClick={onToggleView}
                className={`p-3 rounded-full shadow-lg transition-all ${viewMode === '3d' ? 'bg-indigo-600 text-white' : 'bg-black/60 backdrop-blur-md text-white border border-white/20'}`}
                title="Toggle 2D/3D"
            >
                <Box size={20} />
            </button>

            <button 
                onClick={onToggleLayer}
                className={`p-3 rounded-full shadow-lg transition-all ${mapLayer === 'satellite' ? 'bg-emerald-600 text-white' : 'bg-black/60 backdrop-blur-md text-white border border-white/20'}`}
                title="Toggle Layer"
            >
                <Layers size={20} />
            </button>

            <button 
                onClick={onToggleCompare}
                className={`p-3 rounded-full shadow-lg transition-all ${isCompareMode ? 'bg-purple-600 text-white' : 'bg-black/60 backdrop-blur-md text-white border border-white/20'}`}
                title="Compare"
            >
                <GitCompare size={20} />
            </button>

            <button onClick={onLocateMe} className="p-3 bg-black/60 backdrop-blur-md text-white rounded-full shadow-lg border border-white/20" title="Locate Me">
                <Crosshair size={20} />
            </button>

            <div className="flex flex-col bg-black/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                <button onClick={onZoomIn} className="p-3 hover:bg-white/10 border-b border-white/10 text-white" title="Zoom In"><Plus size={20} /></button>
                <button onClick={onZoomOut} className="p-3 hover:bg-white/10 text-white" title="Zoom Out"><Minus size={20} /></button>
            </div>
        </div>
      )}
    </div>
  );
};

export default MapToolbar;
