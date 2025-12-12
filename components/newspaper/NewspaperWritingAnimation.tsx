import React from 'react';
import { PenTool, RefreshCw } from 'lucide-react';

interface NewspaperWritingAnimationProps {
  isActive: boolean;
  stage?: 'drafting' | 'image-gen' | 'finalizing';
}

const NewspaperWritingAnimation: React.FC<NewspaperWritingAnimationProps> = ({ isActive, stage = 'drafting' }) => {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center transition-opacity duration-300">
      <div className="bg-black/90 text-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-xs text-center animate-in zoom-in-95 duration-300">
        
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center relative z-10">
            {stage === 'image-gen' ? (
                <RefreshCw className="animate-spin text-blue-400" size={24} />
            ) : (
                <PenTool className="animate-bounce text-yellow-400" size={24} />
            )}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-1">
            {stage === 'drafting' && "Drafting Headlines..."}
            {stage === 'image-gen' && "Generating Visuals..."}
            {stage === 'finalizing' && "Polishing Layout..."}
          </h3>
          <p className="text-xs text-gray-400">Gemini is curating your personalized edition.</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-progress origin-left"></div>
        </div>
      </div>
    </div>
  );
};

export default NewspaperWritingAnimation;