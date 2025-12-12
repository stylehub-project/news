import React from 'react';

interface ShimmerProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

const Shimmer: React.FC<ShimmerProps> = ({ 
  className = '', 
  width = '100%', 
  height = '1rem', 
  circle = false 
}) => {
  return (
    <div 
      className={`bg-gray-200 relative overflow-hidden ${circle ? 'rounded-full' : 'rounded-md'} ${className}`}
      style={{ 
        width, 
        height 
      }}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
};

export default Shimmer;