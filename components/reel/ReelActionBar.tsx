
import React from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Sparkles, MoreHorizontal } from 'lucide-react';

interface ReelActionBarProps {
  likes?: string;
  comments?: string;
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
  isLiked,
  isSaved,
  onLike,
  onComment,
  onShare,
  onSave,
  onAIExplain,
  onMore
}) => {
  const buttonBaseClass = "p-3 bg-black/40 border border-white/10 backdrop-blur-xl rounded-full text-white hover:bg-black/60 transition-all active:scale-90 shadow-lg flex items-center justify-center w-12 h-12";

  const handleAction = (e: React.MouseEvent, action?: (e?: React.MouseEvent) => void) => {
      e.stopPropagation();
      action?.(e);
  };

  return (
    <div className="absolute right-4 bottom-24 flex flex-col gap-4 items-center z-20 pb-safe pointer-events-auto">
      {/* Like */}
      <button 
        onClick={(e) => handleAction(e, onLike)}
        className="group relative active:scale-90 transition-transform w-12 h-12 flex items-center justify-center"
        aria-label={isLiked ? "Unlike" : "Like"}
      >
        <div className={`p-3 rounded-full backdrop-blur-xl border border-white/10 transition-all duration-300 shadow-lg w-full h-full flex items-center justify-center ${isLiked ? 'bg-red-500/80 text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}>
          <Heart size={24} className={`transition-transform duration-200 ${isLiked ? 'fill-current scale-110' : ''}`} />
        </div>
      </button>

      {/* Comment */}
      <button 
        onClick={(e) => handleAction(e, onComment)}
        className={buttonBaseClass}
        aria-label="Comments"
      >
        <MessageCircle size={24} />
      </button>

      {/* AI Explain */}
      <button 
          onClick={(e) => handleAction(e, onAIExplain)}
          className="group relative active:scale-95 transition-transform w-14 h-14 flex items-center justify-center"
          aria-label="AI Explain"
      >
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md opacity-50 group-hover:opacity-80 transition-opacity animate-pulse-slow"></div>
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full text-white shadow-xl border border-white/30">
              <Sparkles size={26} className="text-yellow-200 group-hover:rotate-12 transition-transform" />
          </div>
      </button>

      {/* Save */}
      <button 
        onClick={(e) => handleAction(e, onSave)}
        className={`${buttonBaseClass} ${isSaved ? 'text-blue-400 border-blue-400/50' : ''}`}
        aria-label={isSaved ? "Unsave" : "Save"}
      >
        <Bookmark size={24} className={isSaved ? 'fill-current' : ''} />
      </button>

      {/* Share */}
      <button 
        onClick={(e) => handleAction(e, onShare)}
        className={buttonBaseClass}
        aria-label="Share"
      >
        <Share2 size={24} />
      </button>

      {/* More Options */}
      <button 
        onClick={(e) => handleAction(e, onMore)}
        className={buttonBaseClass}
        aria-label="More Options"
      >
        <MoreHorizontal size={24} />
      </button>
    </div>
  );
};

export default ReelActionBar;
