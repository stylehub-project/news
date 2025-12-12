import React from 'react';
import { Camera, Settings, Moon, Globe, LogOut } from 'lucide-react';

const ProfileSkeleton: React.FC = () => {
  return (
    <div className="p-4 pb-24">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 relative flex items-center justify-center">
            <span className="text-2xl text-gray-400 font-bold">JD</span>
            <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg">
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
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Globe size={20}/></div>
                <span className="font-medium">Language & Region</span>
            </div>
             <span className="text-xs text-gray-400">English (US)</span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Moon size={20}/></div>
                <span className="font-medium">Dark Mode</span>
            </div>
            {/* Toggle Switch */}
            <div className="w-10 h-6 bg-gray-200 rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm"></div>
            </div>
        </div>

         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between text-red-500">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 text-red-500 rounded-lg"><LogOut size={20}/></div>
                <span className="font-medium">Log Out</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;