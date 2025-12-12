import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import ReelActionBar from './ReelActionBar';
import ReelInfoBar from './ReelInfoBar';
import ReelCommentsSheet from './ReelCommentsSheet';
import LikeAnimation from './LikeAnimation';

interface ReelItemProps {
  data: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    source: string;
    timeAgo: string;
    likes: string;
    comments: string;
    tags?: string[];
  };
  isActive: boolean;
  isAutoScroll: boolean;
  isMuted: boolean;
  onFinished: () => void;
}

const ReelItem: React.FC<ReelItemProps> = ({ data, isActive, isAutoScroll, isMuted, onFinished }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  
  // Refs for logic
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const REEL_DURATION = 10000; // 10 seconds per reel for demo
  const UPDATE_INTERVAL = 50;

  // Reset when not active
  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      setIsPlaying(false);
      window.speechSynthesis.cancel();
    } else {
      setIsPlaying(true);
      // Start AI Narrator if not muted
      if (!isMuted) {
         speak(data.description);
      }
    }
    return () => {
       if (progressInterval.current) clearInterval(progressInterval.current);
       window.speechSynthesis.cancel();
    };
  }, [isActive, isMuted, data.description]);

  // Handle Playback Progress
  useEffect(() => {
    if (isActive && isPlaying) {
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            // Finished
            if (isAutoScroll) {
               onFinished();
            } else {
               setIsPlaying(false); // Just stop if not auto-scroll
            }
            return 100;
          }
          return prev + (UPDATE_INTERVAL / REEL_DURATION) * 100;
        });
      }, UPDATE_INTERVAL);
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
      window.speechSynthesis.pause();
    }

    if (isActive && isPlaying && !isMuted) {
        window.speechSynthesis.resume();
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isActive, isPlaying, isAutoScroll, onFinished, isMuted]);

  // Gestures
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(true);
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 1000);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div 
        className="h-full w-full relative bg-gray-900 flex items-center justify-center overflow-hidden select-none"
        onClick={togglePlayPause}
        onDoubleClick={handleDoubleClick}
    >
      {/* Background Media with Ken Burns Effect */}
      <div className="absolute inset-0 bg-black">
        <img 
          src={data.imageUrl} 
          className={`w-full h-full object-cover opacity-80 transition-transform duration-[10000ms] ease-linear ${isActive && isPlaying ? 'scale-125' : 'scale-100'}`}
          alt="News Background" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none" />
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/20 z-50">
        <div 
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
        />
      </div>

      {/* Play/Pause Overlay Icon (Fades out) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/20 backdrop-blur-[1px]">
            <div className="p-4 bg-black/40 rounded-full text-white animate-in zoom-in duration-200">
                <Play size={48} fill="currentColor" />
            </div>
        </div>
      )}

      {/* Like Animation Overlay */}
      {showLikeAnimation && <LikeAnimation />}

      {/* Action Bar (Right) */}
      <ReelActionBar 
        likes={data.likes}
        comments={data.comments}
        isLiked={isLiked}
        isSaved={isSaved}
        onLike={(e) => { e?.stopPropagation(); setIsLiked(!isLiked); }}
        onSave={(e) => { e?.stopPropagation(); setIsSaved(!isSaved); }}
        onComment={(e) => { e?.stopPropagation(); setIsCommentsOpen(true); }}
        onShare={(e) => { e?.stopPropagation(); console.log('Share'); }}
        onAIExplain={(e) => { e?.stopPropagation(); console.log('AI Explain'); }}
      />

      {/* Info Bar (Bottom) */}
      <ReelInfoBar 
        title={data.title}
        description={data.description}
        source={data.source}
        timeAgo={data.timeAgo}
        tags={data.tags}
        onReadMore={(e) => { e?.stopPropagation(); console.log('Read More'); }}
      />

      {/* Interactions */}
      <div onClick={(e) => e.stopPropagation()}>
        <ReelCommentsSheet 
            isOpen={isCommentsOpen} 
            onClose={() => setIsCommentsOpen(false)} 
        />
      </div>
    </div>
  );
};

export default ReelItem;