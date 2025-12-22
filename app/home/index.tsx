import React, { useState, useEffect, useMemo } from 'react';
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
    Mic,
    MapPin,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NewsCardBasic from '../../components/cards/NewsCardBasic';
import HighlightReadingMode from '../../components/HighlightReadingMode';
import SmartLoader from '../../components/loaders/SmartLoader';
import { useLoading } from '../../context/LoadingContext';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../utils/translations';

// Mock Data for English
const MOCK_NEWS_EN = [
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

// Mock Data for Hindi
const MOCK_NEWS_HI = [
    {
        id: '1',
        title: "SpaceX स्टारशिप ने ऐतिहासिक परीक्षण उड़ान में सफलतापूर्वक कक्षा में प्रवेश किया",
        description: "विशाल रॉकेट ने टॉवर को साफ किया और अंतरिक्ष अन्वेषण के लिए एक नए युग को चिह्नित करते हुए अपने प्राथमिक मिशन उद्देश्यों को सफलतापूर्वक पूरा किया।",
        imageUrl: "https://picsum.photos/600/400?random=101",
        source: "स्पेस न्यूज़",
        timeAgo: "20 मिनट पहले",
        category: "प्रौद्योगिकी"
    },
    {
        id: '2',
        title: "ग्लोबल क्लाइमेट समिट उत्सर्जन पर ऐतिहासिक समझौते के साथ समाप्त हुआ",
        description: "विश्व के नेताओं ने 2030 तक कार्बन उत्सर्जन को 40% तक कम करने के लिए एक कानूनी रूप से बाध्यकारी संधि पर सहमति व्यक्त की है।",
        imageUrl: "https://picsum.photos/600/400?random=102",
        source: "द गार्डियन",
        timeAgo: "1 घंटा पहले",
        category: "दुनिया"
    },
    {
        id: '3',
        title: "Apple ने अगले iOS अपडेट में क्रांतिकारी AI एकीकरण की घोषणा की",
        description: "टेक दिग्गज ने 'ऐप्पल इंटेलिजेंस' का खुलासा किया, जो सभी ऐप्पल उपकरणों में जेनरेटिव एआई का गहरा एकीकरण है।",
        imageUrl: "https://picsum.photos/600/400?random=103",
        source: "द वर्ज",
        timeAgo: "2 घंटे पहले",
        category: "तकनीक"
    },
    {
        id: '4',
        title: "चैंपियनशिप फाइनल: अंडरडॉग टीम ने ओवरटाइम में जीत हासिल की",
        description: "एक चौंकाने वाले उलटफेर में, शहर के प्रिय अंडरडॉग ने गत चैंपियन को 3-2 से हराया।",
        imageUrl: "https://picsum.photos/600/400?random=104",
        source: "ईएसपीएन",
        timeAgo: "3 घंटे पहले",
        category: "खेल"
    }
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoaded, markAsLoaded } = useLoading();
  const [isLoading, setIsLoading] = useState(!isLoaded('home'));
  const [isReadingMode, setIsReadingMode] = useState(false);
  
  const { appLanguage, contentLanguage } = useLanguage();
  const t = translations[appLanguage];

  // Select news content based on Content Language setting
  const newsData = contentLanguage === 'hi' ? MOCK_NEWS_HI : MOCK_NEWS_EN;

  const FEATURES = useMemo(() => [
    { label: t.ai_analysis, icon: Sparkles, color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', path: '/ai-chat' },
    { label: t.headlines, icon: Zap, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', path: '/top-stories' },
    { label: t.reels, icon: Smartphone, color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', path: '/reel' },
    { label: t.chatbot, icon: MessageSquare, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', path: '/ai-chat' },
    { label: t.newspaper, icon: Newspaper, color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', path: '/newspaper' },
    { label: t.map_news, icon: Map, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', path: '/map' },
    { label: t.saved, icon: Bookmark, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', path: '/bookmarks' },
    { label: t.read_mode, icon: Headphones, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', path: '/' }, // Toggle logic
  ], [t]);

  useEffect(() => {
    if (isLoading) {
        const timer = setTimeout(() => {
            setIsLoading(false);
            markAsLoaded('home');
        }, 2500);
        return () => clearTimeout(timer);
    }
  }, [isLoading, markAsLoaded]);

  const handleCardClick = (id: string) => {
      navigate(`/news/${id}`);
  };

  const handleAIExplain = (id: string) => {
      const article = newsData.find(n => n.id === id);
      if (article) {
          navigate(`/ai-chat?context=article&headline=${encodeURIComponent(article.title)}&id=${id}`);
      }
  };

  if (isLoading) {
      return <SmartLoader type="home" />;
  }

  return (
    <div className="h-full overflow-y-auto pb-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Hero Section */}
      <div className="p-4 pb-2">
         {isReadingMode ? (
             <HighlightReadingMode 
                text={newsData[0].description} // Simplified for demo
                onComplete={() => setIsReadingMode(false)}
             />
         ) : (
            <div className="relative w-full rounded-2xl overflow-hidden shadow-lg h-48 bg-gradient-to-br from-blue-600 to-indigo-900 text-white flex flex-col justify-between p-5">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 animate-pulse-slow"></div>

                <div className="relative z-10">
                    <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg uppercase tracking-wider">
                        {t.daily_briefing}
                    </span>
                    <h1 className="text-2xl font-black mt-3 leading-tight drop-shadow-md">
                        {t.todays_highlights}
                    </h1>
                </div>

                <div className="relative z-10 flex items-center justify-between">
                    <p className="text-sm text-blue-100 font-medium">4 Updates • 2 min read</p>
                    <button 
                        onClick={() => setIsReadingMode(true)}
                        className="flex items-center gap-2 bg-white text-blue-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-md active:scale-95 transition-transform"
                    >
                        <Mic size={14} /> {t.speak_news}
                    </button>
                </div>
            </div>
         )}
      </div>

      {/* Feature Grid */}
      <div className="px-4 py-4">
          <div className="grid grid-cols-4 gap-y-4 gap-x-2">
             {FEATURES.map((feat, idx) => {
                 const Icon = feat.icon;
                 return (
                     <div key={idx} className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => navigate(feat.path)}>
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-active:scale-90 ${feat.color}`}>
                             <Icon size={22} />
                         </div>
                         <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 text-center leading-tight w-full truncate px-1">
                             {feat.label}
                         </span>
                     </div>
                 )
             })}
          </div>
      </div>

      {/* Map Entry Point */}
      <div className="px-4 mb-4">
          <div 
            onClick={() => navigate('/map')}
            className="w-full h-24 bg-gray-800 rounded-xl relative overflow-hidden flex items-center justify-between p-5 cursor-pointer shadow-sm group"
          >
              <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center invert filter"></div>
              <div className="relative z-10 text-white">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                      <MapPin size={18} className="text-red-500" /> {t.news_around_you}
                  </h3>
                  <p className="text-xs text-gray-300">{t.explore_map}</p>
              </div>
              <div className="relative z-10 bg-white/20 backdrop-blur-sm p-2 rounded-full group-hover:scale-110 transition-transform">
                  <ArrowRight size={20} className="text-white" />
              </div>
          </div>
      </div>

      {/* Infinite News Feed */}
      <div className="px-4 mt-2">
        <div className="flex items-center justify-between mb-3">
             <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <PlayCircle size={18} className="text-red-500 fill-red-500" />
                {t.latest_feed}
             </h2>
        </div>

        <div className="space-y-4">
            {newsData.map((news) => (
                <NewsCardBasic
                    key={news.id}
                    {...news}
                    onClick={handleCardClick}
                    onSave={() => console.log('Saved', news.id)}
                    onShare={() => console.log('Shared', news.id)}
                    onAIExplain={handleAIExplain}
                />
            ))}
            
            {/* Infinite Scroll Loader Mock */}
            <div className="py-6 flex justify-center opacity-50">
                    <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                    </div>
            </div>
        </div>
      </div>

    </div>
  );
};

export default HomePage;