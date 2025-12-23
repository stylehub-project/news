import React from 'react';

interface NewspaperPreviewProps {
  zoom: number;
  children: React.ReactNode;
}

const NewspaperPreview: React.FC<NewspaperPreviewProps> = ({ zoom, children }) => {
  return (
    <div className="w-full h-full overflow-auto bg-gray-200 dark:bg-gray-900 p-4 md:p-8 flex items-start justify-center border dark:border-gray-800 rounded-xl shadow-inner custom-scrollbar relative transition-colors duration-300">
       {/* Background Grid Pattern */}
       <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] invert dark:invert-0"></div>
       
      <div 
        className="transition-transform duration-300 ease-out origin-top shadow-2xl bg-white"
        style={{ transform: `scale(${zoom})` }}
      >
        {children}
      </div>
    </div>
  );
};

export default NewspaperPreview;