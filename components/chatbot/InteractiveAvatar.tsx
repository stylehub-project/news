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
  const [reaction, setReaction] = useState<'none' | 'poke'>('none');

  // Blinking Logic
  useEffect(() => {
    const blinkLoop = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
      // Random blink interval between 2s and 5s
      setTimeout(blinkLoop, Math.random() * 3000 + 2000);
    };
    const timer = setTimeout(blinkLoop, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Eye Movement Logic (Idle)
  useEffect(() => {
    if (state !== 'idle') return;
    const lookLoop = () => {
      // Random gaze direction
      const x = (Math.random() - 0.5) * 6;
      const y = (Math.random() - 0.5) * 4;
      setLookDir({ x, y });
      setTimeout(lookLoop, Math.random() * 4000 + 1000);
    };
    const timer = setTimeout(lookLoop, 1000);
    return () => clearTimeout(timer);
  }, [state]);

  const handleClick = () => {
    setReaction('poke');
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    onClick?.();
    setTimeout(() => setReaction('none'), 600); // Reaction duration
  };

  // SVG Element Calculation
  const eyeHeight = blink ? 1 : (reaction === 'poke' ? 14 : 10);
  const eyeWidth = reaction === 'poke' ? 14 : 10;
  
  // Pupil position
  const pupilX = state === 'thinking' ? 0 : (reaction === 'poke' ? 0 : lookDir.x);
  const pupilY = state === 'thinking' ? -2 : (reaction === 'poke' ? 0 : lookDir.y);

  // Mouth Path Calculation
  let mouthPath = "M 16,28 Q 24,32 32,28"; // Default Smile
  if (state === 'speaking') {
      mouthPath = "M 18,28 Q 24,34 30,28"; // Open mouth
  } else if (state === 'thinking') {
      mouthPath = "M 18,30 L 30,30"; // Flat line
  } else if (reaction === 'poke') {
      mouthPath = "M 20,32 Q 24,24 28,32"; // 'O' shape (Surprise)
  }

  // Color logic based on state
  const glowColor = state === 'thinking' ? '#facc15' : (state === 'error' ? '#ef4444' : '#6366f1'); // Yellow, Red, Indigo

  return (
    <div 
      className={`relative cursor-pointer transition-transform duration-200 select-none ${reaction === 'poke' ? 'scale-90' : 'hover:scale-105'} ${className}`}
      style={{ width: size, height: size }}
      onClick={handleClick}
    >
      <svg viewBox="0 0 48 48" className="w-full h-full overflow-visible drop-shadow-lg">
        <defs>
            <filter id="glow-avatar">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>

        {/* Head Shape */}
        <rect x="4" y="4" width="40" height="40" rx="12" fill="#ffffff" stroke={glowColor} strokeWidth="2" className="transition-colors duration-500" />
        
        {/* Face Screen Area */}
        <rect x="8" y="10" width="32" height="28" rx="6" fill="#1e1b4b" />

        {/* Eyes Group */}
        <g transform={`translate(0, ${state === 'thinking' ? -1 : 0})`}>
            {/* Left Eye */}
            <g transform="translate(16, 20)">
                <ellipse cx="0" cy="0" rx={eyeWidth/2} ry={eyeHeight/2} fill={glowColor} filter="url(#glow-avatar)" />
                <circle cx={pupilX} cy={pupilY} r={blink ? 0 : 2} fill="#ffffff" className="transition-all duration-300" />
            </g>

            {/* Right Eye */}
            <g transform="translate(32, 20)">
                <ellipse cx="0" cy="0" rx={eyeWidth/2} ry={eyeHeight/2} fill={glowColor} filter="url(#glow-avatar)" />
                <circle cx={pupilX} cy={pupilY} r={blink ? 0 : 2} fill="#ffffff" className="transition-all duration-300" />
            </g>
        </g>

        {/* Mouth */}
        <path 
            d={mouthPath} 
            stroke={glowColor} 
            strokeWidth="3" 
            strokeLinecap="round" 
            fill="none" 
            className={`transition-all duration-300 ${state === 'speaking' ? 'animate-[pulse_0.5s_infinite]' : ''}`}
        />

        {/* Thinking Spinner Ring */}
        {state === 'thinking' && (
            <circle cx="24" cy="24" r="22" stroke={glowColor} strokeWidth="2" fill="none" strokeDasharray="10 10" className="animate-spin opacity-50" />
        )}
      </svg>
    </div>
  );
};

export default InteractiveAvatar;