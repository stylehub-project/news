import React from 'react';
import { X, ChevronRight, Clock } from 'lucide-react';

interface NewsPopupProps {
  data: {
    id: string;
    title: string;
    source: string;
    time: string;
    imageUrl?: string;
    type: string;
  };
  onClose: () => void;
  onRead: (id: string) => void;
}

const NewsPopup: React.FC<NewsPopupProps> = ({ data, onClose, onRead }) => {
  return (
    <div className="absolute bottom-24 left-4 right-4 md:left-auto md:right-auto md:w-80 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-40 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl overflow-hidden p-1">
        <div className="relative">
          {/* Close Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 text-white rounded-full p-1 z-10 transition-colors"
          >
            <X size={14} />
          </button>

          {/* Image */}
          <div className="h-32 w-full rounded-xl overflow-hidden relative">
             {data.imageUrl ? (
               <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-400 text-xs">No Image</div>
             )}
             <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase">
               {data.type}
             </div>
          </div>

          {/* Content */}
          <div className="p-3">
            <div className="flex items-center gap-2 mb-1 text-gray-500 text-[10px]">
              <span className="font-bold text-gray-700">{data.source}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5"><Clock size={10}/> {data.time}</span>
            </div>
            
            <h3 className="text-sm font-bold leading-snug mb-3 line-clamp-2">{data.title}</h3>
            
            <button 
              onClick={() => onRead(data.id)}
              className="w-full bg-gray-900 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-black transition-colors"
            >
              Read Story <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPopup;