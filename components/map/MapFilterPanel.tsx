import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);
  const CATEGORIES = ['All', 'Politics', 'Tech', 'Environment'];
  
  return (
    <div className="relative flex items-center justify-end">
      
      {/* Dropside Container (Expands to Left) */}
      <div 
        className={`absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-11 transition-all duration-300 ease-out overflow-hidden ${
            isOpen ? 'max-w-[400px] opacity-100 pointer-events-auto' : 'max-w-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex gap-1.5 items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-700 shadow-sm">
            {CATEGORIES.map(cat => (
                <button
                    key={cat}
                    onClick={() => onChange('category', cat)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                        filters.category === cat 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {/* Main Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative z-10 p-2 rounded-full transition-all active:scale-90 ${
            isOpen 
            ? 'bg-gray-900 text-white dark:bg-blue-600' 
            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
        }`}
        title="Toggle Filters"
      >
        {isOpen ? <X size={18} /> : <Filter size={18} />}
      </button>

    </div>
  );
};

export default MapFilterPanel;