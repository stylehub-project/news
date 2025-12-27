
import React, { useState, useEffect } from 'react';
import { Sparkles, Globe, TrendingUp, BrainCircuit } from 'lucide-react';

const FACTS = [
    "Did you know? The first printed newspaper appeared in 1605.",
    "Gemini can summarize 1,000 words in under 2 seconds.",
    "Reading news reduces anxiety compared to watching it.",
    "90% of the world's data was created in the last two years.",
    "The most read newspaper in history is the Yomiuri Shimbun."
];

const KEYWORDS = ["AI Regulation", "Market Rally", "SpaceX", "Climate Pact", "Quantum Leap", "EV Surge"];

const ReelLoadingState: React.FC = () => {
  const [fact, setFact] = useState(FACTS[0]);
  
  useEffect(() => {
      setFact(FACTS[Math.floor(Math.random() * FACTS.length)]);
  }, []);

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col justify-between p-8 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-black to-black"></div>
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full justify-center items-center text-center space-y-8">
            
            {/* Pulsing AI Icon */}
            <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-30 animate-ping"></div>
                <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-xl relative z-10">
                    <BrainCircuit size={40} className="text-indigo-400 animate-pulse" />
                </div>
            </div>

            {/* Fact */}
            <div className="max-w-xs space-y-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">While you wait</span>
                <p className="text-lg font-medium text-gray-200 leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-700">
                    "{fact}"
                </p>
            </div>

            {/* Keywords Cloud */}
            <div className="flex flex-wrap justify-center gap-2 max-w-sm opacity-60">
                {KEYWORDS.map((k, i) => (
                    <span 
                        key={i} 
                        className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded-full text-gray-400"
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                        #{k}
                    </span>
                ))}
            </div>
        </div>

        {/* Bottom Status */}
        <div className="relative z-10 w-full text-center">
            <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-200"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Curating Next Story</span>
            </div>
        </div>
    </div>
  );
};

export default ReelLoadingState;
