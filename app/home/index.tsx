import React, { useState, useEffect } from 'react';
import { 
    PlayCircle, 
    Sparkles, 
    Newspaper, 
    Smartphone, 
    MessageSquare, 
    Map, 
    Bookmark, 
    Headphones, 
    Zap,
    Mic
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NewsCardBasic from '../../components/cards/NewsCardBasic';
import NewsSkeleton from '../../components/skeletons/NewsSkeleton';
import HighlightReadingMode from '../../components/HighlightReadingMode';

// Mock Data for Infinite Feed
const MOCK_NEWS = [
    {
        id: '1',
        title: "SpaceX Starship Successfully Reaches Orbit in Historic Test Flight",
        description: "The massive rocket cleared the tower and successfully completed its primary mission objectives, marking a new era for space exploration.",
        imageUrl: "https://picsum.photos/600/400?random=101",
        source: "SpaceNews",
        timeAgo: "20m ago",
        category: "Technology"
    },
    {
        id: '2',
        title: "Global Climate Summit Ends with Historic Agreement on Emissions",
        description: "World leaders have agreed to a legally binding treaty to reduce carbon emissions by 40% by 2030.",
        imageUrl: "https://picsum.photos/600/400?random=102",
        source: "The Guardian",
        timeAgo: "1h ago",
        category: "World"
    },
    {
        id: '3',
        title: "Apple Announces Revolutionary AI Integration in Next iOS Update",
        description: "The tech giant revealed 'Apple Intelligence', a deep integration of generative AI across all Apple devices.",
        imageUrl: "https://picsum.photos/600/400?random=103",
        source: "The Verge",
        timeAgo: "2h ago",
        category: "Tech"
    },
    {
        id: '4',
        title: "Championship Finals: Underdog Team Secures Victory in Overtime",
        description: "In a stunning upset, the city's beloved underdogs defeated the defending champions 3-2.",
        imageUrl: "https://picsum.photos/600/400?random=104",
        source: "ESPN",
        timeAgo: "3h ago",
        category: "Sports"
    }
];

const FEATURES = [
    { label: 'AI Analysis', icon: Sparkles, color: 'bg-indigo-100 text-indigo-600', path: '/ai-chat' },
    { label: 'Headlines', icon: Zap, color: 'bg-yellow-100 text-yellow-600', path: '/top-stories' },
    { label: 'Reels', icon: Smartphone, color: 'bg-pink-100 text-pink-600', path: '/reel' },
    { label: 'Chatbot', icon: MessageSquare, color: 'bg-blue-100 text-blue-600', path: '/ai-chat' },
    { label: 'Newspaper', icon: Newspaper, color: 'bg-gray-100 text-gray-800', path: '/newspaper' },
    { label: 'Map News', icon: Map, color: 'bg-emerald-100 text-emerald-600', path: '/map' },
    { label: 'Saved', icon: Bookmark, color: 'bg-orange-100 text-orange-600', path: '/bookmarks' },
    { label: 'Read Mode', icon: Headphones, color: 'bg-purple-100 text-purple-600', path: '/' }, // Toggle logic
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isReadingMode, setIsReadingMode] = useState(false);

  useEffect(() => {
    // Simulate initial data fetch
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleCardClick = (id: string) => {
      navigate(`/news/${id}`);
  };

  return (
    <div className="h-full overflow-y-auto pb-24 bg-gray-50">
      
      {/* 2.2 Hero Section */}
      <div className="p-4 pb-2">
         {isReadingMode ? (
             <HighlightReadingMode 
                text="Welcome to News Club. Today's top story: SpaceX Starship successfully reaches orbit in a historic test flight..." 
                onComplete={() => setIsReadingMode(false)}
             />
         ) : (
            <div className="relative w-full rounded-2xl overflow-hidden shadow-lg h-48 bg-gradient-to-br from-blue-600 to-indigo-900 text-white flex flex-col justify-between p-5">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 animate-pulse-slow"></div>

                <div className="relative z-10">
                    <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg uppercase tracking-wider">
                        Daily Briefing
                    </span>
                    <h1 className="text-2xl font-black mt-3 leading-tight drop-shadow-md">
                        Today's Highlights
                    </h1>
                </div>

                <div className="relative z-10 flex items-center justify-between">
                    <p className="text-sm text-blue-100 font-medium">4 Major Updates • 2 min read</p>
                    <button 
                        onClick={() => setIsReadingMode(true)}
                        className="flex items-center gap-2 bg-white text-blue-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-md active:scale-95 transition-transform"
                    >
                        <Mic size={14} /> Speak News
                    </button>
                </div>
            </div>
         )}
      </div>

      {/* 2.3 Feature Grid */}
      <div className="px-4 py-4">
          <div className="grid grid-cols-4 gap-y-4 gap-x-2">
             {FEATURES.map((feat, idx) => {
                 const Icon = feat.icon;
                 return (
                     <div key={idx} className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => navigate(feat.path)}>
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-active:scale-90 ${feat.color}`}>
                             <Icon size={22} />
                         </div>
                         <span className="text-[10px] font-medium text-gray-600 text-center leading-tight w-full truncate px-1">
                             {feat.label}
                         </span>
                     </div>
                 )
             })}
          </div>
      </div>

      {/* 2.4 Infinite News Feed */}
      <div className="px-4 mt-2">
        <div className="flex items-center justify-between mb-3">
             <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <PlayCircle size={18} className="text-red-500 fill-red-500" />
                Latest Feed
             </h2>
        </div>

        <div className="space-y-4">
            {isLoading ? (
                <>
                    <NewsSkeleton />
                    <NewsSkeleton />
                </>
            ) : (
                MOCK_NEWS.map((news) => (
                    <NewsCardBasic
                        key={news.id}
                        {...news}
                        onClick={handleCardClick}
                        onSave={() => console.log('Saved', news.id)}
                        onShare={() => console.log('Shared', news.id)}
                        onAIExplain={() => navigate('/ai-chat')}
                    />
                ))
            )}
            
            {/* Infinite Scroll Loader Mock */}
            {!isLoading && (
                <div className="py-6 flex justify-center opacity-50">
                     <div className="flex gap-1">
                         <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                         <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                         <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                     </div>
                </div>
            )}
        </div>
      </div>

    </div>
  );
};

export default HomePage;