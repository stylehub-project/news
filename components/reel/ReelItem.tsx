
import React, { useState, useEffect, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import SmartReadCanvas from './SmartReadCanvas';
import AudioPlayerStrip from './AudioPlayerStrip';
import ReelActionBar from './ReelActionBar';
import ReelExpandLayer from './ReelExpandLayer';
import { ShieldCheck, MapPin, Clock, Minimize2, RefreshCw } from 'lucide-react';
import { modifyText } from '../../utils/aiService';

interface ReelItemProps {
  data: {
    id: string;
    articleId: string;
    title: string;
    summary: string;
    imageUrl: string;
    source: string;
    category: string;
    timeAgo: string;
    trustScore?: number;
    location?: { name: string };
    tags?: string[];
    aiSummary?: string;
    keyPoints?: string[];
    factCheck?: { status: string; score: number };
    relatedNews?: Array<any>;
  };
  isActive: boolean;
  isAutoRead: boolean;
}

const PERSPECTIVES = ['Neutral', 'Economic', 'Human Impact', 'Future Outlook'];

const ReelItem = memo<ReelItemProps>(({ data, isActive, isAutoRead }) => {
  const navigate = useNavigate();
  
  // Interaction State
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [showExpand, setShowExpand] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  // Content State (For Multi-Angle Switch)
  const [currentPerspective, setCurrentPerspective] = useState('Neutral');
  const [displayedSummary, setDisplayedSummary] = useState(data.summary);
  const [isMorphing, setIsMorphing] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickPreventRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Calculate Title Offset for Highlighting
  const titleWordCount = data.title.split(/\s+/).length;

  // --- Scroll & Reading Progress ---
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const scrollHeight = target.scrollHeight - target.clientHeight;
      const scrollTop = target.scrollTop;
      
      if (scrollHeight > 0) {
          const progress = (scrollTop / scrollHeight) * 100;
          setReadingProgress(progress);
      }
  };

  // --- Perspective Switching ---
  const cyclePerspective = async (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setIsMorphing(true);
      
      const currentIndex = PERSPECTIVES.indexOf(currentPerspective);
      const nextIndex = (currentIndex + 1) % PERSPECTIVES.length;
      const nextPerspective = PERSPECTIVES[nextIndex];
      
      setCurrentPerspective(nextPerspective);

      // Reset Audio
      window.speechSynthesis.cancel();
      setIsPlaying(false);

      try {
          if (nextPerspective === 'Neutral') {
              setDisplayedSummary(data.summary);
          } else {
              // Call AI Service
              const newText = await modifyText(
                  data.summary, 
                  `Rewrite this news summary from a ${nextPerspective} perspective. Focus on ${nextPerspective === 'Economic' ? 'financial implications' : nextPerspective === 'Human Impact' ? 'people and society' : 'long-term consequences'}. Keep it concise.`
              );
              setDisplayedSummary(newText);
          }
      } catch (err) {
          console.error("Failed to switch perspective", err);
          // Fallback
          setDisplayedSummary(data.summary);
      } finally {
          setIsMorphing(false);
          setReadingProgress(0);
          if (scrollRef.current) scrollRef.current.scrollTop = 0;
      }
  };

  // --- Audio Logic ---
  
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setAudioProgress(0);
    setCurrentWordIndex(-1);

    if (isActive && !isMorphing) {
        const text = `${data.title}. ${displayedSummary}`;
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 1.0; 
        u.pitch = 1.0;
        u.volume = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || voices[0];
        if (preferredVoice) u.voice = preferredVoice;

        u.onboundary = (event) => {
            if (event.name === 'word') {
                const charIndex = event.charIndex;
                const textBefore = text.substring(0, charIndex);
                const wordCount = textBefore.trim().split(/\s+/).length;
                setCurrentWordIndex(wordCount);
                setAudioProgress((charIndex / text.length) * 100);
            }
        };

        u.onend = () => {
            setIsPlaying(false);
            setAudioProgress(100);
            setCurrentWordIndex(-1);
        };

        utteranceRef.current = u;

        if (isAutoRead && currentPerspective === 'Neutral') { // Only auto-read default view
            const timer = setTimeout(() => {
                window.speechSynthesis.speak(u);
                setIsPlaying(true);
            }, 600);
            return () => clearTimeout(timer);
        }
    } else {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
    }

    return () => {
        window.speechSynthesis.cancel();
    };
  }, [isActive, isAutoRead, data.id, displayedSummary, isMorphing]);

  const togglePlay = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (clickPreventRef.current) return;

      if (isPlaying) {
          window.speechSynthesis.cancel();
          setIsPlaying(false);
      } else {
          if (utteranceRef.current) {
              window.speechSynthesis.speak(utteranceRef.current);
              setIsPlaying(true);
          }
      }
  };

  // --- Touch/Click Handlers ---

  const handleTouchStart = () => {
      clickPreventRef.current = false;
      longPressTimerRef.current = setTimeout(() => {
          setIsFocusMode(prev => !prev);
          if (navigator.vibrate) navigator.vibrate(50);
          clickPreventRef.current = true; 
      }, 600);
  };

  const handleTouchEnd = () => {
      if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
      }
  };

  const handleReadFull = (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(`/news/${data.articleId}`);
  };

  return (
    <div 
        className="h-full w-full relative bg-gray-900 flex flex-col overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart} 
        onMouseUp={handleTouchEnd}
    >
      
      {/* 1. Blurred Atmosphere Background */}
      <div className="absolute inset-0 z-0 transition-opacity duration-700">
          <img 
            src={data.imageUrl} 
            alt="Background" 
            className={`w-full h-full object-cover blur-3xl scale-125 transition-opacity duration-700 ${isFocusMode ? 'opacity-10' : 'opacity-40'}`} 
          />
          <div className={`absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90 transition-opacity duration-500 ${isFocusMode ? 'opacity-100' : 'opacity-90'}`}></div>
      </div>

      {/* READING FLOW INDICATOR (Right Side) */}
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/10 z-30 pointer-events-none">
          <div 
            className="w-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] transition-all duration-300 ease-out"
            style={{ height: `${readingProgress}%` }}
          ></div>
      </div>

      {/* 2. Main Content Canvas */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className={`relative z-10 flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar scrollbar-hide transition-all duration-500 ${isFocusMode ? 'pt-12' : 'pt-24 pb-4'}`}
        onClick={togglePlay}
      >
          
          {/* Focus Mode Exit Hint */}
          {isFocusMode && (
              <div className="absolute top-6 right-6 animate-in fade-in zoom-in">
                  <div className="bg-white/10 p-2 rounded-full text-white/50">
                      <Minimize2 size={20} />
                  </div>
              </div>
          )}

          {/* Context Strip */}
          <div className={`flex flex-wrap items-center gap-3 mb-6 transition-all duration-500 ${isFocusMode ? 'opacity-0 h-0 overflow-hidden' : 'animate-in slide-in-from-top-4 fade-in duration-700 delay-100'}`}>
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                  {data.category}
              </span>
              <div className="flex items-center gap-1 text-gray-300 text-xs font-medium">
                  <MapPin size={12} className="text-gray-400" />
                  {data.location?.name || 'Global'}
              </div>
              <div className="flex items-center gap-1 text-gray-300 text-xs font-medium">
                  <Clock size={12} className="text-gray-400" />
                  {data.timeAgo}
              </div>
              <div className="ml-auto flex items-center gap-1 bg-green-900/40 border border-green-500/30 px-2 py-0.5 rounded-full text-[9px] font-bold text-green-400">
                  <ShieldCheck size={10} />
                  {data.trustScore || 95}% Trust
              </div>
          </div>

          {/* Headline Zone */}
          <h1 className={`font-black text-white leading-tight mb-6 drop-shadow-lg transition-all duration-500 ${isFocusMode ? 'text-2xl opacity-50' : 'text-3xl md:text-4xl animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200'}`}>
              {data.title}
          </h1>

          {/* Perspective Label (Dynamic) */}
          <div className="flex items-center justify-between mb-4">
              <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded transition-colors ${currentPerspective === 'Neutral' ? 'text-gray-400 bg-white/5' : 'text-indigo-300 bg-indigo-500/20 border border-indigo-500/30'}`}>
                  {currentPerspective} Angle
              </span>
          </div>

          {/* Reading Canvas */}
          <div className={`flex-1 transition-opacity duration-300 ${isMorphing ? 'opacity-0 scale-98 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
              <SmartReadCanvas 
                  text={displayedSummary} 
                  currentWordIndex={currentWordIndex - titleWordCount} 
                  isPlaying={isPlaying}
                  imageUrl={data.imageUrl}
                  isFocusMode={isFocusMode}
                  aiInsight={data.aiSummary || "This story is trending due to high engagement in your region."}
              />
          </div>
      </div>

      {/* 3. Bottom Controls Area (Fixed) */}
      <div className={`relative z-20 w-full px-4 transition-all duration-500 ease-in-out ${isFocusMode ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100 pb-24 pt-4 bg-gradient-to-t from-black via-black/95 to-transparent'}`}>
          
          {/* Inline Audio Player */}
          <div className="mb-6">
              <AudioPlayerStrip 
                  isPlaying={isPlaying} 
                  progress={audioProgress} 
                  onTogglePlay={togglePlay} 
              />
          </div>

          {/* Understanding Actions */}
          <ReelActionBar 
              onAIExplain={(e) => { e?.stopPropagation(); setShowExpand(true); }}
              onSwitchPerspective={cyclePerspective}
              currentPerspective={currentPerspective}
              onSave={() => {}}
              onShare={() => {}}
              onMore={() => {}}
              isLiked={false}
              isSaved={false}
          />
          
          {/* Main CTA */}
          <button 
            onClick={handleReadFull}
            className="absolute bottom-6 right-4 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full transition-all active:scale-95"
          >
              Read Full Article →
          </button>
      </div>

      {/* Expand Layer (AI Analysis) */}
      <ReelExpandLayer 
        isOpen={showExpand} 
        onClose={() => setShowExpand(false)} 
        data={data} 
      />
    </div>
  );
}, (prev, next) => {
    return prev.data.id === next.data.id && 
           prev.isActive === next.isActive && 
           prev.isAutoRead === next.isAutoRead;
});

export default ReelItem;
