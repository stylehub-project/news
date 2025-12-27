
import React from 'react';
import { MapPin, Clock, ShieldCheck } from 'lucide-react';

interface ReelContextStripProps {
  category: string;
  location?: string;
  timeAgo: string;
  source: string;
  trustScore?: number;
}

const ReelContextStrip: React.FC<ReelContextStripProps> = ({ category, location, timeAgo, source, trustScore = 98 }) => {
  return (
    <div className="flex items-center justify-between w-full px-1 py-2 mb-2 animate-in slide-in-from-top-4 fade-in duration-700">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
        <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 backdrop-blur-md">
          {category}
        </span>
        {location && (
          <span className="flex items-center gap-1 text-gray-400">
            <MapPin size={10} /> {location}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-[10px] font-medium text-gray-400">
        <span className="flex items-center gap-1">
          <Clock size={10} /> {timeAgo}
        </span>
        <div className="flex items-center gap-1 text-emerald-400 bg-emerald-900/20 px-1.5 py-0.5 rounded border border-emerald-900/30">
          <ShieldCheck size={10} />
          <span>{trustScore}% Trust</span>
        </div>
        <span className="text-gray-300 font-bold">{source}</span>
      </div>
    </div>
  );
};

export default ReelContextStrip;
