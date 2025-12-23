import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, Zap, PlayCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReelContainer from '../../components/reel/ReelContainer';
import ReelItem from '../../components/reel/ReelItem';
import SmartLoader from '../../components/loaders/SmartLoader';
import SwipeHint from '../../components/reel/SwipeHint';
import { useLoading } from '../../context/LoadingContext';

// Mock Data with Mixed Media (Video & Image)
const INITIAL_REELS = [
  {
    id: '1',
    title: 'Global Markets Rally as Tech Giants Announce New AI Partnership',
    description: 'Major tech companies have agreed on a unified framework for AI development, causing stock markets to surge globally. Analysts predict this could be the biggest shift in the industry since the internet.',
    // Updated Image URL
    imageUrl: 'https://images.unsplash.com/photo-1611974765270-ca12586343bb?q=80&w=1000&auto=format&fit=crop', 
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-robotic-arm-working-on-a-circuit-board-42996-large.mp4',
    source: 'TechCrunch',
    category: 'Technology',
    aiEnhanced: true,
    timeAgo: '2h ago',
    likes: '4.5k',
    comments: '342',
    tags: ['Tech', 'AI', 'Stocks'],
    aiSummary: "A historic alliance between major tech firms has standardized AI safety protocols, triggering a massive market rally. This partnership aims to accelerate AGI development while mitigating risks.",
    keyPoints: [
        "Unified AI Safety Framework established.",
        "NASDAQ and S&P 500 hit all-time highs.",
        "Regulatory bodies express cautious optimism."
    ],
    factCheck: { status: 'Verified', score: 98 },
    location: { name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194 },
    relatedNews: [
        { id: 'r1', title: 'EU AI Act enters final stages', image: 'https://picsum.photos/seed/tech1/150/150', time: '1h ago' },
        { id: 'r2', title: 'Semiconductor stocks surge', image: 'https://picsum.photos/seed/tech2/150/150', time: '3h ago' },
        { id: 'r3', title: 'Opinion: The future of work', image: 'https://picsum.photos/seed/tech3/150/150', time: '5h ago' }
    ],
    personalizationReason: "Because you read Tech"
  },
  {
    id: '2',
    title: 'SpaceX Successfully Launches Starship on Historic Mars Mission Test',
    description: 'The massive rocket cleared the tower and successfully separated its booster, marking a major milestone for interplanetary travel. Elon Musk declares "Mars awaits".',
    imageUrl: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=1000&auto=format&fit=crop',
    source: 'SpaceNews',
    category: 'Space',
    aiEnhanced: false,
    timeAgo: '5h ago',
    likes: '12k',
    comments: '1.2k',
    tags: ['Space', 'Mars', 'Rocket'],
    aiSummary: "SpaceX's Starship has successfully completed its orbital test flight, demonstrating key technologies required for Mars colonization. The booster separation was nominal.",
    keyPoints: [
        "Successful orbital insertion achieved.",
        "Booster separation confirmed.",
        "Next launch window opens in 3 months."
    ],
    factCheck: { status: 'Verified', score: 95 },
    location: { name: 'Boca Chica, TX', lat: 25.9973, lng: -97.1560 },
    relatedNews: [
        { id: 'r4', title: 'NASA congratulates SpaceX', image: 'https://picsum.photos/seed/space1/150/150', time: '30m ago' },
        { id: 'r5', title: 'Mars colonization timeline', image: 'https://picsum.photos/seed/space2/150/150', time: '6h ago' }
    ],
    personalizationReason: "Trending Worldwide"
  },
  {
    id: '3',
    title: 'New Renewable Energy Tech Promises Cleaner Future',
    description: 'A breakthrough in solar panel efficiency could revolutionize how cities power themselves, reducing reliance on fossil fuels significantly by 2030.',
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1000&auto=format&fit=crop',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-solar-panel-forest-42805-large.mp4',
    source: 'GreenDaily',
    category: 'Environment',
    aiEnhanced: true,
    timeAgo: '1d ago',
    likes: '8.9k',
    comments: '890',
    tags: ['Solar', 'Green', 'Energy'],
    aiSummary: "Researchers have unlocked a new photovoltaic cell design that captures 40% more sunlight, making solar energy cheaper than coal in 90% of the world.",
    keyPoints: [
        "40% efficiency increase.",
        "Cheaper manufacturing costs.",
        "Scalable for urban environments."
    ],
    factCheck: { status: 'Reviewing', score: 75 },
    relatedNews: [
        { id: 'r6', title: 'Tesla stock analysis', image: 'https://picsum.photos/seed/green1/150/150', time: '1d ago' },
        { id: 'r7', title: 'Lithium mining impact', image: 'https://picsum.photos/seed/green2/150/150', time: '2d ago' }
    ],
    personalizationReason: "Popular in Science"
  }
];

const ReelPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoaded, markAsLoaded } = useLoading();
  const [reels, setReels] = useState(INITIAL_REELS);
  const [activeReelId, setActiveReelId] = useState<string>(INITIAL_REELS[0].id);
  const [isAutoScroll, setIsAutoScroll] = useState(false);
  const [isLoading, setIsLoading] = useState(!isLoaded('reel'));
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hasRestoredPosition, setHasRestoredPosition] = useState(false);

  // 1. Initial Load Simulation
  useEffect(() => {
      if (isLoading) {
          const timer = setTimeout(() => {
              setIsLoading(false);
              markAsLoaded('reel');
              
              // Only show hint to new users
              const hintShown = localStorage.getItem('swipe_hint_shown');
              if (!hintShown) {
                  setShowHint(true);
                  localStorage.setItem('swipe_hint_shown', 'true');
              }
          }, 1500);
          return () => clearTimeout(timer);
      }
  }, [isLoading, markAsLoaded]);

  // 2. Restore Scroll Position
  useEffect(() => {
      if (!isLoading && !hasRestoredPosition) {
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
  }, [isLoading, hasRestoredPosition]);

  // 3. Preload & Infinite Scroll Logic
  useEffect(() => {
    if (!isLoading && activeReelId) {
        // Save state
        sessionStorage.setItem('news-reel-last-id', activeReelId);

        // Find index
        const currentIndex = reels.findIndex(r => r.id === activeReelId);
        
        // Preload next images
        const nextReels = reels.slice(currentIndex + 1, currentIndex + 3);
        nextReels.forEach(reel => {
            const img = new Image();
            img.src = reel.imageUrl;
        });

        // Trigger Infinite Fetch
        if (currentIndex >= reels.length - 2 && !isFetchingMore) {
            fetchMoreReels();
        }
    }
  }, [activeReelId, isLoading, reels, isFetchingMore]);

  // 4. Data Fetching
  const fetchMoreReels = useCallback(() => {
      setIsFetchingMore(true);
      setTimeout(() => {
          const newReels = INITIAL_REELS.map(r => ({
              ...r,
              id: `${r.id}-${Date.now()}-${Math.random()}`,
              title: `${r.title} (Updated Feed)`,
              imageUrl: `https://picsum.photos/seed/${Date.now() + Math.random()}/1000/1500` // New image for each fetch
          }));
          
          setReels(prev => [...prev, ...newReels]);
          setIsFetchingMore(false);
      }, 1500);
  }, [reels.length]);

  // 5. Intersection Observer
  useEffect(() => {
    if (isLoading) return;

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
  }, [reels, isLoading]);

  const handleNext = () => {
    const currentIndex = reels.findIndex(r => r.id === activeReelId);
    if (currentIndex < reels.length - 1) {
        const nextId = reels[currentIndex + 1].id;
        const element = document.getElementById(`reel-${nextId}`);
        element?.scrollIntoView({ behavior: 'smooth' });
    } else {
        setIsAutoScroll(false); 
    }
  };

  if (isLoading) {
      return <SmartLoader type="reel" />;
  }

  return (
    <div className="h-full w-full bg-black relative">
      
      {showHint && activeReelId === reels[0].id && <SwipeHint />}

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
                Auto-Scroll
             </button>
         </div>
      </div>

      <ReelContainer>
        {reels.map((reel) => (
          <div key={reel.id} id={`reel-${reel.id}`} data-id={reel.id} className="reel-item h-full w-full snap-start">
             <ReelItem 
                data={reel} 
                isActive={activeReelId === reel.id} 
                isAutoScroll={isAutoScroll}
                onFinished={handleNext}
             />
          </div>
        ))}
        
        <div className="h-48 w-full snap-start flex items-center justify-center bg-black text-white">
            <div className="text-center p-4">
                <Loader2 size={32} className="mx-auto mb-2 animate-spin text-blue-500" />
                <span className="text-xs font-medium text-gray-400">Fetching more stories...</span>
            </div>
        </div>
      </ReelContainer>
    </div>
  );
};

export default ReelPage;