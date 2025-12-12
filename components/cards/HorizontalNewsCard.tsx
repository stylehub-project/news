import React from 'react';
import Card from '../ui/Card';

interface HorizontalNewsCardProps {
  id: string;
  title: string;
  imageUrl: string;
  source: string;
  timeAgo: string;
  rank?: number;
  onClick?: (id: string) => void;
}

const HorizontalNewsCard: React.FC<HorizontalNewsCardProps> = ({
  id,
  title,
  imageUrl,
  source,
  timeAgo,
  rank,
  onClick
}) => {
  return (
    <Card 
      variant="flat" 
      className="flex gap-3 p-2 items-center hover:bg-gray-100 transition-colors cursor-pointer border-transparent"
      onClick={() => onClick?.(id)}
    >
      {/* Optional Rank for Trending Lists */}
      {rank && (
        <span className="text-2xl font-black text-gray-200 italic w-8 text-center shrink-0">
          {rank}
        </span>
      )}

      {/* Image */}
      <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-200 relative">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 min-w-0 py-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide truncate pr-2">
            {source}
          </span>
          <span className="text-[10px] text-gray-400 whitespace-nowrap">
            {timeAgo}
          </span>
        </div>
        
        <h4 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">
          {title}
        </h4>
      </div>
    </Card>
  );
};

export default HorizontalNewsCard;