import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading time then redirect to login
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-full w-full bg-blue-600 flex flex-col items-center justify-center text-white relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900 via-blue-700 to-blue-500" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex flex-col items-center p-8 text-center">
            {/* Logo */}
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-2xl animate-bounce">
                <span className="text-5xl font-black text-blue-600 bg-clip-text">N</span>
            </div>
            
            {/* App Name */}
            <h1 className="text-4xl font-black tracking-tight mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
              News Club
            </h1>
            
            {/* Tagline */}
            <p className="text-blue-100 text-lg font-medium tracking-wide animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
              News. AI. Learning.
            </p>
        </div>

        {/* Loading Indicator */}
        <div className="absolute bottom-16 w-48">
             <div className="h-1.5 bg-blue-900/30 rounded-full overflow-hidden backdrop-blur-sm">
                 <div className="h-full bg-white/90 w-1/3 animate-[shimmer_1.5s_infinite] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
             </div>
             <p className="text-center text-xs text-blue-200 mt-3 font-medium tracking-widest uppercase opacity-70">Initializing</p>
        </div>
    </div>
  );
};

export default SplashPage;