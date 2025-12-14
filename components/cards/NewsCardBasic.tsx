import React from 'react';
import { Clock, Share2, Bookmark, Sparkles } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import BlurImageLoader from '../loaders/BlurImageLoader';

interface NewsCardBasicProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  source: string;
  timeAgo: string;
  category?: string;
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
  onSave,
  onShare,
  onAIExplain,
  onClick
}) => {
  return (
    <Card 
      className="flex flex-col h-full hover:shadow-md transition-shadow duration-300 border-gray-100 dark:border-gray-800 dark:bg-gray-800"
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
        {category && (
          <span className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-blue-800 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wide z-10">
            {category}
          </span>
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

        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug mb-2 line-clamp-2">
          {title}
        </h3>

        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
          {description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-700 mt-auto">
          {/* AI Explain Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); onAIExplain?.(id); }}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors group"
          >
            <Sparkles size={12} className="group-hover:rotate-12 transition-transform" />
            AI Explain
          </button>

          <div className="flex gap-1">
             <Button 
               variant="icon-button" 
               size="sm" 
               className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
               onClick={(e) => { e.stopPropagation(); onSave?.(id); }}
             >
               <Bookmark size={18} />
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