import React from 'react';
import { Plus, Minus, Navigation, Crosshair, Flame, Smile, GitCompare } from 'lucide-react';

interface MapToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onLocateMe?: () => void;
  onToggleHeatmapMode?: () => void; // Toggle between Intensity/Sentiment
  heatmapMode?: 'intensity' | 'sentiment';
  onToggleCompare?: () => void;
  isCompareMode?: boolean;
}

const MapToolbar: React.FC<MapToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onLocateMe,
  onToggleHeatmapMode,
  heatmapMode,
  onToggleCompare,
  isCompareMode
}) => {
  return (
    <div className="absolute top-20 right-4 flex flex-col gap-3 z-20 pointer-events-auto" role="toolbar" aria-label="Map controls">
      {/* Zoom Controls */}
      <div className="flex flex-col bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20 overflow-hidden">
        <button onClick={onZoomIn} className="p-3 hover:bg-gray-100 border-b border-gray-100 text-gray-700">
          <Plus size={20} />
        </button>
        <button onClick={onZoomOut} className="p-3 hover:bg-gray-100 text-gray-700">
          <Minus size={20} />
        </button>
      </div>

      {/* Locate Me */}
      <button onClick={onLocateMe} className="p-3 bg-white/90 backdrop-blur-md text-gray-700 rounded-xl shadow-lg hover:bg-gray-50">
        <Crosshair size={20} />
      </button>

      {/* 8.13.6 Sentiment / Heatmap Toggle */}
      <button 
        onClick={onToggleHeatmapMode}
        className={`p-3 backdrop-blur-md rounded-xl shadow-lg active:scale-95 transition-all ${heatmapMode === 'sentiment' ? 'bg-purple-600 text-white' : 'bg-white/90 text-gray-700'}`}
        title="Toggle Sentiment View"
      >
        {heatmapMode === 'sentiment' ? <Smile size={20} /> : <Flame size={20} className="text-orange-500" />}
      </button>

      {/* 8.13.8 Compare Mode */}
      <button 
        onClick={onToggleCompare}
        className={`p-3 backdrop-blur-md rounded-xl shadow-lg active:scale-95 transition-all ${isCompareMode ? 'bg-indigo-600 text-white' : 'bg-white/90 text-gray-700'}`}
        title="Compare Regions"
      >
        <GitCompare size={20} />
      </button>

      {/* Recenter */}
      <button onClick={onRecenter} className="p-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700">
        <Navigation size={20} />
      </button>
    </div>
  );
};

export default MapToolbar;