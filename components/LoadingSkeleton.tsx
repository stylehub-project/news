import React from 'react';
import { BrainCircuit } from 'lucide-react';
import FactLoader from './loaders/FactLoader';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8 w-full min-h-[300px]">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
        <BrainCircuit size={48} className="text-blue-600 animate-pulse relative z-10" />
      </div>
      
      <div className="space-y-3 w-full max-w-md px-4">
        <div className="h-3 bg-slate-200 rounded w-3/4 mx-auto animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:400%_100%]"></div>
        <div className="h-3 bg-slate-200 rounded w-full animate-[shimmer_1.5s_infinite_0.2s] bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:400%_100%]"></div>
        <div className="h-3 bg-slate-200 rounded w-5/6 mx-auto animate-[shimmer_1.5s_infinite_0.4s] bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:400%_100%]"></div>
      </div>

      <div className="w-full max-w-sm">
        <FactLoader type="general" />
      </div>
    </div>
  );
};

export default LoadingSkeleton;