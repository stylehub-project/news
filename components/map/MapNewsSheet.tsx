
import React, { useState, useEffect } from 'react';
import Sheet from '../ui/Sheet';
import { ArrowRight, Sparkles, Smartphone, Clock, Globe, BrainCircuit, Volume2, Pause, FileText } from 'lucide-react';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface MapNewsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    id: string;
    title: string;
    description?: string;
    source: string;
    time: string;
    imageUrl?: string;
    type: string;
    locationName?: string;
  } | null;
}

const MapNewsSheet: React.FC<MapNewsSheetProps> = ({ isOpen, onClose, data }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'overview' | 'ai'>('overview');
  const [isPlaying, setIsPlaying] = useState(false);

  // Reset state on close or data change
  useEffect(() => {
      if (!isOpen) {
          setIsPlaying(false);
          window.speechSynthesis.cancel();
      }
  }, [isOpen, data]);

  if (!data) return null;

  const handlePlayAudio = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isPlaying) {
          window.speechSynthesis.cancel();
          setIsPlaying(false);
      } else {
          const text = `${data.title}. ${data.description || ''}`;
          const u = new SpeechSynthesisUtterance(text);
          u.onend = () => setIsPlaying(false);
          window.speechSynthesis.speak(u);
          setIsPlaying(true);
      }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={tab === 'ai' ? "AI Analysis" : "Intel Brief"}>
      <div className="flex flex-col gap-4 pb-6">
        
        {/* Tab Switcher */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-1">
            <button 
                onClick={() => setTab('overview')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tab === 'overview' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
            >
                Overview
            </button>
            <button 
                onClick={() => setTab('ai')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${tab === 'ai' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
            >
                <Sparkles size={12} /> Why Trending?
            </button>
        </div>

        {tab === 'overview' ? (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                {/* Header Image with Overlay Actions */}
                <div className="relative h-48 w-full rounded-xl overflow-hidden shrink-0 mb-4 group">
                    <img 
                        src={data.imageUrl || "https://picsum.photos/600/400"} 
                        alt={data.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    
                    {/* Floating Play Button */}
                    <button 
                        onClick={handlePlayAudio}
                        className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all active:scale-95 shadow-lg"
                    >
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Volume2 size={20} />}
                    </button>

                    <div className="absolute top-2 right-2 flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold text-white uppercase shadow-sm ${
                            data.type === 'breaking' ? 'bg-red-600' :
                            data.type === 'trending' ? 'bg-yellow-500' :
                            'bg-blue-600'
                        }`}>
                            {data.type}
                        </span>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white text-[10px] font-bold flex items-center gap-1 bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                        <Globe size={10} /> {data.locationName || "Global"}
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400 text-xs">
                    <span className="font-bold text-gray-800 dark:text-gray-200">{data.source}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {data.time}</span>
                </div>
                
                <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight mb-3">
                    {data.title}
                </h2>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed mb-4">
                    {data.description || "Detailed analysis of this event is available. Tap 'AI Explain' for a deep dive or 'Read Full' for the source article."}
                </p>
            </div>
        ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl relative overflow-hidden">
                    <BrainCircuit size={64} className="absolute -right-4 -bottom-4 text-indigo-200 dark:text-indigo-800 opacity-50" />
                    <h3 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-2">Contextual Insight</h3>
                    <p className="text-sm text-indigo-900 dark:text-indigo-100 font-medium leading-relaxed">
                        This story is trending in <span className="font-bold">{data.locationName}</span> due to significantly higher engagement than usual. The semantic tone suggests {data.type === 'breaking' ? 'urgency and high impact' : 'growing public interest'}.
                    </p>
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-600 dark:text-gray-400">
                        <span>Regional Heat</span>
                        <span className="text-red-500">High Activity</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full w-[85%] animate-pulse"></div>
                    </div>
                </div>
            </div>
        )}

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
            <Button 
                variant="primary" 
                onClick={() => navigate(`/news/${data.id}`)}
                className="col-span-2 bg-gray-900 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200"
                rightIcon={<ArrowRight size={16} />}
            >
                Read Full Article
            </Button>
            
            <Button 
                variant="secondary" 
                onClick={() => navigate(`/ai-chat?context=article&headline=${encodeURIComponent(data.title)}`)}
                className="text-indigo-600 border-indigo-100 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300"
                leftIcon={<Sparkles size={16} />}
            >
                Explain with AI
            </Button>

            <Button 
                variant="secondary" 
                onClick={() => navigate('/reel')}
                className="text-pink-600 border-pink-100 bg-pink-50 hover:bg-pink-100 dark:bg-pink-900/30 dark:border-pink-800 dark:text-pink-300"
                leftIcon={<Smartphone size={16} />}
            >
                Open in Reel
            </Button>
        </div>
      </div>
    </Sheet>
  );
};

export default MapNewsSheet;
