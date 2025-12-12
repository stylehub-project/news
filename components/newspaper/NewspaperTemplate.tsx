import React from 'react';
import { Clock, ArrowRight, TrendingUp, Sparkles, Star } from 'lucide-react';

export type NewspaperStyle = 'Classic' | 'Modern' | 'Minimal' | 'Tabloid' | 'Kids' | 'Magazine';

export interface NewspaperData {
  title: string;
  date: string;
  sections: Array<{
    type: 'text' | 'timeline' | 'flowchart' | 'graph' | 'images';
    title: string;
    content: any;
  }>;
}

interface NewspaperTemplateProps {
  style: NewspaperStyle;
  data: NewspaperData;
}

const NewspaperTemplate: React.FC<NewspaperTemplateProps> = ({ style, data }) => {
  const styles = {
    Classic: {
      container: "font-serif bg-[#fdfbf7] text-black",
      header: "border-b-4 border-black pb-4 mb-6 text-center",
      title: "text-4xl md:text-5xl font-black uppercase tracking-widest",
      meta: "flex justify-between text-xs mt-2 border-t border-black pt-1 font-mono uppercase",
      card: "mb-6 border-b border-black/10 pb-4"
    },
    Modern: {
      container: "font-sans bg-white text-gray-900",
      header: "border-b border-gray-200 pb-6 mb-6 flex justify-between items-end",
      title: "text-3xl md:text-4xl font-bold tracking-tight text-blue-900",
      meta: "text-right text-sm font-medium text-gray-500",
      card: "mb-8 bg-gray-50 p-6 rounded-xl"
    },
    Minimal: {
      container: "font-sans bg-white text-gray-800",
      header: "pb-8 mb-8 text-center",
      title: "text-3xl font-light tracking-[0.3em] uppercase",
      meta: "text-xs text-gray-400 mt-4",
      card: "mb-10 border-l-2 border-gray-100 pl-6"
    },
    Tabloid: {
      container: "font-sans bg-yellow-50 text-black border-8 border-red-600 p-2",
      header: "bg-red-600 text-white p-4 mb-4 text-center transform -skew-x-2",
      title: "text-5xl font-black italic uppercase leading-none",
      meta: "text-center font-bold text-black mt-2 bg-yellow-300 inline-block px-2",
      card: "mb-4 border-b-4 border-black pb-4"
    },
    Kids: {
      container: "font-sans bg-sky-100 text-indigo-900 border-dashed border-4 border-indigo-300 p-4 rounded-3xl",
      header: "bg-white rounded-2xl p-4 mb-6 text-center shadow-lg transform rotate-1",
      title: "text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500",
      meta: "text-center font-bold text-indigo-400 mt-2",
      card: "mb-6 bg-white p-4 rounded-2xl shadow-md border-2 border-indigo-100"
    },
    Magazine: {
      container: "font-sans bg-gray-900 text-white",
      header: "border-b border-gray-700 pb-8 mb-8 relative overflow-hidden",
      title: "text-6xl font-black tracking-tighter text-white uppercase relative z-10",
      meta: "text-gray-400 text-sm font-medium mt-4 tracking-widest uppercase",
      card: "mb-8"
    }
  };

  const currentStyle = styles[style] || styles.Classic;

  // --- Renderers ---

  const renderTimeline = (events: any[]) => (
    <div className={`space-y-4 pl-2 border-l-2 ml-2 ${style === 'Magazine' ? 'border-gray-700' : 'border-gray-200'}`}>
      {events.map((evt, i) => (
        <div key={i} className="relative pl-4">
          <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 ${style === 'Kids' ? 'bg-yellow-400 border-pink-500' : 'bg-white border-blue-500'}`}></div>
          <span className={`text-xs font-bold uppercase ${style === 'Magazine' ? 'text-gray-400' : 'text-gray-500'}`}>{evt.time}</span>
          <h4 className="font-bold text-sm">{evt.title}</h4>
          <p className={`text-xs ${style === 'Magazine' ? 'opacity-60' : 'opacity-80'}`}>{evt.desc}</p>
        </div>
      ))}
    </div>
  );

  const renderFlowchart = (steps: string[]) => (
    <div className={`flex flex-wrap items-center gap-2 justify-center py-4 rounded-lg ${style === 'Kids' ? 'bg-yellow-50' : 'bg-white/50'}`}>
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div className={`px-3 py-2 rounded-lg text-xs font-bold shadow-sm ${style === 'Kids' ? 'bg-white text-indigo-600 border-2 border-indigo-200' : 'bg-white border-2 border-gray-800 text-gray-900'}`}>
            {step}
          </div>
          {i < steps.length - 1 && <ArrowRight size={16} className={style === 'Magazine' ? 'text-gray-500' : 'text-gray-400'} />}
        </React.Fragment>
      ))}
    </div>
  );

  const renderGraph = (data: {label: string, value: number}[]) => (
    <div className="flex items-end justify-between h-32 gap-2 pt-4 px-2">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 group">
           <div className="text-[10px] font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{d.value}%</div>
           <div 
             className={`w-full rounded-t-sm opacity-80 hover:opacity-100 transition-all relative ${style === 'Kids' ? 'bg-pink-400 rounded-t-xl' : 'bg-indigo-500'}`}
             style={{ height: `${d.value}%` }}
           ></div>
           <span className="text-[9px] uppercase mt-1 font-medium truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );

  const renderImages = (images: string[]) => (
    <div className="grid grid-cols-3 gap-2">
        {images.map((img, i) => (
            <div key={i} className={`aspect-square bg-gray-200 overflow-hidden ${style === 'Kids' ? 'rounded-2xl border-4 border-white shadow-md rotate-1' : 'rounded-lg'}`}>
                <img src={img} alt="Visual" className="w-full h-full object-cover" />
            </div>
        ))}
    </div>
  );

  return (
    <div className={`w-full h-full min-h-[800px] p-6 md:p-10 shadow-xl ${currentStyle.container} transition-all duration-500`}>
      <header className={currentStyle.header}>
        <h1 className={currentStyle.title}>{data.title}</h1>
        <div className={currentStyle.meta}>
          {style === 'Kids' && <Star size={16} className="inline mr-1 text-yellow-500 fill-yellow-500" />}
          <span>Overview</span>
          <span className="mx-2">•</span>
          <span>{data.date}</span>
          <span className="mx-2">•</span>
          <span>AI Generated</span>
          {style === 'Kids' && <Star size={16} className="inline ml-1 text-yellow-500 fill-yellow-500" />}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {data.sections.map((section, idx) => (
            <div key={idx} className={`${currentStyle.card} break-inside-avoid ${section.type === 'images' ? 'col-span-full' : ''}`}>
                <h3 className={`font-bold text-lg border-b-2 mb-3 pb-1 uppercase tracking-wide flex items-center gap-2 ${style === 'Magazine' ? 'border-indigo-500 text-indigo-400' : 'border-current'}`}>
                    {section.type === 'timeline' && <Clock size={16}/>}
                    {section.type === 'graph' && <TrendingUp size={16}/>}
                    {style === 'Kids' && <Sparkles size={16} className="text-yellow-400" />}
                    {section.title}
                </h3>
                
                {section.type === 'text' && (
                    <p className={`text-sm leading-relaxed text-justify whitespace-pre-line ${style === 'Magazine' ? 'text-gray-300' : 'opacity-90'}`}>{section.content}</p>
                )}
                
                {section.type === 'timeline' && renderTimeline(section.content)}
                
                {section.type === 'flowchart' && renderFlowchart(section.content)}
                
                {section.type === 'graph' && renderGraph(section.content)}
                
                {section.type === 'images' && renderImages(section.content)}
            </div>
        ))}
      </div>
    </div>
  );
};

export default NewspaperTemplate;