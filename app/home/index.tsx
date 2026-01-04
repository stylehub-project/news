
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
import NewsCardBasic from '../../components/cards/NewsCardBasic';
import SmartLoader from '../../components/loaders/SmartLoader';
import ContinueReadingCard from '../../components/cards/ContinueReadingCard';
import { useLoading } from '../../context/LoadingContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNetwork } from '../../context/NetworkContext';
import { useHistory } from '../../context/HistoryContext';
import { translations } from '../../utils/translations';
import { fetchNewsFeed } from '../../utils/aiService';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoaded, markAsLoaded } = useLoading();
  const { isOnline, lastSyncTime } = useNetwork();
  const { getLastActive, getRecommendations, getTimeContext } = useHistory();
  
  const [isLoading, setIsLoading] = useState(!isLoaded('home'));
  const [articles, setArticles] = useState<any[]>([]);
  const [recommendedArticles, setRecommendedArticles] = useState<any[]>([]); // 15.8 Recs
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [showSyncBadge, setShowSyncBadge] = useState(false);
  
  // Filters
  const [activeFilter, setActiveFilter] = useState('Latest');
  
  const { appLanguage, contentLanguage } = useLanguage();
  const t = translations[appLanguage];
  const observer = useRef<IntersectionObserver | null>(null);

  // Resume State
  const lastActiveItem = useMemo(() => getLastActive(), [getLastActive]);
  
  // 15.9 Smart Time Context
  const timeContext = useMemo(() => getTimeContext(), [getTimeContext]);
  
  // 15.8 Recommendation State
  const recommendation = useMemo(() => getRecommendations(), [getRecommendations]);

  // Initial Load
  const loadContent = async (reset = false) => {
        if (reset) setIsLoading(true);
        const langName = contentLanguage === 'hi' ? 'Hindi' : 'English';
        
        // Main Feed
        const initialNews = await fetchNewsFeed(1, { category: 'All', sort: 'Latest', language: langName });
        const processedNews = initialNews.map((n: any) => ({
            ...n,
            isCached: !navigator.onLine
        }));
        setArticles(processedNews);

        // Load Recommendations if available
        if (recommendation) {
            const recNews = await fetchNewsFeed(1, { category: recommendation.topic, sort: 'Trending', language: langName });
            setRecommendedArticles(recNews.slice(0, 3)); // Top 3
        }

        if (reset) {
            setTimeout(() => {
                setIsLoading(false);
                markAsLoaded('home');
            }, 800);
        }
  };

  useEffect(() => {
    loadContent(true);
  }, [contentLanguage]); // Reload if language changes or first mount

  // Silent Background Sync Effect (Prompt 13.7)
  useEffect(() => {
      if (isOnline && articles.length > 0) {
          // Check if we need to refresh (simple check against lastSyncTime)
          setShowSyncBadge(true);
          loadContent(false).then(() => {
              setTimeout(() => setShowSyncBadge(false), 2000);
          });
      }
  }, [lastSyncTime, isOnline]);

  // Filter Change
  const handleFilterChange = async (filter: string) => {
      setActiveFilter(filter);
      setIsLoading(true);
      setPage(1);
      setArticles([]);
      const langName = contentLanguage === 'hi' ? 'Hindi' : 'English';
      const news = await fetchNewsFeed(1, { category: filter === 'Latest' ? 'All' : filter, filter: 'Latest', language: langName });
      setArticles(news);
      setIsLoading(false);
  };

  // Infinite Scroll Fetch
  const loadMore = async () => {
      if (isFetchingMore || !hasMore) return;
      setIsFetchingMore(true);
      const nextPage = page + 1;
      const langName = contentLanguage === 'hi' ? 'Hindi' : 'English';
      const news = await fetchNewsFeed(nextPage, { category: activeFilter === 'Latest' ? 'All' : activeFilter, filter: 'Latest', language: langName });
      
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

  if (isLoading) {
      return <SmartLoader type="home" />;
  }

  const CATEGORY_CHIPS = [
      { id: 'Latest', label: 'Latest', icon: Zap, color: 'text-yellow-500' },
      { id: 'World', label: 'World', icon: Globe, color: 'text-blue-500' },
      { id: 'Tech', label: 'Tech', icon: Cpu, color: 'text-purple-500' },
      { id: 'Politics', label: 'Politics', icon: Landmark, color: 'text-red-500' },
      { id: 'Business', label: 'Business', icon: Briefcase, color: 'text-slate-500' },
      { id: 'Sports', label: 'Sports', icon: Trophy, color: 'text-orange-500' },
      { id: 'Science', label: 'Science', icon: FlaskConical, color: 'text-emerald-500' },
  ];

  const getTimeIcon = () => {
      switch(timeContext.icon) {
          case 'sun': return <Sunrise size={16} className="text-orange-400" />;
          case 'coffee': return <Coffee size={16} className="text-brown-500" />;
          case 'moon': return <Moon size={16} className="text-indigo-400" />;
          default: return <Sparkles size={16} className="text-yellow-400" />;
      }
  };

  return (
    <div className="h-full overflow-y-auto pb-24 bg-gray-50 dark:bg-black transition-colors duration-300 relative">
      
      {/* 13.7 Smart Refresh Badge */}
      {showSyncBadge && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2 shadow-lg animate-in slide-in-from-top-4 fade-in">
              <RefreshCw size={12} className="animate-spin" /> Updating Feed...
          </div>
      )}

      {/* 15.9 Time Aware Greeting Header */}
      <div className="px-6 pt-4 pb-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
              {getTimeIcon()}
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{timeContext.message}</span>
          </div>
          {timeContext.mode === 'audio' && (
              <button 
                onClick={() => navigate('/ai-chat?mode=generator')}
                className="flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full text-[10px] font-bold"
              >
                  <Headphones size={10} /> Audio Mode
              </button>
          )}
      </div>

      {/* Hero Section */}
      <div className="p-4 pb-2 pt-0">
        <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl h-56 bg-black text-white flex flex-col justify-between p-6">
            
            {/* Offline Visual Override */}
            {!isOnline && (
                <div className="absolute inset-0 bg-gray-800 z-10 opacity-90 flex flex-col items-center justify-center text-center p-6">
                    <WifiOff size={32} className="text-gray-400 mb-2" />
                    <h3 className="text-lg font-bold">Offline Daily Brief</h3>
                    <p className="text-xs text-gray-400">Reading from device storage. Images may be low quality.</p>
                </div>
            )}

            {/* Background Image/Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-black z-0"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0"></div>
            
            {/* Content */}
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold bg-white/10 backdrop-blur-md px-2 py-1 rounded border border-white/10 uppercase tracking-widest text-indigo-300">
                        {t.daily_briefing}
                    </span>
                    {isOnline && <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>}
                </div>
                <h1 className="text-2xl font-black leading-tight drop-shadow-lg line-clamp-3">
                    {articles.length > 0 ? articles[0].title : t.todays_highlights}
                </h1>
            </div>

            <div className="relative z-10 flex items-center justify-between mt-auto pt-4">
                <p className="text-xs text-gray-400 font-medium">{articles.length} Stories Available</p>
                <button 
                    onClick={() => {
                        if (articles.length > 0) {
                            navigate(`/ai-chat?context=daily_brief&headline=${encodeURIComponent(articles[0].title)}&autoSpeak=true`);
                        } else {
                            navigate('/ai-chat?mode=generator');
                        }
                    }}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-xs font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform"
                >
                    <Mic size={14} /> {t.speak_news}
                </button>
            </div>
        </div>
      </div>

      {/* 15.2 Continue Reading Card */}
      {lastActiveItem && <ContinueReadingCard item={lastActiveItem} />}

      {/* Feature Grid - Always visible for offline access to Saved items */}
      <div className="px-4 py-4">
          <div className="grid grid-cols-4 gap-y-4 gap-x-2">
             {[
                { label: t.ai_analysis, icon: Sparkles, color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', path: '/ai-chat' },
                { label: t.headlines, icon: Zap, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', path: '/top-stories' },
                { label: t.reels, icon: Smartphone, color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', path: '/reel' },
                { label: t.chatbot, icon: MessageSquare, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', path: '/ai-chat' },
                { label: t.newspaper, icon: Newspaper, color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', path: '/newspaper' },
                { label: t.map_news, icon: Map, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', path: '/map' },
                { label: t.saved, icon: Bookmark, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', path: '/bookmarks' },
                { label: t.read_mode, icon: Headphones, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', path: '/ai-chat?mode=generator' }, 
             ].map((feat, idx) => {
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

      {/* Map Entry Point - Visual change if offline */}
      <div className="px-4 mb-6">
          <div 
            onClick={() => navigate('/map')}
            className={`w-full h-24 rounded-2xl relative overflow-hidden flex items-center justify-center p-5 cursor-pointer shadow-sm group border border-gray-800 ${isOnline ? 'bg-gray-900' : 'bg-gray-800 grayscale'}`}
          >
              <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center invert filter"></div>
              <div className="relative z-10 text-white w-full flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <MapPin size={18} className={isOnline ? "text-emerald-400" : "text-gray-400"} /> 
                        {isOnline ? t.news_around_you : "Offline Maps"}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{isOnline ? t.explore_map : "View cached locations"}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm p-2 rounded-full group-hover:scale-110 transition-transform">
                      <ArrowRight size={20} className="text-white" />
                  </div>
              </div>
          </div>
      </div>

      {/* 15.8 Context Aware Recommendations Section */}
      {recommendation && recommendedArticles.length > 0 && (
          <div className="mb-6 animate-in slide-in-from-right-8 duration-700">
              <div className="px-4 mb-2 flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-500" />
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white">Because you read {recommendation.topic}</h3>
              </div>
              <div className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide">
                  {recommendedArticles.map((article) => (
                      <div key={article.id} className="min-w-[240px] w-[240px] snap-center">
                          <NewsCardBasic 
                              {...article} 
                              onClick={handleCardClick}
                              contextLabel={recommendation.label} // Pass context label
                          />
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* News Feed */}
      <div className="px-4 mt-2">
        <div className="flex items-center justify-between mb-3">
             <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <PlayCircle size={18} className={isOnline ? "text-red-500 fill-red-500" : "text-gray-400"} />
                {t.latest_feed}
             </h2>
             <div onClick={() => navigate('/categories')} className="text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer">
                 View All
             </div>
        </div>

        {/* Enhanced Category Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
            {CATEGORY_CHIPS.map(cat => {
                const Icon = cat.icon;
                const isActive = activeFilter === cat.id;
                return (
                    <button
                        key={cat.id}
                        onClick={() => handleFilterChange(cat.id)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                            isActive 
                            ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-lg' 
                            : 'bg-white text-gray-600 border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                        }`}
                    >
                        <Icon size={14} className={isActive ? 'text-current' : cat.color} />
                        {cat.label}
                    </button>
                )
            })}
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
                                onAIExplain={() => navigate(`/ai-chat?context=article&headline=${encodeURIComponent(news.title)}`)}
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
                        onAIExplain={() => navigate(`/ai-chat?context=article&headline=${encodeURIComponent(news.title)}`)}
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
