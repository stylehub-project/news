
import React, { useState } from 'react';
import { AlertTriangle, X, Clock, Bell } from 'lucide-react';

interface UnderReviewBannerProps {
  featureName: string;
}

const UnderReviewBanner: React.FC<UnderReviewBannerProps> = ({ featureName }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isNotified, setIsNotified] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gray-900/95 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl border border-yellow-500/30 relative overflow-hidden">
        
        {/* Background Stripe */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
        
        <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-white p-1"
        >
            <X size={16} />
        </button>

        <div className="flex gap-4">
            <div className="shrink-0 mt-1">
                <div className="p-2 bg-yellow-500/20 rounded-full text-yellow-400 border border-yellow-500/20 animate-pulse">
                    <AlertTriangle size={20} />
                </div>
            </div>
            
            <div className="flex-1 pr-4">
                <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                    Under Review & Development
                    <span className="bg-yellow-500 text-black text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Beta</span>
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed mb-3">
                    The <span className="font-bold text-white">{featureName}</span> section is currently being enhanced by our AI team. It will be ready soon.
                </p>
                
                <button 
                    onClick={() => setIsNotified(true)}
                    disabled={isNotified}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${isNotified ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-gray-200'}`}
                >
                    {isNotified ? (
                        <>
                            <Clock size={12} /> You will be notified
                        </>
                    ) : (
                        <>
                            <Bell size={12} /> Notify when ready
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
