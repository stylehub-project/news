
import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, WifiOff, RefreshCw } from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';

interface BlurImageLoaderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
  fallbackSrc?: string;
}

const BlurImageLoader: React.FC<BlurImageLoaderProps> = ({ 
  src, 
  alt, 
  className = '', 
  wrapperClassName = '',
  fallbackSrc,
  ...props 
}) => {
  const { isLowData, isOnline } = useNetwork();
  
  // Initialize with fallback if src is missing
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src || fallbackSrc);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!isLowData);

  // Sync prop changes
  useEffect(() => {
      setHasError(false);
      setIsLoaded(false);
      setCurrentSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  // Re-evaluate data saver
  useEffect(() => {
      if (!isLowData && !shouldLoad) {
          setShouldLoad(true);
      }
  }, [isLowData]);

  const handleManualLoad = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShouldLoad(true);
  };

  const handleError = () => {
      if (currentSrc !== fallbackSrc && fallbackSrc) {
          // Retry with fallback
          console.warn(`Image failed: ${currentSrc}, trying fallback.`);
          setCurrentSrc(fallbackSrc);
      } else {
          // Fallback also failed
          setHasError(true);
          setIsLoaded(true);
      }
  };

  return (
    <div className={`relative overflow-hidden bg-gray-200 dark:bg-gray-800 ${wrapperClassName}`}>
      
      {/* Loading / Error State Overlay */}
      <div 
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'} z-10 bg-gray-200 dark:bg-gray-800`}
      >
        {!hasError && shouldLoad ? (
            <div className="w-full h-full bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
        ) : !shouldLoad ? (
            <div className="flex flex-col items-center justify-center text-gray-500 cursor-pointer h-full w-full hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors" onClick={handleManualLoad}>
                <ImageIcon size={20} />
                <span className="text-[10px] mt-1 font-bold">Tap to Load</span>
            </div>
        ) : (
            <div className="flex flex-col items-center text-gray-400 p-4 text-center">
                {isOnline ? <ImageIcon size={24} className="opacity-50" /> : <WifiOff size={24} />}
                <span className="text-[10px] mt-1 font-medium">{isOnline ? 'Image not available' : 'Offline'}</span>
            </div>
        )}
      </div>

      {/* Actual Image */}
      {shouldLoad && currentSrc && !hasError && (
          <img
            src={currentSrc}
            alt={alt}
            className={`relative z-0 w-full h-full object-cover transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-md'} ${className}`}
            onLoad={() => setIsLoaded(true)}
            onError={handleError}
            {...props}
          />
      )}
      
      {/* Hard Fallback Visual if even fallbackSrc fails or is missing */}
      {(hasError || (!currentSrc && shouldLoad)) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center opacity-30">
                  <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 mb-2 mx-auto"></div>
                  <div className="h-2 w-12 bg-gray-300 dark:bg-gray-600 rounded mx-auto"></div>
              </div>
          </div>
      )}
    </div>
  );
};

export default BlurImageLoader;
    