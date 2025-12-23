import React, { useState, useEffect } from 'react';
import { PenTool, Sparkles, Printer, Globe, Coffee, BrainCircuit } from 'lucide-react';
import MultiStepLoader from './MultiStepLoader';

interface NewspaperGenerationLoaderProps {
  steps: { id: string; label: string }[];
  currentStepId: string;
}

const FACTS = [
    "AI fact-checking 1,000+ sources per second...",
    "Optimizing layout for readability...",
    "Did you know? The first printed newspaper appeared in 1605.",
    "Synthesizing neutral editorial tones...",
    "Calibrating column widths for your screen...",
    "Selecting high-impact imagery...",
    "Reviewing grammar and style guides..."
];

const NewspaperGenerationLoader: React.FC<NewspaperGenerationLoaderProps> = ({ steps, currentStepId }) => {
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
      const interval = setInterval(() => {
          setFactIndex(prev => (prev + 1) % FACTS.length);
      }, 2500);
      return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
       <div className="relative w-48 h-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-lg overflow-hidden mb-8 transform rotate-1 transition-colors">
           {/* Paper Lines / Skeleton Content */}
           <div className="p-4 space-y-3 opacity-50">
               <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-3"></div>
               <div className="space-y-1.5">
                   <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
                   <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
                   <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded w-5/6"></div>
                   <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
               </div>
               <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded w-full mt-3"></div>
           </div>

           {/* Writing Hand/Pen Animation */}
           <div className="absolute top-1/3 left-1/4 animate-[writing_2.5s_ease-in-out_infinite] z-20">
               <div className="relative">
                   <PenTool size={32} className="text-blue-600 dark:text-blue-400 drop-shadow-xl -rotate-12 fill-blue-100 dark:fill-blue-900" />
                   <Sparkles size={12} className="absolute -top-1 -right-1 text-yellow-400 animate-spin" />
               </div>
           </div>
           
           {/* Magic Dust Trail */}
           <div className="absolute top-[38%] left-[28%] w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
       </div>

       <div className="w-full max-w-sm bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-blue-50 dark:border-gray-700 relative overflow-hidden transition-colors">
           {/* Shimmer on card */}
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/30 dark:via-blue-900/10 to-transparent animate-[shimmer_2s_infinite]"></div>
           
           <div className="relative z-10">
               <div className="flex items-center justify-center gap-2 mb-2">
                   <Printer size={18} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
                   <h3 className="text-lg font-black text-gray-800 dark:text-white tracking-tight">AI Editor at Work</h3>
               </div>
               
               {/* Rotating Fact */}
               <div className="h-8 flex items-center justify-center mb-6">
                   <p className="text-xs text-center text-gray-500 dark:text-gray-400 font-medium animate-in slide-in-from-bottom-2 fade-in duration-500 key={factIndex}">
                       {FACTS[factIndex]}
                   </p>
               </div>

               <MultiStepLoader steps={steps} currentStepId={currentStepId} />
           </div>
       </div>

       <style>{`
         @keyframes writing {
           0% { transform: translate(0, 0) rotate(0deg); }
           20% { transform: translate(15px, 5px) rotate(-10deg); }
           40% { transform: translate(5px, 15px) rotate(0deg); }
           60% { transform: translate(20px, 10px) rotate(-5deg); }
           80% { transform: translate(0px, 20px) rotate(0deg); }
           100% { transform: translate(0, 0) rotate(0deg); }
         }
       `}</style>
    </div>
  );
};
export default NewspaperGenerationLoader;