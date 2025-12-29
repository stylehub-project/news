
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Sparkles, Search, Filter, RefreshCw, 
    Smartphone, Zap, ChevronDown, Clock, Globe,
    AlertTriangle, PlayCircle
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import PageHeader from '../../components/PageHeader';
import NewsCardBasic from '../../components/cards/NewsCardBasic';
import NewsSkeleton from '../../components/skeletons/NewsSkeleton';
import Button from '../../components/ui/Button';
import { fetchNewsFeed } from '../../utils/aiService';
import { useLanguage } from '../../context/LanguageContext';

// --- AI Insight Component ---
const AICategoryInsight = ({ category }: { category: string }) => {
    const [insight, setInsight] = useState<{summary: string, keywords: string[]} | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const generateInsight = async () => {
            setLoading(true);
            try {
                // Simulate AI delay for UX or call API
                // const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                // In a real scenario, we'd make the API call here. 
                // For this demo, we simulate a "Live" generation to save tokens on mount/unmount spam.
                await new Promise(r => setTimeout(r, 1500));
                
                setInsight({
                    summary: `${category} is seeing a massive shift in focus today. Major discussions revolve around emerging regulations and market volatility driven by recent global events.`,
                    keywords: ['Regulation', 'Market Shift', 'Innovation', 'Global Impact']
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        generateInsight();
    }, [category]);

    if (loading) {
        return (
            <div className="mx-4 mt-4 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900/50 shadow-sm animate-pulse">
                <div className="flex gap-3 items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50"></div>
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 w-5/6 bg-gray-100 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-4 mt-4 p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900 border border-indigo-100 dark:border-indigo-900/50 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="absolute top-0 right-0 p-3 opacity-10">
                <Sparkles size={64} className="text-indigo-600" />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-500/30">
                            <Sparkles size={14} className="animate-spin-slow" />
                        </div>
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">AI Trend Intel</span>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full border border-green-100 dark:border-green-900/30">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Live
                    </span>
                </div>

                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 leading-tight">
                    What's happening in <span className="text-indigo-600 dark:text-indigo-400">{category}</span> today?
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed mb-4">
                    {insight?.summary}
                </p>

                <div className="flex flex-wrap gap-2">
                    {insight?.keywords.map((kw, i) => (
                        <span key={i} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-800 px-2.5 py-1 rounded-full shadow-sm">
                            #{kw}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Control Bar Component ---
const CategoryControlBar = ({ 
    onSearch, 
    onFilterChange, 
    activeFilter 
}: { 
    onSearch: (q: string) => void, 
    onFilterChange: (f: string) => void,
    activeFilter: string
}) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <div className="sticky top-[57px] z-30 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-2 flex items-center gap-3 transition-colors duration-300">
            <div className={`flex-1 transition-all duration-300 ${isSearchOpen ? 'grow' : 'grow-0'}`}>
                {isSearchOpen ? (
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 animate-in fade-in slide-in-from-left-2">
                        <Search size={14} className="text-gray-400 mr-2" />
                        <input 
                            autoFocus
                            placeholder="Search in category..." 
                            className="bg-transparent border-none outline-none text-xs w-full font-medium dark:text-white"
                            onChange={(e) => onSearch(e.target.value)}
                            onBlur={(e) => !e.target.value && setIsSearchOpen(false)}
                        />
                    </div>
                ) : (
                    <button 
                        onClick={() => setIsSearchOpen(true)}
                        className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        <Search size={16} />
                    </button>
                )}
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 flex-1 justify-end">
                {[
                    { id: 'All', icon: null },
                    { id: 'Time', icon: Clock },
                    { id: 'Impact', icon: AlertTriangle },
                    { id: 'Region', icon: Globe }
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => onFilterChange(f.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all whitespace-nowrap ${
                            activeFilter === f.id 
                            ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-md' 
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        {f.icon && <f.icon size={10} />}
                        {f.id}
                    </button>
                ))}
            </div>
        </div>
    );
};

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { contentLanguage } = useLanguage();
  
  // State
  const [articles, setArticles] = useState<any[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);
  const [loadingState, setLoadingState] = useState<'init' | 'streaming' | 'complete'>('init');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Ref for intersection observer
  const observer = useRef<IntersectionObserver | null>(null);

  // Formatting Title
  const title = id ? id.charAt(0).toUpperCase() + id.slice(1) : 'Category';

  // --- Smart Loading Logic ---
  useEffect(() => {
      const loadSmartFeed = async () => {
          setLoadingState('init');
          setArticles([]);
          const langName = contentLanguage === 'hi' ? 'Hindi' : 'English';

          // 1. Load Top Stories (High Priority)
          const topStories = await fetchNewsFeed(1, { category: title, sort: 'Top', language: langName });
          const taggedTop = topStories.map((a: any) => ({ ...a, feedType: 'Top Story', impact: 'High' }));
          setArticles(prev => [...prev, ...taggedTop]);
          
          setLoadingState('streaming');

          // 2. Load Trending (Medium Priority) - slightly delayed to simulate streaming
          setTimeout(async () => {
              const trendingStories = await fetchNewsFeed(1, { category: title, sort: 'Trending', language: langName });
              // Dedupe
              const existingIds = new Set(taggedTop.map((a: any) => a.id));
              const uniqueTrending = trendingStories
                  .filter((a: any) => !existingIds.has(a.id))
                  .map((a: any) => ({ ...a, feedType: 'Trending', impact: 'Medium' }));
              
              setArticles(prev => [...prev, ...uniqueTrending]);
              setLoadingState('complete');
          }, 800);
      };

      loadSmartFeed();
  }, [title, contentLanguage]);

  // --- Filtering Logic ---
  useEffect(() => {
      let result = [...articles];

      // Search
      if (searchQuery) {
          const q = searchQuery.toLowerCase();
          result = result.filter(a => 
              a.title.toLowerCase().includes(q) || 
              a.description.toLowerCase().includes(q)
          );
      }

      // Filters (Simulated logic as real metadata might be missing in mock)
      if (activeFilter === 'Impact') {
          result = result.sort((a, b) => (a.impact === 'High' ? -1 : 1));
      } else if (activeFilter === 'Time') {
          // Assume already sorted by time roughly, but could resort if timestamps existed
      } else if (activeFilter === 'Region') {
          // Could filter by region keyword if available
      }

      setFilteredArticles(result);
  }, [articles, searchQuery, activeFilter]);

  // --- Infinite Scroll ---
  const loadMore = async () => {
      if (loadingState !== 'complete') return;
      const langName = contentLanguage === 'hi' ? 'Hindi' : 'English';
      const nextPage = page + 1;
      const moreNews = await fetchNewsFeed(nextPage, { category: title, sort: 'Latest', language: langName });
      
      const newItems = moreNews.map((a: any) => ({ ...a, feedType: 'Latest' }));
      
      setArticles(prev => {
          const ids = new Set(prev.map(p => p.id));
          return [...prev, ...newItems.filter((n: any) => !ids.has(n.id))];
      });
      setPage(nextPage);
  };

  const lastElementRef = useCallback((node: HTMLDivElement) => {
      if (loadingState !== 'complete') return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting) {
              loadMore();
          }
      });
      if (node) observer.current.observe(node);
  }, [loadingState]);

  // --- Handlers ---
  const handleCardClick = (newsId: string) => {
      navigate(`/news/${newsId}`);
  };

  const handleAIExplain = (newsId: string) => {
      const article = articles.find(a => a.id === newsId);
      if (article) {
          navigate(`/ai-chat?context=article&headline=${encodeURIComponent(article.title)}&id=${newsId}`);
      }
  };

  const handleWatchReel = (newsId: string) => {
      // In a real app, pass the ID to reel page to start there
      // For now, just open reels
      navigate('/reel');
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-black pb-20 transition-colors duration-300">
      <PageHeader title={title} showBack />
      
      {/* 11.5 AI Insights */}
      <AICategoryInsight category={title} />

      {/* 11.6 Search & Filters */}
      <CategoryControlBar 
        onSearch={setSearchQuery} 
        onFilterChange={setActiveFilter}
        activeFilter={activeFilter}
      />
      
      <div className="p-4 space-y-5">
          {/* Section Label if showing mixed types */}
          {activeFilter === 'All' && !searchQuery && articles.length > 0 && (
              <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Top Stories</span>
              </div>
          )}

          {/* Feed */}
          {loadingState === 'init' ? (
              <>
                <NewsSkeleton />
                <NewsSkeleton />
              </>
          ) : (
              filteredArticles.map((news, index) => {
                  const isLast = index === filteredArticles.length - 1;
                  return (
                      <div key={news.id + index} ref={isLast ? lastElementRef : null}>
                          {/* Inject a "Trending" header mid-stream if we switch feed types */}
                          {index > 0 && news.feedType !== filteredArticles[index-1].feedType && !searchQuery && (
                              <div className="flex items-center gap-2 mt-6 mb-2">
                                  {news.feedType === 'Trending' ? <TrendingUpIcon /> : <ClockIcon />}
                                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{news.feedType}</span>
                              </div>
                          )}

                          <div className="relative group">
                              <NewsCardBasic 
                                {...news} 
                                onClick={handleCardClick}
                                onAIExplain={handleAIExplain}
                              />
                              {/* 11.4 Reel View Option - Floating Action on Card */}
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleWatchReel(news.id); }}
                                className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pink-600 hover:scale-110 z-10"
                                title="Watch as Reel"
                              >
                                  <Smartphone size={16} />
                              </button>
                          </div>
                      </div>
                  );
              })
          )}

          {/* Empty State */}
          {loadingState === 'complete' && filteredArticles.length === 0 && (
              <div className="text-center py-20 opacity-50">
                  <Search size={48} className="mx-auto mb-2" />
                  <p>No results found for "{searchQuery}"</p>
              </div>
          )}

          {/* Infinite Scroll Loader */}
          {loadingState === 'complete' && filteredArticles.length > 0 && (
              <div className="py-4 flex justify-center opacity-50">
                  <RefreshCw className="animate-spin text-gray-400" size={20} />
              </div>
          )}
      </div>
    </div>
  );
};

// Simple Icons
const TrendingUpIcon = () => <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const ClockIcon = () => <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export default CategoryPage;
