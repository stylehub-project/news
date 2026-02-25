
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Sparkles, Zap, Clock, Share2, Bookmark, ArrowRight, Filter, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  timeAgo: string;
  category: string;
  imageUrl: string;
  type: 'article' | 'update' | 'hero';
}

interface CinematicFeedProps {
  items: NewsItem[];
  isLoading?: boolean;
  onCategoryChange?: (category: string) => void;
}

const CinematicFeed: React.FC<CinematicFeedProps> = ({ items, isLoading, onCategoryChange }) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const categories = ['All', 'Technology', 'Politics', 'Business', 'Sports', 'Science', 'World'];

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    if (onCategoryChange) onCategoryChange(cat);
  };

  const filteredItems = activeCategory === 'All' 
    ? items 
    : items.filter(item => item.category === activeCategory);

  return (
    <div className="w-full bg-black min-h-screen text-white overflow-hidden" ref={containerRef}>
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-indigo-500 origin-left z-[60]"
        style={{ scaleX }}
      />

      {/* Cinematic Header / Category Bar */}
      <div className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-black tracking-tighter flex items-center gap-2"
          >
            <Sparkles className="text-indigo-500" size={24} />
            NEWS <span className="text-indigo-500">CLUB</span>
          </motion.h2>
          <div className="flex gap-2">
            <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
              <Filter size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat, idx) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleCategoryClick(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                activeCategory === cat 
                ? 'bg-white text-black border-white' 
                : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Feed Content */}
      <div className="px-4 py-6 space-y-8">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, idx) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.6, 
                ease: [0.22, 1, 0.36, 1],
                delay: idx * 0.05
              }}
              className="relative group cursor-pointer"
              onClick={() => navigate(`/news/${item.id}`, { state: { article: item } })}
            >
              {item.type === 'hero' ? (
                <HeroCard item={item} />
              ) : item.type === 'update' ? (
                <UpdateCard item={item} />
              ) : (
                <ArticleCard item={item} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"
            />
            <p className="text-gray-500 font-bold text-xs tracking-widest uppercase">Syncing Intelligence</p>
          </div>
        )}
      </div>
    </div>
  );
};

const HeroCard = ({ item }: { item: NewsItem }) => (
  <div className="relative h-[500px] w-full rounded-[40px] overflow-hidden shadow-2xl group">
    <motion.img 
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.8 }}
      src={item.imageUrl} 
      alt={item.title} 
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
    
    <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
      <div className="flex items-center gap-3">
        <span className="px-3 py-1 rounded-full bg-indigo-600 text-[10px] font-black uppercase tracking-widest">
          {item.category}
        </span>
        <span className="text-xs text-white/60 font-medium flex items-center gap-1">
          <Clock size={12} /> {item.timeAgo}
        </span>
      </div>
      
      <h3 className="text-3xl md:text-4xl font-black leading-tight tracking-tighter">
        {item.title}
      </h3>
      
      <p className="text-white/70 text-sm line-clamp-2 font-medium leading-relaxed max-w-xl">
        {item.description}
      </p>
      
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
            <Zap size={16} className="text-yellow-400" />
          </div>
          <span className="text-xs font-bold text-white/80">{item.source}</span>
        </div>
        
        <div className="flex gap-3">
          <button className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all">
            <Bookmark size={18} />
          </button>
          <button className="p-3 rounded-full bg-white text-black hover:scale-110 transition-all">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ArticleCard = ({ item }: { item: NewsItem }) => (
  <div className="flex flex-col md:flex-row gap-6 bg-white/5 rounded-[32px] p-4 border border-white/5 hover:border-white/20 transition-all group">
    <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden shrink-0">
      <motion.img 
        whileHover={{ scale: 1.1 }}
        src={item.imageUrl} 
        alt={item.title} 
        className="w-full h-full object-cover"
      />
    </div>
    
    <div className="flex flex-col justify-between py-2 flex-1">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
            {item.category}
          </span>
          <span className="text-[10px] text-white/40 font-bold uppercase">
            {item.timeAgo}
          </span>
        </div>
        
        <h3 className="text-xl font-bold leading-tight group-hover:text-indigo-400 transition-colors">
          {item.title}
        </h3>
        
        <p className="text-white/50 text-xs line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <span className="text-[10px] font-bold text-white/60">{item.source}</span>
        <div className="flex gap-2">
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Share2 size={14} />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Bookmark size={14} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const UpdateCard = ({ item }: { item: NewsItem }) => (
  <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
      <Zap size={80} className="text-indigo-500" />
    </div>
    
    <div className="relative z-10 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Flash Update</span>
      </div>
      
      <h3 className="text-lg font-bold leading-snug">
        {item.title}
      </h3>
      
      <div className="flex items-center justify-between pt-2">
        <span className="text-[10px] font-bold text-white/40">{item.timeAgo} • {item.source}</span>
        <button className="text-indigo-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
          Details <ChevronRight size={12} />
        </button>
      </div>
    </div>
  </div>
);

export default CinematicFeed;
