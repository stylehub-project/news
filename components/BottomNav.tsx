import React from 'react';
import { Home, Grid, PlaySquare, MessageSquare, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const { appLanguage } = useLanguage();
  const t = translations[appLanguage];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { icon: Home, label: t.home, path: '/' },
    { icon: Grid, label: t.categories, path: '/categories' },
    { icon: PlaySquare, label: t.news, path: '/reel' },
    { icon: MessageSquare, label: t.ai_chat, path: '/ai-chat' },
    { icon: User, label: t.profile, path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 px-2 z-50 flex justify-around items-end h-[70px] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-300">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center justify-center w-full py-2 transition-all duration-300 relative group ${
            isActive(item.path) 
              ? 'text-blue-600 dark:text-blue-400 -translate-y-1' 
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          {isActive(item.path) && (
            <div className="absolute -top-2 w-8 h-1 bg-blue-600 dark:bg-blue-400 rounded-b-full shadow-sm animate-pulse"></div>
          )}
          <item.icon 
            size={isActive(item.path) ? 24 : 22} 
            strokeWidth={isActive(item.path) ? 2.5 : 2} 
            fill={isActive(item.path) && !item.path.includes('categories') ? "currentColor" : "none"}
            className="transition-transform duration-300 group-active:scale-90"
          />
          <span className={`text-[10px] font-medium mt-1 transition-all ${isActive(item.path) ? 'font-bold' : ''}`}>
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default BottomNav;