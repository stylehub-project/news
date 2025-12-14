import React from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Sparkles, MoreHorizontal } from 'lucide-react';

interface ReelActionBarProps {
  likes: string;
  comments: string;
  isLiked?: boolean;
  isSaved?: boolean;
  onLike?: (e?: React.MouseEvent) => void;
  onComment?: (e?: React.MouseEvent) => void;
  onShare?: (e?: React.MouseEvent) => void;
  onSave?: (e?: React.MouseEvent) => void;
  onAIExplain?: (e?: React.MouseEvent) => void;
  onMore?: (e?: React.MouseEvent) => void;
}

const ReelActionBar: React.FC<ReelActionBarProps> = ({
  likes,
  comments,
  isLiked,
  isSaved,
  onLike,
  onComment,
  onShare,
  onSave,
  onAIExplain,
  onMore
}) => {
  // Ensure min-height/width is adequate for touch targets (min 44px)
  const buttonBaseClass = "p-3 bg-black/40 border border-white/10 backdrop-blur-xl rounded-full text-white hover:bg-black/60 transition-all active:scale-90 shadow-lg flex items-center justify-center w-12 h-12";

  return (
    <div className="absolute right-4 bottom-24 flex flex-col gap-4 items-center z-20 pb-safe pointer-events-auto">
      {/* Like */}
      <div className="flex flex-col items-center gap-1">
        <button 
          onClick={onLike}
          className="group relative active:scale-90 transition-transform w-12 h-12 flex items-center justify-center"
          aria-label={isLiked ? "Unlike" : "Like"}
        >
          <div className={`p-3 rounded-full backdrop-blur-xl border border-white/10 transition-all duration-300 shadow-lg w-full h-full flex items-center justify-center ${isLiked ? 'bg-red-500/80 text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}>
            <Heart size={24} className={`transition-transform duration-200 ${isLiked ? 'fill-current scale-110' : ''}`} />
          </div>
        </button>
        <span className="text-xs font-bold text-white drop-shadow-md">{likes}</span>
      </div>

      {/* Comment */}
      <div className="flex flex-col items-center gap-1">
        <button 
          onClick={onComment}
          className={buttonBaseClass}
          aria-label="Comments"
        >
          <MessageCircle size={24} />
        </button>
        <span className="text-xs font-bold text-white drop-shadow-md">{comments}</span>
      </div>

      {/* AI Explain - Special Treatment (Center of interactions) */}
      <div className="flex flex-col items-center gap-1 py-1">
        <button 
            onClick={onAIExplain}
            className="group relative active:scale-95 transition-transform w-14 h-14 flex items-center justify-center"
            aria-label="AI Explain"
        >
            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md opacity-50 group-hover:opacity-80 transition-opacity animate-pulse-slow"></div>
            <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full text-white shadow-xl border border-white/30">
                <Sparkles size={26} className="text-yellow-200 group-hover:rotate-12 transition-transform" />
            </div>
        </button>
        <span className="text-[10px] font-bold text-indigo-200 bg-indigo-900/80 px-2 py-0.5 rounded-md backdrop-blur-sm border border-indigo-500/30">AI Info</span>
      </div>

      {/* Save */}
      <button 
        onClick={onSave}
        className={`${buttonBaseClass} ${isSaved ? 'text-blue-400 border-blue-400/50' : ''}`}
        aria-label={isSaved ? "Unsave" : "Save"}
      >
        <Bookmark size={24} className={isSaved ? 'fill-current' : ''} />
      </button>

      {/* Share */}
      <button 
        onClick={onShare}
        className={buttonBaseClass}
        aria-label="Share"
      >
        <Share2 size={24} />
      </button>

      {/* More Options (Personalization) */}
      <button 
        onClick={onMore}
        className={buttonBaseClass}
        aria-label="More Options"
      >
        <MoreHorizontal size={24} />
      </button>
    </div>
  );
};

export default ReelActionBar;