
import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Plus, Zap, ArrowRight, ShieldCheck, FileText, ChevronRight, Play, Globe } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import NewsCardBasic from '../../components/cards/NewsCardBasic';
import SmartLoader from '../../components/loaders/SmartLoader';
import FloatingAudioPlayer from '../../components/player/FloatingAudioPlayer';
import SourceUploadSheet from '../../components/upload/SourceUploadSheet';
import HighlightReadingMode from '../../components/HighlightReadingMode';
import { fetchNewsFeed } from '../../utils/aiService';
import { ParsedNews } from '../../utils/sourceParser';
import { useHistory } from '../../context/HistoryContext';

const CATEGORIES = [
    "Top News", "National", "International", "Politics", "Business", 
    "Economy", "Technology", "Science", "Health", "Sports", "Entertainment"
];

const LatestPage: React.FC = () => {
  const { trackProgress } = useHistory();
  
  // State
  const [activeCategory, setActiveCategory] = useState("Top News");
  const [isLoading, setIsLoading] = useState(true);
  const [newsData, setNewsData] = useState<any[]>([]);
  
  // Reading Mode State
  const [activeArticle, setActiveArticle] = useState<any | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
      loadNews(activeCategory);
  }, [activeCategory]);

  const loadNews = async (category: string) => {
      setIsLoading(true);
      // Mapping "Top News" to "All" for API
      const apiCat = category === "Top News" ? "All" : category;
      const data = await fetchNewsFeed(1, { category: apiCat, sort: 'Latest' });
      setNewsData(data);
      setIsLoading(false);
  };

  const handleArticleClick = (article: any) => {
      setActiveArticle(article);
      // Track view
      trackProgress(article.id, 'article', article.title, 10);
  };

  const handlePlayNews = () => {
      setIsPlayerOpen(true);
      setIsPlaying(true);
  };

  const handleUserSource = (parsed: ParsedNews) => {
      // Inject user source into the reader view immediately
      const userArticle = {
          id: `user-${Date.now()}`,
          title: parsed.headline,
          description: parsed.fullText, // Use full text as description for reader logic
          source: "User Upload",
          timeAgo: "Just now",
          category: parsed.category,
          imageUrl: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800",
          isUserSource: true,
          reliability: parsed.reliability
      };
      setActiveArticle(userArticle);
  };

  // --- Render Functions ---

  const renderTopNewsFocus = () => {
      if (!newsData.length) return null;
      const topStory = newsData[0];

      return (
          <div className="mb-8" onClick={() => handleArticleClick(topStory)}>
              <h2 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  Breaking Now
              </h2>
              <div className="group cursor-pointer">
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight mb-3 group-hover:text-blue-600 transition-colors">
                      {topStory.title}
                  </h1>
                  
                  <div className="relative aspect-[2/1] rounded-2xl overflow-hidden mb-4 shadow-lg">
                      <img src={topStory.imageUrl} alt={topStory.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-3 left-3 text-white text-xs font-bold bg-blue-600 px-3 py-1 rounded-full">
                          AI Brief Available
                      </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed mb-3 line-clamp-3">
                      {topStory.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-mono uppercase">
                      <span>{topStory.source}</span>
                      <span>•</span>
                      <span>{topStory.timeAgo}</span>
                  </div>
              </div>
          </div>
      );
  };

  const renderCategoryList = () => {
      // Skip first item if we showed it in Top Focus
      const listItems = activeCategory === 'Top News' ? newsData.slice(1) : newsData;

      return (
          <div className="space-y-4">
              {listItems.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex gap-4 p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                    onClick={() => handleArticleClick(item)}
                  >
                      <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                                  {item.category || activeCategory}
                              </span>
                              <span className="text-[10px] text-gray-400">{item.timeAgo}</span>
                          </div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-2">
                              {item.title}
                          </h3>
                          <div className="flex items-center gap-1 text-[10px] text-gray-500">
                              <Globe size={10} /> {item.source}
                          </div>
                      </div>
                      <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-200">
                          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                  </div>
              ))}
          </div>
      );
  };

  // --- Main View vs Reading View ---

  if (activeArticle) {
      return (
          <div className="h-full bg-white dark:bg-black overflow-y-auto pb-32">
              <div className="sticky top-0 z-40 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
                  <button onClick={() => { setActiveArticle(null); setIsPlayerOpen(false); setIsPlaying(false); }} className="flex items-center gap-1 text-sm font-bold text-gray-600 dark:text-gray-300">
                      <ChevronRight className="rotate-180" size={18} /> Back
                  </button>
                  <button onClick={handlePlayNews} className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg">
                      <Play size={12} fill="currentColor" /> Listen
                  </button>
              </div>

              <div className="p-5 max-w-2xl mx-auto">
                  <span className="text-blue-600 dark:text-blue-400 font-bold tracking-widest text-xs uppercase mb-2 block">
                      {activeArticle.category || "News"}
                  </span>
                  <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                      {activeArticle.title}
                  </h1>

                  {/* AI Metadata for User Sources */}
                  {activeArticle.isUserSource && (
                      <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                          <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase">
                              <ShieldCheck size={14} /> Source Analysis
                          </div>
                          <p className="text-xs text-indigo-900 dark:text-indigo-100">
                              Reliability: <span className="font-bold">{activeArticle.reliability}</span>. This content was extracted from your upload.
                          </p>
                      </div>
                  )}

                  <div className="text-lg leading-loose text-gray-800 dark:text-gray-200 font-serif">
                      <HighlightReadingMode 
                          text={activeArticle.description} // In real app, this would be full content
                          isPlaying={isPlaying}
                          speed={playbackSpeed}
                          theme="light" // Could sync with app theme
                          onComplete={() => setIsPlaying(false)}
                      />
                  </div>
              </div>

              {isPlayerOpen && (
                  <FloatingAudioPlayer 
                      isPlaying={isPlaying}
                      onTogglePlay={() => setIsPlaying(!isPlaying)}
                      onClose={() => { setIsPlayerOpen(false); setIsPlaying(false); }}
                      speed={playbackSpeed}
                      onSpeedChange={setPlaybackSpeed}
                      progress={35} // Mock progress, real would come from reader sync
                      title={activeArticle.title}
                  />
              )}
          </div>
      );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-black overflow-y-auto transition-colors duration-300 pb-20">
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 pb-4 shadow-sm relative z-10">
          <PageHeader 
            title="Today's Briefing" 
            showBack={false}
            action={
                <button 
                    onClick={() => setUploadOpen(true)}
                    className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full text-xs font-bold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 active:scale-95 transition-all"
                >
                    <Plus size={14} /> <span className="hidden xs:inline">Add Source</span>
                </button>
            }
          />
          
          <div className="px-4 mt-2 mb-1 flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
              <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              <span className="flex items-center gap-1"><Globe size={12} /> Global Edition</span>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto px-4 pb-2 pt-2 scrollbar-hide">
              {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                        activeCategory === cat 
                        ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-md transform scale-105' 
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                      {cat}
                  </button>
              ))}
          </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
          {isLoading ? (
              <SmartLoader type="headlines" />
          ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Master View for Top News */}
                  {activeCategory === 'Top News' && renderTopNewsFocus()}
                  
                  {/* Standard List */}
                  {renderCategoryList()}
              </div>
          )}
      </div>

      <SourceUploadSheet 
        isOpen={uploadOpen} 
        onClose={() => setUploadOpen(false)} 
        onAnalyzed={handleUserSource}
      />
    </div>
  );
};

export default LatestPage;
