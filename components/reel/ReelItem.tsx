
import React, { useState, useEffect, useRef, memo } from 'react';
import ReelActionBar from './ReelActionBar';
import ReelInfoBar from './ReelInfoBar';
import ReelCommentsSheet from './ReelCommentsSheet';
import ReelShareSheet from './ReelShareSheet';
import ReelOptionsSheet from './ReelOptionsSheet';
import ReelExpandLayer from './ReelExpandLayer';
import LikeAnimation from './LikeAnimation';
import Toast, { ToastType } from '../ui/Toast';
import { Volume2, VolumeX } from 'lucide-react';

interface ReelItemProps {
  data: {
    id: string;
    articleId: string; // Original ID for routing
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
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); 
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showMuteAnimation, setShowMuteAnimation] = useState(false);
  
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: ToastType }>({ show: false, msg: '', type: 'success' });

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      setVideoPlaying(false);
      
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    } else {
      if (video && isVideo) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
              playPromise.catch(() => {
                  console.log("Autoplay blocked/failed");
              });
          }
      } else if (!isVideo) {
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
      setVideoPlaying(true);
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
                  id: data.articleId, // Save original article ID
                  title: data.title, 
                  source: data.source, 
                  category: data.category,
                  imageUrl: data.imageUrl,
                  savedAt: new Date().toLocaleDateString()
              };
              localStorage.setItem('bookmarks', JSON.stringify([newBookmark, ...bookmarks]));
              setToast({ show: true, msg: 'Saved to Bookmarks', type: 'success' });
              if (navigator.vibrate) navigator.vibrate(20);
          } else {
              const filtered = bookmarks.filter((b: any) => b.id !== data.articleId);
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

  // --- Touch Logic for Tap/Double Tap ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isExpanded) return;
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isExpanded || !touchStartRef.current) return;
    const diffX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const diffY = e.changedTouches[0].clientY - touchStartRef.current.y;
    const diffTime = Date.now() - touchStartRef.current.time;

    // Detect Tap vs Swipe
    if (diffTime < 250 && Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
        // It's a tap
        if (tapTimeoutRef.current) {
            // Double Tap Detected
            clearTimeout(tapTimeoutRef.current);
            tapTimeoutRef.current = null;
            handleLike();
        } else {
            // Wait for possible second tap
            tapTimeoutRef.current = setTimeout(() => {
                // Single Tap Action: Toggle Mute
                if (videoRef.current) {
                    videoRef.current.muted = !videoRef.current.muted;
                    setIsMuted(videoRef.current.muted);
                    setShowMuteAnimation(true);
                    setTimeout(() => setShowMuteAnimation(false), 1000);
                }
                tapTimeoutRef.current = null;
            }, 300);
        }
    } else if (Math.abs(diffY) > 50 && diffY < 0 && Math.abs(diffX) < 30) {
        // Swipe Up (Usually handled by scroll, but could trigger expand if strict)
        // setIsExpanded(true);
    }
  };

  // --- Mouse Logic for Desktop ---
  const handleClick = (e: React.MouseEvent) => {
      if (isExpanded) return;
      if (e.detail === 2) {
          handleLike();
      } else if (e.detail === 1) {
          // Delay to check for double click
          // Desktop specific toggle play/pause or mute
          if (videoRef.current) {
              videoRef.current.muted = !videoRef.current.muted;
              setIsMuted(videoRef.current.muted);
              setShowMuteAnimation(true);
              setTimeout(() => setShowMuteAnimation(false), 1000);
          }
      }
  };

  return (
    <div 
        className="h-full w-full relative bg-black flex items-center justify-center overflow-hidden select-none touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
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
                poster={data.imageUrl}
                className={`w-full h-full object-cover transition-opacity duration-500 ${videoPlaying ? 'opacity-100' : 'opacity-0'}`}
                loop
                playsInline
                muted={isMuted}
                preload="auto"
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnded}
                onError={handleVideoError}
            />
        </div>
      )}

      {/* Poster Image */}
      <div className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-700 ease-in-out ${videoPlaying ? 'opacity-0' : 'opacity-100'}`}>
         <img 
            src={data.imageUrl} 
            className="w-full h-full object-cover" 
            alt=""
            loading="eager"
         />
         <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90 pointer-events-none z-30" />

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/20 z-50">
        <div 
            className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
        />
      </div>

      {/* Animations */}
      {showLikeAnimation && <LikeAnimation />}
      
      {showMuteAnimation && (
          <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
              <div className="bg-black/50 p-4 rounded-full backdrop-blur-md animate-in fade-out zoom-in duration-700">
                  {isMuted ? <VolumeX size={32} className="text-white" /> : <Volume2 size={32} className="text-white" />}
              </div>
          </div>
      )}

      {/* Expand Layer (AI Analysis) */}
      <ReelExpandLayer 
        isOpen={isExpanded} 
        onClose={() => setIsExpanded(false)} 
        data={data}
      />

      {/* Controls */}
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
    return prev.data.id === next.data.id && 
           prev.isActive === next.isActive && 
           prev.isAutoScroll === next.isAutoScroll;
});

export default ReelItem;
