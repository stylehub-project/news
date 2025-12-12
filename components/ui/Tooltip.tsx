import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onTouchStart={() => setIsVisible(true)}
      onTouchEnd={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          className={`absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm whitespace-nowrap transition-opacity duration-200 left-1/2 -translate-x-1/2 ${
            position === 'top' ? '-top-8' : 'top-full mt-2'
          }`}
        >
          {content}
          <div 
            className={`absolute w-0 h-0 border-4 border-transparent left-1/2 -translate-x-1/2 ${
              position === 'top' ? 'border-t-gray-900 -bottom-2' : 'border-b-gray-900 -top-2'
            }`}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;