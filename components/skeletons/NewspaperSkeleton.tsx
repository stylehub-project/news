import React from 'react';
import Shimmer from '../ui/Shimmer';

const NewspaperSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full bg-white p-6 border shadow-lg relative overflow-hidden">
        {/* Header */}
        <div className="border-b-4 border-gray-200 pb-4 mb-6 text-center">
            <Shimmer className="h-10 w-3/4 mx-auto mb-2" />
            <div className="flex justify-between mt-2">
                <Shimmer className="h-3 w-20" />
                <Shimmer className="h-3 w-20" />
                <Shimmer className="h-3 w-20" />
            </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-2 gap-4">
             <div className="col-span-2 aspect-video bg-gray-100 rounded-lg relative overflow-hidden mb-4">
                 <Shimmer className="w-full h-full" />
                 <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-serif font-bold opacity-50">
                    AI PREPARING LAYOUT...
                 </div>
             </div>
             
             <div className="space-y-2">
                 <Shimmer className="h-4 w-full" />
                 <Shimmer className="h-4 w-full" />
                 <Shimmer className="h-4 w-5/6" />
                 <Shimmer className="h-4 w-full" />
             </div>
              <div className="space-y-2">
                 <Shimmer className="h-4 w-full" />
                 <Shimmer className="h-4 w-full" />
                 <Shimmer className="h-4 w-5/6" />
                 <Shimmer className="h-4 w-full" />
             </div>
        </div>
    </div>
  );
};
export default NewspaperSkeleton;