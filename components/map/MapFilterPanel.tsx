import React, { useState } from 'react';
import { Filter, Clock, Zap, Layers, X } from 'lucide-react';

export interface MapFilters {
  category: string;
  time: string;
  type: string;
}

interface MapFilterPanelProps {
  filters: MapFilters;
  onChange: (key: keyof MapFilters, value: string) => void;
}

const MapFilterPanel: React.FC<MapFilterPanelProps> = ({ filters, onChange }) => {
  const [isOpen, setIsOpen] = useState(true);
  const CATEGORIES = ['All', 'Politics', 'Tech', 'Environment', 'World'];
  const TIMES = ['Today', '24h', 'Week'];
  const TYPES = ['All', 'Breaking', 'Trending', 'Top'];

  return (
    <div className="absolute top-20 left-4 z-20 flex flex-col gap-3 pointer-events-auto max-w-[200px]">
      
      {/* Header Row: Toggle & Types */}
      <div className="flex items-center gap-2 max-w-[90vw]">
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-full backdrop-blur-md border shadow-sm transition-colors shrink-0 ${
                isOpen 
                ? 'bg-blue-600 text-white border-blue-500' 
                : 'bg-white/90 text-gray-600 border-white/20 hover:bg-white'
            }`}
        >
            <Filter size={16} />
        </button>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TYPES.map(t => (
                <button
                    key={t}
                    onClick={() => onChange('type', t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border transition-colors shadow-sm whitespace-nowrap ${
                        filters.type === t 
                        ? 'bg-blue-600 text-white border-blue-500' 
                        : 'bg-white/90 text-gray-600 border-white/20 hover:bg-white'
                    }`}
                >
                    {t}
                </button>
            ))}
        </div>
      </div>

      {/* Vertical Filter Stack */}
      {isOpen && (
          <div className="bg-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-lg border border-white/40 space-y-3 animate-in slide-in-from-left-4 duration-500 relative">
             <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100/50 transition-colors"
             >
                <X size={14} />
             </button>

             {/* Category */}
             <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Layers size={10} /> Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => onChange('category', cat)}
                            className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                                filters.category === cat 
                                ? 'bg-gray-900 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
             </div>

             {/* Time */}
             <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Clock size={10} /> Time Range
                </label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                    {TIMES.map(time => (
                        <button
                            key={time}
                            onClick={() => onChange('time', time)}
                            className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all ${
                                filters.time === time 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {time}
                        </button>
                    ))}
                </div>
             </div>
          </div>
      )}
    </div>
  );
};

export default MapFilterPanel;