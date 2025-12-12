import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface BlurImageLoaderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
}

const BlurImageLoader: React.FC<BlurImageLoaderProps> = ({ 
  src, 
  alt, 
  className = '', 
  wrapperClassName = '',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-gray-200 ${wrapperClassName}`}>
      {/* Placeholder / Blur Layer */}
      <div 
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${isLoaded ? 'opacity-0' : 'opacity-100'} z-10`}
      >
        {!hasError ? (
            <div className="w-full h-full bg-gray-300 animate-pulse"></div>
        ) : (
            <div className="flex flex-col items-center text-gray-400">
                <ImageIcon size={24} />
                <span className="text-[10px] mt-1">Image unavailable</span>
            </div>
        )}
      </div>

      {/* Actual Image */}
      <img
        src={src}
        alt={alt}
        className={`relative z-0 transition-all duration-700 ease-in-out ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-md'} ${className}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
            setHasError(true);
            setIsLoaded(true); // Reveal error state
        }}
        {...props}
      />
    </div>
  );
};

export default BlurImageLoader;