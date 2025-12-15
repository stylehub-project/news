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
  const isLongTitle = title.length > 60;
  const titleClass = isLongTitle 
    ? "text-lg md:text-xl leading-snug" 
    : "text-2xl md:text-3xl leading-tight";

  const HighlightText = ({ text, highlights }: { text: string, highlights: string[] }) => {
    if (!highlights.length) return <span>{text}</span>;
    
    const parts = text.split(new RegExp(`(${highlights.join('|')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          highlights.some(h => h.toLowerCase() === part.toLowerCase()) ? (
            <span key={i} className="text-white font-bold bg-white/20 px-1 rounded-sm">{part}</span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  const getReasonIcon = () => {
      if (reason?.includes('Trending')) return <TrendingUp size={12} />;
      if (reason?.includes('location') || reason?.includes('nearby')) return <MapPin size={12} />;
      return <UserCheck size={12} />;
  }

  return (
    // Reduced bottom padding (pb-8) since full-screen reels don't have bottom nav
    <div className="absolute left-0 bottom-0 w-full p-5 pb-8 z-10 pointer-events-none flex flex-col items-start gap-3">
      {/* Width limited to avoid right action bar overlap */}
      <div className="pointer-events-auto w-[82%] max-w-[500px]">
        
        {/* Personalization Signal */}
        {reason && (
            <div className="mb-2 inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 px-2 py-1 rounded-lg text-[10px] font-bold text-blue-200 animate-in slide-in-from-bottom-2 fade-in duration-500 uppercase tracking-wide">
                {getReasonIcon()}
                {reason}
            </div>
        )}

        {/* Metadata Row */}
        <div className="mb-2 animate-in slide-in-from-bottom-2 duration-500 flex flex-wrap items-center gap-2">
            <span className="bg-blue-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-lg shadow-blue-900/50">
                {category}
            </span>

            {aiEnhanced && (
              <div className="flex items-center gap-1.5 bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
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
        
        {/* Headline */}
        <h2 className={`${titleClass} font-black mb-3 drop-shadow-md text-white animate-in slide-in-from-bottom-3 duration-700`}>
            {title}
        </h2>
        
        {/* Description */}
        <div className="relative overflow-hidden mb-4">
            <p className="text-sm text-gray-200 leading-relaxed font-medium line-clamp-3 drop-shadow-sm animate-in slide-in-from-bottom-4 duration-1000">
                <HighlightText text={description} highlights={tags} />
            </p>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 animate-in slide-in-from-bottom-5 duration-1000 delay-100">
            {tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-[10px] text-gray-400 font-medium">#{tag}</span>
            ))}
            </div>
        )}

        {/* CTA */}
        <button 
            onClick={onReadMore}
            className="flex items-center gap-2 text-sm font-bold text-white bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 transition-all active:scale-95 group shadow-lg"
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