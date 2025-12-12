import React from 'react';
import { Trash2, Clock, ExternalLink } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface BookmarkCardProps {
  id: string;
  title: string;
  imageUrl: string;
  source: string;
  savedAt: string;
  category?: string;
  onRemove?: (id: string) => void;
  onClick?: (id: string) => void;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({
  id,
  title,
  imageUrl,
  source,
  savedAt,
  category,
  onRemove,
  onClick
}) => {
  return (
    <Card 
      className="flex flex-row overflow-hidden group border border-gray-100 hover:border-blue-100 transition-colors cursor-pointer h-28"
      onClick={() => onClick?.(id)}
    >
      <div className="w-28 relative shrink-0">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        {category && (
           <div className="absolute top-0 left-0 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-br-lg">
             <span className="text-[10px] text-white font-bold">{category}</span>
           </div>
        )}
      </div>

      <div className="flex-1 p-3 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug mb-1">
            {title}
          </h3>
          <p className="text-xs text-gray-500">{source}</p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <Clock size={10} />
            <span>Saved {savedAt}</span>
          </div>

          <div className="flex gap-1">
            <Button 
               variant="ghost" 
               size="sm" 
               className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
               onClick={(e) => { e.stopPropagation(); onRemove?.(id); }}
            >
               <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BookmarkCard;