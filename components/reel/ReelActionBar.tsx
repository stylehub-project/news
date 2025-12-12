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
  return (
    <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-20 pb-safe pointer-events-auto">
      {/* Like */}
      <div className="flex flex-col items-center gap-1">
        <button 
          onClick={onLike}
          className="group relative active:scale-90 transition-transform"
        >
          <div className={`p-3 rounded-full backdrop-blur-md border border-white/10 transition-all duration-300 ${isLiked ? 'bg-red-500/20 text-red-500' : 'bg-black/20 text-white hover:bg-black/40'}`}>
            <Heart size={28} className={`transition-transform duration-200 ${isLiked ? 'fill-current scale-110' : ''}`} />
          </div>
        </button>
        <span className="text-xs font-bold text-white shadow-black drop-shadow-md">{likes}</span>
      </div>

      {/* Comment */}
      <div className="flex flex-col items-center gap-1">
        <button 
          onClick={onComment}
          className="p-3 bg-black/20 border border-white/10 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-all active:scale-90"
        >
          <MessageCircle size={28} />
        </button>
        <span className="text-xs font-bold text-white shadow-black drop-shadow-md">{comments}</span>
      </div>

      {/* AI Explain */}
      <button 
        onClick={onAIExplain}
        className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
      >
        <div className="p-3 bg-gradient-to-tr from-indigo-600 to-purple-600 backdrop-blur-md rounded-full text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all ring-2 ring-white/20">
          <Sparkles size={26} className="text-yellow-200" />
        </div>
        <span className="text-[10px] font-bold text-white bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10">Summary</span>
      </button>

      {/* Save / Bookmark */}
      <button 
        onClick={onSave}
        className={`p-3 rounded-full border border-white/10 backdrop-blur-md transition-all active:scale-90 ${isSaved ? 'bg-blue-500/20 text-blue-400' : 'bg-black/20 text-white hover:bg-black/40'}`}
      >
        <Bookmark size={28} className={isSaved ? 'fill-current' : ''} />
      </button>

      {/* Share */}
      <button 
        onClick={onShare}
        className="p-3 bg-black/20 border border-white/10 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-all active:scale-90"
      >
        <Share2 size={28} />
      </button>
    </div>
  );
};

export default ReelActionBar;