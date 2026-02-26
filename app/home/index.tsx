
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
    PlayCircle, 
    Sparkles, 
    Newspaper, 
    Smartphone, 
    MessageSquare, 
    Map, 
    Bookmark, 
    Headphones, 
    Zap,
    Mic,
    MapPin,
    ArrowRight,
    Filter,
    Globe, Cpu, Landmark, Briefcase, Trophy, FlaskConical, Wifi, WifiOff, RefreshCw, Sun, Moon, Coffee, Sunrise
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import NewsCardBasic from '../../components/cards/NewsCardBasic';
import SmartLoader from '../../components/loaders/SmartLoader';
import ContinueReadingCard from '../../components/cards/ContinueReadingCard';
import { useLoading } from '../../context/LoadingContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNetwork } from '../../context/NetworkContext';
import { useHistory } from '../../context/HistoryContext';
import { translations } from '../../utils/translations';
import { fetchNewsFeed } from '../../utils/aiService';

const CATEGORIES = ['All', 'Technology', 'Politics', 'Business', 'Sports', 'Science', 'Health', 'Entertainment'];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoaded, markAsLoaded } = useLoading();
  const { isOnline, lastSyncTime } = useNetwork();
  const { getLastActive, getRecommendations, getTimeContext } = useHistory();
  
  const [isLoading, setIsLoading] = useState(!isLoaded('home'));
  const [articles, setArticles] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  
  const { appLanguage, contentLanguage } = useLanguage();
  const t = translations[appLanguage];

  const timeContext = getTimeContext();
  const lastActive = getLastActive();
  const recommendations = getRecommendations();

  // Initial Load
  const loadContent = async (showLoader = false) => {
        if (showLoader) setIsLoading(true);
        const langName = contentLanguage === 'hi' ? 'Hindi' : 'English';
        
        const initialNews = await fetchNewsFeed(1, { 
          category: activeCategory === 'All' ? 'All' : activeCategory, 
          sort: 'Latest', 
          language: langName 
        });
        
        setArticles(initialNews);

        if (showLoader) {
            setTimeout(() => {
                setIsLoading(false);
                markAsLoaded('home');
            }, 800);
        }
  };

  useEffect(() => {
    loadContent(!isLoaded('home'));
  }, [contentLanguage, activeCategory]); 

  const loadMore = async () => {
      if (isFetchingMore || !hasMore) return;
      setIsFetchingMore(true);
      try {
          const nextPage = page + 1;
          const langName = contentLanguage === 'hi' ? 'Hindi' : 'English';
          const moreNews = await fetchNewsFeed(nextPage, { 
            category: activeCategory === 'All' ? 'All' : activeCategory, 
            sort: 'Latest', 
            language: langName 
          });
          
          if (moreNews.length === 0) {
              setHasMore(false);
          } else {
              setArticles(prev => [...prev, ...moreNews]);
              setPage(nextPage);
          }
      } catch (error) {
          console.error("Failed to load more news:", error);
      } finally {
          setIsFetchingMore(false);
      }
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setPage(1);
    setHasMore(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
      return <SmartLoader type="home" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1c] pb-24 transition-colors duration-300">
      
      {/* Header Section */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 pt-4 pb-2 px-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                    {timeContext.icon === 'sun' ? <Sun className="text-yellow-500" /> : 
                     timeContext.icon === 'sunrise' ? <Sunrise className="text-orange-500" /> : 
                     timeContext.icon === 'coffee' ? <Coffee className="text-amber-600" /> : 
                     <Moon className="text-indigo-400" />}
                    {t.home}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{timeContext.message}</p>
            </div>
            
            {!isOnline && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-xs font-bold border border-red-100 dark:border-red-900/30">
                    <WifiOff size={12} /> Offline Mode
                </div>
            )}
        </div>

        {/* Category Filter Bar */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 -mx-4 px-4">
            {CATEGORIES.map(category => (
                <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                        activeCategory === category 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105' 
                        : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                    }`}
                >
                    {category}
                </button>
            ))}
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto">
          
          {/* Continue Reading Section */}
          {lastActive && lastActive.progress > 5 && lastActive.progress < 95 && activeCategory === 'All' && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mb-8"
              >
                  <ContinueReadingCard item={lastActive} />
              </motion.div>
          )}

          {/* News Grid */}
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
              <AnimatePresence mode="popLayout">
                  {articles.map((article, index) => {
                      // Determine context label for recommendations
                      let contextLabel;
                      if (activeCategory === 'All' && index === 2 && recommendations) {
                          contextLabel = `Because you read about ${recommendations.topic}`;
                      }

                      return (
                          <motion.div
                              key={article.id || index}
                              layout
                              initial={{ opacity: 0, scale: 0.9, y: 30 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                              transition={{ 
                                  duration: 0.4, 
                                  ease: [0.23, 1, 0.32, 1],
                                  delay: index < 8 ? index * 0.05 : 0 // Only stagger initial load
                              }}
                              whileHover={{ y: -5, transition: { duration: 0.2 } }}
                              className="h-full"
                          >
                              <NewsCardBasic
                                  id={article.id}
                                  title={article.title}
                                  description={article.description}
                                  imageUrl={article.imageUrl}
                                  source={article.source}
                                  timeAgo={article.timeAgo}
                                  category={article.category}
                                  contextLabel={contextLabel}
                                  onClick={(id) => navigate(`/news/${id}`)}
                                  onAIExplain={(id) => navigate(`/news/${id}?explain=true`)}
                              />
                          </motion.div>
                      );
                  })}
              </AnimatePresence>
          </motion.div>

          {/* Load More / Loading State */}
          {articles.length > 0 && hasMore && (
              <div className="mt-12 flex justify-center">
                  <button
                      onClick={loadMore}
                      disabled={isFetchingMore}
                      className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                      {isFetchingMore ? (
                          <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Loading more...
                          </>
                      ) : (
                          <>
                              <ArrowRight className="w-4 h-4" />
                              Load More Stories
                          </>
                      )}
                  </button>
              </div>
          )}

          {!hasMore && articles.length > 0 && (
              <div className="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm font-medium flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  You've caught up on all the latest news.
              </div>
          )}
          
          {articles.length === 0 && !isLoading && (
              <div className="mt-20 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                  <Newspaper className="w-16 h-16 opacity-20 mb-4" />
                  <p className="text-lg font-medium">No articles found.</p>
                  <p className="text-sm mt-1">Try selecting a different category.</p>
              </div>
          )}
      </main>
    </div>
  );
};

export default HomePage;
