import React, { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';

const INSIGHTS = [
    "Unusual spike in Tech news detected in Western Europe.",
    "Sentiment is trending negative in coastal regions.",
    "Environmental coverage has increased by 40% today.",
    "High engagement detected on Policy updates."
];

const MapSmartInsights: React.FC = () => {
  const [show, setShow] = useState(false);
  const [insight, setInsight] = useState(INSIGHTS[0]);

  useEffect(() => {
    // Show first insight after a delay
    const initialTimer = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(initialTimer);
  }, []);

  useEffect(() => {
    if (!show) return;
    // Auto hide after 6 seconds
    const hideTimer = setTimeout(() => setShow(false), 6000);
    return () => clearTimeout(hideTimer);
  }, [show]);

  if (!show) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 animate-in slide-in-from-top-4 fade-in duration-500">
      <div className="bg-white/90 backdrop-blur-md pl-3 pr-8 py-2 rounded-full shadow-lg border border-indigo-100 flex items-center gap-2 max-w-[280px] md:max-w-md relative">
        <Sparkles size={14} className="text-indigo-600 animate-pulse shrink-0" />
        <p className="text-xs font-medium text-gray-700 truncate">{insight}</p>
        
        <button 
            onClick={() => setShow(false)}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full text-gray-400"
        >
            <X size={12} />
        </button>
      </div>
    </div>
  );
};

export default MapSmartInsights;