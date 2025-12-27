
import React from 'react';
import { Sparkles, Bookmark, Share2, ArrowRight, Repeat } from 'lucide-react';

interface ReelActionToolbarProps {
  onExplain: () => void;
  onSave: () => void;
  onShare: () => void;
  onReadFull: () => void;
}

const ReelActionToolbar: React.FC<ReelActionToolbarProps> = ({ onExplain, onSave, onShare, onReadFull }) => {
  return (
    <div className="absolute bottom-6 left-4 right-4 z-30 flex items-center justify-between bg-gray-900/80 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300">
      
      <div className="flex gap-1">
        <button 
            onClick={(e) => { e.stopPropagation(); onExplain(); }}
            className="flex flex-col items-center justify-center w-14 h-12 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 transition-colors gap-0.5 group"
        >
            <Sparkles size={18} className="group-hover:text-white transition-colors" />
            <span className="text-[9px] font-bold">Explain</span>
        </button>

        <button 
            onClick={(e) => { e.stopPropagation(); onSave(); }}
            className="flex flex-col items-center justify-center w-14 h-12 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors gap-0.5"
        >
            <Bookmark size={18} />
            <span className="text-[9px] font-bold">Save</span>
        </button>

        <button 
            onClick={(e) => { e.stopPropagation(); onShare(); }}
            className="flex flex-col items-center justify-center w-14 h-12 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors gap-0.5"
        >
            <Share2 size={18} />
            <span className="text-[9px] font-bold">Share</span>
        </button>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onReadFull(); }}
        className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors shadow-lg active:scale-95"
      >
        Read Full <ArrowRight size={16} />
      </button>

    </div>
  );
};

export default ReelActionToolbar;
