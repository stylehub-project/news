
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Settings, Bookmark, Share2, Type, Sparkles, Highlighter, ArrowDown, BrainCircuit, MapPin, RefreshCw, AlignLeft, AlignCenter, AlignJustify } from 'lucide-react';
import HighlightReadingMode from '../../components/HighlightReadingMode';
import Sheet from '../../components/ui/Sheet';
import { useBookmark } from '../../context/BookmarkContext';
import { useHistory } from '../../context/HistoryContext';
import Toast from '../../components/ui/Toast';
import { fetchFullArticle, getArticleById } from '../../utils/aiService';
import { useLanguage } from '../../context/LanguageContext';
import FloatingAudioPlayer from '../../components/player/FloatingAudioPlayer';
import CommentSection from '../../components/comments/CommentSection';

const DetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { isBookmarked, toggleBookmark } = useBookmark();
  const { trackProgress, getHistoryItem, checkReadStatus } = useHistory();
  const { contentLanguage } = useLanguage();
  
  // Logic to handle passed state vs URL ID
  const passedArticle = location.state?.article;
  
  const [articleData, setArticleData] = useState<any>(passedArticle || null);
  const [fullContent, setFullContent] = useState<string>("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  const articleId = id || (articleData?.id) || 'unknown';
  const isSaved = isBookmarked(articleId);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Reader State
  const [isReading, setIsReading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark' | 'oled' | 'navy'>('light');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState<number>(1.8);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'justify'>('left');
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('normal');
  const [speed, setSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isHighlightEnabled, setIsHighlightEnabled] = useState(false);
  
  // Resume & Tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const [resumePoint, setResumePoint] = useState<number | null>(null);
  const [showResumeToast, setShowResumeToast] = useState(false);
  
  // 15.4 AI Memory State
  const [memoryContext, setMemoryContext] = useState<{ seen: boolean; progress: number; isUpdated: boolean } | null>(null);

  // Recovery Logic for Refresh
  useEffect(() => {
      if (!articleData && id) {
          const recovered = getArticleById(id);
          setArticleData(recovered);
      }
  }, [articleData, id]);

  // Load Content Logic
  useEffect(() => {
      const loadContent = async () => {
          if (!articleData) return;

          // If we have full text in state (from upload), use it
          if (articleData.description && articleData.description.length > 500) {
              setFullContent(articleData.description);
              return;
          }

          setIsLoadingContent(true);
          const langName = contentLanguage === 'hi' ? 'Hindi' : contentLanguage === 'es' ? 'Spanish' : contentLanguage === 'fr' ? 'French' : 'English';
          const generatedContent = await fetchFullArticle(articleData.title, langName);
          setFullContent(generatedContent);
          setIsLoadingContent(false);
      };

      if (articleData && !fullContent) {
          loadContent();
      }
  }, [articleData, contentLanguage]);

  // 15.1 Load Resume Point & Check History
  useEffect(() => {
      if (!articleId || articleId === 'unknown') return;

      const historyItem = getHistoryItem(articleId);
      const shouldResume = searchParams.get('resume') === 'true';
      const status = checkReadStatus(articleId);
      
      if (status.seen) {
          setMemoryContext(status);
      }

      // Check if there is a specifically saved scroll position > 0
      if (historyItem && historyItem.scrollPosition && historyItem.scrollPosition > 50) {
          setResumePoint(historyItem.scrollPosition);
          // If came from "Continue Reading" card, auto scroll
          if (shouldResume) {
              setTimeout(() => {
                  handleResume();
              }, 500);
          } else {
              setShowResumeToast(true);
          }
      }
  }, [articleId, getHistoryItem, searchParams, checkReadStatus]);

  const handleSetStopPoint = () => {
      if (containerRef.current) {
          const scrollPos = containerRef.current.scrollTop;
          const height = containerRef.current.scrollHeight - containerRef.current.clientHeight;
          const progress = Math.round((scrollPos / height) * 100);
          
          if (articleData) {
              // Save progress with current scroll position
              trackProgress(articleId, 'article', articleData.title, progress, scrollPos, undefined, undefined, articleData.category);
          }
          
          setResumePoint(scrollPos);
          setToastMessage("Stop Point Saved 📍");
          setShowToast(true);
      }
  };

  const handleResume = () => {
      if (containerRef.current && resumePoint) {
          containerRef.current.scrollTo({
              top: resumePoint,
              behavior: 'smooth'
          });
          setShowResumeToast(false);
      }
  };

  // 15.11 Track AI Explanation Interaction
  const handleExplain = () => {
      if (articleData) {
          trackProgress(articleId, 'article', articleData.title, memoryContext?.progress || 0, resumePoint || 0, { hasExplained: true }, undefined, articleData.category);
          navigate(`/ai-chat?context=article&headline=${encodeURIComponent(articleData.title)}`);
      }
  };

  // Theme Styles
  const themes = {
    light: 'bg-white text-gray-900',
    sepia: 'bg-[#f4ecd8] text-[#5b4636]',
    dark: 'bg-[#1a1a1a] text-[#e0e0e0]',
    oled: 'bg-black text-gray-300',
    navy: 'bg-[#0a192f] text-[#ccd6f6]'
  };

  const fonts = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono'
  };

  const handleToggleRead = () => setIsReading(!isReading);

  const handleSave = () => {
      if (articleData) {
          toggleBookmark({
              id: articleId,
              title: articleData.title,
              source: articleData.source,
              category: articleData.category,
              imageUrl: articleData.imageUrl,
              timeAgo: articleData.timeAgo
          });
          setToastMessage(isSaved ? "Removed from Saved" : "Article Saved");
          setShowToast(true);
      }
  };

  // Wait for recovery
  if (!articleData) {
      return (
          <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-black text-gray-500">
              <div className="text-center">
                  <RefreshCw className="animate-spin mb-4 mx-auto text-blue-600" size={32} />
                  <p className="mb-4">Loading article...</p>
              </div>
          </div>
      );
  }

  return (
    <div className={`h-full flex flex-col ${themes[theme]} transition-colors duration-300 relative`}>
      {showToast && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50">
              <Toast type="success" message={toastMessage} onClose={() => setShowToast(false)} />
          </div>
      )}

      {/* 15.2 Resume Toast */}
      {showResumeToast && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 w-max animate-in slide-in-from-bottom-4 fade-in">
              <button 
                onClick={handleResume}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-full shadow-xl font-bold text-xs hover:scale-105 active:scale-95 transition-all"
              >
                  <ArrowDown size={14} className="animate-bounce" />
                  Resume from Stop Point
              </button>
          </div>
      )}

      {/* Header */}
      <div className={`sticky top-0 z-40 px-4 py-3 flex items-center justify-between border-b ${theme === 'dark' || theme === 'oled' || theme === 'navy' ? 'border-gray-800 bg-black/50' : 'border-gray-100 bg-white/90'} backdrop-blur-md`}>
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200/20 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-2">
            <button 
                onClick={() => setIsHighlightEnabled(!isHighlightEnabled)} 
                className={`p-2 rounded-full transition-colors ${isHighlightEnabled ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-200/20'}`}
                title="Highlight Main Words"
            >
                <Highlighter size={20} />
            </button>
            <button onClick={() => setShowSettings(true)} className="p-2 rounded-full hover:bg-gray-200/20 transition-colors">
                <Type size={20} />
            </button>
            <button 
                onClick={handleSave} 
                className={`p-2 rounded-full hover:bg-gray-200/20 transition-colors ${isSaved ? 'text-blue-600' : ''}`}
            >
                <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-200/20 transition-colors">
                <Share2 size={20} />
            </button>
        </div>
      </div>

      {/* Article Content */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-5 pb-32 max-w-2xl mx-auto w-full custom-scrollbar scroll-smooth relative"
      >
        {/* 15.4 AI Memory Banner */}
        {memoryContext && (
            <div className="mb-6 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 animate-in fade-in slide-in-from-top-2">
                <div className="flex gap-3">
                    <div className="mt-1"><BrainCircuit size={18} className="text-indigo-600 dark:text-indigo-400" /></div>
                    <div>
                        <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-1">
                            {memoryContext.isUpdated ? "Story Updated Since Your Visit" : "You've Seen This Story"}
                        </h4>
                        <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                            {memoryContext.isUpdated 
                                ? "New details have been added about the regulatory impact. You previously read 40%." 
                                : `You last read this to ${Math.round(memoryContext.progress)}%. Would you like a recap of what you missed?`}
                        </p>
                    </div>
                </div>
            </div>
        )}

        <h1 className={`${fonts[fontFamily]} text-2xl md:text-3xl font-black mb-2 leading-tight`}>
          {articleData.title}
        </h1>
        
        <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-6 ${theme === 'sepia' ? 'text-[#8a6e57]' : 'text-gray-500'}`}>
            <span className="text-blue-500">{articleData.source}</span>
            <span>•</span>
            <span>{articleData.timeAgo}</span>
            <span>•</span>
            <span>{isLoadingContent ? 'Calculating...' : '4 min read'}</span>
        </div>

        {/* 8.1 Reading Mode Layout - Explicit font size applied here */}
        <div className={`relative ${fonts[fontFamily]}`} style={{ 
            fontSize: `${fontSize}px`, 
            lineHeight: lineHeight,
            textAlign: textAlign,
            fontWeight: fontWeight === 'bold' ? '600' : '400'
        }}>
            
            {/* Visual Marker Logic */}
            {resumePoint && (
                <div 
                    className="absolute w-full border-t-2 border-dashed border-red-500 opacity-70 flex items-center" 
                    style={{ top: `${resumePoint - 120}px` }} // visual offset
                >
                    <span className="bg-red-500 text-white text-[9px] px-1 rounded-r font-bold uppercase flex items-center gap-1">
                        <MapPin size={8} fill="currentColor"/> Stop Point
                    </span>
                </div>
            )}

            {isLoadingContent ? (
                <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="flex items-center gap-2 text-indigo-500 mt-4 text-sm font-bold">
                        <RefreshCw className="animate-spin" size={16} /> Retrieving full report...
                    </div>
                </div>
            ) : (
                <HighlightReadingMode 
                    text={fullContent}
                    isPlaying={isReading}
                    speed={speed}
                    theme={theme}
                    onComplete={() => setIsReading(false)}
                />
            )}
        </div>

        {/* Commenting System */}
        <CommentSection articleId={articleId} />
      </div>

      {/* Floating Controls: Use Transparent Player if active, else standard bar */}
      {isReading ? (
          <FloatingAudioPlayer 
              isPlaying={isReading}
              onTogglePlay={handleToggleRead}
              onClose={() => setIsReading(false)}
              speed={speed}
              onSpeedChange={setSpeed}
              progress={35} // Placeholder progress for now, would sync with HighlightReadingMode
              title={articleData.title}
          />
      ) : (
          <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-4 px-5 py-2.5 rounded-full shadow-2xl z-40 border ${theme === 'dark' || theme === 'oled' || theme === 'navy' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
             {/* Set Stop Point Button */}
             <button 
                onClick={handleSetStopPoint}
                className="text-xs font-bold w-8 flex flex-col items-center gap-0.5 text-gray-500 hover:text-red-500 transition-colors"
                title="Set Bookmark Here"
             >
                <MapPin size={18} />
             </button>

             <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-700"></div>

             <button 
                onClick={() => setSpeed(prev => prev === 2 ? 0.5 : prev + 0.5)}
                className="text-xs font-bold w-8 text-center"
             >
                {speed}x
             </button>
             
             <button 
                onClick={handleToggleRead}
                className={`p-3.5 rounded-full text-white shadow-lg transition-transform active:scale-95 ${isReading ? 'bg-red-500' : 'bg-blue-600'}`}
             >
                <Play size={22} fill="currentColor" className="ml-1" />
             </button>

             {/* 7.13 AI Explain Button with Context */}
             <button 
                className="text-xs font-bold flex items-center gap-1 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                onClick={handleExplain}
             >
                <Sparkles size={14} className="fill-indigo-600/20" /> Explain
             </button>
          </div>
      )}

      {/* Settings Sheet */}
      <Sheet isOpen={showSettings} onClose={() => setShowSettings(false)} title="Reader Appearance">
         <div className="space-y-6 pt-2 pb-8 max-h-[70vh] overflow-y-auto custom-scrollbar px-1">
            {/* Font Family Selection */}
            <div className="space-y-2">
                <span className="text-sm font-bold text-gray-500">Font Family</span>
                <div className="grid grid-cols-3 gap-3">
                    {['serif', 'sans', 'mono'].map((f) => (
                        <button 
                            key={f}
                            onClick={() => setFontFamily(f as any)}
                            className={`py-3 rounded-xl border-2 capitalize font-bold text-sm transition-all ${fontFamily === f ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'border-gray-100 bg-gray-50 text-gray-400 dark:border-gray-800 dark:bg-gray-900'}`}
                        >
                            <span className={f === 'serif' ? 'font-serif' : f === 'sans' ? 'font-sans' : 'font-mono'}>
                                {f}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Font Weight & Alignment */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <span className="text-sm font-bold text-gray-500">Font Weight</span>
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                        <button 
                            onClick={() => setFontWeight('normal')}
                            className={`flex-1 py-2 rounded-lg text-sm transition-all ${fontWeight === 'normal' ? 'bg-white dark:bg-gray-700 shadow-sm font-bold text-blue-600 dark:text-blue-400' : 'text-gray-500 font-medium'}`}
                        >
                            Normal
                        </button>
                        <button 
                            onClick={() => setFontWeight('bold')}
                            className={`flex-1 py-2 rounded-lg text-sm transition-all ${fontWeight === 'bold' ? 'bg-white dark:bg-gray-700 shadow-sm font-bold text-blue-600 dark:text-blue-400' : 'text-gray-500 font-bold'}`}
                        >
                            Bold
                        </button>
                    </div>
                </div>
                <div className="space-y-2">
                    <span className="text-sm font-bold text-gray-500">Alignment</span>
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                        {['left', 'center', 'justify'].map(align => (
                            <button 
                                key={align}
                                onClick={() => setTextAlign(align as any)}
                                className={`flex-1 py-2 rounded-lg text-sm transition-all flex justify-center items-center ${textAlign === align ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
                                title={align}
                            >
                                {align === 'left' ? <AlignLeft size={16} /> : align === 'center' ? <AlignCenter size={16} /> : <AlignJustify size={16} />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                    <span>Font Size</span>
                    <span>{fontSize}px</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 p-2 rounded-xl">
                    <span className="text-xs font-bold px-2 text-gray-500">A</span>
                    <input 
                        type="range" 
                        min="14" 
                        max="32" 
                        value={fontSize} 
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        className="flex-1 accent-blue-600 h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-xl font-bold px-2 text-gray-500">A</span>
                </div>
            </div>

            {/* Line Spacing */}
            <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                    <span>Line Spacing</span>
                    <span>{lineHeight}x</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 p-2 rounded-xl">
                    <span className="text-xs font-bold px-2 text-gray-500 flex flex-col items-center leading-none gap-0.5">
                        <span className="w-3 h-[1px] bg-current"></span>
                        <span className="w-3 h-[1px] bg-current"></span>
                        <span className="w-3 h-[1px] bg-current"></span>
                    </span>
                    <input 
                        type="range" 
                        min="1.2" 
                        max="2.5" 
                        step="0.1"
                        value={lineHeight} 
                        onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                        className="flex-1 accent-blue-600 h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-xl font-bold px-2 text-gray-500 flex flex-col items-center leading-none gap-1.5">
                        <span className="w-4 h-[2px] bg-current"></span>
                        <span className="w-4 h-[2px] bg-current"></span>
                        <span className="w-4 h-[2px] bg-current"></span>
                    </span>
                </div>
            </div>

            {/* Themes */}
            <div className="space-y-2">
                <span className="text-sm font-bold text-gray-500">Theme</span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    <button 
                        onClick={() => setTheme('light')}
                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 ${theme === 'light' ? 'border-blue-500 bg-white shadow-sm' : 'border-gray-200 bg-white text-gray-500'}`}
                    >
                        <div className="w-5 h-5 rounded-full border border-gray-300 bg-white"></div>
                        <span className="text-[10px] font-bold">Light</span>
                    </button>
                    <button 
                        onClick={() => setTheme('sepia')}
                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 ${theme === 'sepia' ? 'border-blue-500 bg-[#f4ecd8] shadow-sm' : 'border-gray-200 bg-[#f4ecd8] text-[#5b4636]'}`}
                    >
                        <div className="w-5 h-5 rounded-full border border-[#d3c0a3] bg-[#f4ecd8]"></div>
                        <span className="text-[10px] font-bold">Sepia</span>
                    </button>
                    <button 
                        onClick={() => setTheme('dark')}
                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 ${theme === 'dark' ? 'border-blue-500 bg-[#1a1a1a] text-white shadow-sm' : 'border-gray-700 bg-[#1a1a1a] text-gray-400'}`}
                    >
                        <div className="w-5 h-5 rounded-full border border-gray-600 bg-[#1a1a1a]"></div>
                        <span className="text-[10px] font-bold">Dark</span>
                    </button>
                    <button 
                        onClick={() => setTheme('oled')}
                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 ${theme === 'oled' ? 'border-blue-500 bg-black text-white shadow-sm' : 'border-gray-800 bg-black text-gray-400'}`}
                    >
                        <div className="w-5 h-5 rounded-full border border-gray-700 bg-black"></div>
                        <span className="text-[10px] font-bold">OLED</span>
                    </button>
                    <button 
                        onClick={() => setTheme('navy')}
                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 ${theme === 'navy' ? 'border-blue-500 bg-[#0a192f] text-white shadow-sm' : 'border-[#112240] bg-[#0a192f] text-gray-400'}`}
                    >
                        <div className="w-5 h-5 rounded-full border border-[#233554] bg-[#0a192f]"></div>
                        <span className="text-[10px] font-bold">Navy</span>
                    </button>
                </div>
            </div>
         </div>
      </Sheet>
    </div>
  );
};

export default DetailsPage;
