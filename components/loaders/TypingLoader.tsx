import React from 'react';

interface TypingLoaderProps {
  text?: string;
  className?: string;
  color?: string;
}

const TypingLoader: React.FC<TypingLoaderProps> = ({ 
  text = "AI is thinking", 
  className = '',
  color = "bg-indigo-400"
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <span className={`w-1.5 h-1.5 rounded-full animate-[bounce_1s_infinite] ${color}`}></span>
        <span className={`w-1.5 h-1.5 rounded-full animate-[bounce_1s_infinite] delay-100 ${color}`}></span>
        <span className={`w-1.5 h-1.5 rounded-full animate-[bounce_1s_infinite] delay-200 ${color}`}></span>
      </div>
      {text && (
        <span className="text-xs font-medium text-gray-400 animate-pulse ml-1">
          {text}
        </span>
      )}
    </div>
  );
};

export default TypingLoader;