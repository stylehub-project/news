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
              ? 'bg-gray-900 dark:bg-white text-white dark:text-black border-gray-900 dark:border-white shadow-lg transform scale-100' 
              : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          {style === selected ? <Check size={14} className="text-green-400 dark:text-green-600" /> : <Layout size={14} />}
          {style}
        </button>
      ))}
    </div>
  );
};

export default TemplateSelector;