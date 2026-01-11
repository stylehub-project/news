
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Share2, Bookmark, Clock, ChevronRight, Sparkles, Eye, Save } from 'lucide-react';
import BlurImageLoader from '../loaders/BlurImageLoader';
import { useNavigate } from 'react-router-dom';

// Robust Fallback Images (Using reliable services + Unsplash)
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800&auto=format&fit=crop", // News
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop", // Abstract
  "https://picsum.photos/seed/news1/800/600", // Backup 1
  "https://picsum.photos/seed/tech/800/600", // Backup 2
  "https://picsum.photos/seed/politics/800/600", // Backup 3
];

interface SwipeableCardProps {
  data: any;
  onSwipe: (direction: 'left' | 'right') => void;
  active: boolean;
  next?: boolean;
  onAIExplain?: (id: string) => void;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
  onLongPress?: (id: string) => void;
  onRead?: (id: string) => void; // New prop for reading
  programmaticSwipe?: 'left' | 'right' | null;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({ 
    data, 
    onSwipe, 
    active, 
    next,
    onAIExplain,
    onSave,
    onShare,
    onLongPress,
    onRead,
    programmaticSwipe
}) => {
  const navigate = useNavigate();
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  // Deterministic Fallback based on ID to ensure consistency
  const fallbackImage = useMemo(() => {
      let hash = 0;
      const str = data.id || 'default';
      for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % FALLBACK_IMAGES.length;
      return FALLBACK_IMAGES[index];
  }, [data.id]);

  // --- Programmatic Swipe Handling ---
  useEffect(() => {
    if (active && programmaticSwipe) {
      const directionMultiplier = programmaticSwipe === 'right' ? 1 : -1;
      const targetOffset = window.innerWidth * 1.2 * directionMultiplier;
      
      setOffset(targetOffset);
      
      if (programmaticSwipe === 'left' && onSave) onSave(data.id);
      if (programmaticSwipe === 'right' && onShare) onShare(data.id);

      const timer = setTimeout(() => {
        onSwipe(programmaticSwipe);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [programmaticSwipe, active]);

  // --- Touch Handlers ---

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only handle touch on the card itself, not if buttons are pressed
    if ((e.target as HTMLElement).closest('button')) return;

    e.stopPropagation(); // Prevent parent scrolling/swiping
    setDragStart(e.touches[0].clientX);
    setIsDragging(true);
    isLongPressRef.current = false;

    // Start Long Press Timer
    timerRef.current = setTimeout(() => {
        if (Math.abs(offset) < 10) { 
            isLongPressRef.current = true;
            if (navigator.vibrate) navigator.vibrate(50);
            onLongPress?.(data.id);
            setIsDragging(false); 
        }
    }, 600);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStart === null || isLongPressRef.current) return;
    
    const current = e.touches[0].clientX;
    const delta = current - dragStart;
    
    // If moved significantly, cancel long press
    if (Math.abs(delta) > 10 && timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }

    setOffset(delta);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    if (isLongPressRef.current) {
        setDragStart(null);
        setOffset(0);
        return;
    }

    setIsDragging(false);
    
    // Threshold to trigger swipe
    if (Math.abs(offset) > 100) {
      const direction = offset > 0 ? 'right' : 'left';
      
      if (direction === 'left' && onSave) {
          if (navigator.vibrate) navigator.vibrate(20); 
          onSave(data.id);
      }
      if (direction === 'right' && onShare) {
          if (navigator.vibrate) navigator.vibrate(20); 
          onShare(data.id);
      }

      onSwipe(direction);
    } else {
      setOffset(0); // Snap back
    }
    setDragStart(null);
  };

  const handleCardClick = (e: React.MouseEvent) => {
      // Only trigger if not dragging significantly and not long pressing
      if (Math.abs(offset) < 5 && !isLongPressRef.current && !(e.target as HTMLElement).closest('button')) {
          if (onRead) onRead(data.id);
          else navigate(`/news/${data.id}`);
      }
  };

  const getStyles = () => {
    if (active) {
      const rotateZ = offset / 15;
      const opacity = 1 - Math.abs(offset) / 800;
      
      return {
        transform: `translateX(${offset}px) rotateZ(${rotateZ}deg) scale(1)`,
        opacity: opacity,
        zIndex: 20,
        transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
        cursor: 'grab',
        boxShadow: `0 20px 50px rgba(0,0,0,${0.2 + Math.abs(offset)/1000})`,
        touchAction: 'pan-y' // Allow vertical scroll, horizontal is handled by JS
      } as React.CSSProperties;
    } else if (next) {
      const scale = 0.95 + (Math.abs(offset) / 5000); 
      return {
        transform: `scale(${Math.min(1, scale)}) translateY(${20 - Math.abs(offset)/20}px)`,
        opacity: 1, 
        zIndex: 10,
        transition: 'all 0.4s ease',
        pointerEvents: 'none'
      } as React.CSSProperties;
    } else {
      return {
        transform: 'scale(0.9) translateY(40px)',
        opacity: 0,
        zIndex: 0
      } as React.CSSProperties;
    }
  };

  const saveOpacity = Math.min(Math.abs(Math.min(0, offset)) / 80, 1);
  const shareOpacity = Math.min(Math.max(0, offset) / 80, 1);

  return (
    <div 
      className="absolute top-0 left-0 w-full h-full p-4 flex items-center justify-center"
      style={{ perspective: '1000px' }}
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
            {/* SAVE Overlay */}
            <div 
                className="absolute top-8 right-8 z-50 pointer-events-none transform rotate-12 border-4 border-green-500 rounded-lg px-4 py-2 bg-white/20 backdrop-blur-md transition-opacity duration-200"
                style={{ opacity: saveOpacity }}
            >
                <span className="text-green-500 font-black text-2xl uppercase tracking-widest flex items-center gap-2">
                    <Bookmark size={32} fill="currentColor" /> SAVE
                </span>
            </div>

            {/* SHARE Overlay */}
            <div 
                className="absolute top-8 left-8 z-50 pointer-events-none transform -rotate-12 border-4 border-blue-500 rounded-lg px-4 py-2 bg-white/20 backdrop-blur-md transition-opacity duration-200"
                style={{ opacity: shareOpacity }}
            >
                <span className="text-blue-500 font-black text-2xl uppercase tracking-widest flex items-center gap-2">
                    <Share2 size={32} fill="currentColor" /> SHARE
                </span>
            </div>

            {/* Image */}
            <div className="absolute inset-0">
                <BlurImageLoader 
                    src={data.imageUrl} 
                    fallbackSrc={fallbackImage}
                    alt={data.title} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>

            {/* Metadata */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
                <span className="bg-blue-600/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                    {data.category || 'News'}
                </span>
                <span className="bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Clock size={12} /> {data.timeAgo}
                </span>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 w-full p-6 text-white z-10 flex flex-col justify-end h-3/4 bg-gradient-to-t from-black via-black/70 to-transparent">
                <div className="flex items-center gap-2 mb-3 pointer-events-none">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden">
                        <img src={`https://ui-avatars.com/api/?name=${data.source}&background=random`} className="w-full h-full" alt="Source" />
                    </div>
                    <span className="text-sm font-bold opacity-90">{data.source}</span>
                </div>

                <h2 className="text-2xl font-black leading-tight mb-3 line-clamp-3 drop-shadow-md pointer-events-none">
                    {data.title}
                </h2>
                
                <p className="text-sm text-gray-200 line-clamp-2 mb-6 opacity-90 font-medium pointer-events-none">
                    {data.description}
                </p>

                {/* Primary Action Buttons - IMPORTANT: High z-index and pointer-events-auto */}
                <div className="grid grid-cols-4 gap-2 relative z-30 pointer-events-auto">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onLongPress?.(data.id); }}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
                        title="Quick Preview"
                    >
                        <Eye size={20} />
                    </button>

                    <button 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            if (onRead) onRead(data.id); 
                            else navigate(`/news/${data.id}`); 
                        }}
                        className="col-span-2 bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors active:scale-95 shadow-lg"
                    >
                        Read Story <ChevronRight size={16} />
                    </button>
                    
                    <div className="flex flex-col gap-2">
                        <button 
                            id="card-save-btn" 
                            onClick={(e) => { e.stopPropagation(); onSave?.(data.id); }}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl flex-1 flex items-center justify-center shadow-sm active:scale-95 transition-all h-10"
                            title="Save"
                        >
                            <Bookmark size={16} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onShare?.(data.id); }}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl flex-1 flex items-center justify-center shadow-sm active:scale-95 transition-all h-10"
                            title="Share"
                        >
                            <Share2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SwipeableCard;
