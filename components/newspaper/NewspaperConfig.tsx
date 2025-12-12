import React, { useState } from 'react';
import { Plus, Layout, Type, Image as ImageIcon, GitMerge, BarChart2, Clock, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import TemplateSelector from './TemplateSelector';
import { NewspaperStyle } from './NewspaperTemplate';
import Input from '../ui/Input';

interface NewspaperConfigProps {
  title: string;
  setTitle: (t: string) => void;
  style: NewspaperStyle;
  setStyle: (s: NewspaperStyle) => void;
  onGenerate: () => void;
}

const SECTIONS = [
  { id: 'summary', label: 'Summary', icon: Type },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'flowchart', label: 'Flowchart', icon: GitMerge },
  { id: 'graph', label: 'Graph', icon: BarChart2 },
  { id: 'images', label: 'Images', icon: ImageIcon },
];

const NewspaperConfig: React.FC<NewspaperConfigProps> = ({
  title,
  setTitle,
  style,
  setStyle,
  onGenerate
}) => {
  const [activeSections, setActiveSections] = useState<string[]>(['summary', 'timeline']);

  const toggleSection = (id: string) => {
    setActiveSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-8 overflow-y-auto bg-gray-50/50">
      
      {/* 6.2 Editor - Header Block */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg"><Layout size={18} /></span>
            <h3 className="font-bold text-gray-800">Edition Details</h3>
        </div>
        <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Headline</label>
            <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g. The Daily Future" 
            className="font-serif text-xl font-bold bg-gray-50 border-transparent focus:bg-white transition-colors"
            />
        </div>
      </div>

      {/* 6.1 Template Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
             <label className="text-sm font-bold text-gray-700">Style Template</label>
             <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">4 Styles</span>
        </div>
        <TemplateSelector selected={style} onSelect={setStyle} />
      </div>

      {/* 6.2 Editor - Blocks */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-gray-700 px-1">Content Blocks</label>
        <div className="grid grid-cols-1 gap-2">
            {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSections.includes(section.id);
                return (
                    <div
                        key={section.id}
                        onClick={() => toggleSection(section.id)}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all duration-200 group ${
                            isActive 
                            ? 'bg-white border-blue-500 shadow-md translate-x-1' 
                            : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'
                        }`}
                    >
                        <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                            <Icon size={18} />
                        </div>
                        <span className={`text-sm font-bold ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>{section.label}</span>
                        
                        {/* Drag Handle Simulation */}
                        <div className="ml-auto flex flex-col gap-[2px] opacity-20 group-hover:opacity-50">
                            <div className="w-1 h-1 bg-black rounded-full"></div>
                            <div className="w-1 h-1 bg-black rounded-full"></div>
                            <div className="w-1 h-1 bg-black rounded-full"></div>
                        </div>
                    </div>
                );
            })}
        </div>
        
        <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-white hover:border-blue-400 hover:text-blue-500 transition-all">
            <Plus size={16} /> Add Custom Section
        </button>
      </div>

      {/* 6.2 AI Write Button */}
      <div className="pt-4 mt-auto sticky bottom-0 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pb-4">
        <Button 
            onClick={onGenerate} 
            size="lg" 
            fullWidth 
            className="shadow-xl shadow-indigo-500/30 bg-gradient-to-r from-indigo-600 to-violet-600 border border-white/20"
            leftIcon={<Sparkles size={18} className="text-yellow-300 animate-pulse" />}
        >
            AI Write & Layout
        </Button>
      </div>
    </div>
  );
};

export default NewspaperConfig;