import React, { useState, useEffect, useRef } from 'react';
import PageHeader from '../../components/PageHeader';
import SwipeableCard from '../../components/cards/SwipeableCard';
import SmartLoader from '../../components/loaders/SmartLoader';
import { RefreshCw, Filter } from 'lucide-react';
import { fetchNewsFeed } from '../../utils/aiService';
import { useNavigate } from 'react-router-dom';
import Toast, { ToastType } from '../../components/ui/Toast';

const TopStoriesPage = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState('All');
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: ToastType }>({ show: false, msg: '', type: 'success' });
  
  // Throttle wheel events
  const lastWheelTime = useRef(0);

  const loadStories = async (selectedFilter = 'All') => {
      setLoading(true);
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

  const handleSwipe = (direction: 'left' | 'right') => {
      setTimeout(() => {
          setCurrentIndex(prev => (prev + 1) % articles.length);
      }, 200); 
  };

  const handleWheel = (e: React.WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime.current < 500) return; // Throttle 500ms

      if (e.deltaY > 50) {
          // Scroll Down -> Next Story (Simulate Swipe Left/Next)
          lastWheelTime.current = now;
          handleSwipe('left');
      }
  };

  const handleAIExplain = (id: string) => {
      const article = articles.find(a => a.id === id);
      if (article) {
          navigate(`/ai-chat?context=article&headline=${encodeURIComponent(article.title)}&id=${id}`);
      }
  };

  const handleSave = (id: string) => {
      setToast({ show: true, msg: 'Saved to bookmarks', type: 'success' });
  };

  const handleShare = (id: string) => {
      setToast({ show: true, msg: 'Shared link copied', type: 'info' });
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-black flex flex-col relative overflow-hidden">
      
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
              <div className="relative w-full max-w-md aspect-[3/5] md:aspect-[3/4]">
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
                                onAIExplain={handleAIExplain}
                                onSave={handleSave}
                                onShare={handleShare}
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
                                onAIExplain={handleAIExplain}
                                onSave={handleSave}
                                onShare={handleShare}
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
          <span className="text-[10px] text-gray-400 bg-white/80 dark:bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm border border-gray-200 dark:border-gray-800">
              Swipe or Scroll to explore
          </span>
      </div>
    </div>
  );
};

export default TopStoriesPage;