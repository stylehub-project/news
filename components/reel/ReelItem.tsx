
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, Zap, Eye, Mic, BrainCircuit, ChevronDown, Check, Volume2, VolumeX, Sparkles, BookOpen } from 'lucide-react';
import ReelContextStrip from './ReelContextStrip';
import ReelActionToolbar from './ReelActionToolbar';
import BlurImageLoader from '../loaders/BlurImageLoader';
import { useNavigate } from 'react-router-dom';
import { modifyText } from '../../utils/aiService';

interface ReelItemProps {
  data: any;
  isActive: boolean;
  isAutoRead: boolean;
}

type Perspective = 'Neutral' | 'Public' | 'Economic' | 'Human';

const ReelItem: React.FC<ReelItemProps> = ({ data, isActive, isAutoRead }) => {
  const navigate = useNavigate();
  
  // --- Core State ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [progress, setProgress] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [perspective, setPerspective] = useState<Perspective>('Neutral');
  const [displayedContent, setDisplayedContent] = useState<string[]>([]);
  const [showWhyItMatters, setShowWhyItMatters] = useState(false);
  
  // --- Animation State ---
  const [revealedParagraphs, setRevealedParagraphs] = useState<number[]>([]);
  
  // --- Refs ---
  const synthRef = useRef<SpeechSynthesis | null>(window.speechSynthesis);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Content splitting for Smart Reveal
  const paragraphs = useMemo(() => {
      // Use summary or description, ensuring it's an array or split string
      const text = data.summary || data.description || "";
      return text.split(/(?:\r\n|\r|\n)/g).filter((p: string) => p.trim().length > 0);
  }, [data]);

  // Initial Content Load
  useEffect(() => {
      setDisplayedContent(paragraphs);
  }, [paragraphs]);

  // --- 1. Spoken Brief & Smart Reveal Logic ---
  useEffect(() => {
    if (isActive) {
        // Reset
        setRevealedParagraphs([]);
        setProgress(0);
        
        // Sequential Reveal Animation
        paragraphs.forEach((_, i) => {
            setTimeout(() => {
                setRevealedParagraphs(prev => [...prev, i]);
            }, 600 + (i * 1200)); // Staggered delay
        });

        // Auto-Start Audio
        if (isAutoRead) {
            setTimeout(startReading, 800);
        }
    } else {
        stopReading();
        setIsFocusMode(false);
        setShowWhyItMatters(false);
    }

    return () => stopReading();
  }, [isActive, isAutoRead, paragraphs]);

  // --- Audio Engine ---
  const startReading = () => {
      if (!isActive) return;
      if (synthRef.current?.speaking) synthRef.current.cancel();

      // Construct Text based on current state
      const textToRead = `${data.title}. ${displayedContent.join('. ')}`;
      const u = new SpeechSynthesisUtterance(textToRead);
      
      // Voice Selection (Prefer "Google US English" or smooth voices)
      const voices = synthRef.current?.getVoices() || [];
      const preferredVoice = voices.find(v => v.name === "Google US English") || voices.find(v => v.lang === 'en-US') || voices[0];
      if (preferredVoice) u.voice = preferredVoice;

      u.rate = playbackSpeed;
      u.pitch = 1.0;
      u.volume = 1.0;

      // Sync Progress Bar
      u.onboundary = (event) => {
          const charIndex = event.charIndex;
          const textLen = textToRead.length;
          const pct = Math.min((charIndex / textLen) * 100, 100);
          setProgress(pct);
      };

      u.onend = () => {
          setIsPlaying(false);
          setProgress(100);
      };

      synthRef.current?.speak(u);
      utteranceRef.current = u;
      setIsPlaying(true);
  };

  const stopReading = () => {
      synthRef.current?.cancel();
      setIsPlaying(false);
  };

  const togglePause = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (isPlaying) {
          synthRef.current?.pause();
          setIsPlaying(false);
      } else {
          if (synthRef.current?.paused) {
              synthRef.current.resume();
              setIsPlaying(true);
          } else {
              startReading();
          }
      }
  };

  // --- 4. Multi-Angle Perspective Logic ---
  const handlePerspectiveChange = async (newPerspective: Perspective) => {
      if (newPerspective === perspective) return;
      
      // Visual feedback
      setPerspective(newPerspective);
      setRevealedParagraphs([]); // Reset reveal to re-animate
      stopReading();

      // In a real app, this fetches from AI. Here we simulate "morphing".
      // We'll use the existing utility to simulate a change
      let instruction = "";
      switch (newPerspective) {
          case 'Public': instruction = "Rewrite this from a public opinion perspective, focusing on social impact."; break;
          case 'Economic': instruction = "Rewrite this focusing strictly on financial markets and economic implications."; break;
          case 'Human': instruction = "Rewrite this as a human interest story, focusing on individuals affected."; break;
          default: 
              setDisplayedContent(paragraphs);
              setTimeout(() => paragraphs.forEach((_, i) => setRevealedParagraphs(prev => [...prev, i])), 300);
              return;
      }

      // Optimistic Update (Simulation)
      const newText = await modifyText(paragraphs.join(' '), instruction);
      const newParas = newText.split('\n').filter(p => p.trim().length > 0);
      
      setDisplayedContent(newParas);
      
      // Re-trigger reveal
      newParas.forEach((_, i) => {
          setTimeout(() => {
              setRevealedParagraphs(prev => [...prev, i]);
          }, 300 + (i * 800));
      });
  };

  // --- Gestures ---
  const handleTouchStart = () => {
      longPressTimer.current = setTimeout(() => {
          setIsFocusMode(true);
          if (navigator.vibrate) navigator.vibrate(50);
      }, 500);
  };

  const handleTouchEnd = () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      setIsFocusMode(false);
  };

  const handleContentTap = () => {
      togglePause();
  };

  // --- Navigation Handlers ---
  const handleAIExplain = () => navigate(`/ai-chat?context=reel&headline=${encodeURIComponent(data.title)}`);
  const handleReadFull = () => navigate(`/news/${data.id}`);
  const handleSave = () => console.log('Saved'); // Mock
  const handleShare = () => {
      if (navigator.share) navigator.share({ title: data.title, text: data.summary, url: window.location.href });
  };

  return (
    <div 
        className="relative h-full w-full bg-black text-white overflow-hidden flex flex-col select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
    >
      
      {/* 1. Immersive Background Layer */}
      <div className={`absolute inset-0 z-0 transition-all duration-700 ${isFocusMode ? 'scale-110 opacity-20' : 'scale-100 opacity-40'}`}>
          <BlurImageLoader 
            src={data.imageUrl} 
            alt="Background" 
            className="w-full h-full object-cover blur-xl" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black"></div>
      </div>

      {/* 5. Reading Flow Indicator (Right Side) */}
      <div className="absolute right-1 top-24 bottom-32 w-1 bg-gray-800/50 rounded-full z-20 overflow-hidden">
          <div 
            className="w-full bg-indigo-500 transition-all duration-300 ease-linear shadow-[0_0_10px_rgba(99,102,241,0.8)]"
            style={{ height: `${progress}%` }}
          ></div>
      </div>

      {/* Main Content Area */}
      <div className={`relative z-10 flex-1 flex flex-col p-6 pt-24 pb-32 transition-opacity duration-300 ${isFocusMode ? 'opacity-100' : 'opacity-100'}`}>
          
          {/* Metadata (Hidden in Focus Mode) */}
          <div className={`transition-opacity duration-300 ${isFocusMode ? 'opacity-0' : 'opacity-100'}`}>
              <ReelContextStrip 
                category={data.category} 
                location={data.location?.name || 'Global'}
                timeAgo={data.timeAgo}
                source={data.source}
                trustScore={data.trustScore}
              />
          </div>

          {/* Headline */}
          <div className="mb-6 animate-in slide-in-from-left-4 duration-700 delay-100">
              <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 drop-shadow-sm">
                  {data.title}
              </h1>
          </div>

          {/* Perspective Switcher (4. Multi-Angle News Switch) */}
          {!isFocusMode && (
              <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
                  {['Neutral', 'Public', 'Economic', 'Human'].map((p) => (
                      <button
                        key={p}
                        onClick={(e) => { e.stopPropagation(); handlePerspectiveChange(p as Perspective); }}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all whitespace-nowrap flex items-center gap-1 ${
                            perspective === p 
                            ? 'bg-white text-black border-white shadow-lg scale-105' 
                            : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/30'
                        }`}
                      >
                          {perspective === p && <Check size={10} />}
                          {p}
                      </button>
                  ))}
              </div>
          )}

          {/* Smart Text Canvas (2. Smart Text Reveal) */}
          <div 
            className="flex-1 space-y-4 overflow-y-auto pr-4 custom-scrollbar mask-gradient-b" 
            onClick={handleContentTap}
            ref={contentRef}
          >
              {displayedContent.map((para, idx) => (
                  <p 
                    key={`${perspective}-${idx}`} 
                    className={`text-lg md:text-xl font-medium leading-relaxed transition-all duration-1000 transform ${
                        revealedParagraphs.includes(idx) 
                        ? 'opacity-100 translate-y-0 filter-none' 
                        : 'opacity-0 translate-y-4 blur-sm'
                    } ${idx === 0 ? 'text-gray-100' : 'text-gray-300'}`}
                  >
                      {/* Keyword Highlighting Logic (Simple Mock) */}
                      {para.split(' ').map((word, wIdx) => {
                          const isKeyword = word.length > 7 && Math.random() > 0.8;
                          return isKeyword && revealedParagraphs.includes(idx) ? (
                              <span key={wIdx} className="text-indigo-300 drop-shadow-[0_0_8px_rgba(165,180,252,0.4)] animate-pulse inline-block">{word} </span>
                          ) : (
                              <span key={wIdx}>{word} </span>
                          );
                      })}
                  </p>
              ))}

              {/* 3. Why It Matters Toggle */}
              <div className="py-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowWhyItMatters(!showWhyItMatters); }}
                    className="flex items-center gap-2 text-xs font-bold text-yellow-400 bg-yellow-400/10 px-4 py-2 rounded-lg border border-yellow-400/20 hover:bg-yellow-400/20 transition-all w-full justify-center"
                  >
                      <BrainCircuit size={14} />
                      {showWhyItMatters ? "Hide Analysis" : "Why this matters?"}
                      <ChevronDown size={14} className={`transition-transform ${showWhyItMatters ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Why It Matters Content Block */}
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showWhyItMatters ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                      <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-l-4 border-yellow-500 p-4 rounded-r-xl">
                          <p className="text-sm text-yellow-100 leading-relaxed font-medium">
                              <span className="font-bold text-yellow-400 block mb-1 uppercase text-[10px] tracking-wider">AI Context</span>
                              This event significantly shifts the {perspective.toLowerCase()} landscape by altering regulatory frameworks. Experts suggest immediate impact on local markets.
                          </p>
                      </div>
                  </div>
              </div>
              
              <div className="h-12"></div>
          </div>

          {/* Audio Controls (Mini Player) */}
          <div className={`mt-2 flex items-center gap-4 transition-opacity duration-300 ${isFocusMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <button 
                onClick={togglePause}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
              </button>
              
              <div className="flex-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      {isPlaying ? <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> : <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>}
                      {isPlaying ? 'Speaking Brief...' : 'Audio Paused'}
                  </span>
              </div>

              <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); setPlaybackSpeed(s => s === 1 ? 1.5 : 1); }} className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded text-gray-300 hover:bg-white/20 transition-colors">
                      {playbackSpeed}x
                  </button>
              </div>
          </div>

      </div>

      {/* 3. Action Toolbar */}
      <div className={`transition-transform duration-300 ${isFocusMode ? 'translate-y-24' : 'translate-y-0'}`}>
          <ReelActionToolbar 
            onExplain={handleAIExplain}
            onSave={handleSave}
            onShare={handleShare}
            onReadFull={handleReadFull}
          />
      </div>

    </div>
  );
};

export default ReelItem;
