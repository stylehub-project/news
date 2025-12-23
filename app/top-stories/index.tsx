import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import SwipeableCard from '../../components/cards/SwipeableCard';
import { RefreshCw } from 'lucide-react';
import { fetchNewsFeed } from '../../utils/aiService';

const TopStoriesPage = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const loadStories = async () => {
      setLoading(true);
      const news = await fetchNewsFeed(1, { category: 'All', sort: 'Top' });
      setArticles(news);
      setLoading(false);
  };

  useEffect(() => {
      loadStories();
  }, []);

  const handleSwipe = (direction: 'left' | 'right') => {
      setTimeout(() => {
          setCurrentIndex(prev => (prev + 1) % articles.length);
      }, 300); // Wait for animation
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full z-20">
          <PageHeader title="Top Headlines" showBack />
      </div>

      <div className="flex-1 relative w-full h-full flex items-center justify-center p-4 pt-16 pb-24 overflow-hidden">
          {loading ? (
              <div className="flex flex-col items-center gap-4 text-gray-400 animate-pulse">
                  <RefreshCw className="animate-spin" size={32} />
                  <span className="text-sm font-bold uppercase tracking-widest">Curating Top Stories...</span>
              </div>
          ) : (
              <div className="relative w-full max-w-md aspect-[3/5] md:aspect-[3/4]">
                  {articles.map((article, index) => {
                      if (index === currentIndex) {
                          return <SwipeableCard key={article.id} data={article} active={true} onSwipe={handleSwipe} />;
                      } else if (index === (currentIndex + 1) % articles.length) {
                          return <SwipeableCard key={article.id} data={article} active={false} next={true} onSwipe={handleSwipe} />;
                      }
                      return null;
                  })}
                  
                  {articles.length === 0 && (
                      <div className="text-center text-gray-500 mt-20">
                          <p>No stories found. Try refreshing.</p>
                          <button onClick={loadStories} className="mt-4 text-blue-600 font-bold">Refresh</button>
                      </div>
                  )}
              </div>
          )}
      </div>
      
      <div className="absolute bottom-20 w-full flex justify-center gap-2 z-10 pointer-events-none">
          <span className="text-[10px] text-gray-400 bg-white/80 dark:bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
              Swipe for next story
          </span>
      </div>
    </div>
  );
};

export default TopStoriesPage;
