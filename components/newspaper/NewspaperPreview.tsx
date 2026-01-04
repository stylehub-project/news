
import React from 'react';

interface NewspaperPreviewProps {
  zoom: number;
  children: React.ReactNode;
}

const NewspaperPreview: React.FC<NewspaperPreviewProps> = ({ zoom, children }) => {
  return (
    <div className="w-full h-full bg-gray-200 dark:bg-gray-900 border dark:border-gray-800 rounded-xl shadow-inner relative transition-colors duration-300 overflow-hidden">
       {/* Background Grid Pattern */}
       <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] invert dark:invert-0 z-0"></div>
       
       {/* Responsive Scrollable Container */}
       <div className="w-full h-full overflow-auto custom-scrollbar flex justify-center p-4 md:p-10">
          <div 
            className="transition-transform duration-300 ease-out origin-top w-full max-w-[1024px]"
            style={{ 
              transform: `scale(${zoom})`,
              marginBottom: `${(zoom - 1) * 100}%` // compensate for scale taking less space visually but DOM keeping height
            }}
          >
            {children}
          </div>
       </div>
    </div>
  );
};

export default NewspaperPreview;
