import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import FloatingAIButton from './FloatingAIButton';
import FloatingFeedback from './FloatingFeedback';
import ToastContainer from './ui/ToastContainer';
import { useTheme } from '../context/ThemeContext';

const Layout: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const { theme } = useTheme();
  
  // Pages that take up the full screen without standard nav
  const isFullScreenPage = ['/splash', '/login', '/onboarding', '/reel'].includes(path);
  const showNav = !isFullScreenPage;

  // Hide AI button on entry pages too
  const showAIButton = !['/splash', '/login', '/onboarding', '/ai-chat', '/reel'].includes(path);

  // Background Logic
  const getBackgroundClass = () => {
    if (theme === 'amoled') return 'bg-black text-gray-100';
    if (theme === 'dark') return 'bg-gray-900 text-gray-100';
    return 'bg-white text-gray-900';
  };

  return (
    <div className={`font-sans h-dvh w-full max-w-md mx-auto shadow-2xl overflow-hidden relative border-x dark:border-gray-800 flex flex-col transition-colors duration-300 ${getBackgroundClass()}`}>
      {/* Top Navbar - Sticky/Fixed at top of flex container */}
      {showNav && <div className="shrink-0 z-40"><Navbar /></div>}

      {/* Main Content Area - Takes remaining height */}
      <main className="flex-1 relative w-full overflow-hidden">
        <Outlet />
      </main>

      {/* Persistent Elements */}
      {showAIButton && <FloatingAIButton />}
      
      {/* Floating Feedback - Global */}
      <FloatingFeedback />
      
      <ToastContainer />

      {/* Bottom Navigation - Overlay at bottom */}
      {showNav && (
        <div className="absolute bottom-0 left-0 w-full z-50">
          <BottomNav />
        </div>
      )}
    </div>
  );
};

export default Layout;