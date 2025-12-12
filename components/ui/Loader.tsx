import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'white' | 'gray';
  className?: string;
  centered?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', variant = 'primary', className = '', centered = false }) => {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  };

  const colors = {
    primary: "text-blue-600",
    white: "text-white",
    gray: "text-gray-400",
  };

  const loader = (
    <Loader2 
      size={sizes[size]} 
      className={`animate-spin ${colors[variant]} ${className}`} 
    />
  );

  if (centered) {
    return <div className="flex items-center justify-center w-full h-full p-4">{loader}</div>;
  }

  return loader;
};

export default Loader;