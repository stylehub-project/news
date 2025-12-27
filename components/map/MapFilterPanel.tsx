
import React, { useState } from 'react';
import { Filter, X, ChevronDown, Check } from 'lucide-react';

export interface MapFilters {
  category: string;
  time: string;
  source: string; // New
  impact: string; // New
  state: string;
  sentiment: string;
  type: string;
}

interface MapFilterPanelProps {
  filters: MapFilters;
  onChange: (key: keyof MapFilters, value: string) => void;
}

const MapFilterPanel: React.FC<MapFilterPanelProps> = ({ filters, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const FILTER_GROUPS = [
      {
          key: 'time',
          label: 'Timeframe',
          options: ['Now', 'Today', 'This Week']
      },
      {
          key: 'category',
          label: 'Topic',
          options: ['All', 'Politics', 'Tech', 'Environment', 'Business']
      },
      {
          key: 'impact',
          label: 'Impact Level',
          options: ['All', 'High', 'Medium', 'Low']
      },
      {
          key: 'source',
          label: 'Source',
          options: ['All', 'Verified', 'Major', 'Local']
      }
  ];

  return (
    <div className="relative flex items-center justify-end pointer-events-auto">
      
      {/* Dropside Container (Glass Dark Theme) */}
      <div 
        className={`absolute right-0 top-14 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-5 w-72 transition-all duration-300 origin-top-right z-50 ${
            isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Filter size={12} /> Map Controls
            </h3>
            <button 
                onClick={() => {
                    onChange('category', 'All');
                    onChange('time', 'Today');
                    onChange('impact', 'All');
                    onChange('source', 'All');
                }} 
                className="text-[10px] text-blue-400 font-bold hover:text-blue-300"
            >
                Reset Default
            </button>
        </div>

        <div className="space-y-5">
            {FILTER_GROUPS.map((group) => (
                <div key={group.key}>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">{group.label}</label>
                    <div className="flex flex-wrap gap-2">
                        {group.options.map(opt => {
                            const isActive = filters[group.key as keyof MapFilters] === opt;
                            return (
                                <button
                                    key={opt}
                                    onClick={() => onChange(group.key as keyof MapFilters, opt)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
                                        isActive
                                        ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.4)]' 
                                        : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {isActive && <Check size={10} />}
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Main Toggle Button (Glass Dark Theme) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg border ${
            isOpen 
            ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/30' 
            : 'bg-black/40 backdrop-blur-md text-white border-white/10 hover:bg-black/60'
        }`}
        title="Map Filters"
      >
        <Filter size={18} className={isOpen ? 'fill-current' : ''} />
      </button>

    </div>
  );
};

export default MapFilterPanel;
