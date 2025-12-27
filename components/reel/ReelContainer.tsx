
import React from 'react';

interface ReelContainerProps {
  children: React.ReactNode;
}

const ReelContainer: React.FC<ReelContainerProps> = ({ children }) => {
  return (
    <div className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-black relative scrollbar-hide overscroll-y-contain">
      {children}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ReelContainer;
