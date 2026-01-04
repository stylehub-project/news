
import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import { User, Bell, Globe, Moon, Database, Link as LinkIcon, LogOut, Check, Wifi, Trash2, PieChart, ShieldAlert, Smartphone, Zap, Bookmark, BrainCircuit, Activity, Sparkles, Clock, Sliders, TrendingUp, PauseCircle, PlayCircle, RefreshCw, EyeOff, Shield, ShieldCheck } from 'lucide-react';
import ThemeSwitcher from '../../components/ThemeSwitcher';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import { useNetwork } from '../../context/NetworkContext';
import { useNotification, NotificationPreferences } from '../../context/NotificationContext';
import { useHistory } from '../../context/HistoryContext';
import { useLanguage } from '../../context/LanguageContext';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
];

const SettingsPage: React.FC = () => {
  const { isLowData, lowDataPreference, setLowDataPreference, dataUsage, clearCache } = useNetwork();
  const { preferences, updatePreference, triggerTestNotification, pauseNotifications, resumeNotifications, resetPersonalization } = useNotification();
  const { isPaused, togglePause, clearHistory } = useHistory();
  const { appLanguage, setAppLanguage } = useLanguage();
  
  const [showToast, setShowToast] = useState<{show: boolean, msg: string, type: 'success' | 'info'}>({ show: false, msg: '', type: 'success' });
  const [pausedTimeRemaining, setPausedTimeRemaining] = useState('');

  // Update remaining time display
  useEffect(() => {
      const updateTime = () => {
          if (preferences.pausedUntil > Date.now()) {
              const diff = Math.ceil((preferences.pausedUntil - Date.now()) / (1000 * 60));
              if (diff > 60) {
                  setPausedTimeRemaining(`${Math.floor(diff/60)}h ${diff%60}m remaining`);
              } else {
                  setPausedTimeRemaining(`${diff}m remaining`);
              }
          } else {
              setPausedTimeRemaining('');
          }
      };
      updateTime();
      const interval = setInterval(updateTime, 60000);
      return () => clearInterval(interval);
  }, [preferences.pausedUntil]);

  const handleClearCache = () => {
      clearCache();
      setShowToast({ show: true, msg: 'Cache Cleared', type: 'success' });
  };

  const handleClearHistory = () => {
      if(window.confirm("Clear your entire reading history? This will reset your recommendations.")) {
          clearHistory();
          setShowToast({ show: true, msg: 'History Cleared', type: 'success' });
      }
  };

  const handleResetPersonalization = () => {
      if (window.confirm("Reset all AI personalization learning? This will clear your notification history and preferences.")) {
          resetPersonalization();
          setShowToast({ show: true, msg: 'AI Reset Complete', type: 'success' });
      }
  };

  const toggleNotif = (key: keyof NotificationPreferences) => {
      updatePreference(key, !preferences[key]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 transition-colors duration-300">
      <PageHeader title="Settings" showBack />
      
      {showToast.show && (
          <div className="fixed top-20 right-4 z-50">
              <Toast type={showToast.type} message={showToast.msg} onClose={() => setShowToast(prev => ({ ...prev, show: false }))} />
          </div>
      )}

      <div className="p-4 space-y-6">
        
        {/* Profile Section */}
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

        {/* 15.10 Memory & Privacy (NEW) */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield size={14} /> Memory & Privacy
            </h2>
            
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl mb-4 flex gap-3">
                <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Privacy First</h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400/80 leading-relaxed">
                        Your reading memory stays on your device. We do not store your detailed reading patterns on cloud servers.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <label className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <EyeOff size={16} className="text-gray-500" /> Pause History
                        </label>
                        <p className="text-[10px] text-gray-400">Stop tracking my reading progress</p>
                    </div>
                    <button 
                        onClick={togglePause}
                        className={`w-11 h-6 rounded-full relative transition-colors ${isPaused ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${isPaused ? 'left-6' : 'left-1'}`}></div>
                    </button>
                </div>

                <div className="flex justify-between items-center border-t border-gray-50 dark:border-gray-700 pt-4">
                    <div>
                        <label className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <Trash2 size={16} className="text-red-500" /> Clear History
                        </label>
                        <p className="text-[10px] text-gray-400">Delete all local reading data</p>
                    </div>
                    <button 
                        onClick={handleClearHistory}
                        className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                    >
                        Clear
                    </button>
                </div>
            </div>
        </section>

        {/* 14.1 - 14.11 Smart Notifications */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Bell size={14} /> Smart Notifications
                </h2>
                <div className="flex gap-2">
                    <button onClick={() => triggerTestNotification('digest')} className="text-[10px] font-bold text-orange-500 hover:underline">Digest</button>
                    <button onClick={() => triggerTestNotification('market')} className="text-[10px] font-bold text-green-500 hover:underline">Market</button>
                </div>
            </div>
            
            <div className="space-y-4">
                
                {/* 14.11 Pause Controls */}
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                            {preferences.pausedUntil > Date.now() ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                            {preferences.pausedUntil > Date.now() ? 'Notifications Paused' : 'Active'}
                        </label>
                        {preferences.pausedUntil > Date.now() && (
                            <button onClick={resumeNotifications} className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Resume</button>
                        )}
                    </div>
                    {preferences.pausedUntil > Date.now() ? (
                        <p className="text-xs text-indigo-700 dark:text-indigo-300">{pausedTimeRemaining}</p>
                    ) : (
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => pauseNotifications(60)} className="px-3 py-1 bg-white dark:bg-gray-700 rounded text-xs font-medium border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300">1h</button>
                            <button onClick={() => pauseNotifications(480)} className="px-3 py-1 bg-white dark:bg-gray-700 rounded text-xs font-medium border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300">8h</button>
                            <button onClick={() => pauseNotifications(1440)} className="px-3 py-1 bg-white dark:bg-gray-700 rounded text-xs font-medium border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300">24h</button>
                        </div>
                    )}
                </div>

                {/* 14.5 Quiet Hours */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <Clock size={16} className="text-purple-500" /> Quiet Hours
                        </label>
                        <button 
                            onClick={() => toggleNotif('quietHoursEnabled')}
                            className={`w-9 h-5 rounded-full relative transition-colors ${preferences.quietHoursEnabled ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                            <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all shadow-sm ${preferences.quietHoursEnabled ? 'left-5' : 'left-1'}`}></div>
                        </button>
                    </div>
                    {preferences.quietHoursEnabled && (
                        <div className="flex items-center gap-2 text-sm animate-in slide-in-from-top-2 fade-in">
                            <input 
                                type="time" 
                                value={preferences.quietHoursStart} 
                                onChange={(e) => updatePreference('quietHoursStart', e.target.value)}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-gray-700 dark:text-gray-200"
                            />
                            <span className="text-gray-400 text-xs">to</span>
                            <input 
                                type="time" 
                                value={preferences.quietHoursEnd} 
                                onChange={(e) => updatePreference('quietHoursEnd', e.target.value)}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-gray-700 dark:text-gray-200"
                            />
                        </div>
                    )}
                    <p className="text-[10px] text-gray-400 mt-2">Alerts are silenced during these times, except Breaking News.</p>
                </div>

                <div className="h-px bg-gray-100 dark:bg-gray-700"></div>

                <div className="pt-2">
                    <button 
                        onClick={handleResetPersonalization}
                        className="text-xs text-red-500 font-bold flex items-center gap-1 hover:text-red-600"
                    >
                        <RefreshCw size={12} /> Reset Personalization
                    </button>
                </div>
            </div>
        </section>

        {/* Data & Storage */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
             <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Database size={14} /> Data & Storage
            </h2>
            
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <Wifi size={16} className="text-blue-500" /> Low Data Mode
                    </label>
                    <span className="text-xs text-gray-400">{lowDataPreference === 'auto' ? 'Auto-Detect' : lowDataPreference === 'on' ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    {['auto', 'on', 'off'].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => setLowDataPreference(opt as any)}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md capitalize transition-all ${
                                lowDataPreference === opt 
                                ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-300' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                    {lowDataPreference === 'on' ? 'Images blurred, videos disabled, audio compressed.' : 'Adjusts quality based on network speed.'}
                </p>
            </div>

            <div className="pt-2 border-t border-gray-50 dark:border-gray-700">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1"><PieChart size={12} /> Session Usage</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{dataUsage.toFixed(1)} MB</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (dataUsage / 100) * 100)}%` }}></div>
                </div>
            </div>

            <div className="pt-2 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center">
                <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Cached Content</p>
                    <p className="text-[10px] text-gray-400">Offline articles & images</p>
                </div>
                <button 
                    onClick={handleClearCache}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                    <Trash2 size={12} /> Clear
                </button>
            </div>
        </section>

        {/* Appearance & Language */}
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
                {/* Inline Language Selector for Better Visibility */}
                <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => setAppLanguage(lang.code as any)}
                            className={`flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                                appLanguage === lang.code 
                                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
             </div>
        </section>

        <Button variant="ghost" fullWidth className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600">
            <LogOut size={18} /> Log Out
        </Button>

        <div className="text-center py-6 opacity-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">A Product by Style Hub</p>
            <p className="text-[9px] text-gray-400 mt-1">The Hub of Upcoming Technical Generation</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
