import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ type, message, onClose, duration = 4000 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} className="text-green-500" />,
    error: <AlertCircle size={20} className="text-red-500" />,
    warning: <AlertTriangle size={20} className="text-yellow-500" />,
    info: <Info size={20} className="text-blue-500" />,
  };

  const styles = {
    success: "border-green-100 bg-green-50",
    error: "border-red-100 bg-red-50",
    warning: "border-yellow-100 bg-yellow-50",
    info: "border-blue-100 bg-blue-50",
  };

  return (
    <div 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 transform ${styles[type]} ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 scale-95'}`}
    >
      {icons[type]}
      <p className="text-sm font-medium text-gray-800 pr-2">{message}</p>
      <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-gray-600">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;