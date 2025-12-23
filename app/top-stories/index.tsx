
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import SwipeableCard from '../../components/cards/SwipeableCard';
import AIQuickPreviewSheet from '../../components/cards/AIQuickPreviewSheet';
import SmartLoader from '../../components/loaders/SmartLoader';
import Toast, { ToastType } from '../../components/ui/Toast';
import { fetchNewsFeed } from '../../utils/aiService';

const TopStoriesPage = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState('All');
  const [toast, setToast] = useState<{show: boolean, msg: string, type: ToastType}>({ show: false, msg: '', type: 'success' });
  
  // AI Preview State
  const [previewArticleId, setPreviewArticleId] = useState<string | null>(null);
  
  // Throttle wheel events
  const lastWheelTime = useRef(0);

  const loadStories = async (selectedFilter = 'All') => {
      setLoading(true);
      // Fetch data with specific sort for Top Headlines
      const news = await fetchNewsFeed(1, { category: selectedFilter, sort: 'Top' });
      setArticles(news);
      setLoading(false);
      setCurrentIndex(0);
  };

  useEffect(() => {
      loadStories();
  }, []);

  const handleFilterChange = (newFilter: string) => {
      setFilter(newFilter);
      loadStories(newFilter);
  };

  // Advances the stack
  const handleSwipe = (direction: 'left' | 'right') => {
      setTimeout(() => {
          setCurrentIndex(prev => (prev + 1) % articles.length);
      }, 200); 
  };

  // Mouse wheel support for desktop
  const handleWheel = (e: React.WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime.current < 500) return; // Throttle 500ms

      if (e.deltaY > 50) {
          // Scroll Down -> Next Story
          lastWheelTime.current = now;
          handleSwipe('left');
      }
  };

  // --- Interaction Handlers ---

  const handleSave = (id: string) => {
      const article = articles.find(a => a.id === id);
      if (!article) return;

      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      const exists = bookmarks.some((b: any) => b.id === id);
      
      if (!exists) {
          const newBookmark = { 
              id: article.id, 
              title: article.title, 
              source: article.source, 
              category: article.category,
              imageUrl: article.imageUrl,
              savedAt: new Date().toLocaleDateString()
          };
          localStorage.setItem('bookmarks', JSON.stringify([newBookmark, ...bookmarks]));
          setToast({ show: true, msg: 'Story Saved 🔖', type: 'success' });
      } else {
          setToast({ show: true, msg: 'Already Saved', type: 'info' });
      }
  };

  const handleShare = async (id: string) => {
      const article = articles.find(a => a.id === id);
      if (!article) return;

      if (navigator.share) {
          try {
              await navigator.share({
                  title: article.title,
                  text: article.description,
                  url: window.location.href
              });
          } catch (e) {}
      } else {
          setToast({ show: true, msg: 'Link copied to clipboard 🔗', type: 'success' });
          navigator.clipboard.writeText(window.location.href);
      }
  };

  const handleAIExplain = (id: string) => {
      const article = articles.find(a => a.id === id);
      if (article) {
          // Navigate to Chatbot with auto-inject context
          navigate(`/ai-chat?context=article&headline=${encodeURIComponent(article.title)}&id=${id}`);
      }
  };

  const handleLongPress = (id: string) => {
      setPreviewArticleId(id);
  };

  const currentArticleData = articles.find(a => a.id === previewArticleId);

  return (
    <div className="h-full bg-gray-50 dark:bg-black flex flex-col relative overflow-hidden">
      
      {toast.show && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-4 w-auto">
              <Toast 
                  type={toast.type} 
                  message={toast.msg} 
                  onClose={() => setToast(prev => ({ ...prev, show: false }))} 
              />
          </div>
      )}

      {/* Long Press Preview Sheet */}
      <AIQuickPreviewSheet 
        isOpen={!!previewArticleId}
        onClose={() => setPreviewArticleId(null)}
        article={currentArticleData}
        onFullAnalysis={() => {
            if (previewArticleId) {
                setPreviewArticleId(null);
                handleAIExplain(previewArticleId);
            }
        }}
      />

      <div className="absolute top-0 left-0 w-full z-20">
          <PageHeader title="Top Headlines" showBack />
          {/* Filter Bar */}
          <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
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

      <div 
        className="flex-1 relative w-full h-full flex items-center justify-center p-4 pt-24 pb-24 overflow-hidden focus:outline-none"
        onWheel={handleWheel}
      >
          {loading ? (
              <SmartLoader type="headlines" />
          ) : (
              <div className="relative w-full max-w-md h-full max-h-[650px] flex items-center justify-center">
                  {articles.length > 0 && articles.map((article, index) => {
                      // Logic for Stack (Nest) Animation
                      // Only render current and next one for performance
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
                                onLongPress={handleLongPress}
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
                          <p>No stories found. Try refreshing.</p>
                          <button onClick={() => loadStories()} className="mt-4 text-blue-600 font-bold">Refresh</button>
                      </div>
                  )}
              </div>
          )}
      </div>
      
      <div className="absolute bottom-20 w-full flex justify-center gap-2 z-10 pointer-events-none">
          <span className="text-[10px] text-gray-400 bg-white/80 dark:bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm border border-gray-200 dark:border-gray-800 animate-pulse">
              Swipe Left to Save • Right to Share
          </span>
      </div>
    </div>
  );
};

export default TopStoriesPage;
