import React from 'react';
import Card from '../ui/Card';

interface TopHeadlineCardProps {
  id: string;
  title: string;
  imageUrl: string;
  source: string;
  timeAgo: string;
  category?: string;
  onClick?: (id: string) => void;
}

const TopHeadlineCard: React.FC<TopHeadlineCardProps> = ({
  id,
  title,
  imageUrl,
  source,
  timeAgo,
  category,
  onClick
}) => {
  return (
    <Card 
      className="relative w-full aspect-[4/3] md:aspect-[2/1] overflow-hidden group cursor-pointer"
      onClick={() => onClick?.(id)}
    >
      {/* Background Image */}
      <img 
        src={imageUrl} 
        alt={title} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-5 text-white">
        <div className="flex items-center gap-2 mb-2 opacity-90">
          {category && (
            <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              {category}
            </span>
          )}
          <span className="text-xs font-medium">{timeAgo}</span>
        </div>

        <h2 className="text-xl md:text-2xl font-bold leading-tight mb-1 drop-shadow-sm line-clamp-3">
          {title}
        </h2>
        
        <p className="text-xs text-gray-300 font-medium mt-2 flex items-center gap-2">
          <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
          {source}
        </p>
      </div>
    </Card>
  );
};

export default TopHeadlineCard;