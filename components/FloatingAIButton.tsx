import React from 'react';
import { Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const FloatingAIButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/ai-chat' || location.pathname === '/reel') return null;

  return (
    <button 
      onClick={() => navigate('/ai-chat')}
      className="fixed bottom-24 right-4 z-40 group"
      aria-label="Ask AI"
    >
      <div className="relative">
         {/* Pulse Ring */}
         <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20 duration-1000"></div>
         
         {/* Glassmorphism Button */}
         <div className="relative bg-white/20 backdrop-blur-md border border-white/40 text-blue-600 p-4 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 bg-gradient-to-br from-white/40 to-white/10">
            <Sparkles size={24} className="fill-blue-600/20 group-hover:rotate-12 transition-transform" />
         </div>
      </div>
    </button>
  );
};
export default FloatingAIButton;