
import React from 'react';
import { Clock, Share2, Bookmark, Sparkles, Eye, RefreshCw, CheckCircle2, RotateCw, BrainCircuit } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import BlurImageLoader from '../loaders/BlurImageLoader';
import { useBookmark } from '../../context/BookmarkContext';
import { useHistory } from '../../context/HistoryContext';

interface NewsCardBasicProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  source: string;
  timeAgo: string;
  category?: string;
  contextLabel?: string; // 15.8 Context Label
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
  onAIExplain?: (id: string) => void;
  onClick?: (id: string) => void;
}

const NewsCardBasic: React.FC<NewsCardBasicProps> = ({
  id,
  title,
  description,
  imageUrl,
  source,
  timeAgo,
  category,
  contextLabel,
  onSave,
  onShare,
  onAIExplain,
  onClick
}) => {
  const { isBookmarked, toggleBookmark } = useBookmark();
  const { checkReadStatus } = useHistory();
  
  const saved = isBookmarked(id);
  const { seen, isUpdated, status, progress, visitCount, hasExplained } = checkReadStatus(id);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark({
      id,
      title,
      description,
      imageUrl,
      source,
      timeAgo,
      category
    });
    onSave?.(id);
  };

  return (
    <Card 
      className={`flex flex-col h-full hover:shadow-md transition-shadow duration-300 border-gray-100 dark:border-gray-800 dark:bg-gray-800 ${status === 'read' && !isUpdated ? 'opacity-75 grayscale-[30%]' : ''}`}
      hoverable
      onClick={() => onClick?.(id)}
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <BlurImageLoader 
          src={imageUrl} 
          alt={title} 
          wrapperClassName="w-full h-full"
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        
        {/* 15.8 Context Label (e.g. "Because you read...") */}
        {contextLabel && (
            <div className="absolute top-0 left-0 w-full bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 z-20 flex items-center gap-1.5">
                <Sparkles size={10} className="text-yellow-300" />
                {contextLabel}
            </div>
        )}

        <div className={`absolute left-3 flex gap-2 z-10 ${contextLabel ? 'top-8' : 'top-3'}`}>
            {category && (
            <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-blue-800 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wide">
                {category}
            </span>
            )}
            
            {/* 15.4 & 15.11 Story Evolution */}
            {isUpdated && (
                <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wide flex items-center gap-1 animate-pulse">
                    <RefreshCw size={10} /> Updated
                </span>
            )}
        </div>

        {/* 15.7 Memory Tags */}
        <div className={`absolute right-3 z-10 flex flex-col items-end gap-1 ${contextLabel ? 'top-8' : 'top-3'}`}>
            {/* 15.11 Previously Explained */}
            {hasExplained && (
                <div className="bg-indigo-600/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20 shadow-sm">
                    <BrainCircuit size={10} className="text-indigo-200" /> Explained
                </div>
            )}

            {status === 'read' && !isUpdated && (
                <div className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
                    <CheckCircle2 size={10} className="text-green-400" /> Read
                </div>
            )}
            {visitCount > 2 && (
                <div className="bg-purple-600/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20 shadow-sm">
                    <RotateCw size={10} /> {visitCount}x
                </div>
            )}
        </div>

        {/* 15.7 Partial Progress Bar */}
        {status === 'partial' && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700/50">
                <div className="h-full bg-yellow-400" style={{ width: `${progress}%` }}></div>
            </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{source}</span>
          <span className="text-[10px] text-gray-400">•</span>
          <div className="flex items-center gap-1 text-gray-400 text-[10px]">
            <Clock size={10} />
            <span>{timeAgo}</span>
          </div>
        </div>

        <h3 className={`text-base font-bold dark:text-white leading-snug mb-2 line-clamp-2 ${status === 'read' ? 'text-gray-500 font-medium' : 'text-gray-900'}`}>
          {title}
        </h3>

        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
          {description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-700 mt-auto">
          {/* AI Explain Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); onAIExplain?.(id); }}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors group ${hasExplained ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'}`}
          >
            <Sparkles size={12} className="group-hover:rotate-12 transition-transform" />
            {hasExplained ? 'Re-Analyze' : 'AI Explain'}
          </button>

          <div className="flex gap-1">
             <Button 
               variant="icon-button" 
               size="sm" 
               className={`transition-colors ${saved ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
               onClick={handleBookmark}
             >
               <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
             </Button>
             <Button 
               variant="icon-button" 
               size="sm"
               className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
               onClick={(e) => { e.stopPropagation(); onShare?.(id); }}
             >
               <Share2 size={18} />
             </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NewsCardBasic;
