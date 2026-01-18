
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNewsFeed } from '../../utils/aiService';
import { useLanguage } from '../../context/LanguageContext';
import ReelSlide from './ReelSlide';
import './reel.css';
import { useBookmark } from '../../context/BookmarkContext';
import Toast from '../../components/ui/Toast';

const ReelPage: React.FC = () => {
  const navigate = useNavigate();
  const { contentLanguage } = useLanguage();
  const { toggleBookmark } = useBookmark();
  
  const [reels, setReels] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, msg: '' });

  // Swipe Refs
  const wrapperRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isSwiping = useRef(false);

  // Load Data
  useEffect(() => {
      const loadReels = async () => {
          setLoading(true);
          const langName = contentLanguage === 'hi' ? 'Hindi' : 'English';
          const news = await fetchNewsFeed(1, { category: 'All', sort: 'Latest', language: langName });
          
          // Augment data for the reel format
          const formatted = news.map((item: any) => ({
              ...item,
              trustScore: 90 + Math.floor(Math.random() * 9),
              location: item.category || 'Global'
          }));
          
          setReels(formatted);
          setLoading(false);
      };
      loadReels();
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
              setToast({ show: true, msg: 'Saved to bookmarks' });
              setTimeout(() => setToast({ show: false, msg: '' }), 2000);
              break;
          case 'share':
              if (navigator.share) {
                  navigator.share({ title: item.title, text: item.description, url: window.location.href });
              }
              break;
          case 'read':
              navigate(`/news/${id}`, { state: { article: item } });
              break;
      }
  };

  // Swipe Logic
  const handleTouchStart = (e: React.TouchEvent) => {
      startY.current = e.touches[0].clientY;
      isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      // Basic vertical swipe detection
      // Note: CSS scroll-snap handles the visual snapping, 
      // but we need to track index for active state
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      // Determine active index based on scroll position
      const height = window.innerHeight;
      const scrollPos = e.currentTarget.scrollTop;
      const index = Math.round(scrollPos / height);
      if (index !== currentIndex) {
          setCurrentIndex(index);
      }
  };

  // Wheel support for desktop testing
  const handleWheel = (e: React.WheelEvent) => {
      // Let native scroll happen, scroll-snap takes care of it
  };

  if (loading) {
      return (
          <div className="reel-container flex items-center justify-center bg-black">
              <div className="text-center">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400 font-mono text-sm animate-pulse">Curating Global Feed...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="reel-container">
        {toast.show && (
            <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-4 py-2 rounded-full font-bold shadow-xl animate-in fade-in slide-in-from-top-2">
                {toast.msg}
            </div>
        )}

        <div 
            className="reels-wrapper h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth"
            ref={wrapperRef}
            onScroll={handleScroll}
            onTouchStart={handleTouchStart}
        >
            {reels.map((item, index) => (
                <div key={item.id} className="h-full w-full snap-start snap-always">
                    <ReelSlide 
                        data={item} 
                        isActive={index === currentIndex} 
                        onAction={handleAction}
                    />
                </div>
            ))}
            
            {/* End of Feed */}
            <div className="h-full w-full snap-start flex items-center justify-center bg-black text-gray-500">
                <div className="text-center">
                    <p className="mb-4">You're all caught up!</p>
                    <button 
                        onClick={() => navigate('/')}
                        className="px-6 py-2 border border-gray-700 rounded-full hover:bg-gray-900 transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ReelPage;
