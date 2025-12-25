
import React, { useRef } from 'react';

interface ReelContainerProps {
  children: React.ReactNode;
}

const ReelContainer: React.FC<ReelContainerProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={containerRef}
      className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black relative overscroll-y-contain"
      style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
    >
      {children}
    </div>
  );
};

export default ReelContainer;
