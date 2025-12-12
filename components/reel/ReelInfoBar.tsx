import React from 'react';
import { ChevronRight, Clock } from 'lucide-react';

interface ReelInfoBarProps {
  title: string;
  description: string;
  source: string;
  timeAgo: string;
  tags?: string[];
  onReadMore?: (e: React.MouseEvent) => void;
}

const ReelInfoBar: React.FC<ReelInfoBarProps> = ({
  title,
  description,
  source,
  timeAgo,
  tags = [],
  onReadMore
}) => {
  return (
    <div className="absolute left-0 bottom-0 w-full p-4 pb-[80px] bg-gradient-to-t from-black via-black/80 to-transparent text-white z-10 pointer-events-none">
      <div className="pointer-events-auto">
        {/* Metadata */}
        <div className="flex items-center gap-2 mb-2 animate-in slide-in-from-bottom-2 duration-500">
            <span className="bg-red-600/90 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide shadow-sm">
            {source}
            </span>
            <div className="flex items-center gap-1 text-gray-300 text-xs font-medium">
            <Clock size={12} />
            <span>{timeAgo}</span>
            </div>
        </div>
        
        {/* Title */}
        <h2 className="text-lg md:text-xl font-bold leading-tight mb-2 line-clamp-2 drop-shadow-md text-white animate-in slide-in-from-bottom-3 duration-700">
            {title}
        </h2>
        
        {/* Description / Moving Caption */}
        <div className="relative overflow-hidden mb-3 max-w-[85%]">
            <p className="text-sm text-gray-100 opacity-90 leading-relaxed drop-shadow-sm font-medium animate-in slide-in-from-bottom-4 duration-1000">
                {description}
            </p>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 animate-in slide-in-from-bottom-5 duration-1000 delay-100">
            {tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-[10px] text-blue-200 bg-blue-900/30 px-2 py-0.5 rounded-full border border-blue-500/20 font-medium">#{tag}</span>
            ))}
            </div>
        )}

        {/* CTA */}
        <button 
            onClick={onReadMore}
            className="flex items-center gap-1 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors animate-pulse"
        >
            Read Full Story <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ReelInfoBar;