import React, { useState, useRef } from 'react';
import { Sparkles, Mic } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const FloatingAIButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isLongPress, setIsLongPress] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Don't show on AI Chat page or Reel page
  if (location.pathname === '/ai-chat' || location.pathname === '/reel') return null;

  const handleMouseDown = () => {
    timerRef.current = setTimeout(() => {
        setIsLongPress(true);
        if (navigator.vibrate) navigator.vibrate(50);
    }, 600);
  };

  const handleMouseUp = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    if (isLongPress) {
        setIsLongPress(false);
        // Navigate to voice mode
        navigate('/ai-chat?mode=voice');
    } else {
        // Standard click
        navigate('/ai-chat');
    }
  };

  // Prevent context menu on long press on mobile
  const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
  };

  return (
    <div className="fixed bottom-24 right-4 z-40 group pointer-events-auto">
       {/* Tooltip */}
       <div 
         className={`absolute bottom-full right-0 mb-3 whitespace-nowrap bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg transition-all duration-300 origin-bottom-right ${showTooltip ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-2 pointer-events-none'}`}
       >
          Ask AI about today's news
          <div className="absolute -bottom-1 right-6 w-3 h-3 bg-gray-900 rotate-45"></div>
       </div>

      <button 
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onContextMenu={handleContextMenu}
        className={`relative transition-transform duration-300 active:scale-90 ${isLongPress ? 'scale-110' : ''}`}
        aria-label="Ask AI"
      >
         {/* Pulse Ring */}
         <div className="absolute inset-0 bg-blue-500 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30"></div>
         
         {/* Button Body */}
         <div className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-xl border border-white/40 backdrop-blur-md transition-all duration-500 ${isLongPress ? 'bg-red-500 border-red-400 rotate-12' : 'bg-gradient-to-br from-indigo-500 to-blue-600'}`}>
            <div className="relative z-10">
                {isLongPress ? (
                    <Mic size={24} className="text-white animate-pulse" />
                ) : (
                    <Sparkles size={24} className="text-white fill-yellow-300/30 group-hover:rotate-12 transition-transform duration-500" />
                )}
            </div>
            
            {/* Inner Gloss */}
            <div className="absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-br from-white/40 to-transparent opacity-50"></div>
         </div>
      </button>
    </div>
  );
};

export default FloatingAIButton;