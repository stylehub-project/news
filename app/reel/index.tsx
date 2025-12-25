
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, PlayCircle, PauseCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReelContainer from '../../components/reel/ReelContainer';
import ReelItem from '../../components/reel/ReelItem';
import ReelLoader from '../../components/loaders/ReelLoader';
import SwipeHint from '../../components/reel/SwipeHint';
import { useLoading } from '../../context/LoadingContext';
import { fetchNewsFeed } from '../../utils/aiService';
import { useLanguage } from '../../context/LanguageContext';

const ReelPage: React.FC = () => {
  const navigate = useNavigate();
  const { markAsLoaded } = useLoading();
  const { contentLanguage } = useLanguage();
  
  const [reels, setReels] = useState<any[]>([]);
  const [activeReelId, setActiveReelId] = useState<string>('');
  const [isAutoScroll, setIsAutoScroll] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hasRestoredPosition, setHasRestoredPosition] = useState(false);
  const [isMutedGlobal, setIsMutedGlobal] = useState(true); // Global mute state
  
  // Track IDs to prevent duplicate rendering keys
  const loadedIdsRef = useRef<Set<string>>(new Set());

  // 1. Initial Data Fetch
  useEffect(() => {
      let isMounted = true;
      const loadReels = async () => {
          loadedIdsRef.current.clear();
          const langName = contentLanguage === 'hi' ? 'Hindi' : 'English';
          
          // Fetch initial batch
          const newsItems = await fetchNewsFeed(1, { category: 'All', sort: 'Latest', language: langName });
          
          const formattedReels = newsItems.map((item: any, index: number) => {
              // Construct a stable, deterministic ID for the list
              const uniqueKey = `${item.id}-p1-${index}`; 
              return {
                ...item,
                id: uniqueKey,       // React Key
                articleId: item.id,  // Actual Content ID for navigation
                videoUrl: index % 2 === 0 ? 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-robotic-arm-working-on-a-circuit-board-42996-large.mp4' : undefined,
                tags: [item.category, contentLanguage === 'hi' ? 'ताज़ा खबर' : 'Trending'],
                aiEnhanced: true,
                aiSummary: item.description,
                keyPoints: ['Key Impact', 'Market Shift', 'Future Outlook'],
                factCheck: { status: 'Verified', score: 95 + (index % 5) },
                location: { name: 'Global', lat: 0, lng: 0 },
                personalizationReason: 'For You'
              };
          });

          if (isMounted) {
              setReels(formattedReels);
              if (formattedReels.length > 0) {
                  setActiveReelId(formattedReels[0].id);
                  // Track loaded IDs
                  formattedReels.forEach((r: any) => loadedIdsRef.current.add(r.id));
              }
              markAsLoaded('reel');

              // Show hint only once per session
              const hintShown = sessionStorage.getItem('reel_hint_shown');
              if (!hintShown) {
                  setShowHint(true);
                  sessionStorage.setItem('reel_hint_shown', 'true');
              }
          }
      };

      loadReels();
      return () => { isMounted = false; };
  }, [contentLanguage, markAsLoaded]);

  // 2. Infinite Scroll Fetching
  const fetchMoreReels = useCallback(async () => {
      if (isFetchingMore) return; 
      setIsFetchingMore(true);
      
      try {
          const langName = contentLanguage === 'hi' ? 'Hindi' : 'English';
          const nextPage = Math.floor(reels.length / 5) + 1;
          const newItems = await fetchNewsFeed(nextPage, { category: 'All', sort: 'Latest', language: langName });

          const formattedNewReels = newItems.map((item: any, index: number) => {
              const uniqueKey = `${item.id}-p${nextPage}-${index}`; 
              return {
                  ...item,
                  id: uniqueKey,
                  articleId: item.id,
                  videoUrl: index % 3 === 0 ? 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-solar-panel-forest-42805-large.mp4' : undefined,
                  tags: [item.category],
                  aiEnhanced: true,
                  aiSummary: item.description,
                  keyPoints: ['Details', 'Analysis'],
                  factCheck: { status: 'Verified', score: 92 },
                  personalizationReason: 'Trending'
              };
          });
          
          setReels(prev => {
              const uniqueNew = formattedNewReels.filter((r: any) => !loadedIdsRef.current.has(r.id));
              uniqueNew.forEach((r: any) => loadedIdsRef.current.add(r.id));
              return [...prev, ...uniqueNew];
          });
      } catch (err) {
          console.error("Failed to load more reels", err);
      } finally {
          setIsFetchingMore(false);
      }
  }, [reels.length, contentLanguage, isFetchingMore]);

  // 3. Preload & Infinite Scroll Trigger
  useEffect(() => {
    if (!activeReelId || reels.length === 0) return;

    const currentIndex = reels.findIndex(r => r.id === activeReelId);
    if (currentIndex === -1) return;

    // Trigger fetch if close to end
    if (currentIndex >= reels.length - 2 && !isFetchingMore) {
        fetchMoreReels();
    }
  }, [activeReelId, reels, isFetchingMore, fetchMoreReels]);

  // 4. Robust Intersection Observer
  useEffect(() => {
    if (reels.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-id');
            if (id) setActiveReelId(id);
          }
        });
      },
      { threshold: 0.7 } // High threshold prevents flipping while scrolling fast
    );

    const elements = document.querySelectorAll('.reel-item');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [reels.length]);

  const handleAutoScrollNext = useCallback(() => {
    const currentIndex = reels.findIndex(r => r.id === activeReelId);
    if (currentIndex < reels.length - 1) {
        const nextId = reels[currentIndex + 1].id;
        const element = document.getElementById(`reel-${nextId}`);
        element?.scrollIntoView({ behavior: 'smooth' });
    } else {
        setIsAutoScroll(false); 
    }
  }, [reels, activeReelId]);

  return (
    <div className="h-full w-full bg-black relative">
      
      {showHint && <SwipeHint />}

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 w-full z-40 p-4 pt-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
         <button 
            onClick={() => navigate('/')} 
            className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors pointer-events-auto"
            aria-label="Back"
         >
            <ChevronLeft size={24} />
         </button>

         <div className="flex gap-3 pointer-events-auto">
             <button 
                onClick={() => setIsAutoScroll(!isAutoScroll)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-bold transition-all ${
                    isAutoScroll 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-black/30 text-gray-300 border border-white/20'
                }`}
             >
                {isAutoScroll ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
                {contentLanguage === 'hi' ? 'ऑटो-प्ले' : 'Auto-Scroll'}
             </button>
         </div>
      </div>

      <ReelContainer>
        {reels.length === 0 ? (
            <div className="h-full w-full snap-start snap-always">
                <ReelLoader />
            </div>
        ) : (
            reels.map((reel) => (
              <div 
                key={reel.id} 
                id={`reel-${reel.id}`} 
                data-id={reel.id} 
                className="reel-item h-full w-full snap-start snap-always transform-gpu"
              >
                 <ReelItem 
                    data={reel} 
                    isActive={activeReelId === reel.id} 
                    isAutoScroll={isAutoScroll}
                    isMutedGlobal={isMutedGlobal}
                    onToggleMute={() => setIsMutedGlobal(!isMutedGlobal)}
                    onFinished={handleAutoScrollNext}
                 />
              </div>
            ))
        )}
      </ReelContainer>
    </div>
  );
};

export default ReelPage;
