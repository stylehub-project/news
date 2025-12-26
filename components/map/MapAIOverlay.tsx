
import React from 'react';
import { Sparkles, X, TrendingUp, AlertTriangle, PlayCircle, MessageSquare, BarChart3, Thermometer, Clock } from 'lucide-react';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface MapAIOverlayProps {
  region: string;
  summary: string;
  stats: { label: string; value: string; icon: any; color?: string }[];
  sentiment: 'Neutral' | 'Tense' | 'Positive';
  momentum: 'High' | 'Medium' | 'Low';
  categories: { label: string; percentage: number; color: string }[];
  onClose: () => void;
}

const MapAIOverlay: React.FC<MapAIOverlayProps> = ({ 
    region, 
    summary, 
    stats, 
    sentiment,
    momentum,
    categories,
    onClose 
}) => {
  const navigate = useNavigate();

  const getSentimentColor = () => {
      switch(sentiment) {
          case 'Positive': return 'text-green-400 bg-green-900/20 border-green-800';
          case 'Tense': return 'text-red-400 bg-red-900/20 border-red-800';
          default: return 'text-gray-400 bg-gray-800 border-gray-700';
      }
  };

  return (
    <div className="absolute top-24 right-4 w-[90%] max-w-sm md:w-80 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-40 animate-in slide-in-from-right-4 fade-in duration-500 text-white">
      <div className="p-5 relative">
        <button 
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors bg-white/10 rounded-full p-1"
        >
            <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
            <div className={`p-2 rounded-xl shadow-lg shadow-indigo-500/20 ${momentum === 'High' ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-600 text-white'}`}>
                {momentum === 'High' ? <TrendingUp size={20} /> : <Sparkles size={20} />}
            </div>
            <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-0.5">Live Intelligence</span>
                <h3 className="text-xl font-black text-white leading-none tracking-tight">{region}</h3>
            </div>
        </div>

        {/* AI Summary */}
        <div className="mb-5 relative pl-3">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
            <p className="text-xs text-gray-300 font-medium leading-relaxed">
                {summary}
            </p>
        </div>

        {/* Timeline Summary (New Feature 10.7) */}
        <div className="mb-5 bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <Clock size={12} /> Event Timeline
            </div>
            <div className="space-y-3 relative pl-1.5">
                <div className="absolute top-1 left-[3.5px] bottom-1 w-0.5 bg-gray-700"></div>
                
                <div className="flex gap-2 relative items-start">
                    <div className="w-2 h-2 rounded-full bg-gray-500 mt-1 relative z-10"></div>
                    <div className="flex-1">
                        <span className="text-[10px] text-gray-500 block">24h ago</span>
                        <p className="text-[10px] text-gray-400">Activity detected in sector.</p>
                    </div>
                </div>
                
                <div className="flex gap-2 relative items-start">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 relative z-10 shadow-[0_0_5px_rgba(59,130,246,0.8)]"></div>
                    <div className="flex-1">
                        <span className="text-[10px] text-blue-400 block">4h ago</span>
                        <p className="text-[10px] text-gray-300 font-bold">Spike in coverage volume.</p>
                    </div>
                </div>

                <div className="flex gap-2 relative items-start">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1 relative z-10 animate-pulse"></div>
                    <div className="flex-1">
                        <span className="text-[10px] text-red-400 block">Now</span>
                        <p className="text-[10px] text-white font-bold">Trending globally.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Vital Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-5">
            <div className={`flex items-center gap-2 p-2 rounded-lg border ${getSentimentColor()}`}>
                <Thermometer size={14} />
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold opacity-70">Sentiment</span>
                    <span className="text-xs font-bold">{sentiment}</span>
                </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg border border-orange-500/30 bg-orange-900/20 text-orange-400">
                <AlertTriangle size={14} />
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold opacity-70">Momentum</span>
                    <span className="text-xs font-bold">{momentum}</span>
                </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
            <Button 
                variant="primary" 
                size="sm" 
                className="bg-white text-black hover:bg-gray-200 text-xs font-bold border-none"
                leftIcon={<PlayCircle size={14} />}
                onClick={() => navigate('/reel')}
            >
                View Coverage
            </Button>
            <Button 
                variant="secondary" 
                size="sm" 
                className="text-xs border-indigo-500/50 text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20"
                leftIcon={<MessageSquare size={14} />}
                onClick={() => navigate(`/ai-chat?topic=${encodeURIComponent(region)}`)}
            >
                Ask AI
            </Button>
        </div>
      </div>
    </div>
  );
};

export default MapAIOverlay;
