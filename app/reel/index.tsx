
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, PlayCircle } from 'lucide-react';
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

  // 1. Fetch Data Based on Language
  useEffect(() => {
      let isMounted = true;
      const loadReels = async () => {
          const langName = contentLanguage === 'hi' ? 'Hindi' : 'English';
          
          const newsItems = await fetchNewsFeed(1, { category: 'All', sort: 'Latest', language: langName });
          
          const formattedReels = newsItems.map((item: any, index: number) => ({
              ...item,
              videoUrl: index % 2 === 0 ? 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-robotic-arm-working-on-a-circuit-board-42996-large.mp4' : undefined,
              likes: Math.floor(Math.random() * 8000 + 1000).toString(),
              comments: Math.floor(Math.random() * 500).toString(),
              tags: [item.category, contentLanguage === 'hi' ? 'ताज़ा खबर' : 'Trending'],
              aiEnhanced: true,
              aiSummary: item.description,
              keyPoints: contentLanguage === 'hi' 
                ? ['मुख्य बिंदु 1: विस्तृत विश्लेषण', 'बाजार पर प्रभाव', 'विशेषज्ञों की राय']
                : ['Key Point 1: Detailed analysis', 'Market Impact', 'Expert Opinion'],
              factCheck: { status: 'Verified', score: 95 + (index % 5) },
              location: { name: contentLanguage === 'hi' ? 'नई दिल्ली, भारत' : 'New York, USA', lat: 40.7128, lng: -74.0060 },
              personalizationReason: contentLanguage === 'hi' ? 'आपके लिए अनुशंसित' : 'Recommended for you'
          }));

          if (isMounted) {
              setReels(formattedReels);
              if (formattedReels.length > 0) {
                  setActiveReelId(formattedReels[0].id);
              }
              markAsLoaded('reel');

              const hintShown = localStorage.getItem('swipe_hint_shown');
              if (!hintShown) {
                  setShowHint(true);
                  localStorage.setItem('swipe_hint_shown', 'true');
              }
          }
      };

      loadReels();
      return () => { isMounted = false; };
  }, [contentLanguage, markAsLoaded]);

  // 2. Restore Scroll Position
  useEffect(() => {
      if (reels.length > 0 && !hasRestoredPosition) {
          const lastId = sessionStorage.getItem('news-reel-last-id');
          if (lastId) {
              const element = document.getElementById(`reel-${lastId}`);
              if (element) {
                  element.scrollIntoView({ behavior: 'auto' });
                  setActiveReelId(lastId);
              }
          }
          setHasRestoredPosition(true);
      }
  }, [reels, hasRestoredPosition]);

  // 3. Infinite Scroll & Preload
  useEffect(() => {
    if (activeReelId && reels.length > 0) {
        sessionStorage.setItem('news-reel-last-id', activeReelId);

        const currentIndex = reels.findIndex(r => r.id === activeReelId);
        
        if (currentIndex !== -1) {
            // Preload next images
            const nextReels = reels.slice(currentIndex + 1, currentIndex + 3);
            nextReels.forEach(reel => {
                const img = new Image();
                img.src = reel.imageUrl;
            });

            if (currentIndex >= reels.length - 2 && !isFetchingMore) {
                fetchMoreReels();
            }
        }
    }
  }, [activeReelId, reels, isFetchingMore]);

  // 4. Data Fetching
  const fetchMoreReels = useCallback(async () => {
      if (isFetchingMore) return; // Prevent double fetch
      setIsFetchingMore(true);
      
      try {
          const langName = contentLanguage === 'hi' ? 'Hindi' : 'English';
          const nextPage = Math.floor(reels.length / 5) + 1;
          const newItems = await fetchNewsFeed(nextPage, { category: 'All', sort: 'Latest', language: langName });

          const formattedNewReels = newItems.map((item: any, index: number) => ({
              ...item,
              // Critical: Ensure unique ID composition to prevent React Key Crash
              id: `${item.id}-p${nextPage}-${index}-${Date.now()}`, 
              videoUrl: index % 3 === 0 ? 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-solar-panel-forest-42805-large.mp4' : undefined,
              likes: Math.floor(Math.random() * 5000).toString(),
              comments: Math.floor(Math.random() * 200).toString(),
              tags: [item.category],
              aiEnhanced: true,
              aiSummary: item.description,
              keyPoints: contentLanguage === 'hi' 
                ? ['अतिरिक्त जानकारी', 'वैश्विक संदर्भ']
                : ['Additional Context', 'Global Scale'],
              factCheck: { status: 'Verified', score: 92 },
              personalizationReason: contentLanguage === 'hi' ? 'लोकप्रिय' : 'Popular Now'
          }));
          
          setReels(prev => {
              // Deduplication Safety Check
              const existingIds = new Set(prev.map(r => r.id));
              const uniqueNew = formattedNewReels.filter((r: any) => !existingIds.has(r.id));
              return [...prev, ...uniqueNew];
          });
      } catch (err) {
          console.error("Failed to load more reels", err);
      } finally {
          setIsFetchingMore(false);
      }
  }, [reels.length, contentLanguage, isFetchingMore]);

  // 5. Intersection Observer
  useEffect(() => {
    if (reels.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-id');
            if (id) {
                setActiveReelId(id);
            }
          }
        });
      },
      { threshold: 0.6 } 
    );

    const elements = document.querySelectorAll('.reel-item');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [reels]);

  const handleNext = useCallback(() => {
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
      
      {showHint && reels.length > 0 && activeReelId === reels[0].id && <SwipeHint />}

      {/* Top Header Overlay */}
      <div className="absolute top-0 left-0 w-full z-40 p-4 pt-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
         <button 
            onClick={() => navigate('/')} 
            className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors pointer-events-auto"
            aria-label="Back to Home"
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
                aria-label="Toggle Auto-Scroll"
             >
                <PlayCircle size={14} className={isAutoScroll ? 'animate-pulse' : ''} />
                {contentLanguage === 'hi' ? 'ऑटो-प्ले' : 'Auto-Scroll'}
             </button>
         </div>
      </div>

      <ReelContainer>
        {reels.length === 0 ? (
            // Immediate structure feedback
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
                    onFinished={handleNext}
                 />
              </div>
            ))
        )}
      </ReelContainer>
    </div>
  );
};

export default ReelPage;
