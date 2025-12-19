import React, { useState } from 'react';
import { Plus, Minus, Navigation, Crosshair, GitCompare, ChevronUp } from 'lucide-react';

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
    <div className="absolute bottom-32 right-4 flex flex-col-reverse gap-3 z-20 pointer-events-auto items-end">
      
      {/* Main FAB Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3.5 rounded-full shadow-2xl transition-all active:scale-95 flex items-center justify-center ${isOpen ? 'bg-gray-900 text-white rotate-180' : 'bg-white/90 backdrop-blur-md text-gray-700 hover:bg-white border border-white/20'}`}
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
                onClick={onToggleCompare}
                className={`p-3 rounded-full shadow-lg transition-all ${isCompareMode ? 'bg-indigo-600 text-white' : 'bg-white/90 text-gray-700 border border-white/20'}`}
                title="Compare"
            >
                <GitCompare size={20} />
            </button>

            <button onClick={onLocateMe} className="p-3 bg-white/90 text-gray-700 rounded-full shadow-lg border border-white/20" title="Locate Me">
                <Crosshair size={20} />
            </button>

            <div className="flex flex-col bg-white/90 rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                <button onClick={onZoomIn} className="p-3 hover:bg-gray-100 border-b border-gray-100 text-gray-700" title="Zoom In"><Plus size={20} /></button>
                <button onClick={onZoomOut} className="p-3 hover:bg-gray-100 text-gray-700" title="Zoom Out"><Minus size={20} /></button>
            </div>
        </div>
      )}
    </div>
  );
};

export default MapToolbar;