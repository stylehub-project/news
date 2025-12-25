
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
    id: string;        // Rendering Key
    articleId: string; // Navigation ID
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
  isMutedGlobal: boolean;
  onToggleMute: () => void;
  onFinished: () => void;
}

const ReelItem = memo<ReelItemProps>(({ data, isActive, isAutoScroll, isMutedGlobal, onToggleMute, onFinished }) => {
  // State
  const [isVideoAvailable] = useState(!!data.videoUrl);
  const [isPlaying, setIsPlaying] = useState(false); // Does video actually run?
  const [progress, setProgress] = useState(0);
  
  // Interaction Sheets
  const [activeSheet, setActiveSheet] = useState<'none' | 'comments' | 'share' | 'options' | 'expand'>('none');
  
  // User Actions
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showLikeAnim, setShowLikeAnim] = useState(false);
  const [showMuteAnim, setShowMuteAnim] = useState(false);
  
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: ToastType }>({ show: false, msg: '', type: 'success' });

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTapTime = useRef(0);

  const REEL_DURATION = 15000; // 15s for image reels
  const UPDATE_INTERVAL = 50;

  // --- 1. Lifecycle & Playback Management ---
  
  useEffect(() => {
    const video = videoRef.current;

    if (isActive && activeSheet === 'none') {
        // Active Reel Logic
        if (isVideoAvailable && video) {
            video.muted = isMutedGlobal;
            video.play().then(() => setIsPlaying(true)).catch(e => console.log("Play interrupted", e));
        } else {
            // Image Logic: Start progress bar
            startImageTimer();
        }
    } else {
        // Inactive Reel Logic
        if (video) {
            video.pause();
            // Do NOT reset time to 0 here to prevent flash when scrolling back up slightly
        }
        setIsPlaying(false);
        stopImageTimer();
        
        // Reset overlay states if scrolled away
        if (!isActive) setActiveSheet('none'); 
    }

    // Cleanup on unmount/change
    return () => stopImageTimer();
  }, [isActive, isVideoAvailable, activeSheet, isMutedGlobal]);

  // --- 2. Image Timer Logic ---
  
  const startImageTimer = () => {
      stopImageTimer();
      setProgress(0);
      progressInterval.current = setInterval(() => {
          setProgress(prev => {
              if (prev >= 100) {
                  if (isAutoScroll && isActive) onFinished();
                  return 100;
              }
              return prev + (UPDATE_INTERVAL / REEL_DURATION) * 100;
          });
      }, UPDATE_INTERVAL);
  };

  const stopImageTimer = () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
  };

  // --- 3. Video Events ---

  const handleTimeUpdate = () => {
      if (videoRef.current && videoRef.current.duration) {
          const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
          setProgress(pct);
      }
  };

  const handleVideoEnded = () => {
      if (isAutoScroll) onFinished();
      else if (videoRef.current) {
          // Loop if no autoscroll
          videoRef.current.currentTime = 0;
          videoRef.current.play();
      }
  };

  // --- 4. User Interactions ---

  const handleContainerClick = (e: React.MouseEvent) => {
      // Prevent double triggers if clicked on buttons
      if ((e.target as HTMLElement).closest('button')) return;

      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;
      
      if (now - lastTapTime.current < DOUBLE_TAP_DELAY) {
          // Double Tap -> Like
          if (!isLiked) handleLike();
          else {
              setShowLikeAnim(true);
              setTimeout(() => setShowLikeAnim(false), 1000);
          }
      } else {
          // Single Tap -> Toggle Mute (only if video)
          if (isVideoAvailable) {
              onToggleMute();
              setShowMuteAnim(true);
              setTimeout(() => setShowMuteAnim(false), 1000);
          }
      }
      lastTapTime.current = now;
  };

  const handleLike = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setIsLiked(prev => !prev);
      if (!isLiked) {
          setShowLikeAnim(true);
          setTimeout(() => setShowLikeAnim(false), 1000);
          if (navigator.vibrate) navigator.vibrate(50);
      }
  };

  const handleSave = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setIsSaved(prev => !prev);
      setToast({ show: true, msg: !isSaved ? 'Saved to Bookmarks' : 'Removed from Bookmarks', type: 'success' });
  };

  const handleShare = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActiveSheet('share');
  };

  return (
    <div 
        className="h-full w-full relative bg-black flex items-center justify-center overflow-hidden select-none"
        onClick={handleContainerClick}
        style={{ transform: 'translateZ(0)' }} // Hardware acceleration
    >
      {/* Toast Notification */}
      {toast.show && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[60]">
              <Toast type={toast.type} message={toast.msg} onClose={() => setToast(prev => ({ ...prev, show: false }))} />
          </div>
      )}

      {/* LAYER 1: Video Player */}
      {isVideoAvailable && (
        <div className="absolute inset-0 z-10 bg-black">
            <video
                ref={videoRef}
                src={data.videoUrl}
                className={`w-full h-full object-cover transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
                loop={false}
                playsInline
                muted={isMutedGlobal}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
            />
        </div>
      )}

      {/* LAYER 2: Poster Image (Fades out when video plays, stays if image reel) */}
      <div className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-700 ease-in-out ${isPlaying && isVideoAvailable ? 'opacity-0' : 'opacity-100'}`}>
         <img 
            src={data.imageUrl} 
            className="w-full h-full object-cover" 
            alt="Reel content"
            loading="eager"
         />
      </div>

      {/* LAYER 3: Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none z-30" />

      {/* LAYER 4: Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/20 z-50 pointer-events-none">
        <div 
            className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
        />
      </div>

      {/* LAYER 5: Animations (Like/Mute) */}
      {showLikeAnim && <LikeAnimation />}
      
      {showMuteAnim && (
          <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
              <div className="bg-black/50 p-4 rounded-full backdrop-blur-md animate-in fade-out zoom-in duration-700">
                  {isMutedGlobal ? <VolumeX size={32} className="text-white" /> : <Volume2 size={32} className="text-white" />}
              </div>
          </div>
      )}

      {/* LAYER 6: Expand Layer (Full Screen AI) */}
      <ReelExpandLayer 
        isOpen={activeSheet === 'expand'} 
        onClose={() => setActiveSheet('none')} 
        data={data}
      />

      {/* LAYER 7: UI Controls (Action Bar & Info Bar) - Always Visible unless expanded */}
      <div className={`z-40 ${activeSheet === 'expand' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <ReelActionBar 
            isLiked={isLiked}
            isSaved={isSaved}
            onLike={handleLike}
            onSave={handleSave}
            onShare={handleShare}
            onComment={(e) => { e?.stopPropagation(); setActiveSheet('comments'); }}
            onAIExplain={(e) => { e?.stopPropagation(); setActiveSheet('expand'); }}
            onMore={(e) => { e?.stopPropagation(); setActiveSheet('options'); }}
        />
        <ReelInfoBar 
            title={data.title}
            description={data.description}
            source={data.source}
            category={data.category}
            aiEnhanced={data.aiEnhanced}
            timeAgo={data.timeAgo}
            tags={data.tags}
            reason={data.personalizationReason}
            onReadMore={(e) => { e?.stopPropagation(); setActiveSheet('expand'); }}
        />
      </div>

      {/* LAYER 8: Bottom Sheets */}
      <div className="z-50 relative" onClick={(e) => e.stopPropagation()}>
        <ReelCommentsSheet isOpen={activeSheet === 'comments'} onClose={() => setActiveSheet('none')} />
        <ReelShareSheet isOpen={activeSheet === 'share'} onClose={() => setActiveSheet('none')} />
        <ReelOptionsSheet isOpen={activeSheet === 'options'} onClose={() => setActiveSheet('none')} category={data.category} source={data.source} />
      </div>
    </div>
  );
}, (prev, next) => {
    // Optimization: Only re-render if essential props change
    return prev.data.id === next.data.id && 
           prev.isActive === next.isActive && 
           prev.isMutedGlobal === next.isMutedGlobal &&
           prev.isAutoScroll === next.isAutoScroll;
});

export default ReelItem;
