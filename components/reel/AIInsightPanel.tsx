
import React from 'react';
import { BrainCircuit, ChevronDown } from 'lucide-react';

interface AIInsightPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  insight: string;
}

const AIInsightPanel: React.FC<AIInsightPanelProps> = ({ isOpen, onToggle, insight }) => {
  return (
    <div className="w-full mt-4 mb-2">
      <button 
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 ${
          isOpen 
            ? 'bg-yellow-500/10 border-yellow-500/50' 
            : 'bg-white/5 border-white/10 hover:bg-white/10'
        }`}
      >
        <div className="flex items-center gap-2">
          <BrainCircuit size={16} className={isOpen ? 'text-yellow-400' : 'text-gray-400'} />
          <span className={`text-xs font-bold uppercase tracking-wider ${isOpen ? 'text-yellow-400' : 'text-gray-400'}`}>
            Why It Matters
          </span>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <div 
        className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOpen ? 'max-h-48 opacity-100 mt-2' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border-l-2 border-yellow-500 p-4 rounded-r-xl backdrop-blur-sm">
          <p className="text-sm font-medium text-yellow-100 leading-relaxed">
            {insight}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIInsightPanel;
