import React from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Sparkles } from 'lucide-react';

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
  onAIExplain
}) => {
  const buttonBaseClass = "p-3 bg-black/40 border border-white/10 backdrop-blur-xl rounded-full text-white hover:bg-black/60 transition-all active:scale-90 shadow-lg flex items-center justify-center";

  return (
    <div className="absolute right-4 bottom-24 flex flex-col gap-5 items-center z-20 pb-safe pointer-events-auto">
      {/* Like */}
      <div className="flex flex-col items-center gap-1">
        <button 
          onClick={onLike}
          className="group relative active:scale-90 transition-transform"
        >
          <div className={`p-3 rounded-full backdrop-blur-xl border border-white/10 transition-all duration-300 shadow-lg ${isLiked ? 'bg-red-500/80 text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}>
            <Heart size={26} className={`transition-transform duration-200 ${isLiked ? 'fill-current scale-110' : ''}`} />
          </div>
        </button>
        <span className="text-xs font-bold text-white drop-shadow-md">{likes}</span>
      </div>

      {/* Comment */}
      <div className="flex flex-col items-center gap-1">
        <button 
          onClick={onComment}
          className={buttonBaseClass}
        >
          <MessageCircle size={26} />
        </button>
        <span className="text-xs font-bold text-white drop-shadow-md">{comments}</span>
      </div>

      {/* AI Explain - Special Treatment (Center of interactions) */}
      <div className="flex flex-col items-center gap-1 py-1">
        <button 
            onClick={onAIExplain}
            className="group relative active:scale-95 transition-transform"
        >
            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md opacity-50 group-hover:opacity-80 transition-opacity animate-pulse-slow"></div>
            <div className="relative p-3 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full text-white shadow-xl border border-white/30">
                <Sparkles size={24} className="text-yellow-200 group-hover:rotate-12 transition-transform" />
            </div>
        </button>
        <span className="text-[10px] font-bold text-indigo-200 bg-indigo-900/80 px-2 py-0.5 rounded-md backdrop-blur-sm border border-indigo-500/30">AI Info</span>
      </div>

      {/* Save */}
      <button 
        onClick={onSave}
        className={`${buttonBaseClass} ${isSaved ? 'text-blue-400 border-blue-400/50' : ''}`}
      >
        <Bookmark size={26} className={isSaved ? 'fill-current' : ''} />
      </button>

      {/* Share */}
      <button 
        onClick={onShare}
        className={buttonBaseClass}
      >
        <Share2 size={26} />
      </button>
    </div>
  );
};

export default ReelActionBar;