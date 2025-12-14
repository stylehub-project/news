import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import ReelActionBar from './ReelActionBar';
import ReelInfoBar from './ReelInfoBar';
import ReelCommentsSheet from './ReelCommentsSheet';
import ReelShareSheet from './ReelShareSheet';
import ReelOptionsSheet from './ReelOptionsSheet';
import ReelExpandLayer from './ReelExpandLayer';
import LikeAnimation from './LikeAnimation';

interface ReelItemProps {
  data: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    source: string;
    category: string;
    aiEnhanced?: boolean;
    timeAgo: string;
    likes: string;
    comments: string;
    tags?: string[];
    // Extended AI Data
    aiSummary?: string;
    keyPoints?: string[];
    factCheck?: { status: string; score: number };
    location?: { name: string; lat: number; lng: number };
    relatedNews?: Array<{ id: string; title: string; image: string; time: string }>;
    // Personalization Signal
    personalizationReason?: string;
  };
  isActive: boolean;
  isAutoScroll: boolean;
  isMuted: boolean;
  onFinished: () => void;
}

const ReelItem: React.FC<ReelItemProps> = ({ data, isActive, isAutoScroll, isMuted, onFinished }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  
  // Interaction States
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  
  // Refs for logic
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasPlayingBeforeLongPress = useRef(true);

  const REEL_DURATION = 10000;
  const UPDATE_INTERVAL = 50;

  // Reset when not active (6.8 Performance: Memory Cleanup)
  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      setIsPlaying(false);
      setIsExpanded(false);
      window.speechSynthesis.cancel();
    } else {
      setIsPlaying(true);
      if (!isMuted) speak(data.description);
    }
    return () => {
       if (progressInterval.current) clearInterval(progressInterval.current);
       window.speechSynthesis.cancel();
    };
  }, [isActive, isMuted, data.description]);

  // Handle Playback Progress
  useEffect(() => {
    if (isActive && isPlaying && !isExpanded && !isCommentsOpen && !isShareOpen && !isOptionsOpen) {
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            if (isAutoScroll) onFinished();
            else setIsPlaying(false);
            return 100;
          }
          return prev + (UPDATE_INTERVAL / REEL_DURATION) * 100;
        });
      }, UPDATE_INTERVAL);
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
      window.speechSynthesis.pause();
    }

    if (isActive && isPlaying && !isMuted && !isExpanded && !isCommentsOpen) {
        window.speechSynthesis.resume();
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isActive, isPlaying, isAutoScroll, onFinished, isMuted, isExpanded, isCommentsOpen, isShareOpen, isOptionsOpen]);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // --- Gesture Handling ---

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
    };

    // Start Long Press Timer (Pause)
    longPressTimerRef.current = setTimeout(() => {
        wasPlayingBeforeLongPress.current = isPlaying;
        setIsPlaying(false); // Pause on long press
    }, 300); // 300ms threshold for long press
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    // Clear Long Press
    if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
    }

    const diffX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const diffTime = Date.now() - touchStartRef.current.time;

    // Check if it was a Long Press release (duration > 300ms and minimal movement)
    if (diffTime > 300 && Math.abs(diffX) < 10) {
        if (wasPlayingBeforeLongPress.current) setIsPlaying(true); // Resume if it was playing
        return; 
    }

    // Check for Tap (Short duration, minimal movement)
    if (diffTime < 300 && Math.abs(diffX) < 10) {
        // Toggle Play/Pause on Tap
        setIsPlaying(prev => !prev);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const diffX = e.touches[0].clientX - touchStartRef.current.x;
      const diffY = e.touches[0].clientY - touchStartRef.current.y;

      // Swipe Left Detection (Expand AI)
      // Threshold: -50px horizontal, minimal vertical movement to avoid scroll conflict
      if (diffX < -60 && Math.abs(diffY) < 50) {
          if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
          setIsExpanded(true);
      }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(true);
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 1000);
  };

  return (
    <div 
        className="h-full w-full relative bg-gray-900 flex items-center justify-center overflow-hidden select-none touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onDoubleClick={handleDoubleClick}
    >
      {/* Zone A: Background Media with Progressive Loading & Parallax */}
      <div className="absolute inset-0 bg-black">
        {/* Blur Placeholder */}
        <img 
            src={data.imageUrl}
            className={`absolute inset-0 w-full h-full object-cover blur-2xl scale-110 transition-opacity duration-700 ${imgLoaded ? 'opacity-0' : 'opacity-100'}`}
            alt="Blur Placeholder"
        />
        
        {/* Main High-Res Image (6.8 Performance: will-change) */}
        <img 
          src={data.imageUrl} 
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-[15000ms] ease-linear will-change-transform ${imgLoaded ? 'opacity-90' : 'opacity-0'} ${isActive && isPlaying ? 'scale-110' : 'scale-100'}`}
          alt="News Content" 
        />
        
        {/* Gradient Overlays for Zone Visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/95 pointer-events-none" />
      </div>

      {/* Zone A (Top): Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/20 z-50">
        <div 
            className="h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            style={{ width: `${progress}%` }}
        />
      </div>

      {/* Play/Pause Overlay Icon (Fades out) */}
      {!isPlaying && !isExpanded && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/20 backdrop-blur-[1px] animate-in fade-in duration-200">
            <div className="p-4 bg-black/40 rounded-full text-white backdrop-blur-md border border-white/10">
                <Play size={48} fill="currentColor" />
            </div>
        </div>
      )}

      {/* Like Animation Overlay */}
      {showLikeAnimation && <LikeAnimation />}

      {/* Zone E: Hidden Expand Layer */}
      <ReelExpandLayer 
        isOpen={isExpanded} 
        onClose={() => setIsExpanded(false)} 
        data={data}
      />

      {/* Zone D: Right Action Bar */}
      <div className={`transition-opacity duration-300 ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <ReelActionBar 
            likes={data.likes}
            comments={data.comments}
            isLiked={isLiked}
            isSaved={isSaved}
            onLike={(e) => { e?.stopPropagation(); setIsLiked(!isLiked); }}
            onSave={(e) => { e?.stopPropagation(); setIsSaved(!isSaved); }}
            onComment={(e) => { e?.stopPropagation(); setIsCommentsOpen(true); }}
            onShare={(e) => { e?.stopPropagation(); setIsShareOpen(true); }}
            onAIExplain={(e) => { e?.stopPropagation(); setIsExpanded(true); }}
            onMore={(e) => { e?.stopPropagation(); setIsOptionsOpen(true); }}
        />
      </div>

      {/* Zone B & C: Bottom Info Bar */}
      <div className={`transition-opacity duration-300 ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <ReelInfoBar 
            title={data.title}
            description={data.description}
            source={data.source}
            category={data.category}
            aiEnhanced={data.aiEnhanced}
            timeAgo={data.timeAgo}
            tags={data.tags}
            reason={data.personalizationReason}
            onReadMore={(e) => { e?.stopPropagation(); setIsExpanded(true); }}
        />
      </div>

      {/* Interactions Sheets */}
      <div onClick={(e) => e.stopPropagation()}>
        <ReelCommentsSheet 
            isOpen={isCommentsOpen} 
            onClose={() => setIsCommentsOpen(false)} 
        />
        <ReelShareSheet
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
        />
        <ReelOptionsSheet
            isOpen={isOptionsOpen}
            onClose={() => setIsOptionsOpen(false)}
            category={data.category}
            source={data.source}
        />
      </div>
    </div>
  );
};

export default ReelItem;