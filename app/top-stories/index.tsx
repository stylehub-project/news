
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import SwipeableCard from '../../components/cards/SwipeableCard';
import AIQuickPreviewSheet from '../../components/cards/AIQuickPreviewSheet';
import SmartLoader from '../../components/loaders/SmartLoader';
import Toast, { ToastType } from '../../components/ui/Toast';
import { fetchNewsFeed } from '../../utils/aiService';
import { useLanguage } from '../../context/LanguageContext';
import { useBookmark } from '../../context/BookmarkContext';
import { ArrowRight, Play, Pause, Headphones, Calendar } from 'lucide-react';
import { useTour } from '../../context/TourContext';
import SpokenBriefPlayer from '../../components/reel/SpokenBriefPlayer';

// Map language code to API parameter name
const getLanguageParam = (code: string) => {
    const map: Record<string, string> = {
        'en': 'English',
        'hi': 'Hindi',
        'es': 'Spanish',
        'fr': 'French'
    };
    return map[code] || 'English';
};

const TopStoriesPage = () => {
  const navigate = useNavigate();
  const { contentLanguage } = useLanguage();
  const { toggleBookmark } = useBookmark();
  const { startTour, runTour } = useTour();
  
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState('All');
  const [toast, setToast] = useState<{show: boolean, msg: string, type: ToastType}>({ show: false, msg: '', type: 'success' });
  
  // AI Preview State
  const [previewArticleId, setPreviewArticleId] = useState<string | null>(null);
  
  // Audio Reader State
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  
  // Programmatic Swipe State
  const [swipeTrigger, setSwipeTrigger] = useState<'left' | 'right' | null>(null);
  
  const lastWheelTime = useRef(0);
  const dataLoadedRef = useRef(false);

  const loadStories = async (selectedFilter = 'All', force = false) => {
      if (!force && dataLoadedRef.current && articles.length > 0 && selectedFilter === filter) return;

      setLoading(true);
      const langName = getLanguageParam(contentLanguage);
      const news = await fetchNewsFeed(1, { category: selectedFilter, sort: 'Top', language: langName });
      
      setArticles(news);
      dataLoadedRef.current = true;
      setLoading(false);
      setCurrentIndex(0);
  };

  useEffect(() => {
      loadStories(filter, true);
  }, [contentLanguage, filter]); 

  const handleFilterChange = (newFilter: string) => {
      if (filter === newFilter) return;
      setFilter(newFilter);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
      setSwipeTrigger(null);
      setTimeout(() => {
          setCurrentIndex(prev => (prev + 1) % articles.length);
          // If auto-playing, allow next card to start
          setReadProgress(0);
      }, 50);
  };

  const handleNext = () => {
      setSwipeTrigger('left');
  };

  // --- Audio Logic ---
  const handleToggleAutoPlay = () => {
      setIsAutoPlaying(!isAutoPlaying);
  };

  const handleAudioComplete = () => {
      // Auto-swipe to next card when reading finishes
      if (isAutoPlaying) {
          handleNext();
      }
  };

  // --- Interaction Handlers ---
  const handleSave = (id: string) => {
      const article = articles.find(a => a.id === id);
      if (!article) return;
      toggleBookmark({
          id: article.id,
          title: article.title,
          source: article.source,
          category: article.category,
          imageUrl: article.imageUrl,
          timeAgo: article.timeAgo,
          description: article.description
      });
      setToast({ show: true, msg: 'Story Bookmarked 🔖', type: 'success' });
  };

  const handleShare = async (id: string) => {
      const article = articles.find(a => a.id === id);
      if (!article) return;
      if (navigator.share) {
          try {
              await navigator.share({ title: article.title, text: article.description, url: window.location.href });
          } catch (e) {}
      } else {
          setToast({ show: true, msg: 'Link copied to clipboard 🔗', type: 'success' });
          navigator.clipboard.writeText(window.location.href);
      }
  };

  const handleAIExplain = (id: string) => {
      const article = articles.find(a => a.id === id);
      if (article) {
          navigate(`/ai-chat?context=article&headline=${encodeURIComponent(article.title)}&id=${id}`);
      }
  };

  const handleReadStory = (id: string) => {
      const article = articles.find(a => a.id === id);
      navigate(`/news/${id}`, { state: { article } });
  };

  const currentArticle = articles[currentIndex];

  return (
    <div className="h-full bg-gray-50 dark:bg-black flex flex-col relative overflow-hidden transition-colors duration-300">
      
      {toast.show && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-4 w-auto">
              <Toast type={toast.type} message={toast.msg} onClose={() => setToast(prev => ({ ...prev, show: false }))} />
          </div>
      )}

      {/* Long Press Preview Sheet */}
      <AIQuickPreviewSheet 
        isOpen={!!previewArticleId}
        onClose={() => setPreviewArticleId(null)}
        article={articles.find(a => a.id === previewArticleId)}
        onFullAnalysis={() => {
            if (previewArticleId) {
                setPreviewArticleId(null);
                handleAIExplain(previewArticleId);
            }
        }}
      />

      <div className="absolute top-0 left-0 w-full z-20">
          <PageHeader title="Today's Headlines Hub" showBack />
          
          {/* Daily Briefing Header */}
          {!loading && (
              <div className="px-4 pt-2 pb-2 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <Calendar size={14} />
                          <span className="text-xs font-bold uppercase tracking-widest">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </div>
                      
                      {/* AI Reader Toggle */}
                      <button 
                          onClick={handleToggleAutoPlay}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isAutoPlaying ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                      >
                          {isAutoPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                          {isAutoPlaying ? 'Listening...' : 'Play Daily Digest'}
                      </button>
                  </div>
              </div>
          )}

          {/* Filter Bar */}
          <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide bg-white/80 dark:bg-black/80 backdrop-blur-sm">
              {['All', 'Tech', 'Politics', 'Business', 'Science'].map(f => (
                  <button
                    key={f}
                    onClick={() => handleFilterChange(f)}
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                        filter === f 
                        ? 'bg-black text-white dark:bg-white dark:text-black' 
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                      {f}
                  </button>
              ))}
          </div>
      </div>

      <div className="flex-1 relative w-full h-full flex items-center justify-center p-4 pt-32 pb-24 overflow-hidden">
          {loading ? (
              <SmartLoader type="headlines" />
          ) : (
              <div className="relative w-full max-w-md h-full max-h-[600px] flex items-center justify-center">
                  
                  {/* Invisible Audio Player for Reader Mode */}
                  {currentArticle && (
                      <div className="absolute top-0 opacity-0 pointer-events-none">
                          <SpokenBriefPlayer 
                              text={currentArticle.description}
                              isActive={true}
                              autoPlay={isAutoPlaying}
                              onProgress={setReadProgress}
                              onComplete={handleAudioComplete}
                          />
                      </div>
                  )}

                  {articles.length > 0 && articles.map((article, index) => {
                      if (index === currentIndex) {
                          return (
                            <SwipeableCard 
                                key={article.id} 
                                data={article} 
                                active={true} 
                                onSwipe={handleSwipe}
                                onSave={handleSave}
                                onShare={handleShare}
                                onAIExplain={handleAIExplain}
                                onLongPress={setPreviewArticleId}
                                onRead={() => handleReadStory(article.id)}
                                programmaticSwipe={swipeTrigger}
                            />
                          );
                      } else if (index === (currentIndex + 1) % articles.length) {
                          return (
                            <SwipeableCard 
                                key={article.id} 
                                data={article} 
                                active={false} 
                                next={true} 
                                onSwipe={handleSwipe}
                            />
                          );
                      }
                      return null;
                  })}
                  
                  {articles.length === 0 && (
                      <div className="text-center text-gray-500 mt-20">
                          <p>No stories found.</p>
                          <button onClick={() => loadStories(filter, true)} className="mt-4 text-blue-600 font-bold">Refresh</button>
                      </div>
                  )}
              </div>
          )}
      </div>
      
      {/* Floating Next Button */}
      {articles.length > 0 && (
          <div className="absolute bottom-28 right-6 z-30">
              <button 
                onClick={handleNext}
                className="w-14 h-14 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-2 border-white/20 dark:border-black/10"
                title="Next Story"
              >
                  <ArrowRight size={28} strokeWidth={3} />
              </button>
          </div>
      )}

      {/* Visual Audio Progress Indicator (If Playing) */}
      {isAutoPlaying && (
          <div className="absolute bottom-24 left-6 z-30 flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-full shadow-lg animate-in fade-in slide-in-from-bottom-2">
              <Headphones size={14} className="animate-pulse" />
              <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all duration-300 ease-linear" style={{ width: `${readProgress}%` }}></div>
              </div>
          </div>
      )}
    </div>
  );
};

export default TopStoriesPage;
