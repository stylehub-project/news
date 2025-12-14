import React, { useState, useEffect } from 'react';
import Shimmer from '../ui/Shimmer';
import MultiStepLoader from './MultiStepLoader';

const ProfileSetupLoader: React.FC = () => {
  const [currentStep, setCurrentStep] = useState('saving');

  useEffect(() => {
    // Simulate progression through setup steps
    const t1 = setTimeout(() => setCurrentStep('personalizing'), 1500);
    const t2 = setTimeout(() => setCurrentStep('finalizing'), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const steps = [
    { id: 'saving', label: 'Saving Preferences' },
    { id: 'personalizing', label: 'Personalizing Feed' },
    { id: 'finalizing', label: 'Ready to Explore' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center overflow-hidden">
      {/* Wave Background Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute bottom-[-40%] left-[-50%] w-[200%] h-[100%] bg-blue-50/80 rounded-[40%] animate-[spin_15s_linear_infinite]"></div>
         <div className="absolute bottom-[-45%] left-[-50%] w-[200%] h-[100%] bg-indigo-50/80 rounded-[35%] animate-[spin_20s_linear_infinite_reverse]"></div>
         <div className="absolute bottom-[-50%] left-[-50%] w-[200%] h-[100%] bg-blue-100/50 rounded-[38%] animate-[spin_25s_linear_infinite]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-8 animate-in zoom-in-95 duration-700">
          {/* Circular Avatar Skeleton with Shimmer */}
          <div className="relative mb-10">
              <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-blue-400 to-indigo-400 animate-[spin_8s_linear_infinite]">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                       {/* Counter-rotate the inner content to keep it upright if it had content, but here we just shimmer */}
                       <div className="w-[94%] h-[94%] bg-gray-100 rounded-full overflow-hidden relative">
                          <Shimmer className="w-full h-full" />
                       </div>
                  </div>
              </div>
              {/* Status Indicator */}
              <div className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 border-4 border-white rounded-full animate-bounce shadow-md"></div>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Setting up your profile</h2>
          <p className="text-gray-500 mb-8 text-center font-medium">Just a moment while we curate your experience.</p>

          <div className="w-full bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-xl">
             <MultiStepLoader steps={steps} currentStepId={currentStep} />
          </div>
      </div>
    </div>
  );
};

export default ProfileSetupLoader;