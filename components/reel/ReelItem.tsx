import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';
import ReelActionBar from './ReelActionBar';
import ReelInfoBar from './ReelInfoBar';
import ReelCommentsSheet from './ReelCommentsSheet';
import ReelShareSheet from './ReelShareSheet';
import ReelOptionsSheet from './ReelOptionsSheet';
import ReelExpandLayer from './ReelExpandLayer';
import LikeAnimation from './LikeAnimation';
import Toast, { ToastType } from '../ui/Toast';

interface ReelItemProps {
  data: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    videoUrl?: string;
    source: string;
    category: string;
    aiEnhanced?: boolean;
    timeAgo: string;
    likes: string;
    comments: string;
    tags?: string[];
    aiSummary?: string;
    keyPoints?: string[];
    factCheck?: { status: string; score: number };
    location?: { name: string; lat: number; lng: number };
    relatedNews?: Array<{ id: string; title: string; image: string; time: string }>;
    personalizationReason?: string;
  };
  isActive: boolean;
  isAutoScroll: boolean;
  isMuted: boolean;
  onFinished: () => void;
}

const ReelItem: React.FC<ReelItemProps> = ({ data, isActive, isAutoScroll, isMuted, onFinished }) => {
  // --- Media State ---
  const [isVideo] = useState(!!data.videoUrl);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  
  // --- Interaction State ---
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // AI Explain
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  
  // --- Toast State ---
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: ToastType }>({ show: false, msg: '', type: 'success' });

  // --- Refs ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasPlayingBeforeLongPress = useRef(true);

  const REEL_DURATION = 10000;
  const UPDATE_INTERVAL = 50;

  // --- Lifecycle & Logic ---

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      setIsPlaying(false);
      setIsExpanded(false);
      setIsCommentsOpen(false);
      setIsShareOpen(false);
      setIsOptionsOpen(false);
      window.speechSynthesis.cancel();
      
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    } else {
      setIsPlaying(true);
      if (videoRef.current && mediaLoaded) {
        videoRef.current.play().catch(() => setIsPlaying(false));
      }
    }
    return () => {
       if (progressInterval.current) clearInterval(progressInterval.current);
       window.speechSynthesis.cancel();
    };
  }, [isActive, mediaLoaded]);

  useEffect(() => {
      if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const isPausedInteraction = isExpanded || isCommentsOpen || isShareOpen || isOptionsOpen;

    if (isActive && isPlaying && !isPausedInteraction) {
      if (isVideo) {
          if (videoRef.current && videoRef.current.paused && mediaLoaded) {
              videoRef.current.play().catch(() => {});
          }
      } else {
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
      }
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (videoRef.current && !videoRef.current.paused) videoRef.current.pause();
      window.speechSynthesis.pause();
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isActive, isPlaying, isVideo, isAutoScroll, onFinished, isExpanded, isCommentsOpen, isShareOpen, isOptionsOpen, mediaLoaded]);

  // --- Handlers ---

  const handleVideoTimeUpdate = () => {
      if (videoRef.current && videoRef.current.duration > 0) {
          setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
      }
  };

  const handleVideoEnded = () => {
      if (isAutoScroll) {
          onFinished();
      } else {
          setIsPlaying(false);
      }
  };

  const handleLike = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      const newState = !isLiked;
      setIsLiked(newState);
      if (newState) {
          setShowLikeAnimation(true);
          setTimeout(() => setShowLikeAnimation(false), 1000);
          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
      }
  };

  const handleSave = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setIsSaved(!isSaved);
      if (!isSaved) {
          setToast({ show: true, msg: 'Saved to Bookmarks', type: 'success' });
          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
      } else {
          setToast({ show: true, msg: 'Removed from Bookmarks', type: 'info' });
      }
  };

  const handleShare = async (e?: React.MouseEvent) => {
      e?.stopPropagation();
      // Try Native Share
      if (navigator.share) {
          try {
              await navigator.share({
                  title: data.title,
                  text: data.description,
                  url: window.location.href,
              });
          } catch (err) {
              console.log('Share canceled');
          }
      } else {
          // Fallback
          setIsShareOpen(true);
      }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
    longPressTimerRef.current = setTimeout(() => {
        wasPlayingBeforeLongPress.current = isPlaying;
        setIsPlaying(false); 
    }, 200); 
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    if (longPressTimerRef.current) { clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; }

    const diffX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const diffTime = Date.now() - touchStartRef.current.time;

    if (diffTime > 200 && Math.abs(diffX) < 10) {
        if (wasPlayingBeforeLongPress.current) setIsPlaying(true);
        return; 
    }
    if (diffTime < 200 && Math.abs(diffX) < 10) {
        setIsPlaying(prev => !prev);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const diffX = e.touches[0].clientX - touchStartRef.current.x;
      const diffY = e.touches[0].clientY - touchStartRef.current.y;

      if (diffX < -60 && Math.abs(diffY) < 50) {
          if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
          setIsExpanded(true);
      }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLiked) handleLike();
    else {
        setShowLikeAnimation(true);
        setTimeout(() => setShowLikeAnimation(false), 1000);
    }
  };

  return (
    <div 
        className="h-full w-full relative bg-gray-900 flex items-center justify-center overflow-hidden select-none touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onDoubleClick={handleDoubleClick}
    >
      {/* --- Toast Notification --- */}
      {toast.show && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[60]">
              <Toast 
                type={toast.type} 
                message={toast.msg} 
                onClose={() => setToast(prev => ({ ...prev, show: false }))} 
                duration={2000}
              />
          </div>
      )}

      {/* --- Media Layer --- */}
      <div className="absolute inset-0 bg-black">
        <img 
            src={data.imageUrl}
            className={`absolute inset-0 w-full h-full object-cover blur-2xl scale-110 transition-opacity duration-700 ${mediaLoaded ? 'opacity-0' : 'opacity-100'}`}
            alt="Blur Placeholder"
        />
        
        {isVideo ? (
            <video
                ref={videoRef}
                src={data.videoUrl}
                poster={data.imageUrl}
                className={`w-full h-full object-cover transition-opacity duration-500 ${mediaLoaded ? 'opacity-100' : 'opacity-0'}`}
                loop={!isAutoScroll}
                playsInline
                muted={isMuted}
                onLoadedData={() => setMediaLoaded(true)}
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnded}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
            />
        ) : (
            <img 
                src={data.imageUrl} 
                onLoad={() => setMediaLoaded(true)}
                className={`w-full h-full object-cover transition-all duration-[15000ms] ease-linear will-change-transform ${mediaLoaded ? 'opacity-90' : 'opacity-0'} ${isActive && isPlaying ? 'scale-110' : 'scale-100'}`}
                alt="News Content" 
            />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90 pointer-events-none" />
      </div>

      {/* --- Overlays --- */}
      {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <Loader2 size={48} className="text-white/80 animate-spin" />
          </div>
      )}

      <div className="absolute top-0 left-0 w-full h-1 bg-white/20 z-50">
        <div 
            className="h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            style={{ width: `${progress}%` }}
        />
      </div>

      {!isPlaying && !isExpanded && !isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/10 backdrop-blur-[1px] animate-in fade-in duration-200 pointer-events-none">
            <div className="p-4 bg-black/40 rounded-full text-white backdrop-blur-md border border-white/10">
                <Play size={48} fill="currentColor" />
            </div>
        </div>
      )}

      {showLikeAnimation && <LikeAnimation />}

      <ReelExpandLayer 
        isOpen={isExpanded} 
        onClose={() => setIsExpanded(false)} 
        data={data}
      />

      {/* --- UI Controls --- */}
      <div className={`transition-opacity duration-300 ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <ReelActionBar 
            likes={isLiked ? (parseInt(data.likes) + 1).toString() : data.likes} // Optimistic update
            comments={data.comments}
            isLiked={isLiked}
            isSaved={isSaved}
            onLike={handleLike}
            onSave={handleSave}
            onShare={handleShare}
            onComment={(e) => { e?.stopPropagation(); setIsCommentsOpen(true); }}
            onAIExplain={(e) => { e?.stopPropagation(); setIsExpanded(true); }}
            onMore={(e) => { e?.stopPropagation(); setIsOptionsOpen(true); }}
        />
      </div>

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