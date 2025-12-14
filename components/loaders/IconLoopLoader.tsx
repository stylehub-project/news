import React, { useState, useEffect } from 'react';
import { Newspaper, Globe, BrainCircuit, Mic, Map, Sparkles } from 'lucide-react';

interface IconLoopLoaderProps {
  interval?: number;
  className?: string;
}

const ICONS = [Newspaper, Globe, BrainCircuit, Mic, Map, Sparkles];
const COLORS = [
    'text-blue-600 bg-blue-50', 
    'text-green-600 bg-green-50', 
    'text-purple-600 bg-purple-50', 
    'text-red-600 bg-red-50', 
    'text-amber-600 bg-amber-50',
    'text-pink-600 bg-pink-50'
];

const IconLoopLoader: React.FC<IconLoopLoaderProps> = ({ 
  interval = 600,
  className = ''
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ICONS.length);
    }, interval);
    return () => clearInterval(timer);
  }, [interval]);

  const CurrentIcon = ICONS[index];
  const currentColorClass = COLORS[index];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-105 ${currentColorClass}`}>
        <CurrentIcon size={32} className="animate-[spin_0.5s_ease-out]" />
      </div>
      <div className="flex gap-1 mt-4">
        {ICONS.map((_, i) => (
            <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i === index ? 'bg-gray-800 scale-125' : 'bg-gray-300'}`}
            ></div>
        ))}
      </div>
    </div>
  );
};

export default IconLoopLoader;