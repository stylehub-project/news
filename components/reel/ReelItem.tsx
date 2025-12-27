
import React, { useState, useEffect, useMemo } from 'react';
import { Type, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReelContextStrip from './ReelContextStrip';
import ReelActionToolbar from './ReelActionToolbar';
import ReelReaderCanvas from './ReelReaderCanvas';
import SpokenBriefPlayer from './SpokenBriefPlayer';
import AIInsightPanel from './AIInsightPanel';
import BlurImageLoader from '../loaders/BlurImageLoader';
import { modifyText } from '../../utils/aiService';

interface ReelItemProps {
  data: any;
  isActive: boolean;
  isAutoRead: boolean;
}

type Perspective = 'Neutral' | 'Public' | 'Economic' | 'Human';

const ReelItem: React.FC<ReelItemProps> = ({ data, isActive, isAutoRead }) => {
  const navigate = useNavigate();
  
  // --- UI State ---
  const [fontSize, setFontSize] = useState<'sm'|'md'|'lg'>('md');
  const [perspective, setPerspective] = useState<Perspective>('Neutral');
  const [showInsight, setShowInsight] = useState(false);
  
  // --- Content State ---
  const initialParagraphs = useMemo(() => {
      const raw = data.summary || data.description || "";
      return raw.split(/(?:\r\n|\r|\n)/g).filter((p: string) => p.trim().length > 0);
  }, [data.summary, data.description]);

  const [paragraphs, setParagraphs] = useState<string[]>(initialParagraphs);
  const [revealedCount, setRevealedCount] = useState(0);
  const [readProgress, setReadProgress] = useState(0);

  // Reveal Animation Logic
  useEffect(() => {
    let timeouts: ReturnType<typeof setTimeout>[] = [];
    
    if (isActive) {
      setRevealedCount(0); 
      const total = paragraphs.length;
      
      // Staggered reveal
      paragraphs.forEach((_, i) => {
        const timeout = setTimeout(() => {
          setRevealedCount(prev => Math.min(prev + 1, total));
        }, 500 + (i * 1200)); 
        timeouts.push(timeout);
      });
    } else {
        setRevealedCount(0);
        setShowInsight(false); // Reset panels on scroll away
    }

    return () => {
        timeouts.forEach(clearTimeout);
    };
  }, [isActive, paragraphs]);

  // --- Handlers ---

  const handlePerspectiveChange = async () => {
    const nextP: Record<Perspective, Perspective> = {
      'Neutral': 'Public',
      'Public': 'Economic',
      'Economic': 'Human',
      'Human': 'Neutral'
    };
    const newP = nextP[perspective];
    setPerspective(newP);
    setRevealedCount(0);
    
    // Fallback text while AI loads
    setParagraphs(["Re-calibrating narrative..."]);

    let prompt = "";
    if (newP === 'Public') prompt = "Rewrite focusing on social impact.";
    else if (newP === 'Economic') prompt = "Rewrite focusing on financial markets.";
    else if (newP === 'Human') prompt = "Rewrite as a human interest story.";
    else prompt = "Reset to neutral journalistic tone.";

    try {
        const newText = await modifyText(initialParagraphs.join('\n'), prompt);
        setParagraphs(newText.split('\n').filter(p => p.trim().length > 0));
    } catch (e) {
        setParagraphs(initialParagraphs);
    }
  };

  const handleFontSizeChange = () => {
    setFontSize(prev => prev === 'md' ? 'lg' : prev === 'lg' ? 'sm' : 'md');
  };

  return (
    <div className="relative h-full w-full bg-black overflow-hidden flex flex-col select-none">
      
      {/* 1. Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gray-900">
        <BlurImageLoader 
          src={data.imageUrl} 
          alt="Background" 
          className="w-full h-full object-cover opacity-40 blur-xl scale-110" 
        />
        {/* Deepened Gradient for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black"></div>
      </div>

      {/* 2. Reading Flow Indicator */}
      <div className="absolute right-1 top-20 bottom-32 w-1 bg-white/10 rounded-full z-20 overflow-hidden pointer-events-none">
        <div 
          className="w-full bg-indigo-500 transition-all duration-300 ease-linear shadow-[0_0_8px_rgba(99,102,241,0.8)]"
          style={{ height: `${readProgress}%` }}
        />
      </div>

      {/* 3. Main Content Layer - Flex Layout for responsiveness */}
      <div className="relative z-10 flex-1 flex flex-col px-5 pt-20 pb-2 h-full max-w-2xl mx-auto w-full">
        
        {/* Top Metadata */}
        <div className="shrink-0">
            <ReelContextStrip 
              category={data.category} 
              location={data.location?.name || 'Global'}
              timeAgo={data.timeAgo}
              source={data.source}
              trustScore={data.trustScore}
            />

            {/* Headline */}
            <h1 className="text-xl md:text-3xl font-black text-white leading-tight mb-4 animate-in slide-in-from-left-4 duration-700 drop-shadow-md">
              {data.title}
            </h1>
        </div>

        {/* Dynamic Reader Canvas - Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mask-gradient-b">
          <ReelReaderCanvas 
            content={paragraphs}
            revealedCount={revealedCount}
            fontSize={fontSize}
            perspective={perspective}
            onTextTap={() => {}} 
          />
          
          <div className="pb-4">
            <AIInsightPanel 
                isOpen={showInsight}
                onToggle={() => setShowInsight(!showInsight)}
                insight={`This update shifts the ${perspective.toLowerCase()} landscape significantly. Analysts predict immediate downstream effects.`}
            />
          </div>
          
          {/* Spacer to push content above bottom controls */}
          <div className="h-32 w-full"></div>
        </div>

        {/* Floating Controls Layer (Positioned absolutely over the flex container to ensure bottom alignment) */}
        <div className="absolute bottom-24 left-5 right-5 z-30 pointer-events-none">
            <div className="flex items-center justify-between">
                <div className="pointer-events-auto">
                    <SpokenBriefPlayer 
                        text={`${data.title}. ${paragraphs.join('. ')}`} 
                        isActive={isActive} 
                        autoPlay={isAutoRead} 
                        onProgress={setReadProgress}
                    />
                </div>

                <div className="flex gap-2 pointer-events-auto">
                    <button 
                        onClick={handleFontSizeChange}
                        className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors shadow-lg"
                    >
                        <Type size={16} />
                    </button>
                    <button 
                        onClick={handlePerspectiveChange}
                        className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors shadow-lg"
                    >
                        <Layers size={16} />
                    </button>
                </div>
            </div>
        </div>

      </div>

      {/* 4. Action Dock */}
      <ReelActionToolbar 
        onExplain={() => navigate(`/ai-chat?context=reel&headline=${encodeURIComponent(data.title)}`)}
        onSave={() => console.log('Saved')}
        onShare={() => navigator.share?.({ title: data.title, url: window.location.href })}
        onReadFull={() => navigate(`/news/${data.id}`)}
      />

    </div>
  );
};

export default ReelItem;
