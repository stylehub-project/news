
import React, { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';

export interface MapFilters {
  category: string;
  time: string;
  type: string;
  state: string; // New
  sentiment: string; // New
}

interface MapFilterPanelProps {
  filters: MapFilters;
  onChange: (key: keyof MapFilters, value: string) => void;
}

const MapFilterPanel: React.FC<MapFilterPanelProps> = ({ filters, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const FILTER_GROUPS = [
      {
          key: 'category',
          label: 'Topic',
          options: ['All', 'Politics', 'Tech', 'Environment', 'Business']
      },
      {
          key: 'state',
          label: 'Region',
          options: ['All', 'India', 'USA', 'Europe']
      },
      {
          key: 'sentiment',
          label: 'Vibe',
          options: ['All', 'Positive', 'Tense', 'Neutral']
      }
  ];

  return (
    <div className="relative flex items-center justify-end pointer-events-auto">
      
      {/* Dropside Container (Glass Dark Theme) */}
      <div 
        className={`absolute right-0 top-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-4 w-64 transition-all duration-300 origin-top-right ${
            isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Map Filters</h3>
            <button onClick={() => onChange('category', 'All')} className="text-[10px] text-blue-400 font-bold hover:text-blue-300">Reset</button>
        </div>

        <div className="space-y-4">
            {FILTER_GROUPS.map((group) => (
                <div key={group.key}>
                    <label className="text-xs font-semibold text-gray-300 mb-1.5 block">{group.label}</label>
                    <div className="flex flex-wrap gap-1.5">
                        {group.options.map(opt => (
                            <button
                                key={opt}
                                onClick={() => onChange(group.key as keyof MapFilters, opt)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                    filters[group.key as keyof MapFilters] === opt 
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]' 
                                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Main Toggle Button (Glass Dark Theme) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md border ${
            isOpen 
            ? 'bg-blue-600 text-white border-blue-500' 
            : 'bg-black/40 backdrop-blur-md text-white border-white/10 hover:bg-black/60'
        }`}
        title="Toggle Filters"
      >
        <Filter size={18} />
      </button>

    </div>
  );
};

export default MapFilterPanel;
