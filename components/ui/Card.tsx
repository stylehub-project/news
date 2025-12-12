import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'outline' | 'glass';
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hoverable = false,
  ...props
}) => {
  const variants = {
    default: "bg-white shadow-sm border border-gray-100",
    flat: "bg-gray-50",
    outline: "bg-transparent border border-gray-200",
    glass: "bg-white/80 backdrop-blur-lg border border-white/50 shadow-sm",
  };

  const hoverStyles = hoverable 
    ? "hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer" 
    : "";

  return (
    <div 
      className={`rounded-2xl overflow-hidden ${variants[variant]} ${hoverStyles} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;