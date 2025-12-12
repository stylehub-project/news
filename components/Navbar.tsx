import React from 'react';
import { Search, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex justify-between items-center transition-all duration-300">
      
      {/* Left: Profile & Logo */}
      <div className="flex items-center gap-3">
        <Link to="/profile" className="relative group">
            <div className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden hover:scale-105 transition-transform">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
        </Link>
        
        <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:rotate-3 transition-transform">
            N
            </div>
            <span className="font-bold text-gray-800 tracking-tight text-lg hidden min-[360px]:block">News Club</span>
        </Link>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <Link to="/notifications" className="p-2.5 hover:bg-gray-100 rounded-full transition-all text-gray-600 hover:text-blue-600 active:scale-95 relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </Link>
        <Link to="/search" className="p-2.5 hover:bg-gray-100 rounded-full transition-all text-gray-600 hover:text-blue-600 active:scale-95">
          <Search size={20} />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;