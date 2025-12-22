import React from 'react';
import { Mic, Radio, X, Zap, Headphones, Sparkles } from 'lucide-react';
import Modal from '../ui/Modal';

interface AIInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: 'live' | 'generator') => void;
}

const AIInteractionModal: React.FC<AIInteractionModalProps> = ({ isOpen, onClose, onSelectMode }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Interaction Studio">
      <div className="space-y-4 p-2">
        <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/30 animate-pulse">
                <Sparkles size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">Choose Your Experience</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Real-time conversation or generated podcasts.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
            {/* Live Talk Option */}
            <button 
                onClick={() => onSelectMode('live')}
                className="group relative overflow-hidden rounded-2xl border-2 border-transparent bg-white dark:bg-gray-800 p-5 text-left shadow-sm transition-all hover:border-indigo-500 hover:shadow-md active:scale-98"
            >
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y-[-8px] rounded-full bg-indigo-500/10 transition-all group-hover:scale-150"></div>
                <div className="flex items-start gap-4 relative z-10">
                    <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-3 text-indigo-600 dark:text-indigo-400">
                        <Mic size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            Live AI Talk 
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-800">
                                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse"></span>
                                LIVE
                            </span>
                        </h4>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Real-time voice conversation with Gemini. Low latency, natural flow.
                        </p>
                    </div>
                </div>
            </button>

            {/* Audio Generator Option */}
            <button 
                onClick={() => onSelectMode('generator')}
                className="group relative overflow-hidden rounded-2xl border-2 border-transparent bg-white dark:bg-gray-800 p-5 text-left shadow-sm transition-all hover:border-purple-500 hover:shadow-md active:scale-98"
            >
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y-[-8px] rounded-full bg-purple-500/10 transition-all group-hover:scale-150"></div>
                <div className="flex items-start gap-4 relative z-10">
                    <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3 text-purple-600 dark:text-purple-400">
                        <Headphones size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            Audio Generator
                            <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-800 border border-purple-200">
                                <Zap size={10} className="mr-1 fill-current" /> NEW
                            </span>
                        </h4>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Generate deep-dive podcasts or summaries. Multi-speaker (NotebookLM style).
                        </p>
                    </div>
                </div>
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default AIInteractionModal;