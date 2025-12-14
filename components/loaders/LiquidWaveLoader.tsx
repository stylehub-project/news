import React from 'react';

interface LiquidWaveLoaderProps {
  progress?: number; // 0 to 100
  color?: string;
  className?: string;
}

const LiquidWaveLoader: React.FC<LiquidWaveLoaderProps> = ({ 
  progress = 45,
  color = 'bg-blue-500',
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative w-24 h-24 rounded-full border-4 border-gray-100 overflow-hidden shadow-inner bg-white">
        {/* Wave Container */}
        <div 
            className={`absolute bottom-0 left-0 w-[200%] h-full transition-transform duration-700 ease-in-out`}
            style={{ 
                transform: `translateY(${100 - progress}%) translateX(-25%)` 
            }}
        >
            {/* Wave 1 */}
            <div className={`absolute bottom-0 left-0 w-full h-[200%] ${color} opacity-40 rounded-[40%] animate-[spin_6s_linear_infinite]`}></div>
            {/* Wave 2 */}
            <div className={`absolute bottom-0 left-0 w-full h-[200%] ${color} opacity-60 rounded-[35%] animate-[spin_8s_linear_infinite_reverse]`} style={{ marginLeft: '-10px' }}></div>
            {/* Wave 3 (Solid) */}
            <div className={`absolute bottom-0 left-0 w-full h-[200%] ${color} rounded-[38%] animate-[spin_10s_linear_infinite]`}></div>
        </div>

        {/* Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="text-lg font-black text-gray-800 mix-blend-overlay">{progress}%</span>
        </div>
      </div>
      <p className="text-xs font-bold text-gray-400 mt-3 uppercase tracking-wider">Syncing Data</p>
    </div>
  );
};

export default LiquidWaveLoader;