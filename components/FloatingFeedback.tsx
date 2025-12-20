import React, { useState, useEffect, useRef } from 'react';
import { MessageSquarePlus, Send } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Toast from './ui/Toast';

const FloatingFeedback: React.FC = () => {
  // Position State: Null means use default CSS position
  const [position, setPosition] = useState<{ x: number, y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  
  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [toast, setToast] = useState<{show: boolean, msg: string, type: 'success'|'error'}>({ show: false, msg: '', type: 'success' });

  // Refs for dragging calculation
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);
  const initialPosRef = useRef<{ x: number, y: number } | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMouseDownRef = useRef(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  // --- Idle Timer Logic ---
  const resetIdleTimer = () => {
    setIsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 3000);
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
          return {
              x: rect.left - parentRect.left,
              y: rect.top - parentRect.top
          };
      }
      return { x: 0, y: 0 };
  };

  // --- Mouse Window Event Listeners for smooth drag ---
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

      // Boundary Checks relative to parent
      const { width, height } = getParentDimensions();
      const size = 56; // Button size approx
      
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

  // --- Touch Handlers (Mobile) ---
  const handleTouchStart = (e: React.TouchEvent) => {
    resetIdleTimer();
    const touch = e.touches[0];
    
    // Initialize absolute position on first drag interaction
    const startPos = initDrag();
    if (!position) setPosition(startPos);

    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    initialPosRef.current = startPos;
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragStartRef.current || !initialPosRef.current) return;
    
    resetIdleTimer();
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartRef.current.x;
    const deltaY = touch.clientY - dragStartRef.current.y;

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        setIsDragging(true);
    }

    let newX = initialPosRef.current.x + deltaX;
    let newY = initialPosRef.current.y + deltaY;

    // Boundary Checks
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

  // --- Mouse Handlers (Desktop trigger) ---
  const handleMouseDown = (e: React.MouseEvent) => {
    resetIdleTimer();
    
    const startPos = initDrag();
    if (!position) setPosition(startPos);

    isMouseDownRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = startPos;
    setIsDragging(false);
  };

  const handleClick = () => {
      if (!isDragging) {
          setIsOpen(true);
          resetIdleTimer();
      }
  };

  const handleSubmit = () => {
      if (!feedback.trim()) return;

      try {
        const existing = JSON.parse(localStorage.getItem('user_feedback_history') || '[]');
        const newEntry = {
            id: Date.now(),
            text: feedback,
            date: new Date().toISOString()
        };
        localStorage.setItem('user_feedback_history', JSON.stringify([...existing, newEntry]));
      } catch(e) {
        console.error("Storage error", e);
      }

      const email = "stylehubofficial02@gmail.com";
      const subject = "News Club App Feedback";
      const body = encodeURIComponent(`Feedback:\n${feedback}\n\nDate: ${new Date().toLocaleString()}`);
      const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;

      window.location.href = mailtoLink;

      setToast({ show: true, msg: 'Opening email client...', type: 'success' });
      setFeedback('');
      setIsOpen(false);
  };

  // Dynamic Styles
  const style: React.CSSProperties = position 
    ? { left: `${position.x}px`, top: `${position.y}px`, touchAction: 'none' }
    : { touchAction: 'none' }; // Allow CSS class positioning if null

  // Use a safe initial CSS class position (Left side to avoid overlapping AI button on Right)
  const positionClasses = position ? '' : 'bottom-24 left-4';

  return (
    <>
        {/* Floating Button */}
        <div 
            ref={buttonRef}
            className={`absolute z-[100] transition-opacity duration-1000 ease-in-out cursor-grab active:cursor-grabbing touch-none ${positionClasses} ${isIdle ? 'opacity-50 hover:opacity-100' : 'opacity-100'}`}
            style={style}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleClick}
        >
            <div className="w-14 h-14 bg-gradient-to-tr from-pink-600 to-rose-500 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex items-center justify-center text-white border-2 border-white/20 active:scale-90 transition-transform hover:scale-105">
                <MessageSquarePlus size={26} className="drop-shadow-sm" />
            </div>
        </div>

        {/* Feedback Modal */}
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Send Feedback">
            <div className="space-y-4">
                <div className="p-3 bg-pink-50 rounded-xl text-pink-800 text-sm border border-pink-100">
                    <p>Have a suggestion or found a bug? We'd love to hear from you!</p>
                </div>
                
                <textarea 
                    className="w-full h-40 p-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none text-sm transition-all"
                    placeholder="Type your feedback here..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    autoFocus
                />

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} className="bg-pink-600 hover:bg-pink-700 text-white gap-2 shadow-pink-500/30">
                        <Send size={16} /> Send to Team
                    </Button>
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