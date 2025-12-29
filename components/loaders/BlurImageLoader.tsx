
import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, WifiOff } from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';

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
  const { isLowData, isOnline } = useNetwork();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!isLowData);

  // Re-evaluate if we should load when connection improves
  useEffect(() => {
      if (!isLowData && !shouldLoad) {
          setShouldLoad(true);
      }
  }, [isLowData]);

  // If offline, check if image is cached by browser automatically.
  // If not, it will error out, which we handle.

  const handleManualLoad = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShouldLoad(true);
  };

  return (
    <div className={`relative overflow-hidden bg-gray-200 ${wrapperClassName}`}>
      
      {/* Placeholder / Blur Layer */}
      <div 
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${isLoaded ? 'opacity-0' : 'opacity-100'} z-10 bg-gray-200`}
      >
        {!hasError && shouldLoad ? (
            <div className="w-full h-full bg-gray-300 animate-pulse"></div>
        ) : !shouldLoad ? (
            <div className="flex flex-col items-center justify-center text-gray-500 cursor-pointer h-full w-full hover:bg-gray-300 transition-colors" onClick={handleManualLoad}>
                <ImageIcon size={20} />
                <span className="text-[10px] mt-1 font-bold">Tap to Load</span>
                <span className="text-[9px] opacity-70">Data Saver On</span>
            </div>
        ) : (
            <div className="flex flex-col items-center text-gray-400">
                {isOnline ? <ImageIcon size={24} /> : <WifiOff size={24} />}
                <span className="text-[10px] mt-1">{isOnline ? 'Image unavailable' : 'Offline'}</span>
            </div>
        )}
      </div>

      {/* Actual Image - Only rendered if shouldLoad is true */}
      {shouldLoad && (
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
      )}
    </div>
  );
};

export default BlurImageLoader;
