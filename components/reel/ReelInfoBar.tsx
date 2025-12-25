
import React from 'react';
import { ChevronRight, Clock, Sparkles, TrendingUp, UserCheck, MapPin } from 'lucide-react';

interface ReelInfoBarProps {
  title: string;
  description: string;
  source: string;
  category: string;
  aiEnhanced?: boolean;
  timeAgo: string;
  tags?: string[];
  reason?: string;
  onReadMore?: (e: React.MouseEvent) => void;
}

const ReelInfoBar: React.FC<ReelInfoBarProps> = ({
  title,
  description,
  source,
  category,
  aiEnhanced,
  timeAgo,
  tags = [],
  reason,
  onReadMore
}) => {
  // Use a stable layout without conditional rendering animations
  
  const getReasonIcon = () => {
      if (reason?.includes('Trending')) return <TrendingUp size={12} />;
      if (reason?.includes('location') || reason?.includes('nearby')) return <MapPin size={12} />;
      return <UserCheck size={12} />;
  }

  return (
    <div className="absolute left-0 bottom-0 w-full p-5 pb-32 z-10 pointer-events-none flex flex-col items-start gap-3">
      <div className="pointer-events-auto w-[85%] max-w-[500px]">
        
        {/* Personalization Signal */}
        {reason && (
            <div className="mb-2 inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 px-2 py-1 rounded-lg text-[10px] font-bold text-blue-200 uppercase tracking-wide">
                {getReasonIcon()}
                {reason}
            </div>
        )}

        {/* Metadata Row */}
        <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="bg-blue-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">
                {category}
            </span>

            {aiEnhanced && (
              <div className="flex items-center gap-1.5 bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                <Sparkles size={8} className="text-indigo-300" />
                AI Enhanced
              </div>
            )}
            
            <div className="flex items-center gap-1.5 text-gray-300 text-xs font-medium bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm border border-white/10">
                <span className="text-white font-bold">{source}</span>
                <span className="text-[10px] opacity-60">•</span>
                <div className="flex items-center gap-1">
                    <Clock size={10} />
                    <span>{timeAgo}</span>
                </div>
            </div>
        </div>
        
        {/* Headline - Clean & Readable */}
        <h2 className="text-xl md:text-2xl font-black mb-2 drop-shadow-md text-white leading-tight">
            {title}
        </h2>
        
        {/* Description - Short & Sweet */}
        <p className="text-sm text-gray-200 leading-relaxed font-medium line-clamp-2 drop-shadow-sm mb-4">
            {description}
        </p>

        {/* CTA Button - High Visibility */}
        <button 
            onClick={onReadMore}
            className="flex items-center gap-2 text-sm font-bold text-white bg-white/20 hover:bg-white/30 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/20 transition-all active:scale-95 group shadow-lg"
            aria-label="Read full article"
        >
            Read Full Story 
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default ReelInfoBar;
