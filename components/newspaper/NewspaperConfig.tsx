import React, { useState } from 'react';
import { Plus, Layout, Type, Image as ImageIcon, GitMerge, BarChart2, Clock, Sparkles, MessageSquare, Globe, FileText, Layers } from 'lucide-react';
import Button from '../ui/Button';
import TemplateSelector from './TemplateSelector';
import { NewspaperStyle } from './NewspaperTemplate';
import Input from '../ui/Input';
import { useNavigate } from 'react-router-dom';

interface NewspaperConfigProps {
  title: string;
  setTitle: (t: string) => void;
  style: NewspaperStyle;
  setStyle: (s: NewspaperStyle) => void;
  onGenerate: (config: any) => void;
}

const NewspaperConfig: React.FC<NewspaperConfigProps> = ({
  title,
  setTitle,
  style,
  setStyle,
  onGenerate
}) => {
  const navigate = useNavigate();
  const [scope, setScope] = useState('World News');
  const [language, setLanguage] = useState('English');
  const [pages, setPages] = useState('1 Page');

  const handleConsultAI = () => {
      navigate(`/ai-chat?context=newspaper&topic=${encodeURIComponent(title || 'General News')}`);
  };

  const handleGenerateClick = () => {
      onGenerate({
          scope,
          language,
          pages
      });
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-6 overflow-y-auto bg-gray-50/50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Header Block */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-5 transition-colors">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 p-2 rounded-xl"><Layout size={20} /></span>
                <div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg leading-none">Editorial Setup</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Configure your daily edition</p>
                </div>
            </div>
            <button onClick={handleConsultAI} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-100 dark:border-indigo-800">
                <MessageSquare size={12} /> AI Editor
            </button>
        </div>

        <div className="space-y-4">
            <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block ml-1">Newspaper Name</label>
                <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="The Daily Future" 
                    className="font-serif text-xl font-bold bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 transition-colors py-3 dark:text-white dark:placeholder:text-gray-600"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block ml-1">Content Scope</label>
                    <div className="relative">
                        <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                        <select 
                            value={scope}
                            onChange={(e) => setScope(e.target.value)}
                            className="w-full pl-9 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 appearance-none focus:bg-white dark:focus:bg-gray-800 outline-none transition-colors"
                        >
                            <option>World News</option>
                            <option>Technology</option>
                            <option>Politics</option>
                            <option>Finance</option>
                            <option>Sports</option>
                            <option>Satire</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block ml-1">Language</label>
                    <div className="relative">
                        <Type size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                        <select 
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full pl-9 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 appearance-none focus:bg-white dark:focus:bg-gray-800 outline-none transition-colors"
                        >
                            <option>English</option>
                            <option>Hindi</option>
                            <option>Spanish</option>
                            <option>French</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Style Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
             <label className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2"><Layers size={16} /> Visual Theme</label>
        </div>
        <TemplateSelector selected={style} onSelect={setStyle} />
      </div>

      {/* Length Config */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 block">Edition Length</label>
          <div className="flex gap-2">
              {['1 Page', '3 Pages', 'Full Issue'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setPages(opt)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                        pages === opt 
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-black border-gray-900 dark:border-white' 
                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                      {opt}
                  </button>
              ))}
          </div>
      </div>

      {/* Generate Button */}
      <div className="pt-2 mt-auto sticky bottom-0 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent dark:from-gray-900 dark:via-gray-900 pb-4 transition-colors duration-300">
        <Button 
            onClick={handleGenerateClick} 
            size="lg" 
            fullWidth 
            className="shadow-xl shadow-indigo-500/30 bg-gradient-to-r from-indigo-600 to-violet-600 border border-white/20 h-14 text-lg"
            leftIcon={<Sparkles size={20} className="text-yellow-300 animate-pulse" />}
        >
            Write Newspaper
        </Button>
        <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-3 font-medium">
            AI will generate layout, write articles, and create images live.
        </p>
      </div>
    </div>
  );
};

export default NewspaperConfig;