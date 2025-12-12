import React, { useState, useEffect } from 'react';
import { Lightbulb, Info, Globe, BrainCircuit } from 'lucide-react';

export type FactType = 'general' | 'ai' | 'history' | 'wellness';

interface FactLoaderProps {
  type?: FactType;
  className?: string;
  interval?: number;
}

const FACTS = {
  general: [
    "90% of the world's data was created in the last two years.",
    "The first newspaper was printed in Germany in 1605.",
    "More people own mobile phones than toothbrushes.",
    "Video content accounts for 82% of all internet traffic."
  ],
  ai: [
    "AI can process reading summaries 1000x faster than humans.",
    "Gemini uses advanced reasoning to check facts in real-time.",
    "Generative AI can create custom images for any headline.",
    "Neural networks are inspired by the human brain's structure."
  ],
  history: [
    "The most read newspaper in history was the Yomiuri Shimbun.",
    "Radio took 38 years to reach 50 million users; TV took 13.",
    "The first website went live on August 6, 1991.",
    "Printing presses revolutionized knowledge sharing in 1440."
  ],
  wellness: [
    "Taking breaks while reading news reduces anxiety.",
    "Reading long-form content improves focus and attention span.",
    "Blue light from screens can affect your sleep cycle.",
    "Stay hydrated while browsing to maintain peak cognitive function."
  ]
};

const ICONS = {
  general: Globe,
  ai: BrainCircuit,
  history: Info,
  wellness: Lightbulb
};

const COLORS = {
  general: "bg-blue-50 text-blue-700 border-blue-100",
  ai: "bg-indigo-50 text-indigo-700 border-indigo-100",
  history: "bg-amber-50 text-amber-700 border-amber-100",
  wellness: "bg-emerald-50 text-emerald-700 border-emerald-100"
};

const FactLoader: React.FC<FactLoaderProps> = ({ 
  type = 'general', 
  className = '',
  interval = 4000 
}) => {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  const currentFacts = FACTS[type] || FACTS.general;
  const Icon = ICONS[type] || ICONS.general;

  useEffect(() => {
    const timer = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % currentFacts.length);
        setIsVisible(true);
      }, 300); // Wait for fade out
    }, interval);

    return () => clearInterval(timer);
  }, [type, interval, currentFacts.length]);

  return (
    <div className={`flex flex-col items-center justify-center text-center p-4 rounded-xl border ${COLORS[type]} ${className}`}>
      <div className="mb-2 p-2 bg-white/50 rounded-full animate-bounce">
        <Icon size={20} />
      </div>
      <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">
        {type === 'ai' ? 'AI Insight' : 'Did You Know?'}
      </p>
      <div className="h-12 flex items-center justify-center w-full">
        <p 
          className={`text-sm font-medium transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
        >
          "{currentFacts[index]}"
        </p>
      </div>
      
      {/* Progress Bar */}
      <div className="w-24 h-1 bg-black/5 rounded-full mt-3 overflow-hidden">
        <div 
            className="h-full bg-current opacity-30 animate-[progress_4s_linear_infinite]"
            style={{ animationDuration: `${interval}ms` }}
        ></div>
      </div>
    </div>
  );
};

export default FactLoader;