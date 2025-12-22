import React from 'react';
import { Mic, Headphones, X, Sparkles, ArrowUp } from 'lucide-react';

interface AIHubTourProps {
  onClose: () => void;
}

const AIHubTour: React.FC<AIHubTourProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center pointer-events-none pb-20">
      {/* Dimmed Background */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={onClose}></div>

      {/* Tour Card */}
      <div className="relative z-10 w-[90%] max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-500 mb-4 mx-4 border border-indigo-100 dark:border-indigo-900">
        
        {/* Close Button */}
        <button 
            onClick={onClose} 
            className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
            <X size={18} />
        </button>

        {/* Header Graphic */}
        <div className="flex justify-center -mt-12 mb-4">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-full shadow-lg shadow-indigo-500/30 ring-4 ring-white dark:ring-gray-800">
                <Sparkles size={32} className="text-white animate-pulse" />
            </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-3">
            <h3 className="text-xl font-black text-gray-900 dark:text-white">Meet the AI Interaction Hub</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Unlock a new way to experience news. Tap the <span className="font-bold text-indigo-600 dark:text-indigo-400">Audio Wave</span> icon above to start.
            </p>

            <div className="grid grid-cols-2 gap-3 py-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex flex-col items-center gap-2">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-sm text-indigo-600 dark:text-indigo-400">
                        <Mic size={20} />
                    </div>
                    <div className="text-center">
                        <span className="block text-xs font-bold text-indigo-900 dark:text-indigo-200">Live Talk</span>
                        <span className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70 leading-tight">Real-time voice chat</span>
                    </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl border border-purple-100 dark:border-purple-900/50 flex flex-col items-center gap-2">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-sm text-purple-600 dark:text-purple-400">
                        <Headphones size={20} />
                    </div>
                    <div className="text-center">
                        <span className="block text-xs font-bold text-purple-900 dark:text-purple-200">Audio Gen</span>
                        <span className="text-[10px] text-purple-600/70 dark:text-purple-400/70 leading-tight">Custom podcasts</span>
                    </div>
                </div>
            </div>

            <button 
                onClick={onClose}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-black font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
            >
                Got it, let's explore!
            </button>
        </div>

        {/* Pointer Arrow */}
        <div className="absolute -top-16 right-16 animate-bounce hidden md:block">
             <div className="bg-white text-indigo-600 px-3 py-1 rounded-full shadow-lg font-bold text-xs mb-1">Tap Here</div>
             <ArrowUp size={24} className="text-white drop-shadow-md mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default AIHubTour;