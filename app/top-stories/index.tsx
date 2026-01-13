
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, ChevronRight, Globe, ShieldCheck, Clock, Calendar, Sparkles } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import SmartLoader from '../../components/loaders/SmartLoader';
import FloatingAudioPlayer from '../../components/player/FloatingAudioPlayer';
import SourceUploadSheet from '../../components/upload/SourceUploadSheet';
import HighlightReadingMode from '../../components/HighlightReadingMode';
import { fetchNewsFeed } from '../../utils/aiService';
import { ParsedNews } from '../../utils/sourceParser';
import { useHistory } from '../../context/HistoryContext';
import { useLanguage } from '../../context/LanguageContext';

const CATEGORIES = [
    "Top News", "National", "International", "Politics", "Business", 
    "Economy", "Technology", "Science", "Health", "Sports", "Entertainment"
];

const TopStoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { trackProgress } = useHistory();
  const { contentLanguage } = useLanguage();
  
  // Data State
  const [activeCategory, setActiveCategory] = useState("Top News");
  const [isLoading, setIsLoading] = useState(true);
  const [newsData, setNewsData] = useState<any[]>([]);
  
  // Interaction State
  const [activeArticle, setActiveArticle] = useState<any | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
      loadNews(activeCategory);
  }, [activeCategory, contentLanguage]);

  const loadNews = async (category: string) => {
      setIsLoading(true);
      const langName = contentLanguage === 'hi' ? 'Hindi' : 'English';
      // Mapping "Top News" to "All" for API
      const apiCat = category === "Top News" ? "All" : category;
      const data = await fetchNewsFeed(1, { category: apiCat, sort: 'Top', language: langName });
      setNewsData(data);
      setIsLoading(false);
  };

  const handleArticleClick = (article: any) => {
      setActiveArticle(article);
      trackProgress(article.id, 'article', article.title, 10);
  };

  const handlePlayNews = () => {
      setIsPlayerOpen(true);
      setIsPlaying(true);
  };

  const handleUserSource = (parsed: ParsedNews) => {
      // Create a temporary article object from the parsed user content
      const userArticle = {
          id: `user-${Date.now()}`,
          title: parsed.headline,
          description: parsed.fullText, 
          source: "User Upload",
          timeAgo: "Just now",
          category: parsed.category,
          imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop",
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
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500" onClick={() => handleArticleClick(topStory)}>
              <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <h2 className="text-xs font-black text-red-500 uppercase tracking-widest">Breaking Headlines</h2>
              </div>
              
              <div className="group cursor-pointer">
                  <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white leading-[1.1] mb-4 group-hover:text-blue-600 transition-colors">
                      {topStory.title}
                  </h1>
                  
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-5 shadow-2xl border border-gray-100 dark:border-gray-800">
                      <img 
                        src={topStory.imageUrl} 
                        alt={topStory.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                          <div className="flex gap-2">
                              <span className="text-white text-[10px] font-bold bg-blue-600 px-2 py-1 rounded shadow-lg uppercase tracking-wide">
                                  {topStory.category || "General"}
                              </span>
                          </div>
                          <button className="bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full p-2 hover:bg-white hover:text-black transition-all">
                              <Play size={16} fill="currentColor" />
                          </button>
                      </div>
                  </div>

                  <div className="flex items-start gap-4">
                      <div className="w-1 bg-gray-200 dark:bg-gray-800 h-12 rounded-full mt-1"></div>
                      <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed line-clamp-3 text-sm md:text-base">
                          {topStory.description}
                      </p>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-4 text-xs text-gray-400 font-bold uppercase tracking-wider">
                      <span>{topStory.source}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
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
                    className="flex gap-4 p-4 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98] group"
                    onClick={() => handleArticleClick(item)}
                  >
                      <div className="flex-1 flex flex-col justify-between">
                          <div>
                              <div className="flex items-center gap-2 mb-2">
                                  <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                      {item.category || activeCategory}
                                  </span>
                                  <span className="text-[9px] text-gray-400 font-medium">{item.timeAgo}</span>
                              </div>
                              <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-3 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {item.title}
                              </h3>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                              <Globe size={10} /> {item.source}
                          </div>
                      </div>
                      <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-200 relative">
                          <img src={item.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      </div>
                  </div>
              ))}
          </div>
      );
  };

  // --- Reading Mode View (In-Place) ---

  if (activeArticle) {
      return (
          <div className="h-full bg-white dark:bg-black overflow-y-auto pb-32 animate-in slide-in-from-right-8 duration-300">
              <div className="sticky top-0 z-40 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
                  <button onClick={() => { setActiveArticle(null); setIsPlayerOpen(false); setIsPlaying(false); }} className="flex items-center gap-1 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                      <ChevronRight className="rotate-180" size={18} /> Back
                  </button>
                  <div className="flex gap-2">
                      <button onClick={() => setPlaybackSpeed(s => s === 1 ? 1.5 : 1)} className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          {playbackSpeed}x
                      </button>
                      <button onClick={handlePlayNews} className="bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all">
                          <Play size={12} fill="currentColor" /> Listen
                      </button>
                  </div>
              </div>

              <div className="p-6 max-w-2xl mx-auto">
                  <div className="flex items-center gap-2 mb-4">
                      <span className="text-blue-600 dark:text-blue-400 font-black tracking-widest text-xs uppercase bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                          {activeArticle.category || "News"}
                      </span>
                      <span className="text-gray-400 text-xs font-mono">{activeArticle.timeAgo}</span>
                  </div>

                  <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                      {activeArticle.title}
                  </h1>

                  {activeArticle.isUserSource && (
                      <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                          <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase">
                              <ShieldCheck size={14} /> AI Source Analysis
                          </div>
                          <p className="text-xs text-indigo-900 dark:text-indigo-100 leading-relaxed">
                              Reliability Score: <span className="font-bold">{activeArticle.reliability || "Pending"}</span>. 
                              This content was parsed and verified by our AI engine from your uploaded source.
                          </p>
                      </div>
                  )}

                  {/* AI Generated Context - usually this would be dynamic */}
                  <div className="mb-8 pl-4 border-l-4 border-gray-200 dark:border-gray-800">
                      <p className="text-lg leading-loose text-gray-800 dark:text-gray-300 font-serif italic">
                          {activeArticle.description}
                      </p>
                  </div>

                  {/* Reading Mode Component for Body */}
                  <div className="text-lg leading-loose text-gray-800 dark:text-gray-200 font-serif">
                      <HighlightReadingMode 
                          text={activeArticle.description} // In a real app, this would be the full body content
                          isPlaying={isPlaying}
                          speed={playbackSpeed}
                          theme="light" // Dynamic theme could be passed here
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
                      progress={35} 
                      title={activeArticle.title}
                  />
              )}
          </div>
      );
  }

  // --- Main Dashboard View ---

  return (
    <div className="h-full bg-gray-50 dark:bg-black overflow-y-auto transition-colors duration-300 pb-20">
      
      {/* Headlines Hub Header */}
      <div className="bg-white dark:bg-gray-900 pb-2 shadow-sm relative z-10">
          <PageHeader 
            title="Today's Briefing" 
            showBack={false}
            action={
                <button 
                    onClick={() => setUploadOpen(true)}
                    className="flex items-center gap-1.5 bg-gray-900 dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-full text-xs font-bold border border-transparent active:scale-95 transition-all shadow-md"
                >
                    <Plus size={14} /> <span className="hidden xs:inline">Add Source</span>
                </button>
            }
          />
          
          <div className="px-4 mt-3 mb-2 flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                  <Calendar size={12} /> {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <Globe size={12} /> Global Edition
              </span>
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-1 scrollbar-hide">
              {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                        activeCategory === cat 
                        ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-md transform scale-105' 
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                      {cat}
                  </button>
              ))}
          </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto">
          {isLoading ? (
              <SmartLoader type="headlines" />
          ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Master View for Top News Tab */}
                  {activeCategory === 'Top News' && renderTopNewsFocus()}
                  
                  {/* Standard News List */}
                  {renderCategoryList()}
              </div>
          )}
      </div>

      {/* Upload Sheet */}
      <SourceUploadSheet 
        isOpen={uploadOpen} 
        onClose={() => setUploadOpen(false)} 
        onAnalyzed={handleUserSource}
      />
    </div>
  );
};

export default TopStoriesPage;
    