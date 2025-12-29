
import React from 'react';
import { PlayCircle, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HistoryItem } from '../../context/HistoryContext';

interface ContinueReadingCardProps {
  item: HistoryItem;
}

const ContinueReadingCard: React.FC<ContinueReadingCardProps> = ({ item }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (item.type === 'article') {
      navigate(`/news/${item.id}?resume=true`);
    } else if (item.type === 'reel') {
      navigate(`/reel`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="mb-6 mx-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-indigo-100 dark:border-indigo-900/30 relative overflow-hidden group cursor-pointer animate-in slide-in-from-top-4 duration-500"
    >
      {/* Progress Bar Background */}
      <div className="absolute bottom-0 left-0 h-1 bg-gray-100 dark:bg-gray-700 w-full">
        <div 
            className="h-full bg-indigo-500 transition-all duration-1000 ease-out" 
            style={{ width: `${item.progress}%` }}
        ></div>
      </div>

      <div className="flex items-start justify-between relative z-10">
        <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                {item.type === 'reel' ? <PlayCircle size={20} className="text-indigo-600 dark:text-indigo-400" /> : <BookOpen size={20} className="text-indigo-600 dark:text-indigo-400" />}
            </div>
            <div>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1 block">Continue Reading</span>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight line-clamp-1">{item.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={10} /> Left off {Math.round(item.progress)}% through
                </p>
            </div>
        </div>
        
        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <ArrowRight size={16} />
        </div>
      </div>
    </div>
  );
};

export default ContinueReadingCard;
