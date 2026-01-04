
import React from 'react';
import { Search, FileText, AlignLeft, Image as ImageIcon } from 'lucide-react';

interface SearchLoadingStateProps {
  query: string;
  filter: string;
}

const SearchLoadingState: React.FC<SearchLoadingStateProps> = ({ query, filter }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] w-full p-8 opacity-90">
      
      {/* Animation Container */}
      <div className="relative w-32 h-32 mb-8">
        {/* Abstract Document/Card Background */}
        <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-3 transform -rotate-6 scale-90 opacity-60">
           <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
           <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
           <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
        
        <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-600 p-4 flex flex-col gap-3 rotate-3 z-10">
           <div className="flex gap-2">
               <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0"></div>
               <div className="flex-1 space-y-1.5">
                   <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                   <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-2/3"></div>
               </div>
           </div>
           <div className="space-y-2 mt-2">
               <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
               <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
               <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-4/5"></div>
           </div>
        </div>

        {/* Scanning Magnifying Glass */}
        <div className="absolute top-0 left-0 w-full h-full z-20 animate-[scan-diagonal_3s_ease-in-out_infinite]">
            <div className="relative">
                <div className="absolute -top-4 -left-4 bg-blue-600/90 text-white p-3 rounded-full shadow-lg border-4 border-white dark:border-gray-900 backdrop-blur-sm">
                    <Search size={28} strokeWidth={3} />
                </div>
                {/* Radar Ripple */}
                <div className="absolute -top-4 -left-4 w-14 h-14 bg-blue-500 rounded-full animate-ping opacity-20"></div>
            </div>
        </div>
      </div>

      {/* Text Feedback */}
      <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              Searching {filter}...
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Scanning database for "<span className="text-blue-600 dark:text-blue-400">{query}</span>"
          </p>
      </div>

      <style>{`
        @keyframes scan-diagonal {
            0% { transform: translate(0, 0); }
            25% { transform: translate(100%, 0); }
            50% { transform: translate(100%, 100%); }
            75% { transform: translate(0, 100%); }
            100% { transform: translate(0, 0); }
        }
      `}</style>
    </div>
  );
};

export default SearchLoadingState;
