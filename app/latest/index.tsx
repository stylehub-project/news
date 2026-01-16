
import React, { useState, useEffect } from 'react';
import { Clock, Plus, Zap, ArrowRight, ShieldCheck, FileText, ChevronRight, Play, Globe, Sparkles, BrainCircuit, BarChart, List, Download, ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import SmartLoader from '../../components/loaders/SmartLoader';
import FloatingAudioPlayer from '../../components/player/FloatingAudioPlayer';
import SourceUploadSheet from '../../components/upload/SourceUploadSheet';
import HighlightReadingMode from '../../components/HighlightReadingMode';
import { fetchNewsFeed } from '../../utils/aiService';
import { ParsedNews } from '../../utils/sourceParser';
import { useHistory } from '../../context/HistoryContext';

const CATEGORIES = [
    "National", "International", "Politics", "Business", "Economy", 
    "Technology", "Science", "Health", "Education", "Sports", 
    "Entertainment", "Weather", "Environment", "Defence", "Opinion"
];

const LatestPage: React.FC = () => {
  const { trackProgress } = useHistory();
  
  // State
  const [activeCategory, setActiveCategory] = useState("National");
  const [isLoading, setIsLoading] = useState(true);
  const [newsData, setNewsData] = useState<any[]>([]);
  
  // Reading Mode State
  const [activeArticle, setActiveArticle] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [uploadOpen, setUploadOpen] = useState(false);
  
  // Settings for Reader
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
      loadNews(activeCategory);
  }, [activeCategory]);

  const loadNews = async (category: string) => {
      setIsLoading(true);
      const data = await fetchNewsFeed(1, { category: category, sort: 'Latest' });
      setNewsData(data);
      setIsLoading(false);
  };

  const handleArticleClick = (article: any) => {
      setActiveArticle(article);
      // Track view
      trackProgress(article.id, 'article', article.title, 10);
  };

  const handlePlayNews = () => {
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
          reliability: parsed.reliability,
          aiSummary: parsed.summary,
          keyFacts: parsed.keyFacts
      };
      setActiveArticle(userArticle);
  };

  // --- Layout Components ---

  const renderCategoryContent = () => {
      if (!newsData.length) return <div className="text-center py-20 text-gray-400">No stories found.</div>;
      
      const topStory = newsData[0];
      const supportingStories = newsData.slice(1);

      return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 pb-20">
              {/* Top Headline - Large Card */}
              <div onClick={() => handleArticleClick(topStory)} className="cursor-pointer group relative px-4 pt-2">
                  <div className="aspect-[16/9] w-full rounded-3xl overflow-hidden relative shadow-2xl border border-white/10">
                      <img src={topStory.imageUrl} alt={topStory.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                      
                      <div className="absolute top-4 left-4 flex gap-2">
                          <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-wider animate-pulse">
                              Top Story
                          </span>
                          <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded border border-white/20 flex items-center gap-1">
                              <Sparkles size={10} className="text-yellow-300" /> AI Insights
                          </span>
                      </div>

                      <div className="absolute bottom-0 left-0 p-5 w-full">
                          <div className="flex items-center gap-2 text-xs text-gray-300 mb-2 font-mono">
                              <span className="text-blue-400 font-bold uppercase">{topStory.source}</span>
                              <span>•</span>
                              <span>{topStory.timeAgo}</span>
                          </div>
                          <h2 className="text-xl md:text-2xl font-black text-white leading-tight mb-2 group-hover:text-blue-400 transition-colors">
                              {topStory.title}
                          </h2>
                          <p className="text-sm text-gray-300 line-clamp-2 opacity-90 font-medium leading-relaxed">{topStory.description}</p>
                      </div>
                  </div>
              </div>

              {/* Supporting Stories - Stacked */}
              <div className="space-y-4 px-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                      <List size={12} /> More in {activeCategory}
                  </h3>
                  {supportingStories.map((item, idx) => (
                      <div 
                          key={idx} 
                          className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98] group"
                          onClick={() => handleArticleClick(item)}
                      >
                          <div className="flex-1">
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {item.title}
                              </h4>
                              <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                                  <span className="text-indigo-600 dark:text-indigo-400">{item.source}</span>
                                  <span>•</span>
                                  <span>{item.timeAgo}</span>
                              </div>
                          </div>
                          <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-200 relative">
                              <img src={item.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  // --- Reading View ---

  if (activeArticle) {
      return (
          <div className={`h-full overflow-hidden flex flex-col ${theme === 'dark' ? 'bg-black text-gray-100' : 'bg-white text-gray-900'}`}>
              
              {/* Reading Header */}
              <div className="sticky top-0 z-40 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between shrink-0">
                  <button 
                    onClick={() => { setActiveArticle(null); setIsPlaying(false); }} 
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                      <ArrowLeft size={20} />
                  </button>
                  
                  <div className="flex gap-3">
                      <button onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                          {theme === 'light' ? '🌙' : '☀️'}
                      </button>
                      <button onClick={() => setFontSize(prev => Math.min(prev + 2, 24))} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 font-bold text-xs">
                          A+
                      </button>
                      <button 
                        onClick={handlePlayNews} 
                        className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                      >
                          <Play size={12} fill="currentColor" /> Listen
                      </button>
                  </div>
              </div>

              {/* Reading Content */}
              <div className="flex-1 overflow-y-auto p-5 pb-32 max-w-2xl mx-auto w-full custom-scrollbar">
                  <span className="text-indigo-600 dark:text-indigo-400 font-black tracking-widest text-[10px] uppercase mb-3 block">
                      {activeArticle.category || "News"}
                  </span>
                  
                  <h1 className="text-2xl md:text-3xl font-black mb-6 leading-tight">
                      {activeArticle.title}
                  </h1>

                  {/* AI Metadata & Analysis */}
                  <div className="mb-8 space-y-4">
                      {/* Summary Card */}
                      <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                          <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase">
                              <BrainCircuit size={14} /> AI Summary
                          </div>
                          <p className="text-sm text-indigo-900 dark:text-indigo-100 leading-relaxed font-medium">
                              {activeArticle.aiSummary || activeArticle.description}
                          </p>
                      </div>

                      {/* Why it Matters */}
                      <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-500/20">
                          <div className="flex items-center gap-2 mb-2 text-yellow-700 dark:text-yellow-300 font-bold text-xs uppercase">
                              <Zap size={14} className="fill-current" /> Why it matters
                          </div>
                          <p className="text-sm text-yellow-900 dark:text-yellow-100 leading-relaxed">
                              This event signals a major shift in the sector, potentially impacting global markets and policy decisions in the coming quarter.
                          </p>
                      </div>

                      {/* Key Facts */}
                      {(activeArticle.keyFacts || []).length > 0 && (
                          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                              <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400 font-bold text-xs uppercase">
                                  <FileText size={14} /> Key Facts
                              </div>
                              <ul className="space-y-2">
                                  {activeArticle.keyFacts.map((fact: string, i: number) => (
                                      <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                                          <span className="text-indigo-500">•</span> {fact}
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      )}

                      {/* User Source Badge */}
                      {activeArticle.isUserSource && (
                          <div className="flex items-center gap-2 text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full w-fit">
                              <ShieldCheck size={12} />
                              <span className="font-bold">Source Analysis: {activeArticle.reliability}</span>
                          </div>
                      )}
                  </div>

                  <hr className="border-gray-100 dark:border-gray-800 mb-8" />

                  {/* Full Text Reader */}
                  <div style={{ fontSize: `${fontSize}px` }} className="text-justify font-serif leading-loose">
                      <HighlightReadingMode 
                          text={activeArticle.description} // In real usage, this would be full content
                          isPlaying={isPlaying}
                          speed={playbackSpeed}
                          theme={theme}
                          onComplete={() => setIsPlaying(false)}
                      />
                  </div>
              </div>

              {/* Transparent Floating Player */}
              {isPlaying && (
                  <FloatingAudioPlayer 
                      isPlaying={isPlaying}
                      onTogglePlay={() => setIsPlaying(!isPlaying)}
                      onClose={() => setIsPlaying(false)}
                      speed={playbackSpeed}
                      onSpeedChange={setPlaybackSpeed}
                      progress={35} // Sync would require deeper integration
                      title={activeArticle.title}
                  />
              )}
          </div>
      );
  }

  // --- Main View ---

  return (
    <div className="h-full bg-gray-50 dark:bg-black overflow-y-auto transition-colors duration-300">
      
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-black/95 backdrop-blur-md pb-1 border-b border-gray-100 dark:border-gray-800">
          <PageHeader 
            title="Today's Top News" 
            showBack={false}
            action={
                <button 
                    onClick={() => setUploadOpen(true)}
                    className="flex items-center gap-1.5 bg-gray-900 dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-full text-xs font-bold border border-transparent shadow-lg active:scale-95 transition-all"
                >
                    <Plus size={14} /> <span className="hidden xs:inline">Add Source</span>
                </button>
            }
          />
          
          <div className="px-4 mt-1 mb-3 flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
              <span>{new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              <span className="flex items-center gap-1 text-indigo-500"><Globe size={12} /> Global Edition</span>
          </div>

          {/* Categories Scroll */}
          <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
              {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                        activeCategory === cat 
                        ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-lg transform scale-105' 
                        : 'bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                      {cat}
                  </button>
              ))}
          </div>
      </div>

      <div className="w-full max-w-2xl mx-auto">
          {isLoading ? (
              <div className="p-4 space-y-6">
                  <div className="w-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse"></div>
                  <div className="space-y-3">
                      <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                      <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                  </div>
              </div>
          ) : (
              renderCategoryContent()
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
