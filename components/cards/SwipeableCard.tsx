import React, { useState, useEffect } from 'react';
import { Share2, Bookmark, Clock, ChevronRight } from 'lucide-react';

interface SwipeableCardProps {
  data: any;
  onSwipe: (direction: 'left' | 'right') => void;
  active: boolean;
  next?: boolean;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({ data, onSwipe, active, next }) => {
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStart(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStart === null) return;
    const current = e.touches[0].clientX;
    setOffset(current - dragStart);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (Math.abs(offset) > 100) {
      onSwipe(offset > 0 ? 'right' : 'left');
    } else {
      setOffset(0);
    }
    setDragStart(null);
  };

  // Intro/Outro Animation Styles
  const getStyles = () => {
    if (active) {
      const rotation = offset / 20;
      const opacity = 1 - Math.abs(offset) / 500;
      return {
        transform: `translateX(${offset}px) rotate(${rotation}deg) scale(1)`,
        opacity: opacity,
        zIndex: 10,
        transition: isDragging ? 'none' : 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)'
      };
    } else if (next) {
      return {
        transform: 'scale(0.95) translateY(10px)',
        opacity: 0.6,
        zIndex: 5,
        transition: 'all 0.5s ease'
      };
    } else {
      return {
        transform: 'scale(0.9) translateY(20px)',
        opacity: 0,
        zIndex: 0
      };
    }
  };

  return (
    <div 
      className="absolute top-0 left-0 w-full h-full p-4"
      style={getStyles()}
      onTouchStart={active ? handleTouchStart : undefined}
      onTouchMove={active ? handleTouchMove : undefined}
      onTouchEnd={active ? handleTouchEnd : undefined}
    >
      <div className="w-full h-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden relative border border-gray-100 dark:border-gray-700 select-none">
        
        {/* Full Background Image */}
        <div className="absolute inset-0">
            <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
            <span className="bg-blue-600/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                {data.category}
            </span>
            <span className="bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Clock size={12} /> {data.timeAgo}
            </span>
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-6 text-white z-10">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <img src={`https://ui-avatars.com/api/?name=${data.source}&background=random`} className="w-full h-full rounded-full" alt="Source" />
                </div>
                <span className="text-sm font-bold opacity-90">{data.source}</span>
            </div>

            <h2 className="text-2xl font-black leading-tight mb-3 line-clamp-3 drop-shadow-md">
                {data.title}
            </h2>
            
            <p className="text-sm text-gray-200 line-clamp-2 mb-6 opacity-90">
                {data.description}
            </p>

            <div className="flex gap-3">
                <button className="flex-1 bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors active:scale-95">
                    Read Story <ChevronRight size={16} />
                </button>
                <button className="p-3 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-colors">
                    <Bookmark size={20} />
                </button>
                <button className="p-3 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-colors">
                    <Share2 size={20} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SwipeableCard;
