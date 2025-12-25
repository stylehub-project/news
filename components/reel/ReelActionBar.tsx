
import React from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Sparkles, RefreshCw } from 'lucide-react';

interface ReelActionBarProps {
  isLiked?: boolean;
  isSaved?: boolean;
  onLike?: (e?: React.MouseEvent) => void;
  onComment?: (e?: React.MouseEvent) => void;
  onShare?: (e?: React.MouseEvent) => void;
  onSave?: (e?: React.MouseEvent) => void;
  onAIExplain?: (e?: React.MouseEvent) => void;
  onSwitchPerspective?: (e?: React.MouseEvent) => void;
  currentPerspective?: string;
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
  onSwitchPerspective,
  currentPerspective = 'Neutral',
  onMore
}) => {
  return (
    <div className="flex items-center justify-between px-2">
        {/* Left Actions */}
        <div className="flex items-center gap-4">
            <button 
                onClick={(e) => { e.stopPropagation(); onLike?.(e); }} 
                className="flex flex-col items-center gap-1 group"
            >
                <div className={`p-2 rounded-full transition-colors ${isLiked ? 'text-red-500 bg-red-500/10' : 'text-gray-400 hover:text-white'}`}>
                    <Heart size={24} className={isLiked ? 'fill-current' : ''} />
                </div>
                <span className="text-[10px] text-gray-500 font-medium">Like</span>
            </button>

            <button 
                onClick={(e) => { e.stopPropagation(); onSwitchPerspective?.(e); }} 
                className="flex flex-col items-center gap-1 group"
            >
                <div className="p-2 rounded-full text-indigo-400 hover:text-white hover:bg-indigo-500/20 transition-all">
                    <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-500" />
                </div>
                <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">{currentPerspective}</span>
            </button>

            <button 
                onClick={(e) => { e.stopPropagation(); onShare?.(e); }} 
                className="flex flex-col items-center gap-1 group"
            >
                <div className="p-2 rounded-full text-gray-400 hover:text-white transition-colors">
                    <Share2 size={24} />
                </div>
                <span className="text-[10px] text-gray-500 font-medium">Share</span>
            </button>
        </div>

        {/* Center/Right Actions */}
        <div className="flex items-center gap-3">
             <button 
                onClick={(e) => { e.stopPropagation(); onAIExplain?.(e); }} 
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-full text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all active:scale-95"
            >
                <Sparkles size={16} className="text-yellow-300 fill-yellow-300" />
                <span className="text-xs font-bold">Explain</span>
            </button>

            <button 
                onClick={(e) => { e.stopPropagation(); onSave?.(e); }} 
                className={`p-2 rounded-full border transition-colors ${isSaved ? 'bg-blue-600 border-blue-600 text-white' : 'border-white/20 text-gray-400 hover:text-white hover:border-white/40'}`}
            >
                <Bookmark size={20} className={isSaved ? 'fill-current' : ''} />
            </button>
        </div>
    </div>
  );
};

export default ReelActionBar;
