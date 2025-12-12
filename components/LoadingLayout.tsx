import React from 'react';
import LoadingSkeleton from './LoadingSkeleton';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

const LoadingLayout: React.FC = () => {
  return (
    <div className="font-sans text-gray-900 bg-white min-h-screen max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-gray-200 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center bg-gray-50">
        <LoadingSkeleton />
      </main>
      <BottomNav />
    </div>
  );
};

export default LoadingLayout;
