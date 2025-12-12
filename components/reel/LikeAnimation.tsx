import React from 'react';
import { Heart } from 'lucide-react';

const LikeAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
      <div className="animate-in zoom-in fade-out duration-700 transform">
        <Heart size={120} className="text-white fill-red-500 drop-shadow-2xl rotate-[-15deg]" />
      </div>
    </div>
  );
};

export default LikeAnimation;