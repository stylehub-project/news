
import React, { useMemo, useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface SmartReadCanvasProps {
  text: string;
  currentWordIndex: number; // Relative to the summary start
  isPlaying: boolean;
  imageUrl: string;
  isFocusMode: boolean;
  aiInsight: string;
}

const SmartReadCanvas: React.FC<SmartReadCanvasProps> = ({ 
    text, 
    currentWordIndex, 
    isPlaying, 
    imageUrl,
    isFocusMode,
    aiInsight
}) => {
  const [showWhyItMatters, setShowWhyItMatters] = useState(false);

  // 1. Process text into paragraphs and words
  const paragraphs = useMemo(() => {
      // Split text, respecting newlines and spaces for layout
      return text.split('\n').filter(p => p.trim().length > 0).map(para => {
          return para.split(/(\s+)/); // Split keeping delimiters
      });
  }, [text]);

  // Flattened word count helper to map global index to paragraph structure
  let globalWordCounter = 0;

  return (
    <div className="space-y-6 pb-8">
        
        {/* 'Why It Matters' Toggle Block */}
        <div className={`transition-all duration-500 ease-out ${isFocusMode ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
            <button 
                onClick={(e) => { e.stopPropagation(); setShowWhyItMatters(!showWhyItMatters); }}
                className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2 transition-colors ${showWhyItMatters ? 'text-indigo-400' : 'text-indigo-300/70 hover:text-indigo-300'}`}
            >
                <Sparkles size={14} className={showWhyItMatters ? 'fill-indigo-400' : ''} />
                Why This Matters
                {showWhyItMatters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showWhyItMatters ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-indigo-900/30 border-l-2 border-indigo-500 p-3 rounded-r-xl">
                    <p className="text-sm text-indigo-100 leading-relaxed font-medium">
                        {aiInsight}
                    </p>
                </div>
            </div>
        </div>

        {/* Featured Image (Hidden in Focus Mode for Immersion) */}
        {!isFocusMode && (
            <div className="w-full h-48 rounded-2xl overflow-hidden shadow-lg border border-white/10 relative group animate-in zoom-in-95 duration-700 delay-300">
                <img src={imageUrl} alt="News" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
            </div>
        )}

        {/* Text Body with Smart Reveal & Morphing Support */}
        <div className={`text-lg md:text-xl leading-relaxed text-gray-300 font-serif tracking-wide transition-all duration-500 ${isFocusMode ? 'text-2xl leading-loose text-gray-100' : ''}`}>
            {paragraphs.map((words, pIndex) => (
                <p 
                    key={pIndex} 
                    className="mb-6 animate-in slide-in-from-bottom-2 fade-in duration-500 fill-mode-forwards"
                    style={{ animationDelay: `${100 + (pIndex * 100)}ms` }} // Faster staggered reveal for morphs
                >
                    {words.map((part, wIndex) => {
                        const isWord = /\S/.test(part);
                        let isHighlighted = false;
                        
                        if (isWord) {
                            // Check if this word matches the current spoken index
                            if (isPlaying && globalWordCounter === currentWordIndex) {
                                isHighlighted = true;
                            }
                            globalWordCounter++;
                        }

                        // Determine style
                        let className = "transition-all duration-200 rounded px-0.5 inline-block ";
                        
                        // Active Word (Karaoke)
                        if (isHighlighted) {
                            className += "bg-indigo-500 text-white font-bold shadow-sm scale-105 ";
                        } 
                        // Already Read Words
                        else if (isWord && isPlaying && globalWordCounter <= currentWordIndex) {
                            className += "text-gray-500 transition-colors duration-500 ";
                        }

                        return (
                            <span key={`${pIndex}-${wIndex}`} className={className}>
                                {part}
                            </span>
                        );
                    })}
                </p>
            ))}
        </div>
    </div>
  );
};

export default SmartReadCanvas;
