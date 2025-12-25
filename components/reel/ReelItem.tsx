
import React, { useState, useEffect, useRef, memo } from 'react';
import { Loader2 } from 'lucide-react';
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
  onFinished: () => void;
}

const ReelItem = memo<ReelItemProps>(({ data, isActive, isAutoScroll, onFinished }) => {
  // --- Media State ---
  const [isVideo, setIsVideo] = useState(!!data.videoUrl);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  
  // --- Interaction State ---
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); 
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  
  // --- Toast State ---
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: ToastType }>({ show: false, msg: '', type: 'success' });

  // --- Refs ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const REEL_DURATION = 15000; 
  const UPDATE_INTERVAL = 50;

  // Load saved state on mount
  useEffect(() => {
      try {
          const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
          if (bookmarks.some((b: any) => b.id === data.id)) {
              setIsSaved(true);
          }
      } catch (e) {}
  }, [data.id]);

  // Video Playback Logic
  useEffect(() => {
    const video = videoRef.current;
    
    if (!isActive) {
      // Deactivate
      setProgress(0);
      setIsExpanded(false);
      setIsCommentsOpen(false);
      setIsShareOpen(false);
      setIsOptionsOpen(false);
      
      if (video) {
        video.pause();
        // Do NOT reset currentTime to 0 to avoid poster flashing on quick scroll back
      }
    } else {
      // Activate
      if (video && isVideo) {
          // Promise-based play handling to prevent "The play() request was interrupted" error
          const playPromise = video.play();
          if (playPromise !== undefined) {
              playPromise.catch(() => {
                  // Auto-play was prevented
                  // console.log('Autoplay prevented');
              });
          }
      }
    }
  }, [isActive, isVideo]);

  // Progress Bar Logic
  useEffect(() => {
    const isPausedInteraction = isExpanded || isCommentsOpen || isShareOpen || isOptionsOpen;

    // Clear existing interval
    if (progressInterval.current) clearInterval(progressInterval.current);

    if (isActive && !isPausedInteraction) {
      if (isVideo) {
          if (videoRef.current && videoRef.current.paused && mediaLoaded) {
              videoRef.current.play().catch(() => {});
          }
      } else {
          // Image Timer Logic
          progressInterval.current = setInterval(() => {
            setProgress((prev) => {
              if (prev >= 100) {
                if (isAutoScroll) onFinished();
                return 100;
              }
              return prev + (UPDATE_INTERVAL / REEL_DURATION) * 100;
            });
          }, UPDATE_INTERVAL);
      }
    } else {
      if (videoRef.current && !videoRef.current.paused) videoRef.current.pause();
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isActive, isVideo, isAutoScroll, onFinished, isExpanded, isCommentsOpen, isShareOpen, isOptionsOpen, mediaLoaded]);

  const handleVideoTimeUpdate = () => {
      if (videoRef.current && videoRef.current.duration > 0) {
          const val = (videoRef.current.currentTime / videoRef.current.duration) * 100;
          // Only update state if change is significant to reduce renders
          if (Math.abs(val - progress) > 0.5) {
              setProgress(val);
          }
      }
  };

  const handleVideoEnded = () => {
      if (isAutoScroll) {
          onFinished();
      } else if (videoRef.current) {
          // Loop manually
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {});
      }
  };

  const handleVideoError = () => {
      console.warn("Video failed to load, falling back to image:", data.videoUrl);
      setIsVideo(false);
      setIsBuffering(false);
      setMediaLoaded(true); // Treat fallback as loaded
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
      const newState = !isSaved;
      setIsSaved(newState);
      
      try {
          const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
          if (newState) {
              const newBookmark = { 
                  id: data.id, 
                  title: data.title, 
                  source: data.source, 
                  category: data.category,
                  imageUrl: data.imageUrl,
                  savedAt: new Date().toLocaleDateString()
              };
              localStorage.setItem('bookmarks', JSON.stringify([newBookmark, ...bookmarks]));
              setToast({ show: true, msg: 'Saved to Bookmarks', type: 'success' });
              if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
          } else {
              const filtered = bookmarks.filter((b: any) => b.id !== data.id);
              localStorage.setItem('bookmarks', JSON.stringify(filtered));
              setToast({ show: true, msg: 'Removed from Bookmarks', type: 'info' });
          }
      } catch (e) {
          console.error("Bookmark error", e);
      }
  };

  const handleShare = async (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (navigator.share) {
          try {
              await navigator.share({
                  title: data.title,
                  text: data.description,
                  url: window.location.href,
              });
          } catch (err) {}
      } else {
          setIsShareOpen(true);
      }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isExpanded) return;
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isExpanded || !touchStartRef.current) return;

    const diffX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const diffY = e.changedTouches[0].clientY - touchStartRef.current.y;
    const diffTime = Date.now() - touchStartRef.current.time;

    // Small movement and short time = Click/Tap
    if (diffTime < 250 && Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
        setIsExpanded(true);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isExpanded) return;
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
        onDoubleClick={handleDoubleClick}
        style={{ transform: 'translateZ(0)' }} // Force hardware acceleration
    >
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

      {/* Layer 1: Persistent Background Image (Low Z-Index) */}
      <div className="absolute inset-0 z-0">
        <img 
            src={data.imageUrl}
            className="w-full h-full object-cover"
            alt=""
            loading="lazy"
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      </div>

      {/* Layer 2: Video Player (Mid Z-Index) */}
      {isVideo && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-transparent">
            <video
                ref={videoRef}
                src={data.videoUrl}
                poster={data.imageUrl}
                className={`w-full h-full object-cover transition-opacity duration-500 ${mediaLoaded ? 'opacity-100' : 'opacity-0'}`}
                loop={false}
                playsInline
                muted
                preload="auto"
                onLoadedData={() => setMediaLoaded(true)}
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnded}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                onError={handleVideoError}
            />
        </div>
      )}

      {/* Layer 3: High Res Image (If not video or while video loads) */}
      {!isVideo && (
         <div className="absolute inset-0 z-10">
            <img
                src={data.imageUrl} 
                onLoad={() => setMediaLoaded(true)}
                className={`w-full h-full object-cover transition-transform duration-[15000ms] ease-linear ${isActive ? 'scale-110' : 'scale-100'}`}
                alt={data.title}
            />
         </div>
      )}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90 pointer-events-none z-20" />

      {/* Buffering Indicator */}
      {isVideo && isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <Loader2 size={48} className="text-white/80 animate-spin" />
          </div>
      )}

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/20 z-50">
        <div 
            className="h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            style={{ width: `${progress}%` }}
        />
      </div>

      {showLikeAnimation && <LikeAnimation />}

      <ReelExpandLayer 
        isOpen={isExpanded} 
        onClose={() => setIsExpanded(false)} 
        data={data}
      />

      <div className={`transition-opacity duration-300 z-30 ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <ReelActionBar 
            likes={isLiked ? (parseInt(data.likes) + 1).toString() : data.likes}
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

      <div className={`transition-opacity duration-300 z-30 ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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

      <div onClick={(e) => e.stopPropagation()} className="z-40 relative">
        <ReelCommentsSheet isOpen={isCommentsOpen} onClose={() => setIsCommentsOpen(false)} />
        <ReelShareSheet isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
        <ReelOptionsSheet isOpen={isOptionsOpen} onClose={() => setIsOptionsOpen(false)} category={data.category} source={data.source} />
      </div>
    </div>
  );
}, (prev, next) => {
    // Custom equality check for React.memo
    // Only re-render if:
    // 1. The ID changed (new item)
    // 2. Active state changed (scroll)
    // 3. Auto-scroll state changed
    return prev.data.id === next.data.id && 
           prev.isActive === next.isActive && 
           prev.isAutoScroll === next.isAutoScroll;
});

export default ReelItem;
