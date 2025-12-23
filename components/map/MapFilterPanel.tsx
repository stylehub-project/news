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
      
      {/* Dropside Container */}
      <div 
        className={`absolute right-0 top-12 bg-white/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800/95 rounded-2xl shadow-xl p-4 w-64 transition-all duration-300 origin-top-right ${
            isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Map Filters</h3>
            <button onClick={() => onChange('category', 'All')} className="text-[10px] text-blue-600 font-bold">Reset</button>
        </div>

        <div className="space-y-4">
            {FILTER_GROUPS.map((group) => (
                <div key={group.key}>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">{group.label}</label>
                    <div className="flex flex-wrap gap-1.5">
                        {group.options.map(opt => (
                            <button
                                key={opt}
                                onClick={() => onChange(group.key as keyof MapFilters, opt)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                    filters[group.key as keyof MapFilters] === opt 
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                                    : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
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

      {/* Main Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative z-10 p-2.5 rounded-full transition-all active:scale-95 shadow-md flex items-center gap-2 ${
            isOpen 
            ? 'bg-gray-900 text-white dark:bg-blue-600' 
            : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200'
        }`}
        title="Toggle Filters"
      >
        <Filter size={18} />
        {isOpen && <span className="text-xs font-bold pr-1">Close</span>}
      </button>

    </div>
  );
};

export default MapFilterPanel;
