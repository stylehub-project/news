import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Settings, Bookmark, Share2, Type, MoveVertical, FastForward, Sparkles } from 'lucide-react';
import HighlightReadingMode from '../../components/HighlightReadingMode';
import Sheet from '../../components/ui/Sheet';

const MOCK_ARTICLE = {
  id: '1',
  title: "The Future of AI: Beyond Generative Models",
  author: "Dr. Sarah Connors",
  source: "TechDaily",
  content: "Artificial Intelligence has evolved rapidly over the past decade. From simple rule-based systems to complex neural networks, the journey has been transformative. Today, we stand on the brink of a new era: General Purpose AI.\n\nUnlike its predecessors, which were designed for specific tasks, modern AI aims to understand context, reason through problems, and adapt to new situations without explicit retraining. This shift promises to revolutionize industries ranging from healthcare to transportation.\n\nHowever, with great power comes great responsibility. The ethical implications of autonomous systems are vast. We must consider bias, privacy, and the socio-economic impact of automation. As we move forward, a balanced approach—prioritizing human well-being alongside technological advancement—is crucial."
};

const DetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Reader State
  const [isReading, setIsReading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [fontSize, setFontSize] = useState(16);
  const [speed, setSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  // Theme Styles
  const themes = {
    light: 'bg-white text-gray-900',
    sepia: 'bg-[#f4ecd8] text-[#5b4636]',
    dark: 'bg-[#1a1a1a] text-[#e0e0e0]'
  };

  const handleToggleRead = () => setIsReading(!isReading);

  return (
    <div className={`min-h-screen flex flex-col ${themes[theme]} transition-colors duration-300 pb-24`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 px-4 py-3 flex items-center justify-between border-b ${theme === 'dark' ? 'border-gray-800 bg-[#1a1a1a]/90' : 'border-gray-100 bg-white/90'} backdrop-blur-md`}>
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200/20 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-2">
            <button onClick={() => setShowSettings(true)} className="p-2 rounded-full hover:bg-gray-200/20 transition-colors">
                <Type size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-200/20 transition-colors">
                <Bookmark size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-200/20 transition-colors">
                <Share2 size={20} />
            </button>
        </div>
      </div>

      {/* Article Content */}
      <div className="flex-1 p-5 max-w-2xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-black mb-2 leading-tight">
          {MOCK_ARTICLE.title}
        </h1>
        
        <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-6 ${theme === 'sepia' ? 'text-[#8a6e57]' : 'text-gray-500'}`}>
            <span className="text-blue-500">{MOCK_ARTICLE.source}</span>
            <span>•</span>
            <span>{MOCK_ARTICLE.author}</span>
            <span>•</span>
            <span>5 min read</span>
        </div>

        {/* 8.1 Reading Mode Layout */}
        <div style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}>
            <HighlightReadingMode 
                text={MOCK_ARTICLE.content}
                isPlaying={isReading}
                speed={speed}
                theme={theme}
                onComplete={() => setIsReading(false)}
            />
        </div>
      </div>

      {/* 8.2 Controls (Floating) */}
      <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-4 px-5 py-2.5 rounded-full shadow-2xl z-40 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
         <button 
            onClick={() => setSpeed(prev => prev === 2 ? 0.5 : prev + 0.5)}
            className="text-xs font-bold w-8 text-center"
         >
            {speed}x
         </button>
         
         <button 
            onClick={handleToggleRead}
            className={`p-3.5 rounded-full text-white shadow-lg transition-transform active:scale-95 ${isReading ? 'bg-red-500' : 'bg-blue-600'}`}
         >
            {isReading ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-1" />}
         </button>

         {/* 7.13 AI Explain Button with Context */}
         <button 
            className="text-xs font-bold flex items-center gap-1 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
            onClick={() => navigate(`/ai-chat?context=article&headline=${encodeURIComponent(MOCK_ARTICLE.title)}`)}
         >
            <Sparkles size={14} className="fill-indigo-600/20" /> Explain
         </button>
      </div>

      {/* Settings Sheet */}
      <Sheet isOpen={showSettings} onClose={() => setShowSettings(false)} title="Reader Appearance">
         <div className="space-y-6 pt-2">
            {/* Font Size */}
            <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                    <span>Font Size</span>
                    <span>{fontSize}px</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-100 p-2 rounded-xl">
                    <span className="text-xs font-bold px-2">A</span>
                    <input 
                        type="range" 
                        min="14" 
                        max="24" 
                        value={fontSize} 
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        className="flex-1 accent-blue-600 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-xl font-bold px-2">A</span>
                </div>
            </div>

            {/* Themes */}
            <div className="space-y-2">
                <span className="text-sm font-bold text-gray-500">Theme</span>
                <div className="grid grid-cols-3 gap-3">
                    <button 
                        onClick={() => setTheme('light')}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${theme === 'light' ? 'border-blue-500 bg-white shadow-sm' : 'border-gray-200 bg-white text-gray-500'}`}
                    >
                        <div className="w-6 h-6 rounded-full border border-gray-300 bg-white"></div>
                        <span className="text-xs font-bold">Light</span>
                    </button>
                    <button 
                        onClick={() => setTheme('sepia')}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${theme === 'sepia' ? 'border-blue-500 bg-[#f4ecd8] shadow-sm' : 'border-gray-200 bg-[#f4ecd8] text-[#5b4636]'}`}
                    >
                        <div className="w-6 h-6 rounded-full border border-[#d3c0a3] bg-[#f4ecd8]"></div>
                        <span className="text-xs font-bold">Sepia</span>
                    </button>
                    <button 
                        onClick={() => setTheme('dark')}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${theme === 'dark' ? 'border-blue-500 bg-gray-900 text-white shadow-sm' : 'border-gray-700 bg-gray-900 text-gray-400'}`}
                    >
                        <div className="w-6 h-6 rounded-full border border-gray-600 bg-gray-800"></div>
                        <span className="text-xs font-bold">Dark</span>
                    </button>
                </div>
            </div>
         </div>
      </Sheet>
    </div>
  );
};

export default DetailsPage;