import React from 'react';
import { Sun, Moon, Smartphone } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'amoled', icon: Smartphone, label: 'AMOLED' },
  ];

  return (
    <div className="flex bg-gray-100 p-1 rounded-xl">
      {themes.map((t) => {
          const Icon = t.icon;
          const isActive = theme === t.id;
          return (
            <button
                key={t.id}
                onClick={() => setTheme(t.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                <Icon size={16} />
                <span className="hidden md:inline">{t.label}</span>
            </button>
          )
      })}
    </div>
  );
};
export default ThemeSwitcher;