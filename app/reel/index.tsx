
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNewsFeed } from '../../utils/aiService';
import { useLanguage } from '../../context/LanguageContext';
import ReelSlide from './ReelSlide';
import './reel.css';
import { useBookmark } from '../../context/BookmarkContext';
import { ArrowLeft, RefreshCw } from 'lucide-react';

const ReelPage: React.FC = () => {
  const navigate = useNavigate();
  const { contentLanguage } = useLanguage();
  const { toggleBookmark } = useBookmark();
  
  const [reels, setReels] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Use a function to initialize state so we can check cache immediately
  const [loading, setLoading] = useState(() => {
      const cached = sessionStorage.getItem('nc_reels_cached');
      return !cached; // If cached, not loading. If not cached, loading.
  });
  
  const [error, setError] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '' });

  const dataFetchedRef = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (dataFetchedRef.current) return;

      const loadReels = async () => {
          // If we have cached data in memory or session logic, we might still want to fetch fresh news
          // but we can skip the "Loading" screen if we had previous data.
          // For this specific request, we want to show loading ONLY once per session.
          
          const hasLoadedBefore = sessionStorage.getItem('nc_reels_cached');
          if (!hasLoadedBefore) setLoading(true);

          setError(false);
          try {
              const langName = contentLanguage === 'hi' ? 'Hindi' : 'English';
              const news = await fetchNewsFeed(1, { category: 'All', sort: 'Top', language: langName });
              
              if (news && news.length > 0) {
                  const formatted = news.map((item: any) => ({
                      ...item,
                      trustScore: 90 + Math.floor(Math.random() * 9),
                      location: item.category || 'Global',
                      imageUrl: item.imageUrl?.includes('picsum') ? item.imageUrl : `https://picsum.photos/seed/${item.id}/800/1200`
                  }));
                  setReels(formatted);
                  sessionStorage.setItem('nc_reels_cached', 'true');
              } else {
                  setError(true);
              }
          } catch (e) {
              console.error("Failed to load reels", e);
              setError(true);
          } finally {
              setLoading(false);
              dataFetchedRef.current = true;
          }
      };
      
      loadReels();
      
      return () => { dataFetchedRef.current = false; };
  }, [contentLanguage]);

  const handleAction = (action: string, id: string) => {
      const item = reels.find(r => r.id === id);
      if (!item) return;

      switch(action) {
          case 'explain':
              navigate(`/ai-chat?context=article&headline=${encodeURIComponent(item.title)}`);
              break;
          case 'save':
              toggleBookmark(item);
              showToast('Saved to bookmarks');
              break;
          case 'share':
              if (navigator.share) {
                  navigator.share({ title: item.title, text: item.description, url: window.location.href }).catch(() => {});
              } else {
                  showToast('Link copied');
              }
              break;
          case 'read':
              navigate(`/news/${id}`, { state: { article: item } });
              break;
      }
  };

  const showToast = (msg: string) => {
      setToast({ show: true, msg });
      setTimeout(() => setToast({ show: false, msg: '' }), 2000);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const height = window.innerHeight;
      const scrollPos = e.currentTarget.scrollTop;
      const index = Math.round(scrollPos / height);
      if (index !== currentIndex) {
          setCurrentIndex(index);
      }
  };

  // Only show the full screen loader if it's the first visit in the session
  if (loading && reels.length === 0) {
      return (
          <div className="reel-container flex flex-col items-center justify-center bg-black text-white z-50">
              <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-t-4 border-purple-500 border-solid rounded-full animate-spin-reverse"></div>
              </div>
              <p className="text-gray-400 font-mono text-sm animate-pulse uppercase tracking-widest">Curating Global Feed...</p>
          </div>
      );
  }

  if (error && reels.length === 0) {
      return (
          <div className="reel-container flex flex-col items-center justify-center bg-black text-white">
              <p className="text-gray-400 mb-4">Unable to load new reels.</p>
              <button 
                  onClick={() => window.location.reload()} 
                  className="px-6 py-3 bg-white text-black rounded-full font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors"
              >
                  <RefreshCw size={18} /> Retry
              </button>
              <button onClick={() => navigate('/')} className="mt-4 text-gray-500 text-sm hover:text-white">Go Home</button>
          </div>
      );
  }

  return (
    <div className="reel-container bg-black">
        {toast.show && (
            <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full font-bold shadow-2xl animate-in fade-in slide-in-from-top-4">
                {toast.msg}
            </div>
        )}

        <button 
            onClick={() => navigate('/')} 
            className="absolute top-6 left-4 z-50 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/80 hover:text-white hover:bg-black/40 transition-all border border-white/10"
        >
            <ArrowLeft size={24} />
        </button>

        <div 
            className="reels-wrapper h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth hide-scrollbar"
            ref={wrapperRef}
            onScroll={handleScroll}
        >
            {reels.map((item, index) => (
                <div key={item.id} className="h-full w-full snap-start snap-always relative">
                    {/* Render optimization: only nearby slides */}
                    {Math.abs(currentIndex - index) <= 1 && (
                        <ReelSlide 
                            data={item} 
                            isActive={index === currentIndex} 
                            onAction={handleAction}
                        />
                    )}
                </div>
            ))}
            
            <div className="h-full w-full snap-start flex flex-col items-center justify-center bg-black text-gray-500 space-y-6">
                <div className="w-16 h-1 bg-gray-800 rounded-full"></div>
                <p className="text-lg font-medium">You're all caught up!</p>
                <button 
                    onClick={() => navigate('/')}
                    className="px-8 py-3 border border-gray-700 rounded-full text-white hover:bg-gray-900 transition-colors font-bold uppercase tracking-wider text-sm"
                >
                    Back to Home
                </button>
            </div>
        </div>
    </div>
  );
};

export default ReelPage;
