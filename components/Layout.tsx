import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import FloatingAIButton from './FloatingAIButton';
import ToastContainer from './ui/ToastContainer';

const Layout: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  
  // Pages that take up the full screen without standard nav
  // Also hiding nav on 'reel' as it has its own overlay controls
  const isFullScreenPage = ['/splash', '/login', '/onboarding', '/reel'].includes(path);
  const showNav = !isFullScreenPage;

  // Hide AI button on entry pages too
  const showAIButton = !['/splash', '/login', '/onboarding', '/ai-chat', '/reel'].includes(path);

  return (
    <div className="font-sans text-gray-900 bg-white h-dvh w-full max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-gray-200 flex flex-col">
      {/* Top Navbar - Sticky/Fixed at top of flex container */}
      {showNav && <div className="shrink-0 z-40"><Navbar /></div>}

      {/* Main Content Area - Takes remaining height */}
      <main className="flex-1 relative w-full overflow-hidden">
        <Outlet />
      </main>

      {/* Persistent Elements */}
      {showAIButton && <FloatingAIButton />}
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