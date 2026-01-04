
import React, { useEffect, useState, useRef } from 'react';
import { X, ArrowRight, Zap, Sparkles, Volume2, ShieldAlert, Info, Bell, Play, BrainCircuit, TrendingUp, Trophy, CloudRain, List, MessageSquare, ThumbsDown } from 'lucide-react';
import { useNotification, NotificationType } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationBanner: React.FC = () => {
  const { latestNotification, dismissBanner, markAsRead, provideFeedback } = useNotification();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Swipe Logic
  const [translateX, setTranslateX] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const startX = useRef<number | null>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    if (latestNotification) {
      setIsVisible(true);
      setTranslateX(0);
      setOpacity(1);
      // Auto-dismiss standard notifications after 6s unless listening
      const duration = ['breaking', 'ai', 'digest'].includes(latestNotification.type) ? 8000 : 6000;
      
      const timer = setTimeout(() => {
          if (!isSpeaking) handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [latestNotification]);

  const handleClose = () => {
      setIsVisible(false);
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setTimeout(() => {
          dismissBanner();
          setTranslateX(0); // Reset for next time
      }, 300);
  };

  const handleRead = () => {
      if (latestNotification) {
          markAsRead(latestNotification.id);
          if (latestNotification.actionLink) {
              navigate(latestNotification.actionLink);
          }
      }
      handleClose();
  };

  const handleAskAI = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (latestNotification) {
          const prompt = `Tell me more about this: "${latestNotification.title}"`;
          navigate(`/ai-chat?context=notification&headline=${encodeURIComponent(latestNotification.title)}&prompt=${encodeURIComponent(prompt)}`);
          handleClose();
      }
  };

  const handleLessLikeThis = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (latestNotification) {
          provideFeedback(latestNotification.id, 'less');
      }
  };

  const handleListen = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!latestNotification) return;

      if (isSpeaking) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
      } else {
          // Stop any other audio first
          window.speechSynthesis.cancel();
          
          const insightText = latestNotification.data?.aiInsight ? ` Insight: ${latestNotification.data.aiInsight}` : '';
          const digestText = latestNotification.data?.digestItems ? ` Top stories: ${latestNotification.data.digestItems.join('. ')}` : '';
          
          const u = new SpeechSynthesisUtterance(`${latestNotification.type === 'breaking' ? 'Breaking News.' : ''} ${latestNotification.title}. ${latestNotification.body}. ${insightText} ${digestText}`);
          u.rate = 1.1;
          
          u.onstart = () => setIsSpeaking(true);
          
          u.onend = () => {
              setIsSpeaking(false);
              // Auto dismiss after listening is complete
              setTimeout(handleClose, 500); 
          };
          
          u.onerror = () => setIsSpeaking(false);

          window.speechSynthesis.speak(u);
      }
  };

  // --- Touch Handlers for Swipe ---
  const handleTouchStart = (e: React.TouchEvent) => {
      startX.current = e.touches[0].clientX;
      isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (!startX.current || !isDragging.current) return;
      const currentX = e.touches[0].clientX;
      const delta = currentX - startX.current;
      setTranslateX(delta);
      // Fade out as you swipe further
      setOpacity(1 - Math.abs(delta) / 300);
  };

  const handleTouchEnd = () => {
      isDragging.current = false;
      if (Math.abs(translateX) > 100) {
          // Swipe to dismiss
          handleClose();
      } else {
          // Snap back
          setTranslateX(0);
          setOpacity(1);
      }
      startX.current = null;
  };

  if (!latestNotification) return null;

  const isLowData = latestNotification.isLowData;

  // Visual Styles based on Type
  const getStyles = (type: NotificationType) => {
      if (isLowData) {
          return {
              container: 'bg-white dark:bg-gray-800 border-l-4 border-gray-500 shadow-lg text-gray-900 dark:text-white',
              icon: <Info size={18} className="text-gray-500" />,
              label: 'ALERT',
              actionBtn: 'bg-gray-200 text-black border border-gray-300'
          };
      }

      switch (type) {
          case 'breaking':
              return {
                  container: 'bg-red-600 text-white border-red-500 shadow-red-500/30',
                  icon: <Zap size={18} className="text-white fill-white animate-pulse" />,
                  label: 'BREAKING NEWS',
                  actionBtn: 'bg-white text-red-600 hover:bg-gray-100'
              };
          case 'ai':
              return {
                  container: 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/30',
                  icon: <BrainCircuit size={18} className="text-yellow-300 animate-pulse" />,
                  label: 'AI INTELLIGENCE',
                  actionBtn: 'bg-white text-indigo-600 hover:bg-indigo-50'
              };
          case 'market':
              return {
                  container: 'bg-green-600 text-white border-green-500 shadow-green-500/30',
                  icon: <TrendingUp size={18} className="text-white" />,
                  label: 'MARKET ALERT',
                  actionBtn: 'bg-white text-green-600 hover:bg-green-50'
              };
          case 'sports':
              return {
                  container: 'bg-orange-500 text-white border-orange-400 shadow-orange-500/30',
                  icon: <Trophy size={18} className="text-white" />,
                  label: 'SPORTS UPDATE',
                  actionBtn: 'bg-white text-orange-600 hover:bg-orange-50'
              };
          case 'digest':
              return {
                  container: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-l-4 border-l-blue-500 border-y border-r border-gray-200 dark:border-gray-700 shadow-xl',
                  icon: <List size={18} className="text-blue-500" />,
                  label: 'DAILY DIGEST',
                  actionBtn: 'bg-blue-600 text-white hover:bg-blue-700'
              };
          case 'personalized':
              return {
                  container: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-pink-200 dark:border-pink-900 shadow-xl',
                  icon: <Sparkles size={18} className="text-pink-500 fill-pink-500" />,
                  label: 'FOR YOU',
                  actionBtn: 'bg-pink-50 text-pink-600 hover:bg-pink-100 dark:bg-pink-900/30 dark:text-pink-300'
              };
          default:
              return {
                  container: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 shadow-xl',
                  icon: <Info size={18} className="text-blue-500" />,
                  label: 'UPDATE',
                  actionBtn: 'bg-gray-900 dark:bg-white text-white dark:text-black'
              };
      }
  };

  const style = getStyles(latestNotification.type);

  return (
    <div 
        className={`fixed top-4 left-4 right-4 z-[100] md:w-96 md:left-auto md:right-4 transition-all duration-500 ease-out transform ${isVisible ? 'translate-y-0' : '-translate-y-32 pointer-events-none'}`}
        style={{ 
            opacity: isVisible ? opacity : 0, 
            transform: isVisible ? `translate3d(${translateX}px, 0, 0)` : `translate3d(0, -150px, 0)`
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
    >
        <div className={`p-4 rounded-2xl shadow-2xl border ${style.container} flex flex-col gap-3 backdrop-blur-md`}>
            
            {/* Header Line */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                        {style.icon}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{style.label}</span>
                        {latestNotification.data?.context && !isLowData && (
                            <span className="text-[9px] opacity-70 leading-none">{latestNotification.data.context}</span>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleLessLikeThis} className="text-current opacity-60 hover:opacity-100 transition-opacity" title="Less like this">
                        <ThumbsDown size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleClose(); }} className="text-current opacity-60 hover:opacity-100 transition-opacity">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div onClick={handleRead} className="cursor-pointer group">
                <h3 className="font-bold text-base leading-tight mb-1 group-hover:underline decoration-2 underline-offset-2">{latestNotification.title}</h3>
                <p className="text-xs font-medium opacity-90 line-clamp-2 leading-relaxed">{latestNotification.body}</p>
                
                {latestNotification.data?.digestItems && (
                    <ul className="mt-2 space-y-1">
                        {latestNotification.data.digestItems.slice(0, 3).map((item, i) => (
                            <li key={i} className="text-[10px] flex gap-2 items-start opacity-80">
                                <span className="mt-1 w-1 h-1 bg-current rounded-full shrink-0"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                )}

                {latestNotification.data?.aiInsight && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                        <p className="text-[10px] font-bold opacity-80 flex items-start gap-1">
                            <Sparkles size={10} className="mt-0.5" /> 
                            {latestNotification.data.aiInsight}
                        </p>
                    </div>
                )}
            </div>

            {/* Action Row */}
            <div className="flex gap-2 mt-1">
                <button 
                    onClick={handleRead}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-transform active:scale-95 ${style.actionBtn}`}
                >
                    Read <ArrowRight size={12} />
                </button>
                
                {!isLowData && (
                    <button 
                        onClick={handleAskAI}
                        className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-transform active:scale-95 bg-white/10 hover:bg-white/20 border border-white/20 text-current"
                    >
                        <MessageSquare size={12} /> Ask AI
                    </button>
                )}

                <button 
                    onClick={handleListen}
                    className="w-10 flex items-center justify-center rounded-lg bg-black/10 hover:bg-black/20 text-current transition-colors"
                    title="Listen"
                >
                    {isSpeaking ? <Volume2 size={16} className="animate-pulse" /> : <Play size={16} className="ml-0.5" />}
                </button>
            </div>
        </div>
    </div>
  );
};

export default NotificationBanner;
