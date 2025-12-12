import React from 'react';
import { Camera, Settings, LogOut } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import ThemeSwitcher from '../../components/ThemeSwitcher';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const ProfilePage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <PageHeader title="My Profile" />
      <div className="p-4">
        <div className="flex flex-col items-center mb-8 mt-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 relative flex items-center justify-center border-4 border-white shadow">
                <span className="text-2xl text-gray-400 font-bold">JD</span>
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                    <Camera size={16} />
                </button>
            </div>
            <h2 className="text-xl font-bold">John Doe</h2>
            <p className="text-gray-500 text-sm">@johndoe • News Enthusiast</p>
        </div>

        <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Settings size={20}/></div>
                    <span className="font-medium">Account Settings</span>
                </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Appearance</span>
                <ThemeSwitcher />
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-2">
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Language</span>
                 <LanguageSwitcher />
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between text-red-500 cursor-pointer hover:bg-red-50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 text-red-500 rounded-lg"><LogOut size={20}/></div>
                    <span className="font-medium">Log Out</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;