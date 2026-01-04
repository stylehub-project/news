
import React, { useState } from 'react';
import { AlertTriangle, X, Bell } from 'lucide-react';

interface UnderReviewBannerProps {
  featureName?: string;
}

const UnderReviewBanner: React.FC<UnderReviewBannerProps> = ({ featureName }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isNotified, setIsNotified] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 animate-in slide-in-from-bottom-4 duration-700 pointer-events-auto">
      <div className="bg-gray-100/95 dark:bg-gray-800/95 backdrop-blur-md text-gray-800 dark:text-gray-200 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden">
        
        <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-100 p-1 transition-colors"
        >
            <X size={16} />
        </button>

        <div className="flex gap-3">
            <div className="shrink-0 mt-0.5">
                <div className="p-1.5 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400">
                    <AlertTriangle size={16} />
                </div>
            </div>
            
            <div className="flex-1 pr-4">
                <p className="text-xs font-medium leading-relaxed mb-3">
                    ⚠️ This feature is under review and development. It will be available soon. You’ll be notified once it’s ready.
                </p>
                
                <button 
                    onClick={() => setIsNotified(true)}
                    disabled={isNotified}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${isNotified ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50'}`}
                >
                    {isNotified ? (
                        "We'll notify you"
                    ) : (
                        <>
                            <Bell size={12} /> Notify me
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UnderReviewBanner;
