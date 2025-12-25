
import React from 'react';
import { Camera, Settings, ShieldCheck, Zap, Globe, Smartphone, BookOpen, RotateCcw } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import ThemeSwitcher from '../../components/ThemeSwitcher';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../utils/translations';

const ProfilePage: React.FC = () => {
  const { appLanguage, setAppLanguage, contentLanguage, setContentLanguage } = useLanguage();
  const t = translations[appLanguage];

  const handleResetApp = () => {
      if (window.confirm("Are you sure you want to reset the app? This will clear all your saved data, preferences, and bookmarks.")) {
          localStorage.clear();
          sessionStorage.clear();
          window.location.reload();
      }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 h-full flex flex-col transition-colors duration-300">
      <div className="shrink-0">
        <PageHeader title={t.my_profile} />
      </div>
      
      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 custom-scrollbar">
        <div className="flex flex-col items-center mb-8 mt-4">
            
            {/* Cinematic Avatar Composition */}
            <div className="relative w-36 h-36 mb-6 group cursor-pointer">
                {/* Volumetric Backlight Glow */}
                <div className="absolute -inset-6 bg-gradient-to-tr from-blue-600/30 to-purple-600/30 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity duration-1000"></div>
                
                {/* Orbital Ring 1 (Cyan/Blue) - Rotates Clockwise */}
                <div className="absolute -inset-[3px] rounded-full border border-cyan-500/20 border-t-cyan-400 border-r-transparent animate-[spin_8s_linear_infinite]"></div>
                
                {/* Orbital Ring 2 (Purple/Pink) - Rotates Counter-Clockwise */}
                <div className="absolute inset-[3px] rounded-full border border-purple-500/20 border-b-purple-400 border-l-transparent animate-[spin_12s_linear_infinite_reverse]"></div>

                {/* Main Avatar Container */}
                <div className="absolute inset-[8px] rounded-full z-10 overflow-hidden border-4 border-white/20 dark:border-black/20 shadow-[0_10px_40px_rgba(0,0,0,0.3)] bg-gray-100 dark:bg-gray-800">
                    <img 
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop" 
                        alt="Profile" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    
                    {/* Cinematic Lens Flare/Gloss */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-black/10 pointer-events-none"></div>
                    
                    {/* Hover Overlay with Edit Icon */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Camera size={28} className="text-white drop-shadow-md" />
                    </div>
                </div>

                {/* Premium Gold Badge */}
                <div className="absolute -bottom-2 -right-2 z-20 animate-in zoom-in duration-500 delay-100">
                    <div className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 text-amber-950 text-[10px] font-black px-3 py-1 rounded-full shadow-lg border border-white/40 flex items-center gap-1 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={12} className="text-amber-800" />
                        <span className="tracking-wide">PRO</span>
                    </div>
                </div>
                
                {/* Status Indicator */}
                <div className="absolute top-1 right-2 z-20">
                     <div className="w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm animate-pulse"></div>
                </div>
            </div>

            {/* Typography */}
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight drop-shadow-sm">Lakshya</h2>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">@lakshya</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <Zap size={10} className="fill-current" /> {t.early_adopter}
                </span>
            </div>
        </div>

        <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-colors hover:shadow-md duration-300 cursor-pointer group">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl group-hover:scale-110 transition-transform"><Settings size={20}/></div>
                    <span className="font-bold text-gray-700 dark:text-gray-200">{t.account_settings}</span>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-3 transition-colors">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">{t.appearance}</span>
                <ThemeSwitcher />
            </div>

            {/* Language Selection Section */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4 transition-colors">
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1 block">{t.language_preferences}</span>
                 
                 {/* App Interface Language */}
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Smartphone size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{t.app_interface}</p>
                            <p className="text-[10px] text-gray-500">{t.interface_desc}</p>
                        </div>
                    </div>
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button 
                            onClick={() => setAppLanguage('en')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${appLanguage === 'en' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-300' : 'text-gray-500'}`}
                        >
                            English
                        </button>
                        <button 
                            onClick={() => setAppLanguage('hi')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${appLanguage === 'hi' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-300' : 'text-gray-500'}`}
                        >
                            Hindi
                        </button>
                    </div>
                 </div>

                 <div className="h-px bg-gray-100 dark:bg-gray-700"></div>

                 {/* Content Language */}
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                            <BookOpen size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{t.news_content}</p>
                            <p className="text-[10px] text-gray-500">{t.content_desc}</p>
                        </div>
                    </div>
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button 
                            onClick={() => setContentLanguage('en')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${contentLanguage === 'en' ? 'bg-white dark:bg-gray-600 shadow text-emerald-600 dark:text-emerald-300' : 'text-gray-500'}`}
                        >
                            English
                        </button>
                        <button 
                            onClick={() => setContentLanguage('hi')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${contentLanguage === 'hi' ? 'bg-white dark:bg-gray-600 shadow text-emerald-600 dark:text-emerald-300' : 'text-gray-500'}`}
                        >
                            Hindi
                        </button>
                    </div>
                 </div>
            </div>

            <div 
                onClick={handleResetApp}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between text-red-500 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border-l-4 border-l-transparent hover:border-l-red-500"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl"><RotateCcw size={20}/></div>
                    <span className="font-bold">Reset App</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
