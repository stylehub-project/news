import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, Zap, Volume2, VolumeX, PlayCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReelContainer from '../../components/reel/ReelContainer';
import ReelItem from '../../components/reel/ReelItem';
import SmartLoader from '../../components/loaders/SmartLoader';
import SwipeHint from '../../components/reel/SwipeHint';
import { useLoading } from '../../context/LoadingContext';

// Base Mock Data
const INITIAL_REELS = [
  {
    id: '1',
    title: 'Global Markets Rally as Tech Giants Announce New AI Partnership',
    description: 'Major tech companies have agreed on a unified framework for AI development, causing stock markets to surge globally. Analysts predict this could be the biggest shift in the industry since the internet.',
    imageUrl: 'https://images.unsplash.com/photo-1611974765270-ca1258634369?q=80&w=1000&auto=format&fit=crop',
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
        { id: 'r1', title: 'EU AI Act enters final stages', image: 'https://picsum.photos/150/150?random=1', time: '1h ago' },
        { id: 'r2', title: 'Semiconductor stocks surge', image: 'https://picsum.photos/150/150?random=2', time: '3h ago' },
        { id: 'r3', title: 'Opinion: The future of work', image: 'https://picsum.photos/150/150?random=3', time: '5h ago' }
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
        { id: 'r4', title: 'NASA congratulates SpaceX', image: 'https://picsum.photos/150/150?random=4', time: '30m ago' },
        { id: 'r5', title: 'Mars colonization timeline', image: 'https://picsum.photos/150/150?random=5', time: '6h ago' }
    ],
    personalizationReason: "Trending Worldwide"
  },
  {
    id: '3',
    title: 'New Electric Vehicle Battery Tech Promises 1000km Range',
    description: 'A breakthrough in solid-state battery technology could double the range of current EVs and reduce charging time to just 10 minutes.',
    imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=1000&auto=format&fit=crop',
    source: 'GreenDaily',
    category: 'Environment',
    aiEnhanced: true,
    timeAgo: '1d ago',
    likes: '8.9k',
    comments: '890',
    tags: ['EV', 'Battery', 'Green'],
    aiSummary: "Researchers have unlocked a solid-state electrolyte formula that remains stable at high temperatures, enabling EV batteries to charge faster and last longer.",
    keyPoints: [
        "1000km range on a single charge.",
        "10-minute fast charging capability.",
        "Commercial production expected by 2026."
    ],
    factCheck: { status: 'Reviewing', score: 75 },
    relatedNews: [
        { id: 'r6', title: 'Tesla stock analysis', image: 'https://picsum.photos/150/150?random=6', time: '1d ago' },
        { id: 'r7', title: 'Lithium mining impact', image: 'https://picsum.photos/150/150?random=7', time: '2d ago' }
    ],
    personalizationReason: "Popular in Science"
  },
  {
    id: '4',
    title: 'Digital Art Sold for Record $50 Million at NFT Auction',
    description: 'The digital masterpiece titled "The Future is Now" has shattered records, reigniting the debate about the value of digital assets.',
    imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop',
    source: 'ArtWorld',
    category: 'Culture',
    aiEnhanced: false,
    timeAgo: '2d ago',
    likes: '2.1k',
    comments: '150',
    tags: ['NFT', 'Art', 'Crypto'],
    aiSummary: "A digital artwork has set a new auction record, validating the high-end NFT market despite recent volatility. The piece explores themes of transhumanism.",
    keyPoints: [
        "Sold for $50M at Christie's.",
        "Artist remains anonymous.",
        "Crypto market sees slight bump."
    ],
    factCheck: { status: 'Verified', score: 99 },
    location: { name: 'New York, NY', lat: 40.7128, lng: -74.0060 },
    relatedNews: [
        { id: 'r8', title: 'Crypto regulation updates', image: 'https://picsum.photos/150/150?random=8', time: '2d ago' }
    ],
    personalizationReason: "Nearby Event"
  }
];

const ReelPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoaded, markAsLoaded } = useLoading();
  const [reels, setReels] = useState(INITIAL_REELS);
  const [activeReelId, setActiveReelId] = useState<string>(INITIAL_REELS[0].id);
  const [isAutoScroll, setIsAutoScroll] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(!isLoaded('reel'));
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [hasRestoredPosition, setHasRestoredPosition] = useState(false);

  // 1. Initial Load Simulation
  useEffect(() => {
      if (isLoading) {
          const timer = setTimeout(() => {
              setIsLoading(false);
              markAsLoaded('reel');
          }, 1500);
          return () => clearTimeout(timer);
      }
  }, [isLoading, markAsLoaded]);

  // 2. Restore Scroll Position (6.9 Requirement)
  useEffect(() => {
      if (!isLoading && !hasRestoredPosition) {
          const lastId = sessionStorage.getItem('news-reel-last-id');
          if (lastId) {
              const element = document.getElementById(`reel-${lastId}`);
              if (element) {
                  element.scrollIntoView({ behavior: 'auto' }); // Instant jump on load
                  setActiveReelId(lastId);
              }
          }
          setHasRestoredPosition(true);
      }
  }, [isLoading, hasRestoredPosition]);

  // 3. Preload Next Images & Haptics Logic
  useEffect(() => {
    if (!isLoading && activeReelId) {
        // Save current position
        sessionStorage.setItem('news-reel-last-id', activeReelId);

        // Find current index
        const currentIndex = reels.findIndex(r => r.id === activeReelId);
        
        // Preload next 2 images
        const nextReels = reels.slice(currentIndex + 1, currentIndex + 3);
        nextReels.forEach(reel => {
            const img = new Image();
            img.src = reel.imageUrl;
        });

        // Trigger Haptic
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(15);
        }

        // Infinite Scroll Trigger (Load more when 2 away from end)
        if (currentIndex >= reels.length - 2 && !isFetchingMore) {
            fetchMoreReels();
        }
    }
  }, [activeReelId, isLoading, reels, isFetchingMore]);

  // 4. Infinite Fetch Logic (6.9 Data Fetch Prompt)
  const fetchMoreReels = useCallback(() => {
      setIsFetchingMore(true);
      // Simulate API delay
      setTimeout(() => {
          const newReels = INITIAL_REELS.map(r => ({
              ...r,
              id: `${r.id}-${Date.now()}-${Math.random()}`, // Ensure unique IDs
              title: `${r.title} (Page ${Math.floor(reels.length / 4) + 1})` // Mock variation
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
                if (id !== INITIAL_REELS[0].id) setShowHint(false);
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
        // At actual end, stop autoscroll until fetch finishes
        setIsAutoScroll(false); 
    }
  };

  if (isLoading) {
      return <SmartLoader type="reel" />;
  }

  return (
    <div className="h-full w-full bg-black relative">
      
      {showHint && activeReelId === INITIAL_REELS[0].id && <SwipeHint />}

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

             <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 bg-black/30 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/10"
                aria-label={isMuted ? "Unmute" : "Mute"}
             >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
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
                isMuted={isMuted}
                onFinished={handleNext}
             />
          </div>
        ))}
        
        {/* Infinite Loading Indicator */}
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