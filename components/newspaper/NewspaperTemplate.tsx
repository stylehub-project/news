
import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { Clock, TrendingUp, Sparkles } from 'lucide-react';
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

const TypewriterText: React.FC<{ text: string; speed?: number; onComplete?: () => void; className?: string }> = ({ text, speed = 10, onComplete, className }) => {
    const [displayed, setDisplayed] = useState('');
    const containerRef = useRef<HTMLSpanElement>(null);
    
    useEffect(() => {
        let i = 0;
        setDisplayed(''); // Reset
        const interval = setInterval(() => {
            setDisplayed(text.substring(0, i));
            i++;
            if (i > text.length) {
                clearInterval(interval);
                onComplete?.();
            }
        }, speed);
        
        // Auto scroll to this element when typing starts
        if(containerRef.current) {
            containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        return () => clearInterval(interval);
    }, [text, speed]);

    return (
        <span ref={containerRef} className={className}>
            {displayed}
            {displayed.length < text.length && <span className="animate-pulse inline-block w-[2px] h-[1em] bg-current align-middle ml-[1px]"></span>}
        </span>
    );
};

const NewspaperTemplate = forwardRef<HTMLDivElement, NewspaperTemplateProps>(({ 
    style, 
    data, 
    isLive = false, 
    onWritingComplete, 
    onSectionUpdate,
    settings = { fontSize: 'md', spacing: 'comfortable', font: 'serif' }
}, ref) => {
  const [visibleSections, setVisibleSections] = useState(0);
  const activeSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      // Scroll to the active section during live writing
      if (isLive && activeSectionRef.current) {
          activeSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  }, [visibleSections, isLive]);

  const handleSectionComplete = () => {
      if (visibleSections < data.sections.length) {
          setTimeout(() => {
              setVisibleSections(prev => prev + 1);
          }, 300); 
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

  // Styles Map: Adjusted to handle dark mode by using dark: variants, 
  // but keeping base colors neutral for print (which overrides dark mode).
  const styles = {
    Classic: {
      container: "bg-[#fdfbf7] text-gray-900 dark:bg-[#1a1a1a] dark:text-gray-100",
      header: "border-b-[4px] border-black dark:border-white pb-6 mb-8 text-center",
      title: "text-6xl md:text-8xl font-black uppercase tracking-widest font-serif leading-none text-black dark:text-white",
      meta: "flex justify-between text-lg mt-4 border-t-[2px] border-black dark:border-white pt-3 font-mono uppercase font-bold",
      card: "mb-8 border-b border-black/20 dark:border-white/20 pb-6 last:border-0"
    },
    Modern: {
      container: "bg-white text-gray-900 dark:bg-black dark:text-white modern-layout",
      header: "border-b-[8px] border-black dark:border-white pb-8 mb-10 flex flex-col items-start",
      title: "text-7xl md:text-9xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.85]",
      meta: "w-full flex justify-between text-xl font-bold text-gray-900 dark:text-gray-100 mt-6 border-t-4 border-black dark:border-white pt-3 uppercase tracking-wide",
      card: "mb-10 bg-white dark:bg-gray-900 p-0 border-b-2 border-gray-100 dark:border-gray-800 pb-8"
    },
    Minimal: {
      container: "bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      header: "pb-12 mb-12 text-center",
      title: "text-6xl font-thin tracking-[0.2em] uppercase text-gray-900 dark:text-white",
      meta: "text-sm text-gray-500 dark:text-gray-400 mt-8 border-t border-b border-gray-200 dark:border-gray-700 py-4 font-sans tracking-widest",
      card: "mb-12 border-l-4 border-gray-100 dark:border-gray-700 pl-8"
    },
    Tabloid: {
      container: "bg-yellow-100 text-black border-4 border-red-600 p-6 dark:bg-yellow-900 dark:text-white dark:border-red-500",
      header: "bg-red-600 text-white p-6 mb-8 text-center transform -skew-x-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-none",
      title: "text-7xl md:text-8xl font-black italic uppercase leading-none drop-shadow-lg",
      meta: "text-center font-bold text-black mt-4 bg-yellow-300 inline-block px-6 py-2 text-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
      card: "mb-8 border-b-8 border-black dark:border-white pb-8"
    },
    Kids: {
      container: "bg-sky-50 text-indigo-900 border-dashed border-8 border-indigo-300 p-8 rounded-[2rem] dark:bg-slate-800 dark:text-indigo-100",
      header: "bg-white dark:bg-slate-700 rounded-[2rem] p-6 mb-8 text-center shadow-xl transform rotate-1 border-4 border-indigo-200",
      title: "text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 font-comic drop-shadow-sm",
      meta: "text-center font-bold text-indigo-500 dark:text-indigo-300 mt-4 text-xl",
      card: "mb-8 bg-white dark:bg-slate-700 p-6 rounded-3xl shadow-lg border-4 border-indigo-100 dark:border-slate-600"
    },
    Magazine: {
      container: "bg-[#111] text-white",
      header: "border-b border-gray-600 pb-12 mb-12 relative overflow-hidden",
      title: "text-8xl md:text-[10rem] font-black tracking-tighter text-white uppercase relative z-10 leading-none mix-blend-overlay",
      meta: "text-gray-400 text-lg font-medium mt-8 tracking-[0.5em] uppercase flex gap-12",
      card: "mb-16 border-b border-gray-800 pb-10"
    }
  };

  const currentStyle = styles[style] || styles.Classic;

  const fontClass = settings.font === 'dyslexic' ? 'font-sans' : (settings.font === 'sans' ? 'font-sans' : 'font-serif');
  const spacingClass = settings.spacing === 'loose' ? 'leading-loose' : (settings.spacing === 'compact' ? 'leading-tight' : 'leading-relaxed');
  const textSizeClass = settings.fontSize === 'lg' ? 'text-2xl' : (settings.fontSize === 'sm' ? 'text-lg' : 'text-xl');
  const baseFont = style === 'Classic' ? 'font-serif' : 'font-sans';
  const effectiveFont = settings.font === 'serif' ? baseFont : fontClass;

  const renderContent = (section: any, index: number) => {
      if (index > visibleSections) return null;
      const isWriting = isLive && index === visibleSections;
      const shouldAnimate = isWriting;

      const handleUpdate = (newContent: any) => {
          if (onSectionUpdate) {
              if (section.type === 'headline') {
                  onSectionUpdate(index, newContent);
              } else if (section.type === 'text') {
                  onSectionUpdate(index, { ...section, content: newContent });
              }
          }
      };

      return (
        <div 
            key={index} 
            ref={isWriting ? activeSectionRef : null}
            className={`${currentStyle.card} relative article-card break-inside-avoid`}
        >
            {section.title && section.type !== 'headline' && (
                <h3 className={`font-black text-2xl border-b-2 mb-4 pb-2 uppercase tracking-wide flex items-center gap-3 ${style === 'Magazine' ? 'border-indigo-500 text-indigo-400' : 'border-current text-gray-800 dark:text-gray-200'}`}>
                    {section.type === 'timeline' && <Clock size={24}/>}
                    {section.type === 'graph' && <TrendingUp size={24}/>}
                    {style === 'Kids' && <Sparkles size={24} className="text-yellow-400" />}
                    {section.title}
                </h3>
            )}

            {section.type === 'headline' && (
                <NewspaperSection type="headline" content={section} onUpdate={handleUpdate} isLive={isLive}>
                    <div className="mb-6" dir="auto">
                        <h2 className={`font-black leading-[0.9] mb-4 ${style === 'Tabloid' ? 'text-6xl italic uppercase' : 'text-5xl md:text-7xl'}`}>
                            {shouldAnimate ? (
                                <TypewriterText text={section.title} speed={20} onComplete={handleSectionComplete} />
                            ) : section.title}
                        </h2>
                        <div className="w-full h-1.5 bg-current opacity-20 my-4"></div>
                    </div>
                </NewspaperSection>
            )}

            {section.type === 'text' && (
                <NewspaperSection type="text" content={section.content} onUpdate={handleUpdate} isLive={isLive}>
                    <div className={`${textSizeClass} ${spacingClass} text-justify whitespace-pre-line ${style === 'Magazine' ? 'text-gray-300' : 'text-gray-800 dark:text-gray-300'} article-body font-medium`} dir="auto">
                        {shouldAnimate ? (
                            <TypewriterText text={section.content} speed={5} onComplete={handleSectionComplete} />
                        ) : section.content}
                    </div>
                </NewspaperSection>
            )}

            {section.type === 'images' && (
                <NewspaperSection type="images" content={section.content} onUpdate={handleUpdate} isLive={isLive}>
                    <div className="space-y-4 mb-6">
                        <div className={`aspect-video bg-gray-200 dark:bg-gray-800 overflow-hidden relative ${style === 'Kids' ? 'rounded-3xl rotate-1 border-4 border-white shadow-xl' : 'rounded-sm grayscale-[20%] hover:grayscale-0 transition-all duration-700 shadow-md'}`}>
                            <img 
                                src={section.content[0]} 
                                alt="Visual" 
                                className={`w-full h-full object-cover transition-all duration-[2000ms] ${shouldAnimate ? 'blur-xl scale-110' : 'blur-0 scale-100'}`}
                                onLoad={() => { if(shouldAnimate) setTimeout(handleSectionComplete, 1000) }}
                                onError={(e) => {
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800";
                                    if(shouldAnimate) setTimeout(handleSectionComplete, 1000);
                                }} 
                            />
                        </div>
                        {section.imageCaption && (
                            <p className="text-sm font-bold opacity-70 uppercase tracking-wider flex items-center gap-2 border-l-4 border-current pl-3">
                                {section.imageCaption}
                            </p>
                        )}
                    </div>
                </NewspaperSection>
            )}

            {(section.type === 'timeline' || section.type === 'graph' || section.type === 'flowchart') && (
                <div onLoad={() => isLive && setTimeout(handleSectionComplete, 800)}>
                    <div className="p-8 bg-black/5 dark:bg-white/5 rounded-xl text-center text-lg font-mono opacity-60 border-2 border-black/10 dark:border-white/10 dashed">
                        [Graphic Visualization Generated]
                    </div>
                    {shouldAnimate && <span className="hidden" ref={(el) => { if(el) setTimeout(handleSectionComplete, 1000); }}></span>}
                </div>
            )}
        </div>
      );
  };

  const ITEMS_PER_PAGE = 4;
  const pages = [];
  for (let i = 0; i < data.sections.length; i += ITEMS_PER_PAGE) {
      pages.push(data.sections.slice(i, i + ITEMS_PER_PAGE));
  }

  return (
    <div ref={ref} className="print-container flex flex-col items-center gap-8 py-8 w-full">
        <style>{`
            .article-body p:first-of-type::first-letter {
                float: left;
                font-size: 3.5em;
                line-height: 0.8;
                font-weight: 900;
                margin-right: 0.15em;
                margin-top: 0.05em;
                color: inherit;
            }
            .newspaper-page {
                page-break-after: always;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            /* Explicit print export overrides to prevent dark mode / overlaps */
            .print-export {
                background-color: #ffffff !important;
                color: #000000 !important;
                width: 1024px !important;
                max-width: 1024px !important;
                min-width: 1024px !important;
                margin: 0 !important;
                padding: 40px !important;
                border: none !important;
                box-shadow: none !important;
            }
            .print-export * {
                color: #000000 !important;
                text-shadow: none !important;
                border-color: #000000 !important;
            }
            .print-export .bg-black { background-color: #000000 !important; color: #ffffff !important; }
            .print-export .text-white { color: #000000 !important; }
            .print-export img { filter: none !important; }
        `}</style>
        
        {pages.map((pageSections, pageIndex) => (
            <div 
                key={pageIndex}
                data-page-index={pageIndex}
                className={`newspaper-page w-full max-w-[1024px] min-h-[1400px] h-auto p-12 md:p-16 ${currentStyle.container} ${effectiveFont} transition-all duration-500 bg-white dark:bg-gray-900 mx-auto`}
            >
                {pageIndex === 0 ? (
                    <header className={`${currentStyle.header} animate-in fade-in duration-1000`}>
                        {style === 'Classic' ? (
                            <h1 className={currentStyle.title}>
                                <TypewriterText text={data.title} speed={70} />
                            </h1>
                        ) : (
                            <h1 className={currentStyle.title}>{data.title}</h1>
                        )}
                        
                        <div className={currentStyle.meta}>
                        <span className="flex items-center gap-3">
                            {isLive && <span className="w-4 h-4 bg-red-600 rounded-full animate-pulse shadow-sm"></span>}
                            {isLive ? 'LIVE WRITING...' : `VOL #${data.issueNumber || '101'}`}
                        </span>
                        <span>{data.date}</span>
                        <span>{data.price || '$2.00'}</span>
                        </div>
                    </header>
                ) : (
                    <div className="border-b-2 border-gray-300 dark:border-gray-700 pb-4 mb-8 flex justify-between text-gray-400 font-bold uppercase tracking-widest">
                        <span>{data.title}</span>
                        <span>Page {pageIndex + 1}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative items-start h-full">
                    <div className="col-span-1 space-y-8">
                        {pageSections.filter((_, i) => i % 2 === 0).map((section, idx) => {
                            const globalIndex = pageIndex * ITEMS_PER_PAGE + idx * 2;
                            if (globalIndex > visibleSections) return null;
                            return renderContent(section, globalIndex);
                        })}
                    </div>
                    <div className="col-span-1 space-y-8 mt-8 md:mt-0">
                        {pageSections.filter((_, i) => i % 2 !== 0).map((section, idx) => {
                            const globalIndex = pageIndex * ITEMS_PER_PAGE + idx * 2 + 1;
                            if (globalIndex > visibleSections) return null;
                            return renderContent(section, globalIndex);
                        })}
                    </div>
                </div>
                
                <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-center text-gray-400 font-mono text-sm">
                    {pageIndex + 1} / {pages.length}
                </div>
            </div>
        ))}
    </div>
  );
});

export default NewspaperTemplate;
