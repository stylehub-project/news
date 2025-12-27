
import React, { useState, useEffect, useRef } from 'react';
import { Clock, ArrowRight, TrendingUp, Sparkles, Star, PenTool } from 'lucide-react';
import NewspaperSection from './NewspaperSection';
import BlurImageLoader from '../loaders/BlurImageLoader';

export type NewspaperStyle = 'Classic' | 'Modern' | 'Minimal' | 'Tabloid' | 'Kids' | 'Magazine';

export interface NewspaperData {
  title: string;
  date: string;
  issueNumber?: string;
  price?: string;
  sections: Array<{
    type: 'text' | 'timeline' | 'flowchart' | 'graph' | 'images' | 'headline';
    title?: string;
    content: any;
    imageCaption?: string;
  }>;
}

export interface NewspaperSettings {
    fontSize: 'sm' | 'md' | 'lg';
    spacing: 'compact' | 'comfortable' | 'loose';
    font: 'serif' | 'sans' | 'dyslexic';
}

interface NewspaperTemplateProps {
  style: NewspaperStyle;
  data: NewspaperData;
  isLive?: boolean;
  onWritingComplete?: () => void;
  onSectionUpdate?: (index: number, newContent: any) => void;
  settings?: NewspaperSettings;
}

// Typewriter Component
const TypewriterText: React.FC<{ text: string; speed?: number; onComplete?: () => void; className?: string }> = ({ text, speed = 10, onComplete, className }) => {
    const [displayed, setDisplayed] = useState('');
    
    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setDisplayed(text.substring(0, i));
            i++;
            if (i > text.length) {
                clearInterval(interval);
                onComplete?.();
            }
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);

    return (
        <span className={className}>
            {displayed}
            {displayed.length < text.length && <span className="animate-pulse inline-block w-[2px] h-[1em] bg-current align-middle ml-[1px]"></span>}
        </span>
    );
};

const NewspaperTemplate: React.FC<NewspaperTemplateProps> = ({ 
    style, 
    data, 
    isLive = false, 
    onWritingComplete, 
    onSectionUpdate,
    settings = { fontSize: 'md', spacing: 'comfortable', font: 'serif' }
}) => {
  const [visibleSections, setVisibleSections] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect during live writing
  useEffect(() => {
      if (isLive && scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
  }, [visibleSections, isLive]);

  // Handle section completion to trigger next
  const handleSectionComplete = () => {
      if (visibleSections < data.sections.length) {
          setTimeout(() => {
              setVisibleSections(prev => prev + 1);
          }, 400); 
      } else {
          onWritingComplete?.();
      }
  };

  useEffect(() => {
      if (!isLive) {
          setVisibleSections(data.sections.length);
      } else {
          setVisibleSections(0);
          setTimeout(() => setVisibleSections(1), 500); 
      }
  }, [isLive, data.sections.length]);

  const styles = {
    Classic: {
      container: "bg-[#fdfbf7] text-black",
      header: "border-b-4 border-black pb-4 mb-6 text-center",
      title: "text-4xl md:text-6xl font-black uppercase tracking-widest",
      meta: "flex justify-between text-xs mt-2 border-t border-black pt-1 font-mono uppercase",
      card: "mb-6 border-b border-black/10 pb-6"
    },
    Modern: {
      container: "bg-white text-gray-900",
      header: "border-b border-gray-200 pb-6 mb-6 flex flex-col items-start",
      title: "text-4xl md:text-5xl font-bold tracking-tight text-slate-900",
      meta: "w-full flex justify-between text-sm font-medium text-gray-500 mt-2",
      card: "mb-8 bg-gray-50 p-6 rounded-xl"
    },
    Minimal: {
      container: "bg-white text-gray-800",
      header: "pb-8 mb-8 text-center",
      title: "text-4xl font-light tracking-[0.2em] uppercase",
      meta: "text-xs text-gray-400 mt-4 border-t border-b border-gray-100 py-2",
      card: "mb-10 border-l-2 border-gray-100 pl-6"
    },
    Tabloid: {
      container: "bg-yellow-50 text-black border-8 border-red-600 p-2",
      header: "bg-red-600 text-white p-4 mb-4 text-center transform -skew-x-2",
      title: "text-5xl md:text-7xl font-black italic uppercase leading-none",
      meta: "text-center font-bold text-black mt-2 bg-yellow-300 inline-block px-2",
      card: "mb-4 border-b-4 border-black pb-4"
    },
    Kids: {
      container: "bg-sky-100 text-indigo-900 border-dashed border-4 border-indigo-300 p-4 rounded-3xl",
      header: "bg-white rounded-2xl p-4 mb-6 text-center shadow-lg transform rotate-1",
      title: "text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500",
      meta: "text-center font-bold text-indigo-400 mt-2",
      card: "mb-6 bg-white p-4 rounded-2xl shadow-md border-2 border-indigo-100"
    },
    Magazine: {
      container: "bg-gray-900 text-white",
      header: "border-b border-gray-700 pb-8 mb-8 relative overflow-hidden",
      title: "text-6xl md:text-8xl font-black tracking-tighter text-white uppercase relative z-10",
      meta: "text-gray-400 text-sm font-medium mt-4 tracking-widest uppercase flex gap-4",
      card: "mb-8"
    }
  };

  const currentStyle = styles[style] || styles.Classic;

  // Accessibility & Style Classes
  const fontClass = settings.font === 'dyslexic' ? 'font-sans' : (settings.font === 'sans' ? 'font-sans' : 'font-serif');
  const spacingClass = settings.spacing === 'loose' ? 'leading-loose' : (settings.spacing === 'compact' ? 'leading-tight' : 'leading-relaxed');
  const textSizeClass = settings.fontSize === 'lg' ? 'text-lg' : (settings.fontSize === 'sm' ? 'text-xs' : 'text-sm');

  // Override font for specific styles if not manually overridden by user settings
  const baseFont = style === 'Classic' ? 'font-serif' : 'font-sans';
  const effectiveFont = settings.font === 'serif' ? baseFont : fontClass; // Use template default if user set 'serif' (default state), else user pref

  // --- Renderers ---

  const renderContent = (section: any, index: number) => {
      if (index > visibleSections) return null;
      const isWriting = isLive && index === visibleSections;
      const shouldAnimate = isWriting;

      const handleUpdate = (newContent: any) => {
          if (onSectionUpdate) {
              if (section.type === 'headline') {
                  onSectionUpdate(index, newContent); // Passing object { title: 'new' }
              } else if (section.type === 'text') {
                  onSectionUpdate(index, { ...section, content: newContent }); // Passing string text
              }
          }
      };

      return (
        <div key={index} className={`${currentStyle.card} animate-in fade-in slide-in-from-bottom-2 duration-500 relative`}>
            {/* Section Header */}
            {section.title && section.type !== 'headline' && (
                <h3 className={`font-bold text-lg border-b-2 mb-3 pb-1 uppercase tracking-wide flex items-center gap-2 ${style === 'Magazine' ? 'border-indigo-500 text-indigo-400' : 'border-current'}`}>
                    {section.type === 'timeline' && <Clock size={16}/>}
                    {section.type === 'graph' && <TrendingUp size={16}/>}
                    {style === 'Kids' && <Sparkles size={16} className="text-yellow-400" />}
                    {section.title}
                </h3>
            )}

            {/* Headline Type */}
            {section.type === 'headline' && (
                <NewspaperSection type="headline" content={section} onUpdate={handleUpdate} isLive={isLive}>
                    <div className="mb-4" dir="auto">
                        <h2 className={`font-black leading-tight mb-2 ${style === 'Tabloid' ? 'text-4xl italic uppercase' : 'text-3xl'}`}>
                            {shouldAnimate ? (
                                <TypewriterText text={section.title} speed={20} onComplete={handleSectionComplete} />
                            ) : section.title}
                        </h2>
                        <div className="w-full h-1 bg-current opacity-20 my-3"></div>
                    </div>
                </NewspaperSection>
            )}

            {/* Text Type */}
            {section.type === 'text' && (
                <NewspaperSection type="text" content={section.content} onUpdate={handleUpdate} isLive={isLive}>
                    <div className={`${textSizeClass} ${spacingClass} text-justify whitespace-pre-line ${style === 'Magazine' ? 'text-gray-300' : 'opacity-90'}`} dir="auto">
                        {shouldAnimate ? (
                            <TypewriterText text={section.content} speed={5} onComplete={handleSectionComplete} />
                        ) : section.content}
                    </div>
                </NewspaperSection>
            )}

            {/* Images - Using BlurImageLoader for performance */}
            {section.type === 'images' && (
                <NewspaperSection type="images" content={section.content} onUpdate={handleUpdate} isLive={isLive}>
                    <div className="space-y-2">
                        <div className={`aspect-video bg-gray-200 overflow-hidden relative ${style === 'Kids' ? 'rounded-2xl rotate-1 border-4 border-white' : 'rounded-sm grayscale hover:grayscale-0 transition-all duration-700'}`}>
                            <BlurImageLoader 
                                src={section.content[0]} 
                                alt="Visual" 
                                className={`w-full h-full object-cover transition-all duration-[2000ms] ${shouldAnimate ? 'blur-xl scale-110' : 'blur-0 scale-100'}`}
                                onLoad={() => { if(shouldAnimate) setTimeout(handleSectionComplete, 1000) }} 
                            />
                            {shouldAnimate && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                        </div>
                        {section.imageCaption && (
                            <p className="text-[10px] font-bold opacity-60 uppercase tracking-wider">{section.imageCaption}</p>
                        )}
                    </div>
                </NewspaperSection>
            )}

            {/* Complex types */}
            {(section.type === 'timeline' || section.type === 'graph' || section.type === 'flowchart') && (
                <div onLoad={() => isLive && setTimeout(handleSectionComplete, 800)}>
                    <div className="p-4 bg-black/5 rounded-lg text-center text-xs font-mono opacity-70">
                        [Graphic Visualization Generated]
                    </div>
                    {shouldAnimate && <span className="hidden" ref={(el) => { if(el) setTimeout(handleSectionComplete, 1000); }}></span>}
                </div>
            )}
        </div>
      );
  };

  return (
    <div 
        ref={scrollRef} 
        className={`w-full min-h-full p-6 md:p-12 shadow-2xl ${currentStyle.container} ${effectiveFont} transition-all duration-500 overflow-hidden`}
    >
      <header className={`${currentStyle.header} animate-in fade-in duration-1000`}>
        <h1 className={currentStyle.title}>{data.title}</h1>
        <div className={currentStyle.meta}>
          <span className="flex items-center gap-2">
             {isLive && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
             {isLive ? 'LIVE WRITING...' : `ISSUE #${data.issueNumber || '101'}`}
          </span>
          <span>{data.date}</span>
          <span>{data.price || '$2.00'}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        {isLive && (
            <div className="absolute -left-10 top-0 bottom-0 w-[2px] bg-red-500/10 pointer-events-none"></div>
        )}
        
        {data.sections.map((section, idx) => (
            <div key={idx} className={`break-inside-avoid ${section.type === 'headline' || section.type === 'images' ? 'col-span-full' : ''}`}>
                {renderContent(section, idx)}
            </div>
        ))}
      </div>
    </div>
  );
};

export default NewspaperTemplate;
