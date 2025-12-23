import React, { useState } from 'react';
import { Share2, Bookmark, Clock, ChevronRight, Sparkles, ExternalLink } from 'lucide-react';
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
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({ 
    data, 
    onSwipe, 
    active, 
    next,
    onAIExplain,
    onSave,
    onShare
}) => {
  const navigate = useNavigate();
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
    const delta = current - dragStart;
    setOffset(delta);
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

  const handleCardClick = (e: React.MouseEvent) => {
      // Only navigate if not part of a drag action
      if (Math.abs(offset) < 5) {
          navigate(`/news/${data.id}`);
      }
  };

  // Advanced Animation Styles
  const getStyles = () => {
    if (active) {
      // Calculate rotation: swipe right = rotate clockwise, left = counter-clockwise
      const rotateZ = offset / 15;
      
      // Calculate "Fold/Lift" rotation (3D effect)
      // When swiping, card rotates along Y axis slightly
      const rotateY = offset / 20;

      const opacity = 1 - Math.abs(offset) / 800; // Slower fade
      
      return {
        transform: `translateX(${offset}px) rotateZ(${rotateZ}deg) rotateY(${rotateY}deg) scale(1)`,
        opacity: opacity,
        zIndex: 20,
        transition: isDragging ? 'none' : 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
        cursor: 'grab',
        boxShadow: `0 20px 50px rgba(0,0,0,${0.2 + Math.abs(offset)/1000})`
      };
    } else if (next) {
      // The next card scales up slightly as top card moves away
      const scale = 0.92 + (Math.abs(offset) / 5000); 
      return {
        transform: `scale(${Math.min(1, scale)}) translateY(30px)`,
        opacity: 1, // Keep visible for "stack" look
        zIndex: 10,
        transition: 'all 0.5s ease',
        pointerEvents: 'none'
      } as React.CSSProperties;
    } else {
      return {
        transform: 'scale(0.85) translateY(60px)',
        opacity: 0,
        zIndex: 0
      };
    }
  };

  // Corner Fold Effect Calculation
  // We simulate a corner fold opacity/size based on swipe direction
  const isSwipingLeft = offset < 0;
  const isSwipingRight = offset > 0;
  const foldOpacity = Math.min(Math.abs(offset) / 200, 0.8);

  return (
    <div 
      className="absolute top-0 left-0 w-full h-full p-4"
      style={{ perspective: '1000px' }} // Essential for 3D rotation
    >
      <div 
        className="w-full h-full relative"
        style={getStyles()}
        onTouchStart={active ? handleTouchStart : undefined}
        onTouchMove={active ? handleTouchMove : undefined}
        onTouchEnd={active ? handleTouchEnd : undefined}
      >
        <div 
            className={`w-full h-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden relative border border-gray-100 dark:border-gray-700 select-none ${next ? 'border-t-4 border-indigo-500/20' : ''}`}
            onClick={active ? handleCardClick : undefined}
        >
            
            {/* Visual Fold Effect (Dog-ear style overlay) */}
            {active && isSwipingLeft && (
                <div 
                    className="absolute top-0 right-0 w-24 h-24 z-50 pointer-events-none transition-opacity duration-200"
                    style={{ 
                        opacity: foldOpacity,
                        background: 'linear-gradient(225deg, transparent 50%, rgba(0,0,0,0.1) 50%, rgba(255,255,255,0.8) 55%, #ddd 100%)',
                        boxShadow: '-2px 2px 5px rgba(0,0,0,0.2)'
                    }}
                />
            )}
            
            {/* Dynamic Light Sheen on Swipe */}
            {active && (
                <div 
                    className="absolute inset-0 z-40 pointer-events-none"
                    style={{
                        background: `linear-gradient(${isSwipingRight ? '90deg' : '-90deg'}, transparent, rgba(255,255,255,${foldOpacity * 0.5}), transparent)`
                    }}
                />
            )}

            {/* Border Glow for Next Card hint */}
            {next && <div className="absolute inset-0 bg-black/10 z-50"></div>}

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

            {/* Content Overlay */}
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

                <div className="flex gap-3">
                    <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/news/${data.id}`); }}
                        className="flex-1 bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors active:scale-95 shadow-lg"
                    >
                        Read Story <ChevronRight size={16} />
                    </button>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onAIExplain?.(data.id); }}
                            className="p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition-colors shadow-lg active:scale-90"
                            title="AI Explain"
                        >
                            <Sparkles size={20} className="fill-yellow-300 text-yellow-300" />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onSave?.(data.id); }}
                            className="p-3 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-colors active:scale-90"
                            title="Save"
                        >
                            <Bookmark size={20} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onShare?.(data.id); }}
                            className="p-3 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-colors active:scale-90"
                            title="Share"
                        >
                            <Share2 size={20} />
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