
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '' });

  // Refs for logic control
  const dataFetchedRef = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load Data
  useEffect(() => {
      // Prevent double fetching in Strict Mode
      if (dataFetchedRef.current) return;

      const loadReels = async () => {
          setLoading(true);
          setError(false);
          try {
              const langName = contentLanguage === 'hi' ? 'Hindi' : 'English';
              // Fetch a larger batch for the reel to ensure smooth scrolling
              const news = await fetchNewsFeed(1, { category: 'All', sort: 'Top', language: langName });
              
              if (news && news.length > 0) {
                  // Augment data for the reel format with mock trust scores and locations
                  const formatted = news.map((item: any) => ({
                      ...item,
                      trustScore: 90 + Math.floor(Math.random() * 9),
                      location: item.category || 'Global',
                      // Ensure high-res images for reels if possible
                      imageUrl: item.imageUrl?.includes('picsum') ? item.imageUrl : `https://picsum.photos/seed/${item.id}/800/1200`
                  }));
                  setReels(formatted);
                  dataFetchedRef.current = true;
              } else {
                  setError(true);
              }
          } catch (e) {
              console.error("Failed to load reels", e);
              setError(true);
          } finally {
              setLoading(false);
          }
      };
      
      loadReels();
      
      // Reset ref on unmount to allow refresh if user navigates away and back
      return () => { dataFetchedRef.current = false; };
  }, [contentLanguage]);

  // Actions Handler
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

  if (loading) {
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

  if (error && !loading) {
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
        {/* Toast Notification */}
        {toast.show && (
            <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full font-bold shadow-2xl animate-in fade-in slide-in-from-top-4">
                {toast.msg}
            </div>
        )}

        {/* Back Button Overlay */}
        <button 
            onClick={() => navigate('/')} 
            className="absolute top-6 left-4 z-50 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/80 hover:text-white hover:bg-black/40 transition-all border border-white/10"
        >
            <ArrowLeft size={24} />
        </button>

        {/* Swipe Container */}
        <div 
            className="reels-wrapper h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth hide-scrollbar"
            ref={wrapperRef}
            onScroll={handleScroll}
        >
            {reels.map((item, index) => (
                <div key={item.id} className="h-full w-full snap-start snap-always relative">
                    {/* Render current, prev, and next slides for performance */}
                    {Math.abs(currentIndex - index) <= 1 && (
                        <ReelSlide 
                            data={item} 
                            isActive={index === currentIndex} 
                            onAction={handleAction}
                        />
                    )}
                </div>
            ))}
            
            {/* End of Feed Message */}
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
