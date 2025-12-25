
import React, { useState, useEffect, useRef, memo } from 'react';
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
  const [isVideo, setIsVideo] = useState(!!data.videoUrl);
  const [progress, setProgress] = useState(0);
  
  // videoPlaying: Controls poster fade-out.
  const [videoPlaying, setVideoPlaying] = useState(false);
  
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); 
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: ToastType }>({ show: false, msg: '', type: 'success' });

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const REEL_DURATION = 15000; 
  const UPDATE_INTERVAL = 50;

  // Video Management
  useEffect(() => {
    const video = videoRef.current;
    
    if (!isActive) {
      setProgress(0);
      setIsExpanded(false);
      setIsCommentsOpen(false);
      setIsShareOpen(false);
      setIsOptionsOpen(false);
      setVideoPlaying(false); // Bring back poster immediately when scrolling away
      
      if (video) {
        video.pause();
        // Do NOT reset currentTime to 0 to avoid black flash if quickly scrolling back
      }
    } else {
      if (video && isVideo) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
              playPromise.catch(() => {
                  // Autoplay failed, fallback handled by UI (poster remains)
                  console.log("Autoplay blocked/failed");
              });
          }
      } else if (!isVideo) {
          // If no video, we set playing to true to start the progress bar for the image
          setVideoPlaying(true); 
      }
    }
  }, [isActive, isVideo]);

  // Progress Bar Logic
  useEffect(() => {
    const isPausedInteraction = isExpanded || isCommentsOpen || isShareOpen || isOptionsOpen;

    if (progressInterval.current) clearInterval(progressInterval.current);

    if (isActive && !isPausedInteraction) {
      if (isVideo) {
          if (videoRef.current && videoRef.current.paused) {
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
  }, [isActive, isVideo, isAutoScroll, onFinished, isExpanded, isCommentsOpen, isShareOpen, isOptionsOpen]);

  const handleVideoTimeUpdate = () => {
      if (videoRef.current && videoRef.current.duration > 0) {
          const val = (videoRef.current.currentTime / videoRef.current.duration) * 100;
          if (Math.abs(val - progress) > 0.5) setProgress(val);
          
          // Only fade out poster when video has actually advanced
          if (!videoPlaying && videoRef.current.currentTime > 0.2) {
              setVideoPlaying(true);
          }
      }
  };

  const handleVideoEnded = () => {
      if (isAutoScroll) {
          onFinished();
      } else if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {});
      }
  };

  const handleVideoError = () => {
      setIsVideo(false);
      setVideoPlaying(true); // Switch to "playing" state for image fallback
  };

  const handleLike = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      const newState = !isLiked;
      setIsLiked(newState);
      if (newState) {
          setShowLikeAnimation(true);
          setTimeout(() => setShowLikeAnimation(false), 1000);
          if (navigator.vibrate) navigator.vibrate(50);
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
          try { await navigator.share({ title: data.title, url: window.location.href }); } catch (err) {}
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
        className="h-full w-full relative bg-black flex items-center justify-center overflow-hidden select-none touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
        style={{ transform: 'translateZ(0)' }} 
    >
      {toast.show && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[60]">
              <Toast type={toast.type} message={toast.msg} onClose={() => setToast(prev => ({ ...prev, show: false }))} />
          </div>
      )}

      {isVideo && (
        <div className="absolute inset-0 z-10 bg-black">
            <video
                ref={videoRef}
                src={data.videoUrl}
                poster={data.imageUrl} // Native poster fallback
                className={`w-full h-full object-cover transition-opacity duration-500 ${videoPlaying ? 'opacity-100' : 'opacity-0'}`}
                loop={false}
                playsInline
                muted
                preload="auto"
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnded}
                onError={handleVideoError}
            />
        </div>
      )}

      {/* Poster Image - High Res, Always Visible until video is strictly playing > 0.2s */}
      {/* This prevents the "Blinking" black screen issue */}
      <div className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-700 ease-in-out ${videoPlaying ? 'opacity-0' : 'opacity-100'}`}>
         <img 
            src={data.imageUrl} 
            className="w-full h-full object-cover" 
            alt=""
            loading="eager"
         />
         <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
      </div>

      {/* UI Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90 pointer-events-none z-30" />

      <div className="absolute top-0 left-0 w-full h-1 bg-white/20 z-50">
        <div 
            className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
        />
      </div>

      {showLikeAnimation && <LikeAnimation />}

      <ReelExpandLayer 
        isOpen={isExpanded} 
        onClose={() => setIsExpanded(false)} 
        data={data}
      />

      <div className={`transition-opacity duration-300 z-40 ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <ReelActionBar 
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

      <div className={`transition-opacity duration-300 z-40 ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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

      <div onClick={(e) => e.stopPropagation()} className="z-50 relative">
        <ReelCommentsSheet isOpen={isCommentsOpen} onClose={() => setIsCommentsOpen(false)} />
        <ReelShareSheet isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
        <ReelOptionsSheet isOpen={isOptionsOpen} onClose={() => setIsOptionsOpen(false)} category={data.category} source={data.source} />
      </div>
    </div>
  );
}, (prev, next) => {
    // Custom equality check to prevent re-renders when parent state changes but this item doesn't
    return prev.data.id === next.data.id && 
           prev.isActive === next.isActive && 
           prev.isAutoScroll === next.isAutoScroll;
});

export default ReelItem;
