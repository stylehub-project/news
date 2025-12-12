import React from 'react';

export type MarkerType = 'breaking' | 'politics' | 'tech' | 'general';

interface LocationMarkerProps {
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  type?: MarkerType;
  label?: string;
  onClick: () => void;
  isActive?: boolean;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({
  x,
  y,
  type = 'general',
  label,
  onClick,
  isActive
}) => {
  const colors = {
    breaking: 'bg-red-500 shadow-red-500/50',
    politics: 'bg-blue-600 shadow-blue-600/50',
    tech: 'bg-indigo-500 shadow-indigo-500/50',
    general: 'bg-emerald-500 shadow-emerald-500/50',
  };

  const activeClass = isActive ? 'scale-125 z-30 ring-4 ring-white/50' : 'z-10 hover:scale-110';

  return (
    <div 
      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Label Tooltip (Always visible on active, hover otherwise) */}
      {label && (
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold rounded shadow-lg transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {label}
        </div>
      )}

      {/* Pulse Effect */}
      <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${colors[type].split(' ')[0]}`}></div>
      
      {/* Dot */}
      <div className={`relative w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-300 ${colors[type]} ${activeClass}`}></div>
    </div>
  );
};

export default LocationMarker;