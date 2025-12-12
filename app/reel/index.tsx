import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Zap, Volume2, VolumeX, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReelContainer from '../../components/reel/ReelContainer';
import ReelItem from '../../components/reel/ReelItem';

const MOCK_REELS = [
  {
    id: '1',
    title: 'Global Markets Rally as Tech Giants Announce New AI Partnership',
    description: 'Major tech companies have agreed on a unified framework for AI development, causing stock markets to surge globally. Analysts predict this could be the biggest shift in the industry since the internet.',
    imageUrl: 'https://images.unsplash.com/photo-1611974765270-ca1258634369?q=80&w=1000&auto=format&fit=crop',
    source: 'TechCrunch',
    timeAgo: '2h ago',
    likes: '4.5k',
    comments: '342',
    tags: ['Tech', 'AI', 'Stocks']
  },
  {
    id: '2',
    title: 'SpaceX Successfully Launches Starship on Historic Mars Mission Test',
    description: 'The massive rocket cleared the tower and successfully separated its booster, marking a major milestone for interplanetary travel. Elon Musk declares "Mars awaits".',
    imageUrl: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=1000&auto=format&fit=crop',
    source: 'SpaceNews',
    timeAgo: '5h ago',
    likes: '12k',
    comments: '1.2k',
    tags: ['Space', 'Mars', 'Future']
  },
  {
    id: '3',
    title: 'New Electric Vehicle Battery Tech Promises 1000km Range',
    description: 'A breakthrough in solid-state battery technology could double the range of current EVs and reduce charging time to just 10 minutes.',
    imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=1000&auto=format&fit=crop',
    source: 'GreenDaily',
    timeAgo: '1d ago',
    likes: '8.9k',
    comments: '890',
    tags: ['EV', 'Green', 'Tech']
  },
  {
    id: '4',
    title: 'Digital Art Sold for Record $50 Million at NFT Auction',
    description: 'The digital masterpiece titled "The Future is Now" has shattered records, reigniting the debate about the value of digital assets.',
    imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop',
    source: 'ArtWorld',
    timeAgo: '2d ago',
    likes: '2.1k',
    comments: '150',
    tags: ['Crypto', 'NFT', 'Art']
  }
];

const ReelPage: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeReelId, setActiveReelId] = useState<string>(MOCK_REELS[0].id);
  const [isAutoScroll, setIsAutoScroll] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Intersection Observer to detect active reel
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-id');
            if (id) setActiveReelId(id);
          }
        });
      },
      { threshold: 0.6 } // 60% of item must be visible
    );

    const elements = document.querySelectorAll('.reel-item');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [MOCK_REELS]);

  const handleNext = () => {
    const currentIndex = MOCK_REELS.findIndex(r => r.id === activeReelId);
    if (currentIndex < MOCK_REELS.length - 1) {
        const nextId = MOCK_REELS[currentIndex + 1].id;
        const element = document.getElementById(`reel-${nextId}`);
        element?.scrollIntoView({ behavior: 'smooth' });
    } else {
        setIsAutoScroll(false); // Stop at end
    }
  };

  return (
    <div className="h-full w-full bg-black relative">
      {/* Top Header Overlay */}
      <div className="absolute top-0 left-0 w-full z-40 p-4 pt-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
         <button 
            onClick={() => navigate('/')} 
            className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
         >
            <ChevronLeft size={24} />
         </button>

         <div className="flex gap-3">
             <button 
                onClick={() => setIsAutoScroll(!isAutoScroll)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-bold transition-all ${
                    isAutoScroll 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-black/30 text-gray-300 border border-white/20'
                }`}
             >
                <PlayCircle size={14} className={isAutoScroll ? 'animate-pulse' : ''} />
                Auto-Scroll
             </button>

             <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 bg-black/30 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/10"
             >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
             </button>
         </div>
      </div>

      <ReelContainer>
        {MOCK_REELS.map((reel) => (
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
        
        {/* End of Feed */}
        <div className="h-full w-full snap-start flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center p-8">
                <Zap size={48} className="mx-auto mb-4 text-yellow-400" />
                <h2 className="text-2xl font-bold">You're all caught up!</h2>
                <button onClick={() => navigate('/')} className="mt-6 px-6 py-3 bg-white text-black font-bold rounded-full">
                    Return Home
                </button>
            </div>
        </div>
      </ReelContainer>
    </div>
  );
};

export default ReelPage;