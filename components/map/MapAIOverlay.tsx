import React from 'react';
import { Sparkles, X, TrendingUp, Users, AlertTriangle, PlayCircle, MessageSquare, BarChart3, Thermometer } from 'lucide-react';
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
          case 'Positive': return 'text-green-600 bg-green-50 border-green-200';
          case 'Tense': return 'text-red-600 bg-red-50 border-red-200';
          default: return 'text-gray-600 bg-gray-50 border-gray-200';
      }
  };

  return (
    <div className="absolute top-20 right-4 w-[90%] max-w-sm md:w-80 bg-white/95 backdrop-blur-xl border border-indigo-100 rounded-2xl shadow-2xl z-40 animate-in slide-in-from-right-4 fade-in duration-500">
      <div className="p-5 relative">
        <button 
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors bg-white/50 rounded-full p-1"
        >
            <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
            <div className={`p-2 rounded-xl shadow-sm ${momentum === 'High' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-indigo-100 text-indigo-600'}`}>
                {momentum === 'High' ? <TrendingUp size={20} /> : <Sparkles size={20} />}
            </div>
            <div>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block mb-0.5">Regional Analysis</span>
                <h3 className="text-lg font-black text-gray-900 leading-none">{region}</h3>
            </div>
        </div>

        {/* AI Summary */}
        <div className="mb-5 relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
            <p className="text-xs text-gray-600 font-medium leading-relaxed pl-3">
                {summary}
            </p>
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
            <div className="flex items-center gap-2 p-2 rounded-lg border border-orange-100 bg-orange-50 text-orange-700">
                <AlertTriangle size={14} />
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold opacity-70">Momentum</span>
                    <span className="text-xs font-bold">{momentum}</span>
                </div>
            </div>
        </div>

        {/* Category Distribution */}
        <div className="mb-5">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <BarChart3 size={12} /> Topic Breakdown
            </h4>
            <div className="space-y-2">
                {categories.map((cat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="w-16 font-medium text-gray-600 truncate">{cat.label}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                            ></div>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 w-8 text-right">{cat.percentage}%</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
            <Button 
                variant="primary" 
                size="sm" 
                className="bg-gray-900 hover:bg-black text-xs"
                leftIcon={<PlayCircle size={14} />}
                onClick={() => navigate('/reel')}
            >
                View Reels
            </Button>
            <Button 
                variant="secondary" 
                size="sm" 
                className="text-xs border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
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