import React from 'react';
import { Camera, Settings, LogOut } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import ThemeSwitcher from '../../components/ThemeSwitcher';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const ProfilePage: React.FC = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-24 transition-colors duration-300">
      <PageHeader title="My Profile" />
      <div className="p-4">
        <div className="flex flex-col items-center mb-8 mt-4">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full mb-4 relative flex items-center justify-center border-4 border-white dark:border-gray-700 shadow">
                <span className="text-2xl text-gray-400 font-bold">L</span>
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                    <Camera size={16} />
                </button>
            </div>
            <h2 className="text-xl font-bold dark:text-white">Lakshya</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">@lakshya • News Enthusiast</p>
        </div>

        <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><Settings size={20}/></div>
                    <span className="font-medium dark:text-gray-200">Account Settings</span>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-2 transition-colors">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Appearance</span>
                <ThemeSwitcher />
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-2 transition-colors">
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Language</span>
                 <LanguageSwitcher />
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between text-red-500 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg"><LogOut size={20}/></div>
                    <span className="font-medium">Log Out</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;