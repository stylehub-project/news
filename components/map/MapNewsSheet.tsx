
import React, { useState, useEffect } from 'react';
import Sheet from '../ui/Sheet';
import { ArrowRight, Sparkles, Smartphone, Clock, Globe, BrainCircuit, Volume2, Pause, FileText, Bookmark, Thermometer, Wind, Droplets, Gauge } from 'lucide-react';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { useBookmark } from '../../context/BookmarkContext';
import Toast from '../ui/Toast';

interface MapNewsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    id: string;
    title: string;
    description?: string;
    source?: string;
    time?: string;
    imageUrl?: string;
    type: string;
    locationName?: string;
    category?: string;
    temp?: string;
    wind?: string;
    humidity?: string;
    precip?: string;
  } | null;
}

const MapNewsSheet: React.FC<MapNewsSheetProps> = ({ isOpen, onClose, data }) => {
  const navigate = useNavigate();
  const { toggleBookmark, isBookmarked } = useBookmark();
  const [tab, setTab] = useState<'overview' | 'ai'>('overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Reset state on close or data change
  useEffect(() => {
      if (!isOpen) {
          setIsPlaying(false);
          window.speechSynthesis.cancel();
          setShowToast(false);
      }
  }, [isOpen, data]);

  if (!data) return null;

  const isSaved = isBookmarked(data.id);

  const handlePlayAudio = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isPlaying) {
          window.speechSynthesis.cancel();
          setIsPlaying(false);
      } else {
          const text = `${data.title}. ${data.description || ''}. Current temperature is ${data.temp || 'unavailable'}.`;
          const u = new SpeechSynthesisUtterance(text);
          u.onend = () => setIsPlaying(false);
          window.speechSynthesis.speak(u);
          setIsPlaying(true);
      }
  };

  const handleSave = () => {
      toggleBookmark({
          id: data.id,
          title: data.title,
          description: data.description,
          source: data.source || 'Map Feed',
          imageUrl: data.imageUrl || '',
          timeAgo: data.time || 'Today',
          category: data.category || 'World',
      });
      setShowToast(true);
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={tab === 'ai' ? "AI Analysis" : "Weather Brief"}>
      {showToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-max">
              <Toast type="success" message={isSaved ? "Saved to Library" : "Removed"} onClose={() => setShowToast(false)} />
          </div>
      )}

      <div className="flex flex-col gap-4 pb-6">
        
        {/* Tab Switcher */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-1">
            <button 
                onClick={() => setTab('overview')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tab === 'overview' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
            >
                Forecast
            </button>
            <button 
                onClick={() => setTab('ai')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${tab === 'ai' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
            >
                <Sparkles size={12} /> Impact
            </button>
        </div>

        {tab === 'overview' ? (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                {/* Header Image with Overlay Actions */}
                <div className="relative h-40 w-full rounded-xl overflow-hidden shrink-0 mb-4 group bg-gray-900">
                    {/* Placeholder Weather Gradient if no image */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-black"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <Thermometer size={64} className="text-white" />
                    </div>
                    
                    {/* Floating Play Button */}
                    <button 
                        onClick={handlePlayAudio}
                        className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all active:scale-95 shadow-lg"
                    >
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Volume2 size={20} />}
                    </button>

                    <div className="absolute top-2 left-2 flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold text-white uppercase shadow-sm ${
                            data.type === 'severe' ? 'bg-red-600' :
                            data.type === 'warning' ? 'bg-orange-500' :
                            'bg-blue-600'
                        }`}>
                            {data.type}
                        </span>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                        <h2 className="text-2xl font-black leading-none drop-shadow-md">{data.title}</h2>
                        <div className="flex items-center gap-1 text-xs opacity-90 font-bold mt-1">
                            <Globe size={10} /> {data.locationName || "Global"}
                        </div>
                    </div>
                </div>

                {/* Weather Grid */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-xl border border-blue-100 dark:border-blue-900/50 flex flex-col items-center">
                        <Thermometer size={16} className="text-blue-600 dark:text-blue-400 mb-1" />
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Temp</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{data.temp || '--'}</span>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex flex-col items-center">
                        <Wind size={16} className="text-indigo-600 dark:text-indigo-400 mb-1" />
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Wind</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{data.wind || '--'}</span>
                    </div>
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 p-2 rounded-xl border border-cyan-100 dark:border-cyan-900/50 flex flex-col items-center">
                        <Droplets size={16} className="text-cyan-600 dark:text-cyan-400 mb-1" />
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Rain</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{data.precip || '0%'}</span>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-xl border border-purple-100 dark:border-purple-900/50 flex flex-col items-center">
                        <Gauge size={16} className="text-purple-600 dark:text-purple-400 mb-1" />
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Humid</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{data.humidity || '--'}</span>
                    </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed mb-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                    {data.description || "Conditions are developing. Monitor local alerts for real-time updates."}
                </p>
            </div>
        ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl relative overflow-hidden">
                    <BrainCircuit size={64} className="absolute -right-4 -bottom-4 text-indigo-200 dark:text-indigo-800 opacity-50" />
                    <h3 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-2">Pattern Recognition</h3>
                    <p className="text-sm text-indigo-900 dark:text-indigo-100 font-medium leading-relaxed">
                        This weather system in <span className="font-bold">{data.locationName}</span> follows a trajectory similar to the 2019 event. Expect higher than average precipitation in the next 48h.
                    </p>
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-600 dark:text-gray-400">
                        <span>Severity Index</span>
                        <span className="text-red-500">High Impact</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full w-[75%] animate-pulse"></div>
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
                Detailed Forecast
            </Button>
            
            <Button 
                variant="secondary" 
                onClick={() => navigate(`/ai-chat?context=weather&headline=${encodeURIComponent(data.title)}`)}
                className="text-indigo-600 border-indigo-100 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300"
                leftIcon={<Sparkles size={16} />}
            >
                AI Prediction
            </Button>

            <Button 
                variant="secondary" 
                onClick={() => navigate('/reel')}
                className="text-pink-600 border-pink-100 bg-pink-50 hover:bg-pink-100 dark:bg-pink-900/30 dark:border-pink-800 dark:text-pink-300"
                leftIcon={<Smartphone size={16} />}
            >
                View Reel
            </Button>
        </div>
      </div>
    </Sheet>
  );
};

export default MapNewsSheet;
