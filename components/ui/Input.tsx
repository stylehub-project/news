
import React, { forwardRef } from 'react';
import { Search } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'underline' | 'search';
  icon?: React.ReactNode;
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  variant = 'default',
  icon,
  label,
  error,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const baseStyles = "w-full outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    default: "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl px-4 py-3 placeholder:text-gray-400 dark:text-white",
    underline: "bg-transparent border-b border-gray-200 dark:border-gray-700 px-0 py-2 rounded-none focus:border-blue-600 dark:focus:border-blue-400 placeholder:text-gray-400 dark:text-white",
    search: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 focus:bg-white dark:focus:bg-gray-900 border border-transparent focus:border-blue-500 rounded-full px-5 py-2.5 pl-11 dark:text-white",
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
      {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">{label}</label>}
      <div className="relative">
        {(variant === 'search' || icon) && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {variant === 'search' ? <Search size={18} /> : icon}
          </div>
        )}
        <input
          ref={ref}
          className={`${baseStyles} ${variants[variant]} ${icon ? 'pl-11' : ''} ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-500 ml-1 mt-0.5">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
