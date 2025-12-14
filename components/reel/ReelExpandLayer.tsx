import React, { useState, useEffect } from 'react';
import { X, Sparkles, MapPin, List, ArrowRight, BrainCircuit, Globe, Volume2, Pause, ShieldCheck, ExternalLink } from 'lucide-react';

interface ReelExpandLayerProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    title: string;
    description: string;
    source: string;
    tags?: string[];
    aiSummary?: string;
    keyPoints?: string[];
    factCheck?: { status: string; score: number };
    location?: { name: string; lat: number; lng: number };
    relatedNews?: Array<{ id: string; title: string; image: string; time: string }>;
  };
}

const ReelExpandLayer: React.FC<ReelExpandLayerProps> = ({ isOpen, onClose, data }) => {
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
    }
  }, [isOpen]);

  const toggleVoice = () => {
    if (isPlayingVoice) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
    } else {
      const text = data.aiSummary || data.description;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsPlayingVoice(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingVoice(true);
    }
  };

  return (
    <div 
      className={`absolute inset-0 z-50 bg-gray-900/95 backdrop-blur-xl transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2 text-indigo-400">
            <Sparkles size={18} className="animate-pulse" />
            <span className="font-bold text-sm tracking-wider uppercase">AI Analysis</span>
        </div>
        <button onClick={onClose} className="p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition-colors">
            <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-20 custom-scrollbar">
        
        {/* Fact Check Badge (6.5) */}
        {data.factCheck && (
            <div className={`flex items-center justify-between p-3 rounded-xl border ${data.factCheck.score > 90 ? 'bg-emerald-900/20 border-emerald-800 text-emerald-400' : 'bg-yellow-900/20 border-yellow-800 text-yellow-400'}`}>
                <div className="flex items-center gap-2">
                    <ShieldCheck size={18} />
                    <span className="font-bold text-xs uppercase tracking-wide">AI Fact Check</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{data.factCheck.status}</span>
                    <span className="bg-black/30 px-2 py-0.5 rounded text-[10px] font-mono">{data.factCheck.score}%</span>
                </div>
            </div>
        )}

        {/* Summary Card with Voice (6.5) */}
        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-5 rounded-2xl border border-indigo-500/30 relative overflow-hidden group">
            {/* Gloss Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex justify-between items-start mb-3 relative z-10">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <BrainCircuit size={20} className="text-indigo-400" />
                    Executive Summary
                </h3>
                <button 
                    onClick={toggleVoice}
                    className="p-2 rounded-full bg-indigo-600/30 hover:bg-indigo-600/50 text-white transition-colors"
                >
                    {isPlayingVoice ? <Pause size={16} /> : <Volume2 size={16} />}
                </button>
            </div>
            <p className="text-gray-200 text-sm leading-relaxed relative z-10 font-medium">
                {data.aiSummary || data.description}
            </p>
        </div>

        {/* Key Points (6.5 Bullet Points) */}
        {data.keyPoints && data.keyPoints.length > 0 && (
            <div>
                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <List size={14} /> Key Takeaways
                </h4>
                <div className="space-y-2">
                    {data.keyPoints.map((point, i) => (
                        <div key={i} className="flex gap-3 items-start p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:bg-gray-800 transition-colors">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                            <p className="text-sm text-gray-300">{point}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Location Insight (6.5) */}
        {data.location ? (
            <div>
                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MapPin size={14} /> Location Context
                </h4>
                <div className="h-32 w-full bg-gray-800 rounded-xl overflow-hidden relative border border-gray-700 group">
                    <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity group-hover:scale-105 duration-700"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-gray-600 shadow-lg">
                            <Globe size={14} className="text-emerald-400" />
                            <span className="text-xs font-bold text-white">{data.location.name}</span>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div>
                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Globe size={14} /> Global Impact
                </h4>
                <div className="p-3 bg-gray-800/30 rounded-xl border border-gray-700/50 text-xs text-gray-400">
                    No specific location data available for this story.
                </div>
            </div>
        )}

        {/* AI Related News (6.5 Horizontal Mini Cards) */}
        {data.relatedNews && data.relatedNews.length > 0 && (
            <div>
                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ExternalLink size={14} /> Related Coverage
                </h4>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                    {data.relatedNews.map((news) => (
                        <div key={news.id} className="w-40 shrink-0 bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-sm group cursor-pointer hover:border-gray-600 transition-colors">
                            <div className="h-20 bg-gray-700 relative overflow-hidden">
                                <img src={news.image} alt={news.title} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="p-2">
                                <h5 className="text-xs font-bold text-gray-200 line-clamp-2 mb-1">{news.title}</h5>
                                <span className="text-[10px] text-gray-500">{news.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Related Topics Tags */}
        <div className="flex flex-wrap gap-2 pt-2">
            {data.tags?.map(tag => (
                <span key={tag} className="text-xs text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700 hover:border-gray-500 transition-colors">#{tag}</span>
            ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/90 backdrop-blur-md sticky bottom-0 z-20">
          <button className="w-full py-3.5 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-lg active:scale-95">
              Read Full Article <ArrowRight size={18} />
          </button>
      </div>
    </div>
  );
};

export default ReelExpandLayer;