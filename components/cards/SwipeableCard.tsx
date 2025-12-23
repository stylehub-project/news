
import React, { useState, useRef } from 'react';
import { Share2, Bookmark, Clock, ChevronRight, Sparkles, Zap, Check } from 'lucide-react';
import BlurImageLoader from '../loaders/BlurImageLoader';
import { useNavigate } from 'react-router-dom';

interface SwipeableCardProps {
  data: any;
  onSwipe: (direction: 'left' | 'right') => void;
  active: boolean;
  next?: boolean;
  onAIExplain?: (id: string) => void;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
  onLongPress?: (id: string) => void;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({ 
    data, 
    onSwipe, 
    active, 
    next,
    onAIExplain,
    onSave,
    onShare,
    onLongPress
}) => {
  const navigate = useNavigate();
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  // --- Touch Handlers ---

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStart(e.touches[0].clientX);
    setIsDragging(true);
    isLongPressRef.current = false;

    // Start Long Press Timer (600ms)
    timerRef.current = setTimeout(() => {
        if (Math.abs(offset) < 10) { // Only if not dragged significantly
            isLongPressRef.current = true;
            if (navigator.vibrate) navigator.vibrate(50);
            onLongPress?.(data.id);
            setIsDragging(false); // Cancel drag visual
        }
    }, 600);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStart === null || isLongPressRef.current) return;
    
    const current = e.touches[0].clientX;
    const delta = current - dragStart;
    
    // If moved significantly, cancel long press timer
    if (Math.abs(delta) > 10 && timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }

    setOffset(delta);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    if (isLongPressRef.current) {
        setDragStart(null);
        setOffset(0);
        return;
    }

    setIsDragging(false);
    
    // Threshold to trigger swipe
    if (Math.abs(offset) > 120) {
      const direction = offset > 0 ? 'right' : 'left';
      
      // Trigger specific actions based on direction
      if (direction === 'left' && onSave) {
          if (navigator.vibrate) navigator.vibrate(20); // Haptic
          onSave(data.id);
      }
      if (direction === 'right' && onShare) {
          if (navigator.vibrate) navigator.vibrate(20); // Haptic
          onShare(data.id);
      }

      onSwipe(direction);
    } else {
      setOffset(0); // Snap back
    }
    setDragStart(null);
  };

  const handleCardClick = (e: React.MouseEvent) => {
      // Navigate only if it was a tap (not a drag or long press)
      if (Math.abs(offset) < 5 && !isLongPressRef.current) {
          navigate(`/news/${data.id}`);
      }
  };

  // --- Animation Styles ---

  const getStyles = () => {
    if (active) {
      // Rotate: Swipe Right (Share) -> Rotate CW, Swipe Left (Save) -> Rotate CCW
      const rotateZ = offset / 15;
      const opacity = 1 - Math.abs(offset) / 500; // Fade out slightly
      
      return {
        transform: `translateX(${offset}px) rotateZ(${rotateZ}deg) scale(1)`,
        opacity: opacity,
        zIndex: 20,
        transition: isDragging ? 'none' : 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
        cursor: 'grab',
        boxShadow: `0 20px 50px rgba(0,0,0,${0.2 + Math.abs(offset)/1000})`
      };
    } else if (next) {
      // Scale up next card as top card leaves
      const scale = 0.95 + (Math.abs(offset) / 5000); 
      return {
        transform: `scale(${Math.min(1, scale)}) translateY(${20 - Math.abs(offset)/20}px)`,
        opacity: 1, 
        zIndex: 10,
        transition: 'all 0.5s ease',
        pointerEvents: 'none'
      } as React.CSSProperties;
    } else {
      // Hidden cards in stack
      return {
        transform: 'scale(0.9) translateY(40px)',
        opacity: 0,
        zIndex: 0
      };
    }
  };

  // Calculate Opacity for "Action Stamps"
  const saveOpacity = Math.min(Math.abs(Math.min(0, offset)) / 100, 1); // Left drag
  const shareOpacity = Math.min(Math.max(0, offset) / 100, 1); // Right drag

  return (
    <div 
      className="absolute top-0 left-0 w-full h-full p-4 flex items-center justify-center"
      style={{ perspective: '1000px' }} // Essential for 3D feel
    >
      <div 
        className="w-full h-full relative max-h-[600px]"
        style={getStyles()}
        onTouchStart={active ? handleTouchStart : undefined}
        onTouchMove={active ? handleTouchMove : undefined}
        onTouchEnd={active ? handleTouchEnd : undefined}
      >
        <div 
            className={`w-full h-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden relative border border-gray-100 dark:border-gray-700 select-none ${next ? 'border-t-4 border-indigo-500/20' : ''}`}
            onClick={active ? handleCardClick : undefined}
        >
            
            {/* --- VISUAL ACTION OVERLAYS --- */}
            
            {/* SAVE Overlay (Swipe Left) */}
            <div 
                className="absolute top-8 right-8 z-50 pointer-events-none transform rotate-12 border-4 border-green-500 rounded-lg px-4 py-2 bg-white/20 backdrop-blur-md"
                style={{ opacity: saveOpacity }}
            >
                <span className="text-green-500 font-black text-2xl uppercase tracking-widest flex items-center gap-2">
                    <Bookmark size={32} fill="currentColor" /> SAVE
                </span>
            </div>

            {/* SHARE Overlay (Swipe Right) */}
            <div 
                className="absolute top-8 left-8 z-50 pointer-events-none transform -rotate-12 border-4 border-blue-500 rounded-lg px-4 py-2 bg-white/20 backdrop-blur-md"
                style={{ opacity: shareOpacity }}
            >
                <span className="text-blue-500 font-black text-2xl uppercase tracking-widest flex items-center gap-2">
                    <Share2 size={32} fill="currentColor" /> SHARE
                </span>
            </div>

            {/* --- CARD CONTENT --- */}

            {/* Full Background Image */}
            <div className="absolute inset-0">
                <BlurImageLoader src={data.imageUrl} alt={data.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
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

            {/* Content Info Overlay */}
            <div className="absolute bottom-0 left-0 w-full p-6 text-white z-10 flex flex-col justify-end h-3/4 bg-gradient-to-t from-black via-black/70 to-transparent">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden">
                        <img src={`https://ui-avatars.com/api/?name=${data.source}&background=random`} className="w-full h-full" alt="Source" />
                    </div>
                    <span className="text-sm font-bold opacity-90">{data.source}</span>
                </div>

                <h2 className="text-2xl font-black leading-tight mb-3 line-clamp-3 drop-shadow-md">
                    {data.title}
                </h2>
                
                <p className="text-sm text-gray-200 line-clamp-2 mb-6 opacity-90 font-medium">
                    {data.description}
                </p>

                {/* Footer Buttons */}
                <div className="flex gap-3">
                    <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/news/${data.id}`); }}
                        className="flex-1 bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors active:scale-95 shadow-lg"
                    >
                        Read Story <ChevronRight size={16} />
                    </button>
                    
                    {/* AI Analysis Icon (Robot/Sparkles) */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onAIExplain?.(data.id); }}
                        className="p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition-colors shadow-lg active:scale-90 relative group"
                        title="AI Analysis"
                    >
                        <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse group-hover:hidden"></div>
                        <Sparkles size={20} className="fill-yellow-300 text-yellow-300 relative z-10" />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SwipeableCard;
