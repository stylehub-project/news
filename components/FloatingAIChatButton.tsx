import React from 'react';
import { Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const FloatingAIChatButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on AI Chat page or Reel page
  if (location.pathname === '/ai-chat' || location.pathname === '/reel') return null;

  return (
    <button 
      onClick={() => navigate('/ai-chat')}
      className="fixed bottom-20 right-4 z-40 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 group"
      aria-label="Ask AI"
    >
      <Sparkles size={24} className="animate-pulse-slow group-hover:rotate-12 transition-transform" />
    </button>
  );
};

export default FloatingAIChatButton;
