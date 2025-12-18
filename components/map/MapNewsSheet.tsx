import React, { useState } from 'react';
import Sheet from '../ui/Sheet';
import { ArrowRight, Sparkles, Smartphone, Share2, Clock, Globe, BrainCircuit } from 'lucide-react';
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

  if (!data) return null;

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={tab === 'ai' ? "AI Analysis" : "Location Intel"}>
      <div className="flex flex-col gap-4 pb-6">
        
        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-1">
            <button 
                onClick={() => setTab('overview')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tab === 'overview' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
                Overview
            </button>
            <button 
                onClick={() => setTab('ai')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${tab === 'ai' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
            >
                <Sparkles size={12} /> Why Trending?
            </button>
        </div>

        {tab === 'overview' ? (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                {/* Header Image */}
                <div className="relative h-40 w-full rounded-xl overflow-hidden shrink-0 mb-4">
                    <img 
                        src={data.imageUrl || "https://picsum.photos/600/400"} 
                        alt={data.title} 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold text-white uppercase shadow-sm ${
                            data.type === 'breaking' ? 'bg-red-600' :
                            data.type === 'trending' ? 'bg-yellow-500' :
                            'bg-blue-600'
                        }`}>
                            {data.type}
                        </span>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-white text-[10px] font-bold flex items-center gap-1">
                        <Globe size={10} /> {data.locationName || "Global"}
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs">
                    <span className="font-bold text-gray-800">{data.source}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {data.time}</span>
                </div>
                <h2 className="text-lg font-black text-gray-900 leading-tight mb-2">{data.title}</h2>
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
                    {data.description || "Detailed analysis of this event is available. Tap below to read the full coverage."}
                </p>
            </div>
        ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl relative overflow-hidden">
                    <BrainCircuit size={64} className="absolute -right-4 -bottom-4 text-indigo-200 opacity-50" />
                    <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">Contextual Insight</h3>
                    <p className="text-sm text-indigo-900 font-medium leading-relaxed">
                        This story is trending in <span className="font-bold">{data.locationName}</span> due to recent policy changes affecting local markets. Social sentiment is highly active.
                    </p>
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                        <span>Regional Impact</span>
                        <span className="text-red-500">High</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-red-500 h-1.5 rounded-full w-[85%]"></div>
                    </div>
                </div>
            </div>
        )}

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
            <Button 
                variant="primary" 
                onClick={() => navigate(`/news/${data.id}`)}
                className="col-span-2 bg-gray-900 hover:bg-black"
                rightIcon={<ArrowRight size={16} />}
            >
                Read Full Article
            </Button>
            
            <Button 
                variant="secondary" 
                onClick={() => navigate(`/ai-chat?context=article&headline=${encodeURIComponent(data.title)}`)}
                className="text-indigo-600 border-indigo-100 bg-indigo-50 hover:bg-indigo-100"
                leftIcon={<Sparkles size={16} />}
            >
                AI Explain
            </Button>

            <Button 
                variant="secondary" 
                onClick={() => navigate('/reel')}
                className="text-pink-600 border-pink-100 bg-pink-50 hover:bg-pink-100"
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