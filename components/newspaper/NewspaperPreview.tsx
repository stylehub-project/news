import React from 'react';

interface NewspaperPreviewProps {
  zoom: number;
  children: React.ReactNode;
}

const NewspaperPreview: React.FC<NewspaperPreviewProps> = ({ zoom, children }) => {
  return (
    <div className="w-full h-full overflow-auto bg-gray-100 p-4 md:p-8 flex items-start justify-center border rounded-xl shadow-inner custom-scrollbar relative">
       {/* Background Grid Pattern */}
       <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
       
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