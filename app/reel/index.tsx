
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReelContainer from '../../components/reel/ReelContainer';
import ReelItem from '../../components/reel/ReelItem';
import ReelLoadingState from '../../components/reel/ReelLoadingState';
import { useLoading } from '../../context/LoadingContext';
import { fetchNewsFeed } from '../../utils/aiService';
import { useLanguage } from '../../context/LanguageContext';

const ReelPage: React.FC = () => {
  const navigate = useNavigate();
  const { markAsLoaded } = useLoading();
  const { contentLanguage } = useLanguage();
  
  const [reels, setReels] = useState<any[]>([]);
  const [activeReelId, setActiveReelId] = useState<string>('');
  const [isAutoRead, setIsAutoRead] = useState(true); 
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadedIdsRef = useRef<Set<string>>(new Set());
  const observerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Initial Data Fetch
  useEffect(() => {
      let isMounted = true;
      const loadReels = async () => {
          loadedIdsRef.current.clear();
          const langName = contentLanguage === 'hi' ? 'Hindi' : 'English';
          
          const newsItems = await fetchNewsFeed(1, { category: 'All', sort: 'Latest', language: langName });
          
          const formattedReels = newsItems.map((item: any, index: number) => {
              const uniqueKey = `${item.id}-p1-${index}`; 
              return {
                ...item,
                id: uniqueKey,       
                articleId: item.id,  
                summary: item.description, 
                tags: [item.category, 'Trending'],
                aiEnhanced: true,
                trustScore: 95 + Math.floor(Math.random() * 5),
                location: { name: 'Global' }
              };
          });

          if (isMounted) {
              setReels(formattedReels);
              if (formattedReels.length > 0) {
                  // Set initial active reel immediately without animation delay
                  setActiveReelId(formattedReels[0].id);
                  formattedReels.forEach((r: any) => loadedIdsRef.current.add(r.id));
              }
              markAsLoaded('reel');
          }
      };

      loadReels();
      return () => { isMounted = false; };
  }, [contentLanguage, markAsLoaded]);

  // 2. STABILIZED Intersection Observer
  useEffect(() => {
    if (reels.length === 0) return;

    const options = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.6 // Element must be 60% visible to be considered "Active"
    };

    const callback = (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('data-id');
                if (id) {
                    // Debounce the state update to prevent flickering during fast scrolls
                    if (observerTimeoutRef.current) {
                        clearTimeout(observerTimeoutRef.current);
                    }
                    
                    observerTimeoutRef.current = setTimeout(() => {
                        setActiveReelId(id);
                        
                        // Check for infinite scroll
                        const index = reels.findIndex(r => r.id === id);
                        if (index >= reels.length - 2 && !isLoadingMore) {
                            handleLoadMore();
                        }
                    }, 300); // 300ms delay ensures scrolling has settled
                }
            }
        });
    };

    const observer = new IntersectionObserver(callback, options);
    const elements = document.querySelectorAll('.reel-item');
    elements.forEach((el) => observer.observe(el));

    return () => {
        observer.disconnect();
        if (observerTimeoutRef.current) clearTimeout(observerTimeoutRef.current);
    };
  }, [reels.length, isLoadingMore]);

  const handleLoadMore = async () => {
      setIsLoadingMore(true);
      const langName = contentLanguage === 'hi' ? 'Hindi' : 'English';
      const moreNews = await fetchNewsFeed(2, { category: 'All', sort: 'Trending', language: langName });
      
      const newReels = moreNews.map((item: any, index: number) => ({
          ...item,
          id: `${item.id}-p${Date.now()}-${index}`,
          articleId: item.id,
          summary: item.description,
          tags: [item.category, 'Viral'],
          aiEnhanced: true,
          trustScore: 90 + Math.floor(Math.random() * 8),
          location: { name: 'Global' }
      }));

      // Append ensuring no duplicates if network is slow/fast
      setReels(prev => {
          const existingIds = new Set(prev.map(r => r.id));
          const uniqueNewReels = newReels.filter((r: any) => !existingIds.has(r.id));
          return [...prev, ...uniqueNewReels];
      });
      setIsLoadingMore(false);
  };

  return (
    <div className="h-full w-full bg-black relative font-sans">
      
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 w-full z-50 p-4 pt-4 flex justify-between items-center pointer-events-none">
         <button 
            onClick={() => navigate('/')} 
            className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors pointer-events-auto border border-white/10"
            aria-label="Back"
         >
            <ChevronLeft size={24} />
         </button>

         <button 
            onClick={() => setIsAutoRead(!isAutoRead)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md text-xs font-bold transition-all pointer-events-auto border ${
                isAutoRead 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' 
                : 'bg-black/30 text-gray-300 border-white/10'
            }`}
         >
            {isAutoRead ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {isAutoRead ? 'Spoken Brief' : 'Silent'}
         </button>
      </div>

      <ReelContainer>
        {reels.length === 0 ? (
            <div className="h-full w-full snap-start snap-always">
                <ReelLoadingState />
            </div>
        ) : (
            <>
                {reels.map((reel) => (
                  <div 
                    key={reel.id} 
                    id={`reel-${reel.id}`} 
                    data-id={reel.id} 
                    className="reel-item h-full w-full snap-start snap-always transform-gpu overflow-hidden"
                  >
                     {/* Only render complex children if close to active to save memory */}
                     <ReelItem 
                        data={reel} 
                        isActive={activeReelId === reel.id} 
                        isAutoRead={isAutoRead}
                     />
                  </div>
                ))}
                
                <div className="reel-item h-full w-full snap-start snap-always transform-gpu">
                    <ReelLoadingState />
                </div>
            </>
        )}
      </ReelContainer>
    </div>
  );
};

export default ReelPage;
