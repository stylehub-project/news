
import React, { useState, useEffect } from 'react';
import { X, Sparkles, MapPin, List, ArrowRight, BrainCircuit, Globe, Volume2, Pause, ShieldCheck, ExternalLink, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReelExpandLayerProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    id: string;
    articleId: string; // The correct ID for navigation
    title: string;
    description: string;
    source: string;
    tags?: string[];
    aiSummary?: string;
    keyPoints?: string[];
    factCheck?: { status: string; score: number };
    location?: { name: string; lat: number; lng: number };
    relatedNews?: Array<{ id: string; title: string; image: string; time: string }>;
  };
}

const ReelExpandLayer: React.FC<ReelExpandLayerProps> = ({ isOpen, onClose, data }) => {
  const navigate = useNavigate();
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load voices securely
  useEffect(() => {
    const loadVoices = () => {
      const vs = window.speechSynthesis.getVoices();
      setVoices(vs);
    };
    
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // Stop voice when closing
  useEffect(() => {
    if (!isOpen) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
    }
  }, [isOpen]);

  const getBestVoice = () => {
      return voices.find(v => v.name === "Google US English") || 
             voices.find(v => v.name === "Microsoft Zira - English (United States)") || 
             voices.find(v => v.name.includes("Samantha")) || 
             voices.find(v => v.name.includes("Female") && v.lang.startsWith("en")) ||
             voices.find(v => v.lang.startsWith("en")) ||
             voices[0];
  };

  const toggleVoice = () => {
    if (isPlayingVoice) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
    } else {
      const text = data.aiSummary || data.description;
      if (!text) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getBestVoice();
      if (voice) utterance.voice = voice;
      
      utterance.pitch = 1.1;
      utterance.rate = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => setIsPlayingVoice(false);
      utterance.onerror = (e) => {
          console.error("Speech Error", e);
          setIsPlayingVoice(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsPlayingVoice(true);
    }
  };

  const handleChat = () => {
      navigate(`/ai-chat?context=reel&headline=${encodeURIComponent(data.title)}`);
  };

  const handleFullArticle = () => {
      // Critical Fix: Use articleId instead of the composite Reel ID
      navigate(`/news/${data.articleId}`);
  };

  return (
    <div 
      className={`absolute inset-0 z-50 bg-gray-900/95 backdrop-blur-xl transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      onClick={(e) => e.stopPropagation()} 
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-2 text-indigo-400">
            <Sparkles size={18} className="animate-pulse" />
            <span className="font-bold text-sm tracking-wider uppercase">AI Analysis</span>
        </div>
        <button onClick={onClose} className="p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition-colors">
            <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar overscroll-contain">
        
        {/* Fact Check Badge */}
        {data.factCheck && (
            <div className={`flex items-center justify-between p-3 rounded-xl border ${data.factCheck.score > 90 ? 'bg-emerald-900/20 border-emerald-800 text-emerald-400' : 'bg-yellow-900/20 border-yellow-800 text-yellow-400'}`}>
                <div className="flex items-center gap-2">
                    <ShieldCheck size={18} />
                    <span className="font-bold text-xs uppercase tracking-wide">AI Fact Check</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{data.factCheck.status}</span>
                    <span className="bg-black/30 px-2 py-0.5 rounded text-[10px] font-mono">{data.factCheck.score}%</span>
                </div>
            </div>
        )}

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-5 rounded-2xl border border-indigo-500/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex justify-between items-start mb-3 relative z-10">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <BrainCircuit size={20} className="text-indigo-400" />
                    Executive Summary
                </h3>
                <button 
                    onClick={toggleVoice}
                    className={`p-2 rounded-full transition-all ${isPlayingVoice ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.6)] animate-pulse' : 'bg-indigo-600/30 text-white hover:bg-indigo-600/50'}`}
                >
                    {isPlayingVoice ? <Pause size={16} /> : <Volume2 size={16} />}
                </button>
            </div>
            <p className="text-gray-200 text-sm leading-relaxed relative z-10 font-medium">
                {data.aiSummary || data.description}
            </p>
        </div>

        {/* Key Points */}
        {data.keyPoints && data.keyPoints.length > 0 && (
            <div>
                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <List size={14} /> Key Takeaways
                </h4>
                <div className="space-y-2">
                    {data.keyPoints.map((point, i) => (
                        <div key={i} className="flex gap-3 items-start p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:bg-gray-800 transition-colors">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                            <p className="text-sm text-gray-300">{point}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Location Insight */}
        {data.location ? (
            <div>
                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MapPin size={14} /> Location Context
                </h4>
                <div className="h-32 w-full bg-gray-800 rounded-xl overflow-hidden relative border border-gray-700 group">
                    <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity group-hover:scale-105 duration-700"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-gray-600 shadow-lg">
                            <Globe size={14} className="text-emerald-400" />
                            <span className="text-xs font-bold text-white">{data.location.name}</span>
                        </div>
                    </div>
                </div>
            </div>
        ) : null}

        <div className="h-4"></div>
      </div>

      {/* Footer CTA */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/90 backdrop-blur-md sticky bottom-0 z-20 flex gap-3 shrink-0">
          <button 
            onClick={handleChat} 
            className="p-3.5 bg-gray-800 text-indigo-400 rounded-xl hover:bg-gray-700 transition-colors border border-gray-700"
            aria-label="Ask Chatbot"
          >
              <MessageSquare size={18} />
          </button>
          <button 
            onClick={handleFullArticle}
            className="flex-1 py-3.5 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-lg active:scale-95"
          >
              Read Full Article <ArrowRight size={18} />
          </button>
      </div>
    </div>
  );
};

export default ReelExpandLayer;
