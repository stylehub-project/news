
import React, { useEffect, useState } from 'react';
import { WifiOff, Database, CheckCircle2 } from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';

const ConnectivityIndicator: React.FC = () => {
  const { status } = useNetwork();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [icon, setIcon] = useState<React.ReactNode>(null);
  const [styleClass, setStyleClass] = useState('');

  useEffect(() => {
    if (status === 'offline') {
      setMessage('You are offline. Showing saved content.');
      setIcon(<WifiOff size={14} />);
      setStyleClass('bg-red-500 text-white');
      setVisible(true);
    } else if (status === 'low-data') {
      setMessage('Low Data Mode active.');
      setIcon(<Database size={14} />);
      setStyleClass('bg-yellow-500 text-white');
      setVisible(true);
      // Auto-hide low data warning after 3s
      setTimeout(() => setVisible(false), 3000);
    } else {
      // If we were previously offline, show a quick "Back Online" green toast
      if (visible && styleClass.includes('red')) {
          setMessage('Back Online');
          setIcon(<CheckCircle2 size={14} />);
          setStyleClass('bg-green-500 text-white');
          setTimeout(() => setVisible(false), 3000);
      } else {
          setVisible(false);
      }
    }
  }, [status]);

  if (!visible) return null;

  return (
    <div className="fixed top-14 left-0 w-full z-50 flex justify-center pointer-events-none">
      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full shadow-md text-xs font-bold animate-in slide-in-from-top-2 fade-in duration-300 ${styleClass}`}>
        {icon}
        <span>{message}</span>
      </div>
    </div>
  );
};

export default ConnectivityIndicator;
