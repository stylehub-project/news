import React from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
];

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors w-full justify-between"
      >
        <div className="flex items-center gap-2">
            <Globe size={18} className="text-gray-500" />
            <span className="text-sm font-medium">{LANGUAGES.find(l => l.code === language)?.label}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
            {LANGUAGES.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => {
                        setLanguage(lang.code as any);
                        setIsOpen(false);
                    }}
                    className="flex items-center justify-between w-full px-4 py-3 text-sm hover:bg-gray-50 text-left"
                >
                    <span>{lang.label}</span>
                    {language === lang.code && <Check size={14} className="text-blue-600" />}
                </button>
            ))}
        </div>
      )}
    </div>
  );
};
export default LanguageSwitcher;