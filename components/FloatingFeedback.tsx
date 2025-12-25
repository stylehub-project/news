
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquarePlus, Send, Bug, Lightbulb, MessageSquare, X, Info } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Toast from './ui/Toast';

type FeedbackType = 'bug' | 'feature' | 'remark';

const FloatingFeedback: React.FC = () => {
  // Position State
  const [position, setPosition] = useState<{ x: number, y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  
  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('remark');
  const [toast, setToast] = useState<{show: boolean, msg: string, type: 'success'|'error'}>({ show: false, msg: '', type: 'success' });

  // Refs
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);
  const initialPosRef = useRef<{ x: number, y: number } | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMouseDownRef = useRef(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  // --- Intro Guide Logic ---
  useEffect(() => {
      const hasSeenIntro = localStorage.getItem('has_seen_feedback_intro');
      if (!hasSeenIntro) {
          const timer = setTimeout(() => setShowIntro(true), 2000); // Show after 2s
          return () => clearTimeout(timer);
      }
  }, []);

  const dismissIntro = () => {
      setShowIntro(false);
      localStorage.setItem('has_seen_feedback_intro', 'true');
  };

  // --- Idle Timer Logic ---
  const resetIdleTimer = () => {
    setIsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 4000);
  };

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  // --- Coordinate Helpers ---
  const getParentDimensions = () => {
      if (buttonRef.current && buttonRef.current.offsetParent) {
          const parent = buttonRef.current.offsetParent as HTMLElement;
          return { width: parent.clientWidth, height: parent.clientHeight };
      }
      return { width: window.innerWidth, height: window.innerHeight };
  };

  const initDrag = () => {
      if (position) return { ...position };
      if (buttonRef.current && buttonRef.current.offsetParent) {
          const rect = buttonRef.current.getBoundingClientRect();
          const parentRect = buttonRef.current.offsetParent.getBoundingClientRect();
          return { x: rect.left - parentRect.left, y: rect.top - parentRect.top };
      }
      return { x: 0, y: 0 };
  };

  // --- Mouse Window Event Listeners ---
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current || !dragStartRef.current || !initialPosRef.current) return;
      
      resetIdleTimer();
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
          setIsDragging(true);
      }

      let newX = initialPosRef.current.x + deltaX;
      let newY = initialPosRef.current.y + deltaY;

      const { width, height } = getParentDimensions();
      const size = 56; 
      
      newX = Math.max(0, Math.min(width - size, newX));
      newY = Math.max(0, Math.min(height - size, newY));

      setPosition({ x: newX, y: newY });
    };

    const handleWindowMouseUp = () => {
      if (isMouseDownRef.current) {
        isMouseDownRef.current = false;
        resetIdleTimer();
        setTimeout(() => setIsDragging(false), 0);
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, []);

  // --- Touch Handlers ---
  const handleTouchStart = (e: React.TouchEvent) => {
    resetIdleTimer();
    const touch = e.touches[0];
    const startPos = initDrag();
    if (!position) setPosition(startPos);
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    initialPosRef.current = startPos;
    setIsDragging(false);
    if (showIntro) dismissIntro();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragStartRef.current || !initialPosRef.current) return;
    resetIdleTimer();
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartRef.current.x;
    const deltaY = touch.clientY - dragStartRef.current.y;

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) setIsDragging(true);

    let newX = initialPosRef.current.x + deltaX;
    let newY = initialPosRef.current.y + deltaY;
    const { width, height } = getParentDimensions();
    const size = 56; 
    newX = Math.max(0, Math.min(width - size, newX));
    newY = Math.max(0, Math.min(height - size, newY));
    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    resetIdleTimer();
    dragStartRef.current = null;
    initialPosRef.current = null;
    setTimeout(() => setIsDragging(false), 0);
  };

  // --- Mouse Handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    resetIdleTimer();
    const startPos = initDrag();
    if (!position) setPosition(startPos);
    isMouseDownRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = startPos;
    setIsDragging(false);
    if (showIntro) dismissIntro();
  };

  const handleClick = () => {
      if (!isDragging) {
          setIsOpen(true);
          resetIdleTimer();
          if (showIntro) dismissIntro();
      }
  };

  const handleSubmit = () => {
      if (!feedback.trim()) return;

      const email = "stylehubofficial02@gmail.com";
      const typeLabel = feedbackType === 'bug' ? 'Bug Report' : feedbackType === 'feature' ? 'Feature Request' : 'Remark';
      const subject = `[${typeLabel}] News Club Feedback`;
      
      const deviceInfo = `\n\n---\nApp Version: 1.0.0\nPlatform: ${navigator.platform}\nUser Agent: ${navigator.userAgent}`;
      const body = encodeURIComponent(`Type: ${typeLabel}\n\nFeedback:\n${feedback}${deviceInfo}`);
      
      const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;

      window.location.href = mailtoLink;

      setToast({ show: true, msg: 'Opening email client...', type: 'success' });
      setFeedback('');
      setIsOpen(false);
  };

  const style: React.CSSProperties = position 
    ? { left: `${position.x}px`, top: `${position.y}px`, touchAction: 'none' }
    : { touchAction: 'none' }; 

  const positionClasses = position ? '' : 'bottom-24 left-4';

  const getTypeStyles = (type: FeedbackType) => {
      if (feedbackType === type) {
          switch(type) {
              case 'bug': return 'bg-red-100 text-red-700 border-red-200 ring-1 ring-red-500';
              case 'feature': return 'bg-amber-100 text-amber-700 border-amber-200 ring-1 ring-amber-500';
              case 'remark': return 'bg-blue-100 text-blue-700 border-blue-200 ring-1 ring-blue-500';
          }
      }
      return 'bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-100';
  };

  return (
    <>
        {/* Floating Button Container */}
        <div 
            ref={buttonRef}
            className={`absolute z-[100] transition-all duration-500 ease-out cursor-grab active:cursor-grabbing touch-none ${positionClasses} ${isIdle && !showIntro ? 'opacity-40 translate-x-[-10px] scale-90 blur-[0.5px] hover:opacity-100 hover:translate-x-0 hover:scale-100 hover:blur-0' : 'opacity-100 scale-100'}`}
            style={style}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleClick}
        >
            {/* Guide Tooltip */}
            {showIntro && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 w-48 bg-gray-900 text-white p-3 rounded-xl shadow-2xl animate-in slide-in-from-left-4 fade-in duration-500 pointer-events-none">
                    <div className="absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 w-3 h-3 bg-gray-900 rotate-45"></div>
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">New</span>
                    </div>
                    <p className="text-xs leading-relaxed">
                        Spot a bug? 🐛 <br/>
                        Want a new feature? 💡<br/>
                        <span className="font-bold">Tap here to tell us!</span>
                    </p>
                </div>
            )}

            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-700 dark:from-indigo-500 dark:to-blue-600 rounded-full shadow-[0_8px_30px_rgba(79,70,229,0.3)] flex items-center justify-center text-white border-2 border-white/20 active:scale-90 transition-transform hover:scale-105 hover:shadow-indigo-500/50 relative">
                <MessageSquarePlus size={26} className="drop-shadow-md" />
                {showIntro && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>}
            </div>
        </div>

        {/* Feedback Modal */}
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Share Feedback">
            <div className="space-y-5">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-800 dark:text-indigo-200 text-xs font-medium border border-indigo-100 dark:border-indigo-800 flex gap-2">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <p>Help us improve News Club! Select a category below to send your report directly to our dev team.</p>
                </div>
                
                {/* Type Selector */}
                <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Feedback Type</label>
                    <div className="grid grid-cols-3 gap-2">
                        <button 
                            onClick={() => setFeedbackType('bug')}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${getTypeStyles('bug')}`}
                        >
                            <Bug size={20} />
                            <span className="text-[10px] font-bold">Bug Report</span>
                        </button>
                        <button 
                            onClick={() => setFeedbackType('feature')}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${getTypeStyles('feature')}`}
                        >
                            <Lightbulb size={20} />
                            <span className="text-[10px] font-bold">Feature</span>
                        </button>
                        <button 
                            onClick={() => setFeedbackType('remark')}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${getTypeStyles('remark')}`}
                        >
                            <MessageSquare size={20} />
                            <span className="text-[10px] font-bold">Remark</span>
                        </button>
                    </div>
                </div>

                {/* Input Area */}
                <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                        {feedbackType === 'bug' ? 'Describe the error' : feedbackType === 'feature' ? 'Describe your idea' : 'Your message'}
                    </label>
                    <textarea 
                        className="w-full h-32 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-sm transition-all dark:text-white"
                        placeholder={
                            feedbackType === 'bug' ? "What happened? Steps to reproduce..." :
                            feedbackType === 'feature' ? "I would love to see..." :
                            "Tell us what you think..."
                        }
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-indigo-500/30">
                        <Send size={16} /> Send Report
                    </Button>
                </div>

                {/* Tagline */}
                <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">A Service by Style Hub</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">The Hub of Upcoming Technical Generation</p>
                </div>
            </div>
        </Modal>

        {/* Toast Notification */}
        {toast.show && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[110]">
                <Toast 
                    type={toast.type} 
                    message={toast.msg} 
                    onClose={() => setToast({ ...toast, show: false })} 
                />
            </div>
        )}
    </>
  );
};

export default FloatingFeedback;
