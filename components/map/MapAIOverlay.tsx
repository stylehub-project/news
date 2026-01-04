
import React from 'react';
import { X, TrendingUp, AlertTriangle, Wind, CloudRain, PlayCircle, MessageSquare } from 'lucide-react';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface MapAIOverlayProps {
  region: string;
  summary: string;
  stats: { label: string; value: string; icon: any; color?: string }[];
  sentiment: string;
  momentum: string;
  categories: { label: string; percentage: number; color: string }[];
  onClose: () => void;
}

const MapAIOverlay: React.FC<MapAIOverlayProps> = ({ 
    region, 
    summary, 
    momentum,
    onClose 
}) => {
  const navigate = useNavigate();

  return (
    <div className="absolute top-24 right-4 w-[90%] max-w-sm md:w-80 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-40 animate-in slide-in-from-right-4 fade-in duration-500 text-white">
      <div className="p-5 relative">
        <button 
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors bg-white/10 rounded-full p-1"
        >
            <X size={16} />
        </button>

        {/* W5 - AI Analysis Header */}
        <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg text-white">
                <CloudRain size={20} />
            </div>
            <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-0.5">Weather Intelligence</span>
                <h3 className="text-xl font-black text-white leading-none tracking-tight">{region}</h3>
            </div>
        </div>

        <div className="mb-5 relative pl-3 border-l-2 border-indigo-500">
            <p className="text-xs text-gray-300 font-medium leading-relaxed">
                {summary}
            </p>
        </div>

        {/* W5 - Weather Stats */}
        <div className="grid grid-cols-2 gap-2 mb-5">
            <div className="flex items-center gap-2 p-2 rounded-lg border border-red-500/30 bg-red-900/20 text-red-400">
                <AlertTriangle size={14} />
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold opacity-70">Momentum</span>
                    <span className="text-xs font-bold">{momentum}</span>
                </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg border border-white/10 bg-gray-800 text-gray-300">
                <Wind size={14} />
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold opacity-70">Wind Gusts</span>
                    <span className="text-xs font-bold">120 km/h</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <Button 
                variant="primary" 
                size="sm" 
                className="bg-white text-black hover:bg-gray-200 text-xs font-bold border-none"
                leftIcon={<PlayCircle size={14} />}
                onClick={() => navigate('/reel')}
            >
                Stories
            </Button>
            <Button 
                variant="secondary" 
                size="sm" 
                className="text-xs border-indigo-500/50 text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20"
                leftIcon={<MessageSquare size={14} />}
                onClick={() => navigate(`/ai-chat?topic=${encodeURIComponent(region)}`)}
            >
                AI Detail
            </Button>
        </div>
      </div>
    </div>
  );
};

export default MapAIOverlay;
