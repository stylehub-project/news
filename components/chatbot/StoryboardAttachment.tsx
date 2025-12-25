
import React, { useState } from 'react';
import { Play, Pause, Share2, Maximize2, X, BarChart3, Clock, Zap, ArrowRight } from 'lucide-react';
import Modal from '../ui/Modal';

export interface StoryboardData {
  headline: string;
  summary: string;
  audioDuration: string;
  highlights: string[];
  graph?: { label: string; value: number }[];
  timeline?: { time: string; event: string }[];
  imageUrl?: string;
}

interface StoryboardAttachmentProps {
  data: StoryboardData;
}

const StoryboardAttachment: React.FC<StoryboardAttachmentProps> = ({ data }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(data.summary);
      
      // Professional News Voice Configuration
      const voices = window.speechSynthesis.getVoices();
      const newsVoice = voices.find(v => v.name === "Google US English") || 
                        voices.find(v => v.name === "Microsoft Zira - English (United States)") ||
                        voices.find(v => v.lang === 'en-GB' && v.name.includes("Google")) ||
                        voices.find(v => v.lang === 'en-US') || 
                        voices[0];
      
      if (newsVoice) utterance.voice = newsVoice;
      utterance.pitch = 1.0; // Neutral, professional pitch
      utterance.rate = 1.0; // Standard broadcast rate

      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const Content = () => (
    <div className="space-y-4">
       {/* 1. Header Card (Image + Audio) */}
       <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video group">
          <img src={data.imageUrl || "https://picsum.photos/600/300"} alt="Cover" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 p-4 w-full">
             <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded uppercase tracking-wider">Daily Briefing</span>
                <button onClick={togglePlay} className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full hover:bg-white/30 transition-colors">
                    {isPlaying ? <Pause size={12} className="text-white fill-white" /> : <Play size={12} className="text-white fill-white" />}
                    <span className="text-xs font-bold text-white">{isPlaying ? 'Playing...' : `Listen (${data.audioDuration})`}</span>
                </button>
             </div>
             <h3 className="text-lg font-black text-white leading-tight">{data.headline}</h3>
          </div>
       </div>

       {/* 2. Key Points (Horizontal Scroll) */}
       <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
             <Zap size={14} className="text-yellow-500" /> Key Highlights
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
             {data.highlights.map((point, i) => (
                <div key={i} className="min-w-[140px] bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex flex-col justify-between">
                   <span className="text-2xl font-black text-indigo-200 mb-1">0{i+1}</span>
                   <p className="text-xs font-bold text-indigo-900 leading-snug">{point}</p>
                </div>
             ))}
          </div>
       </div>

       {/* 3. Visual Data (Graph) */}
       {data.graph && (
         <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
               <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1"><BarChart3 size={14}/> Market Impact</span>
               <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold">+2.4% Overall</span>
            </div>
            <div className="flex items-end justify-between h-20 gap-2">
               {data.graph.map((item, i) => (
                  <div key={i} className="flex flex-col items-center flex-1 group">
                     <div className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-colors relative" style={{ height: `${item.value}%` }}>
                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-gray-600 opacity-0 group-hover:opacity-100">{item.value}</span>
                     </div>
                     <span className="text-[9px] text-gray-400 mt-1 uppercase font-bold">{item.label}</span>
                  </div>
               ))}
            </div>
         </div>
       )}

       {/* 4. Timeline (Vertical) */}
       {data.timeline && (
         <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
               <Clock size={14} /> Timeline
            </div>
            <div className="space-y-3 relative pl-1">
               <div className="absolute top-2 left-[5px] bottom-2 w-0.5 bg-gray-200"></div>
               {data.timeline.map((item, i) => (
                  <div key={i} className="flex gap-3 relative">
                     <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm z-10 shrink-0"></div>
                     <div>
                        <span className="text-[10px] font-bold text-gray-400 block">{item.time}</span>
                        <p className="text-xs font-medium text-gray-800">{item.event}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
       )}
    </div>
  );

  return (
    <>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 max-w-sm w-full relative group transition-all hover:shadow-md">
            <button 
                onClick={() => setIsExpanded(true)} 
                className="absolute top-3 right-3 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-gray-500 hover:text-blue-600 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Maximize2 size={16} />
            </button>
            <Content />
            
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Generated by Gemini</span>
                <button className="text-gray-400 hover:text-blue-600 transition-colors">
                    <Share2 size={16} />
                </button>
            </div>
        </div>

        {/* Full Screen Modal */}
        <Modal isOpen={isExpanded} onClose={() => setIsExpanded(false)} title="Daily Briefing" size="lg">
            <div className="p-2">
                <Content />
            </div>
        </Modal>
    </>
  );
};

export default StoryboardAttachment;
