import React, { useState, useEffect } from 'react';

interface InteractiveAvatarProps {
  state: 'idle' | 'thinking' | 'speaking' | 'error';
  size?: number;
  className?: string;
  onClick?: () => void;
}

const InteractiveAvatar: React.FC<InteractiveAvatarProps> = ({ 
  state, 
  size = 48, 
  className = '',
  onClick 
}) => {
  const [blink, setBlink] = useState(false);
  const [lookDir, setLookDir] = useState({ x: 0, y: 0 });
  const [reaction, setReaction] = useState<'none' | 'poke' | 'happy'>('none');
  const [mouthOpen, setMouthOpen] = useState(false);

  // Blinking Logic - Randomized
  useEffect(() => {
    const triggerBlink = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
      const nextBlink = Math.random() * 4000 + 2000; // 2-6s
      setTimeout(triggerBlink, nextBlink);
    };
    const timer = setTimeout(triggerBlink, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Eye Movement Logic (Idle)
  useEffect(() => {
    if (state !== 'idle') {
        setLookDir({ x: 0, y: 0 }); // Reset when busy
        return;
    }
    const triggerLook = () => {
      const x = (Math.random() - 0.5) * 8;
      const y = (Math.random() - 0.5) * 4;
      setLookDir({ x, y });
      const nextLook = Math.random() * 3000 + 1500;
      setTimeout(triggerLook, nextLook);
    };
    const timer = setTimeout(triggerLook, 1000);
    return () => clearTimeout(timer);
  }, [state]);

  // Speaking Animation (Mouth Flap)
  useEffect(() => {
      if (state !== 'speaking') {
          setMouthOpen(false);
          return;
      }
      const interval = setInterval(() => {
          setMouthOpen(prev => !prev);
      }, 150); // Fast flap
      return () => clearInterval(interval);
  }, [state]);

  const handleClick = () => {
    // Determine random reaction
    const newReaction = Math.random() > 0.5 ? 'poke' : 'happy';
    setReaction(newReaction);
    
    // Haptic Feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    
    onClick?.();
    
    // Reset reaction
    setTimeout(() => setReaction('none'), 800);
  };

  // --- SVG Calculations ---

  // Color Palette
  const colors = {
      idle: { face: '#4f46e5', eyes: '#ffffff', glow: '#818cf8' }, // Indigo
      thinking: { face: '#d97706', eyes: '#fffbeb', glow: '#fbbf24' }, // Amber
      speaking: { face: '#0ea5e9', eyes: '#ffffff', glow: '#38bdf8' }, // Sky
      error: { face: '#dc2626', eyes: '#fee2e2', glow: '#f87171' }, // Red
  };
  const theme = colors[state] || colors.idle;

  // Eye shape logic
  const leftEyeScaleY = blink ? 0.1 : (reaction === 'poke' ? 0.1 : 1); // Left eye winks on poke
  const rightEyeScaleY = blink ? 0.1 : 1; 

  return (
    <div 
      className={`relative cursor-pointer select-none transition-transform duration-200 ${reaction !== 'none' ? 'scale-90' : 'hover:scale-105'} ${className}`}
      style={{ width: size, height: size }}
      onClick={handleClick}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-xl">
        <defs>
            <linearGradient id={`grad-${state}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={theme.glow} />
                <stop offset="100%" stopColor={theme.face} />
            </linearGradient>
            <filter id="glow-soft" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>

        {/* Floating Animation Container */}
        <g className={state === 'thinking' ? 'animate-pulse' : 'animate-[float_6s_ease-in-out_infinite]'}>
            
            {/* Main Face Shape */}
            <rect 
                x="10" y="10" width="80" height="80" rx="24" 
                fill={`url(#grad-${state})`}
                stroke="white" strokeWidth="2" strokeOpacity="0.2"
                filter="url(#glow-soft)"
                className="transition-all duration-500 ease-out"
            />

            {/* Inner Face Screen (Dark Glass) */}
            <rect 
                x="20" y="25" width="60" height="50" rx="16" 
                fill="#0f172a" 
                fillOpacity="0.9"
            />

            {/* Eyes Container */}
            <g transform={`translate(${lookDir.x}, ${lookDir.y})`} className="transition-transform duration-500 ease-out">
                {/* Left Eye */}
                <ellipse 
                    cx="35" cy="45" rx="8" ry="10" 
                    fill={theme.eyes}
                    style={{ transformBox: 'fill-box', transformOrigin: 'center', transform: `scaleY(${leftEyeScaleY})` }}
                    className="transition-transform duration-100"
                />
                
                {/* Right Eye */}
                <ellipse 
                    cx="65" cy="45" rx="8" ry="10" 
                    fill={theme.eyes}
                    style={{ transformBox: 'fill-box', transformOrigin: 'center', transform: `scaleY(${rightEyeScaleY})` }}
                    className="transition-transform duration-100"
                />
            </g>

            {/* Mouth */}
            <path 
                d={
                    reaction === 'happy' 
                    ? "M 35,65 Q 50,75 65,65" // Big Smile
                    : state === 'speaking' 
                        ? (mouthOpen ? "M 40,65 Q 50,72 60,65" : "M 40,65 Q 50,65 60,65") 
                        : (state === 'thinking' ? "M 42,68 L 58,68" : "M 40,65 Q 50,70 60,65")
                } 
                stroke={theme.eyes} 
                strokeWidth="3" 
                strokeLinecap="round" 
                fill="none" 
                className="transition-all duration-150"
            />

            {/* Reflection/Shine */}
            <path d="M 20,20 Q 50,15 80,20" stroke="white" strokeWidth="2" strokeOpacity="0.3" fill="none" />
        </g>

        {/* Loading Spinner Ring */}
        {state === 'thinking' && (
            <circle cx="50" cy="50" r="46" stroke={theme.glow} strokeWidth="3" fill="none" strokeDasharray="20 10" className="animate-[spin_3s_linear_infinite] opacity-60" />
        )}
      </svg>
    </div>
  );
};

export default InteractiveAvatar;