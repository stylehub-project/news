import React, { useState, useEffect } from 'react';
import { X, Mic } from 'lucide-react';

interface NotebookModeProps {
  topic?: string;
  onClose: () => void;
}

const NotebookMode: React.FC<NotebookModeProps> = ({ topic = "the latest updates", onClose }) => {
  const [text, setText] = useState("");
  const fullText = `Topic: ${topic}\n\nKey Concepts:\n----------------\n\n1. Core Analysis\n   - Data suggests a 15% increase in efficiency.\n   - Historical patterns are repeating.\n\n2. The Human Element\n   - Adaptation is slower than technology.\n   - Ethical considerations are paramount.\n\n3. Future Outlook\n   - Integration will be seamless by 2026.\n   - New regulatory frameworks expected.\n\nSummary:\n"The only constant is change."`;
  
  useEffect(() => {
    let i = 0;
    setText("");
    const interval = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [topic, fullText]);

  return (
    <div className="absolute inset-0 z-50 bg-gray-900 text-gray-200 flex flex-col font-mono animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900/90 backdrop-blur">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Notebook Mode</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
            <X size={20} />
        </button>
      </div>

      {/* Blackboard Content */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <div className="max-w-2xl mx-auto bg-gray-800/50 p-6 rounded-lg border border-gray-700 shadow-inner min-h-[50vh]">
            <p className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap text-emerald-100 font-mono">
                {text}
                <span className="inline-block w-2.5 h-5 bg-green-500 ml-1 animate-pulse align-middle"></span>
            </p>
        </div>
      </div>

      {/* Audio Visualizer Footer */}
      <div className="p-6 border-t border-gray-800 bg-gray-900">
         <div className="flex items-center justify-center gap-1.5 h-16">
            {[...Array(15)].map((_, i) => (
                <div 
                    key={i} 
                    className="w-1.5 bg-indigo-500 rounded-full animate-pulse"
                    style={{ 
                        height: `${Math.max(20, Math.random() * 100)}%`, 
                        animationDuration: `${0.5 + Math.random() * 0.5}s` 
                    }}
                ></div>
            ))}
         </div>
         <div className="text-center mt-3 text-xs text-indigo-400 font-medium flex items-center justify-center gap-2">
            <div className="p-2 bg-indigo-500/10 rounded-full">
                <Mic size={14} className="animate-pulse" /> 
            </div>
            Listening to conversation...
         </div>
      </div>
    </div>
  );
};

export default NotebookMode;