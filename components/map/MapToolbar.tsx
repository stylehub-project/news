import React, { useState } from 'react';
import { Plus, Minus, Navigation, Crosshair, GitCompare, Layout, ChevronDown } from 'lucide-react';

interface MapToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onLocateMe?: () => void;
  onToggleCompare?: () => void;
  isCompareMode?: boolean;
}

const MapToolbar: React.FC<MapToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onLocateMe,
  onToggleCompare,
  isCompareMode
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-20 right-4 flex flex-col gap-3 z-20 pointer-events-auto items-end" role="toolbar" aria-label="Map controls">
      
      {/* Main Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center ${isOpen ? 'bg-gray-900 text-white' : 'bg-white/90 backdrop-blur-md text-gray-700 hover:bg-white'}`}
        title="Map Tools"
      >
        {isOpen ? <ChevronDown size={20} /> : <Layout size={20} />}
      </button>

      {/* Collapsible Tools */}
      {isOpen && (
        <div className="flex flex-col gap-3 animate-in slide-in-from-top-2 fade-in duration-300">
            {/* Zoom Controls */}
            <div className="flex flex-col bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20 overflow-hidden">
                <button onClick={onZoomIn} className="p-3 hover:bg-gray-100 border-b border-gray-100 text-gray-700" title="Zoom In">
                <Plus size={20} />
                </button>
                <button onClick={onZoomOut} className="p-3 hover:bg-gray-100 text-gray-700" title="Zoom Out">
                <Minus size={20} />
                </button>
            </div>

            {/* Locate Me */}
            <button onClick={onLocateMe} className="p-3 bg-white/90 backdrop-blur-md text-gray-700 rounded-xl shadow-lg hover:bg-gray-50" title="Locate Me">
                <Crosshair size={20} />
            </button>

            {/* Compare Mode */}
            <button 
                onClick={onToggleCompare}
                className={`p-3 backdrop-blur-md rounded-xl shadow-lg active:scale-95 transition-all ${isCompareMode ? 'bg-indigo-600 text-white' : 'bg-white/90 text-gray-700'}`}
                title="Compare Regions"
            >
                <GitCompare size={20} />
            </button>

            {/* Recenter */}
            <button onClick={onRecenter} className="p-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700" title="Recenter Map">
                <Navigation size={20} />
            </button>
        </div>
      )}
    </div>
  );
};

export default MapToolbar;