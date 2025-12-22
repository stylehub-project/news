import React from 'react';
import { Search, Bell, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex justify-between items-center transition-all duration-300">
      
      {/* Left: Profile & Logo */}
      <div className="flex items-center gap-3">
        <Link to="/profile" className="group relative block">
            {/* Cinematic Premium Avatar Container */}
            <div className="w-10 h-10 relative flex items-center justify-center">
                {/* Rotating Metallic Sheen (The Ring) */}
                <div className="absolute inset-[-2px] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(99,102,241,0.5)_120deg,rgba(236,72,153,0.5)_240deg,transparent_360deg)] animate-[spin_3s_linear_infinite] opacity-70 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Inner Border Spacer */}
                <div className="absolute inset-[1.5px] bg-white dark:bg-gray-900 rounded-full z-10"></div>
                
                {/* Avatar Image with Depth */}
                <div className="absolute inset-[3px] rounded-full overflow-hidden z-20 shadow-inner bg-gray-100 dark:bg-gray-800">
                     <img 
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop" 
                        alt="Profile" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                     />
                     {/* Gloss Overlay */}
                     <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent pointer-events-none"></div>
                </div>

                {/* Professional Status Dot */}
                <div className="absolute bottom-0 right-0 z-30 translate-x-[2px] translate-y-[2px]">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white dark:border-gray-900"></span>
                    </span>
                </div>
            </div>
        </Link>
        
        <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:rotate-3 transition-transform">
            N
            </div>
            <span className="font-bold text-gray-800 dark:text-white tracking-tight text-lg hidden min-[360px]:block">News Club</span>
        </Link>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <Link to="/ai-chat" className="hidden sm:flex items-center gap-1.5 p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold mr-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-100 dark:border-indigo-800">
            <Sparkles size={14} className="fill-indigo-600/20 dark:fill-indigo-400/20" />
            <span>Ask AI</span>
        </Link>

        <Link to="/notifications" className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-900"></span>
        </Link>
        <Link to="/search" className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95">
          <Search size={20} />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;