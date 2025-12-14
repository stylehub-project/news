import React from 'react';

interface ParticleLoaderProps {
  className?: string;
  count?: number;
}

const ParticleLoader: React.FC<ParticleLoaderProps> = ({ 
  className = '',
  count = 15
}) => {
  return (
    <div className={`relative w-full h-48 overflow-hidden bg-gradient-to-b from-gray-900 to-black rounded-xl ${className}`}>
      {/* Particles */}
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full opacity-0 animate-[float_4s_ease-in-out_infinite]"
          style={{
            width: Math.random() * 4 + 1 + 'px',
            height: Math.random() * 4 + 1 + 'px',
            left: Math.random() * 100 + '%',
            top: '100%',
            animationDelay: Math.random() * 4 + 's',
            animationDuration: Math.random() * 5 + 3 + 's',
          }}
        ></div>
      ))}
      
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-white text-xs font-medium tracking-[0.2em] uppercase opacity-80">Initializing</p>
        </div>
      </div>
    </div>
  );
};

export default ParticleLoader;