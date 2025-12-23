import React, { useState } from 'react';
import { RefreshCw, Zap, Feather, Volume2, Sparkles, StopCircle, Wand2 } from 'lucide-react';
import { modifyText } from '../../utils/aiService';

interface NewspaperSectionProps {
  type: 'text' | 'headline' | 'images' | 'other';
  content: any;
  onUpdate: (newContent: any) => void;
  children: React.ReactNode;
  isLive?: boolean;
}

const NewspaperSection: React.FC<NewspaperSectionProps> = ({ type, content, onUpdate, children, isLive }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleAction = async (action: string) => {
      if (type === 'images') {
          // Image regeneration logic would go here
          return;
      }

      setIsProcessing(true);
      let prompt = "";
      
      switch(action) {
          case 'simplify': prompt = "Simplify this text for a general audience, make it shorter and easier to read"; break;
          case 'rewrite': prompt = "Rewrite this to be more engaging and professional"; break;
          case 'catchy': prompt = "Make this headline punchy, dramatic and catchy"; break;
          case 'neutral': prompt = "Rewrite this to be completely neutral and objective"; break;
          default: prompt = "Improve this text";
      }

      const newText = await modifyText(typeof content === 'string' ? content : content.title, prompt);
      
      // Handle data structure difference
      if (type === 'headline') {
          onUpdate({ ...content, title: newText }); // Assuming content was passed as section object if headline
      } else {
          onUpdate(newText);
      }
      
      setIsProcessing(false);
  };

  const handleSpeak = () => {
      if (isSpeaking) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
          return;
      }

      const textToSpeak = typeof content === 'string' ? content : (content.title || "");
      if (!textToSpeak) return;

      const u = new SpeechSynthesisUtterance(textToSpeak);
      u.rate = 1.0;
      u.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(u);
      setIsSpeaking(true);
  };

  if (isLive) return <>{children}</>;

  return (
    <div 
        className="relative group transition-all duration-300 rounded-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
        {/* Loading Overlay */}
        {isProcessing && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-lg">
                <div className="flex flex-col items-center">
                    <RefreshCw className="animate-spin text-blue-600 mb-2" size={24} />
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">AI Rewriting...</span>
                </div>
            </div>
        )}

        {/* Editorial Toolbar - Appears on Hover */}
        <div 
            className={`absolute -top-10 right-0 flex gap-1 bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 rounded-full p-1 z-30 transition-all duration-200 ${
                isHovered && !isProcessing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
        >
            {type === 'text' && (
                <>
                    <button onClick={() => handleAction('simplify')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300" title="Simplify Language">
                        <Feather size={14} />
                    </button>
                    <button onClick={() => handleAction('rewrite')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-blue-600 dark:text-blue-400" title="Rewrite Section">
                        <Wand2 size={14} />
                    </button>
                    <button onClick={handleSpeak} className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors ${isSpeaking ? 'text-red-500 bg-red-50' : 'text-gray-600 dark:text-gray-300'}`} title="Read Aloud">
                        {isSpeaking ? <StopCircle size={14} /> : <Volume2 size={14} />}
                    </button>
                </>
            )}

            {type === 'headline' && (
                <>
                    <button onClick={() => handleAction('catchy')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-yellow-600 dark:text-yellow-400" title="Make Catchy">
                        <Zap size={14} />
                    </button>
                    <button onClick={() => handleAction('neutral')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300" title="Neutral Tone">
                        <RefreshCw size={14} />
                    </button>
                </>
            )}

            {type === 'images' && (
                <button className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold">
                    <RefreshCw size={10} /> Regenerate
                </button>
            )}
        </div>

        {/* Content Border Highlight on Hover */}
        <div className={`transition-all duration-300 ${isHovered ? 'ring-1 ring-blue-500/20 bg-blue-50/10 rounded-lg -m-1 p-1' : ''}`}>
            {children}
        </div>
    </div>
  );
};

export default NewspaperSection;