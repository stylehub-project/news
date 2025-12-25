
import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { User, Bell, Globe, Moon, Database, Link as LinkIcon, ChevronRight, LogOut, Check } from 'lucide-react';
import ThemeSwitcher from '../../components/ThemeSwitcher';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';

const SettingsPage: React.FC = () => {
  const [notifications, setNotifications] = useState({
      inApp: true,
      whatsapp: false,
      sms: true,
      email: false
  });
  
  const [showCacheToast, setShowCacheToast] = useState(false);

  const toggleNote = (key: keyof typeof notifications) => {
      setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 transition-colors duration-300">
      <PageHeader title="Settings" showBack />
      
      {showCacheToast && <div className="fixed top-20 right-4 z-50"><Toast type="success" message="Cache cleared successfully" onClose={() => setShowCacheToast(false)} /></div>}

      <div className="p-4 space-y-6">
        
        {/* 13.1 Profile Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User size={14} /> Profile
            </h2>
            <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop" alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Lakshya</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Free Account</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">Edit</Button>
            </div>
        </section>

        {/* 13.2 Appearance & Language */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
             <div className="space-y-2">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Moon size={14} /> Theme
                </h2>
                <ThemeSwitcher />
             </div>
             
             <div className="space-y-2 pt-2 border-t border-gray-50 dark:border-gray-700">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Globe size={14} /> Language
                </h2>
                <LanguageSwitcher />
             </div>
        </section>

        {/* 13.3 Notifications Channels */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Bell size={14} /> Notifications
            </h2>
            <div className="space-y-1">
                {[
                    { id: 'inApp', label: 'In-App Alerts', desc: 'Breaking news popups' },
                    { id: 'whatsapp', label: 'WhatsApp', desc: 'Daily summaries' },
                    { id: 'sms', label: 'SMS', desc: 'Urgent alerts only' }
                ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3">
                        <div>
                            <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{item.label}</p>
                            <p className="text-xs text-gray-400">{item.desc}</p>
                        </div>
                        <button 
                            onClick={() => toggleNote(item.id as any)}
                            className={`w-11 h-6 rounded-full relative transition-colors ${notifications[item.id as keyof typeof notifications] ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${notifications[item.id as keyof typeof notifications] ? 'left-6' : 'left-1'}`}></div>
                        </button>
                    </div>
                ))}
            </div>
        </section>

        {/* 13.4 Storage */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
             <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Database size={14} /> Storage
            </h2>
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-bold text-sm dark:text-gray-200">Cache Size</p>
                    <p className="text-xs text-gray-400">128 MB used</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setShowCacheToast(true)} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">Clear Cache</Button>
            </div>
        </section>

        {/* 13.5 Linked Accounts */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
             <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <LinkIcon size={14} /> Linked Accounts
            </h2>
            <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-2 font-bold text-sm text-gray-700 dark:text-gray-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div> Google
                    </div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">Connected <Check size={12}/></span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg opacity-60">
                     <div className="flex items-center gap-2 font-bold text-sm text-gray-700 dark:text-gray-200">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div> Twitter
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs h-6 px-2 dark:text-gray-300">Connect</Button>
                </div>
            </div>
        </section>

        <Button variant="ghost" fullWidth className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600">
            <LogOut size={18} /> Log Out
        </Button>

        {/* Branding Tagline */}
        <div className="text-center py-6 opacity-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">A Product by Style Hub</p>
            <p className="text-[9px] text-gray-400 mt-1">The Hub of Upcoming Technical Generation</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
