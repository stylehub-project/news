
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Bookmark, Share2, Sparkles, Clock, ChevronDown, AlignLeft, ArrowRight, BrainCircuit } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import AIQuickPreviewSheet from '../../components/cards/AIQuickPreviewSheet';
import SmartLoader from '../../components/loaders/SmartLoader';
import BlurImageLoader from '../../components/loaders/BlurImageLoader';
import Toast, { ToastType } from '../../components/ui/Toast';
import { fetchNewsFeed } from '../../utils/aiService';
import { useLanguage } from '../../context/LanguageContext';
import { useBookmark } from '../../context/BookmarkContext';
import SpokenBriefPlayer from '../../components/reel/SpokenBriefPlayer';

// Map language code to API parameter name
const getLanguageParam = (code: string) => {
    const map: Record<string, string> = {
        'en': 'English',
        'hi': 'Hindi',
        'es': 'Spanish',
        'fr': 'French'
    };
    return map[code] || 'English';
};

const TopStoriesPage = () => {
  const navigate = useNavigate();
  const { contentLanguage } = useLanguage();
  const { toggleBookmark, isBookmarked } = useBookmark();
  
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [toast, setToast] = useState<{show: boolean, msg: string, type: ToastType}>({ show: false, msg: '', type: 'success' });
  
  // AI Preview State
  const [previewArticle, setPreviewArticle] = useState<any | null>(null);
  
  // Audio State
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  
  const dataLoadedRef = useRef(false);

  const loadStories = async (selectedFilter = 'All', force = false) => {
      if (!force && dataLoadedRef.current && articles.length > 0 && selectedFilter === filter) return;

      setLoading(true);
      const langName = getLanguageParam(contentLanguage);
      const news = await fetchNewsFeed(1, { category: selectedFilter, sort: 'Top', language: langName });
      
      setArticles(news);
      dataLoadedRef.current = true;
      setLoading(false);
  };

  useEffect(() => {
      loadStories(filter, true);
  }, [contentLanguage, filter]); 

  const handleFilterChange = (newFilter: string) => {
      if (filter === newFilter) return;
      setFilter(newFilter);
  };

  const handleSave = (article: any) => {
      toggleBookmark({
          id: article.id,
          title: article.title,
          source: article.source,
          category: article.category,
          imageUrl: article.imageUrl,
          timeAgo: article.timeAgo,
          description: article.description
      });
      const isSaved = isBookmarked(article.id);
      setToast({ show: true, msg: isSaved ? 'Removed from Library' : 'Story Saved', type: 'success' });
  };

  const handleShare = async (article: any) => {
      if (navigator.share) {
          try {
              await navigator.share({ title: article.title, text: article.description, url: window.location.href });
          } catch (e) {}
      } else {
          setToast({ show: true, msg: 'Link copied to clipboard', type: 'success' });
          navigator.clipboard.writeText(window.location.href);
      }
  };

  const handleReadStory = (id: string) => {
      const article = articles.find(a => a.id === id);
      navigate(`/news/${id}`, { state: { article } });
  };

  return (
    <div className="h-full bg-black flex flex-col relative overflow-hidden">
      
      {toast.show && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-4 w-auto">
              <Toast type={toast.type} message={toast.msg} onClose={() => setToast(prev => ({ ...prev, show: false }))} />
          </div>
      )}

      {/* AI Intelligence Sheet */}
      <AIQuickPreviewSheet 
        isOpen={!!previewArticle}
        onClose={() => setPreviewArticle(null)}
        article={previewArticle}
        onFullAnalysis={() => {
            if (previewArticle) {
                navigate(`/ai-chat?context=article&headline=${encodeURIComponent(previewArticle.title)}`);
                setPreviewArticle(null);
            }
        }}
      />

      {/* Modern Masthead Header */}
      <div className="absolute top-0 left-0 w-full z-30 bg-gradient-to-b from-black/90 to-transparent pt-safe">
          <div className="px-5 py-4 flex items-end justify-between">
              <div>
                  <h1 className="text-3xl font-black text-white tracking-tighter leading-none font-serif">Headlines</h1>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">
                      {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
              </div>
              
              {/* Minimal Filter Pill */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide max-w-[50%] justify-end pb-1">
                  {['All', 'Tech', 'Politics', 'Business'].map(f => (
                      <button
                        key={f}
                        onClick={() => handleFilterChange(f)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                            filter === f 
                            ? 'bg-white text-black border-white' 
                            : 'bg-transparent text-gray-400 border-white/20 hover:border-white/50'
                        }`}
                      >
                          {f}
                      </button>
                  ))}
              </div>
          </div>
      </div>

      {/* Main Editorial Feed */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 scroll-smooth">
          {loading ? (
              <div className="pt-32">
                  <SmartLoader type="headlines" />
              </div>
          ) : (
              <div className="flex flex-col">
                  {articles.map((article, index) => {
                      const isFirst = index === 0;
                      const isSaved = isBookmarked(article.id);
                      
                      return (
                          <div 
                            key={article.id} 
                            className={`relative w-full border-b border-white/10 group ${isFirst ? 'min-h-[500px]' : 'min-h-[400px]'}`}
                            onClick={() => handleReadStory(article.id)}
                          >
                              {/* Background Image */}
                              <div className="absolute inset-0 z-0">
                                  <BlurImageLoader 
                                      src={article.imageUrl} 
                                      alt={article.title} 
                                      className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-[1.5s]" 
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10"></div>
                              </div>

                              {/* Content Container */}
                              <div className="relative z-10 h-full flex flex-col justify-end p-5 pb-8">
                                  
                                  {/* Top Meta (Floating) */}
                                  <div className="absolute top-5 left-5 flex gap-2">
                                      <span className="bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                          {article.category}
                                      </span>
                                      {index === 0 && (
                                          <span className="bg-red-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 animate-pulse">
                                              Live
                                          </span>
                                      )}
                                  </div>

                                  {/* Headline Block */}
                                  <div className="space-y-3 max-w-2xl">
                                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                          <span className="text-white">{article.source}</span>
                                          <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                          <span>{article.timeAgo}</span>
                                      </div>

                                      <h2 className={`${isFirst ? 'text-3xl md:text-5xl' : 'text-2xl md:text-3xl'} font-black text-white leading-[1.1] font-serif shadow-black drop-shadow-md`}>
                                          {article.title}
                                      </h2>

                                      <p className="text-sm text-gray-300 line-clamp-2 font-medium leading-relaxed max-w-lg">
                                          {article.description}
                                      </p>

                                      {/* Action Row */}
                                      <div className="flex items-center justify-between pt-4">
                                          <div className="flex gap-4">
                                              {/* Explain Button */}
                                              <button 
                                                  onClick={(e) => { e.stopPropagation(); setPreviewArticle(article); }}
                                                  className="flex items-center gap-2 text-xs font-bold text-indigo-300 hover:text-white transition-colors group/btn"
                                              >
                                                  <div className="p-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/50 group-hover/btn:bg-indigo-500 transition-colors">
                                                      <Sparkles size={12} />
                                                  </div>
                                                  AI Context
                                              </button>

                                              {/* Listen Button */}
                                              <button 
                                                  onClick={(e) => { e.stopPropagation(); setActiveAudioId(activeAudioId === article.id ? null : article.id); }}
                                                  className={`flex items-center gap-2 text-xs font-bold transition-colors group/btn ${activeAudioId === article.id ? 'text-green-400' : 'text-gray-300 hover:text-white'}`}
                                              >
                                                  <div className={`p-1.5 rounded-full border transition-colors ${activeAudioId === article.id ? 'bg-green-500 text-white border-green-500' : 'bg-white/10 border-white/20 group-hover/btn:bg-white/20'}`}>
                                                      {activeAudioId === article.id ? <Pause size={12} /> : <Play size={12} fill="currentColor" />}
                                                  </div>
                                                  {activeAudioId === article.id ? 'Playing' : 'Listen'}
                                              </button>
                                          </div>

                                          <div className="flex gap-2">
                                              <button 
                                                  onClick={(e) => { e.stopPropagation(); handleSave(article); }}
                                                  className={`p-2 rounded-full hover:bg-white/10 transition-colors ${isSaved ? 'text-blue-400' : 'text-gray-400'}`}
                                              >
                                                  <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
                                              </button>
                                              <button 
                                                  onClick={(e) => { e.stopPropagation(); handleShare(article); }}
                                                  className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                              >
                                                  <Share2 size={20} />
                                              </button>
                                          </div>
                                      </div>
                                  </div>
                              </div>

                              {/* Inline Audio Player (Hidden visually, logical only unless expanded UI desired) */}
                              {activeAudioId === article.id && (
                                  <div className="hidden">
                                      <SpokenBriefPlayer 
                                          text={article.description} 
                                          isActive={true} 
                                          autoPlay={true} 
                                          onProgress={() => {}}
                                          onComplete={() => setActiveAudioId(null)}
                                      />
                                  </div>
                              )}
                          </div>
                      );
                  })}
                  
                  {/* End of Stream */}
                  <div className="p-8 text-center text-gray-500 pb-20">
                      <p className="text-xs uppercase tracking-widest font-bold mb-4">You're all caught up</p>
                      <button 
                        onClick={() => { window.scrollTo({top:0, behavior:'smooth'}); }}
                        className="text-white bg-white/10 px-6 py-3 rounded-full text-xs font-bold hover:bg-white/20 transition-colors"
                      >
                          Back to Top
                      </button>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default TopStoriesPage;
