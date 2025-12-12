import React, { useRef, useEffect } from 'react';

interface ReelContainerProps {
  children: React.ReactNode;
}

const ReelContainer: React.FC<ReelContainerProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Optional: Add intersection observer here to detect active slide
  
  return (
    <div 
      ref={containerRef}
      className="h-[calc(100vh)] w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black relative"
      style={{ scrollBehavior: 'smooth' }}
    >
      {children}
    </div>
  );
};

export default ReelContainer;