
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
    ArrowRight,
    Filter,
    Globe, Cpu, Landmark, Briefcase, Trophy, FlaskConical, Wifi, WifiOff, RefreshCw, Sun, Moon, Coffee, Sunrise
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NewsCardBasic from '../../components/cards/NewsCardBasic';
import SmartLoader from '../../components/loaders/SmartLoader';
import ContinueReadingCard from '../../components/cards/ContinueReadingCard';
import { useLoading } from '../../context/LoadingContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNetwork } from '../../context/NetworkContext';
import { useHistory } from '../../context/HistoryContext';
import { translations } from '../../utils/translations';
import { fetchNewsFeed } from '../../utils/aiService';

import CinematicFeed from '../../components/feed/CinematicFeed';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoaded, markAsLoaded } = useLoading();
  const { isOnline, lastSyncTime } = useNetwork();
  const { getLastActive, getRecommendations, getTimeContext } = useHistory();
  
  // Only show full loading screen if Home hasn't been loaded in this session yet
  const [isLoading, setIsLoading] = useState(!isLoaded('home'));
  const [articles, setArticles] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  
  const { appLanguage, contentLanguage } = useLanguage();
  const t = translations[appLanguage];

  // Initial Load
  const loadContent = async (showLoader = false) => {
        if (showLoader) setIsLoading(true);
        const langName = contentLanguage === 'hi' ? 'Hindi' : 'English';
        
        // Main Feed
        const initialNews = await fetchNewsFeed(1, { 
          category: activeCategory === 'All' ? 'All' : activeCategory, 
          sort: 'Latest', 
          language: langName 
        });
        
        const processedNews = initialNews.map((n: any, idx: number) => ({
            ...n,
            type: idx === 0 ? 'hero' : (idx % 4 === 0 ? 'update' : 'article'),
            isCached: !navigator.onLine
        }));
        setArticles(processedNews);

        if (showLoader) {
            setTimeout(() => {
                setIsLoading(false);
                markAsLoaded('home');
            }, 800);
        }
  };

  useEffect(() => {
    loadContent(!isLoaded('home'));
  }, [contentLanguage, activeCategory]); 

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  if (isLoading) {
      return <SmartLoader type="home" />;
  }

  return (
    <div className="h-full bg-black">
      <CinematicFeed 
        items={articles} 
        isLoading={isFetchingMore} 
        onCategoryChange={handleCategoryChange}
      />
    </div>
  );
};

export default HomePage;
