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
    Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NewsCardBasic from '../../components/cards/NewsCardBasic';
import HighlightReadingMode from '../../components/HighlightReadingMode';
import SmartLoader from '../../components/loaders/SmartLoader';
import { useLoading } from '../../context/LoadingContext';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../utils/translations';
import { fetchNewsFeed } from '../../utils/aiService';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoaded, markAsLoaded } = useLoading();
  const [isLoading, setIsLoading] = useState(!isLoaded('home'));
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  
  // Filters
  const [activeFilter, setActiveFilter] = useState('Latest');
  const FILTERS = ['Latest', 'Popular', 'Positive', 'Tech', 'India', 'World'];

  const { appLanguage } = useLanguage();
  const t = translations[appLanguage];
  const observer = useRef<IntersectionObserver | null>(null);

  const FEATURES = useMemo(() => [
    { label: t.ai_analysis, icon: Sparkles, color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', path: '/ai-chat' },
    { label: t.headlines, icon: Zap, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', path: '/top-stories' },
    { label: t.reels, icon: Smartphone, color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', path: '/reel' },
    { label: t.chatbot, icon: MessageSquare, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', path: '/ai-chat' },
    { label: t.newspaper, icon: Newspaper, color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', path: '/newspaper' },
    { label: t.map_news, icon: Map, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', path: '/map' },
    { label: t.saved, icon: Bookmark, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', path: '/bookmarks' },
    { label: t.read_mode, icon: Headphones, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', path: '/' }, 
  ], [t]);

  // Initial Load
  useEffect(() => {
    const initLoad = async () => {
        const initialNews = await fetchNewsFeed(1, { category: 'All', sort: 'Latest' });
        setArticles(initialNews);
        if (isLoading) {
            setTimeout(() => {
                setIsLoading(false);
                markAsLoaded('home');
            }, 1500);
        }
    };
    initLoad();
  }, []);

  // Filter Change
  const handleFilterChange = async (filter: string) => {
      setActiveFilter(filter);
      setIsLoading(true);
      setPage(1);
      setArticles([]);
      const news = await fetchNewsFeed(1, { category: 'All', filter: filter, state: filter === 'India' ? 'India' : 'Global' });
      setArticles(news);
      setIsLoading(false);
  };

  // Infinite Scroll Fetch
  const loadMore = async () => {
      if (isFetchingMore || !hasMore) return;
      setIsFetchingMore(true);
      const nextPage = page + 1;
      const news = await fetchNewsFeed(nextPage, { category: 'All', filter: activeFilter });
      
      if (news.length === 0) setHasMore(false);
      else {
          setArticles(prev => [...prev, ...news]);
          setPage(nextPage);
      }
      setIsFetchingMore(false);
  };

  const lastElementRef = useCallback((node: HTMLDivElement) => {
      if (isLoading || isFetchingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting && hasMore) {
              loadMore();
          }
      });
      if (node) observer.current.observe(node);
  }, [isLoading, hasMore, isFetchingMore]);

  const handleCardClick = (id: string) => {
      navigate(`/news/${id}`);
  };

  const handleAIExplain = (id: string) => {
      const article = articles.find(n => n.id === id);
      if (article) {
          navigate(`/ai-chat?context=article&headline=${encodeURIComponent(article.title)}&id=${id}`);
      }
  };

  if (isLoading) {
      return <SmartLoader type="home" />;
  }

  return (
    <div className="h-full overflow-y-auto pb-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Hero Section */}
      <div className="p-4 pb-2">
         {isReadingMode && articles.length > 0 ? (
             <HighlightReadingMode 
                text={articles[0].description} 
                onComplete={() => setIsReadingMode(false)}
             />
         ) : (
            <div className="relative w-full rounded-2xl overflow-hidden shadow-lg h-48 bg-gradient-to-br from-blue-600 to-indigo-900 text-white flex flex-col justify-between p-5">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 animate-pulse-slow"></div>

                <div className="relative z-10">
                    <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg uppercase tracking-wider">
                        {t.daily_briefing}
                    </span>
                    <h1 className="text-2xl font-black mt-3 leading-tight drop-shadow-md">
                        {articles.length > 0 ? articles[0].title : t.todays_highlights}
                    </h1>
                </div>

                <div className="relative z-10 flex items-center justify-between">
                    <p className="text-sm text-blue-100 font-medium">{articles.length} Updates • Live</p>
                    <button 
                        onClick={() => setIsReadingMode(true)}
                        className="flex items-center gap-2 bg-white text-blue-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-md active:scale-95 transition-transform"
                    >
                        <Mic size={14} /> {t.speak_news}
                    </button>
                </div>
            </div>
         )}
      </div>

      {/* Feature Grid */}
      <div className="px-4 py-4">
          <div className="grid grid-cols-4 gap-y-4 gap-x-2">
             {FEATURES.map((feat, idx) => {
                 const Icon = feat.icon;
                 return (
                     <div key={idx} className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => navigate(feat.path)}>
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-active:scale-90 ${feat.color}`}>
                             <Icon size={22} />
                         </div>
                         <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 text-center leading-tight w-full truncate px-1">
                             {feat.label}
                         </span>
                     </div>
                 )
             })}
          </div>
      </div>

      {/* Map Entry Point */}
      <div className="px-4 mb-4">
          <div 
            onClick={() => navigate('/map')}
            className="w-full h-24 bg-gray-800 rounded-xl relative overflow-hidden flex items-center justify-between p-5 cursor-pointer shadow-sm group"
          >
              <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center invert filter"></div>
              <div className="relative z-10 text-white">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                      <MapPin size={18} className="text-red-500" /> {t.news_around_you}
                  </h3>
                  <p className="text-xs text-gray-300">{t.explore_map}</p>
              </div>
              <div className="relative z-10 bg-white/20 backdrop-blur-sm p-2 rounded-full group-hover:scale-110 transition-transform">
                  <ArrowRight size={20} className="text-white" />
              </div>
          </div>
      </div>

      {/* News Feed with Filters */}
      <div className="px-4 mt-2">
        <div className="flex items-center justify-between mb-3">
             <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <PlayCircle size={18} className="text-red-500 fill-red-500" />
                {t.latest_feed}
             </h2>
             <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                 <Filter size={16} className="text-gray-500" />
             </div>
        </div>

        {/* Filter Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {FILTERS.map(filter => (
                <button
                    key={filter}
                    onClick={() => handleFilterChange(filter)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeFilter === filter ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
                >
                    {filter}
                </button>
            ))}
        </div>

        <div className="space-y-4">
            {articles.map((news, index) => {
                if (articles.length === index + 1) {
                    return (
                        <div ref={lastElementRef} key={news.id + index}>
                            <NewsCardBasic
                                {...news}
                                onClick={handleCardClick}
                                onSave={() => console.log('Saved', news.id)}
                                onShare={() => console.log('Shared', news.id)}
                                onAIExplain={handleAIExplain}
                            />
                        </div>
                    );
                }
                return (
                    <NewsCardBasic
                        key={news.id + index}
                        {...news}
                        onClick={handleCardClick}
                        onSave={() => console.log('Saved', news.id)}
                        onShare={() => console.log('Shared', news.id)}
                        onAIExplain={handleAIExplain}
                    />
                );
            })}
            
            {/* Infinite Scroll Loader */}
            {isFetchingMore && (
                <div className="py-6 flex justify-center opacity-70">
                    <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-200"></span>
                    </div>
                </div>
            )}
            
            {!hasMore && (
                <p className="text-center text-xs text-gray-400 py-4">No more stories to load.</p>
            )}
        </div>
      </div>

    </div>
  );
};

export default HomePage;
