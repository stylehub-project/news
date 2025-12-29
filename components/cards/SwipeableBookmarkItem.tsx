
import React, { useState, useRef } from 'react';
import { Trash2, Check, Clock, AlertCircle } from 'lucide-react';
import { BookmarkItem } from '../../context/BookmarkContext';
import BlurImageLoader from '../loaders/BlurImageLoader';

interface SwipeableBookmarkItemProps {
  data: BookmarkItem;
  onRead: () => void;
  onDelete: () => void;
  onClick: () => void;
}

const SwipeableBookmarkItem: React.FC<SwipeableBookmarkItemProps> = ({ data, onRead, onDelete, onClick }) => {
  const [offset, setOffset] = useState(0);
  const startX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startX.current) return;
    const currentX = e.touches[0].clientX;
    const delta = currentX - startX.current;
    
    // Limit drag range
    if (Math.abs(delta) < 150) {
        setOffset(delta);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    startX.current = null;

    if (offset > 100) {
        // Swipe Right -> Mark Read
        onRead();
        setOffset(0);
    } else if (offset < -100) {
        // Swipe Left -> Delete
        onDelete();
        setOffset(0); // Item usually disappears, but reset for safety
    } else {
        setOffset(0); // Snap back
    }
  };

  // Importance Badge Color
  const getBadgeColor = (level: string) => {
      switch(level) {
          case 'High': return 'bg-red-100 text-red-700 border-red-200';
          case 'Medium': return 'bg-blue-100 text-blue-700 border-blue-200';
          default: return 'bg-gray-100 text-gray-600 border-gray-200';
      }
  };

  return (
    <div className="relative w-full h-28 overflow-hidden rounded-xl">
        {/* Background Actions */}
        <div className="absolute inset-0 flex justify-between items-center px-6">
            <div className={`flex items-center gap-2 text-green-600 font-bold transition-opacity ${offset > 50 ? 'opacity-100' : 'opacity-0'}`}>
                <Check size={20} /> Mark Read
            </div>
            <div className={`flex items-center gap-2 text-red-600 font-bold transition-opacity ${offset < -50 ? 'opacity-100' : 'opacity-0'}`}>
                Remove <Trash2 size={20} />
            </div>
        </div>

        {/* Foreground Card */}
        <div 
            className="relative w-full h-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm flex overflow-hidden transition-transform duration-200 ease-out z-10 active:cursor-grabbing"
            style={{ transform: `translateX(${offset}px)` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => {
                if (Math.abs(offset) < 5) onClick();
            }}
        >
            {/* Image */}
            <div className="w-28 h-full shrink-0 relative">
                <BlurImageLoader 
                    src={data.imageUrl} 
                    alt={data.title} 
                    className={`w-full h-full object-cover ${data.isRead ? 'grayscale opacity-70' : ''}`} 
                />
                {data.category && (
                    <div className="absolute top-0 left-0 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-br-lg text-[9px] font-bold text-white uppercase">
                        {data.category}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 p-3 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase tracking-wider ${getBadgeColor(data.importance)}`}>
                            {data.importance} Priority
                        </span>
                        {data.isRead && <Check size={14} className="text-green-500" />}
                    </div>
                    <h3 className={`text-sm font-bold leading-snug line-clamp-2 ${data.isRead ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                        {data.title}
                    </h3>
                </div>

                <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-600 dark:text-gray-300">{data.source}</span>
                        <span>•</span>
                        <Clock size={10} />
                        <span>{data.savedAt}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SwipeableBookmarkItem;
