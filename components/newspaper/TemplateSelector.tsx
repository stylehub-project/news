import React from 'react';
import { Layout, Check } from 'lucide-react';
import { NewspaperStyle } from './NewspaperTemplate';

interface TemplateSelectorProps {
  selected: NewspaperStyle;
  onSelect: (style: NewspaperStyle) => void;
}

const STYLES: NewspaperStyle[] = ['Classic', 'Modern', 'Minimal', 'Tabloid', 'Kids', 'Magazine'];

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex gap-2 overflow-x-auto py-2 px-1 scrollbar-hide snap-x">
      {STYLES.map((style) => (
        <button
          key={style}
          onClick={() => onSelect(style)}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border transition-all whitespace-nowrap snap-start ${
            selected === style 
              ? 'bg-gray-900 text-white border-gray-900 shadow-lg transform scale-100' 
              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
          }`}
        >
          {style === selected ? <Check size={14} className="text-green-400" /> : <Layout size={14} />}
          {style}
        </button>
      ))}
    </div>
  );
};

export default TemplateSelector;