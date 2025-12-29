
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { cacheService } from '../utils/cacheService';

export type ConnectionStatus = 'online' | 'offline' | 'low-data';
export type LowDataPreference = 'auto' | 'on' | 'off';

interface NetworkContextType {
  status: ConnectionStatus;
  isOnline: boolean;
  isLowData: boolean;
  lowDataPreference: LowDataPreference;
  setLowDataPreference: (pref: LowDataPreference) => void;
  dataUsage: number; // in MB
  clearCache: () => void;
  lastSyncTime: number;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<ConnectionStatus>('online');
  const [lowDataPreference, setLowDataPreference] = useState<LowDataPreference>('auto');
  const [dataUsage, setDataUsage] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(Date.now());
  const prevStatusRef = useRef<ConnectionStatus>('online');

  // Load preference
  useEffect(() => {
      const savedPref = localStorage.getItem('nc_low_data_pref') as LowDataPreference;
      if (savedPref) setLowDataPreference(savedPref);
      
      // Load usage
      const savedUsage = localStorage.getItem('nc_data_usage');
      if (savedUsage) setDataUsage(parseFloat(savedUsage));
  }, []);

  // Save preference & Usage
  useEffect(() => {
      localStorage.setItem('nc_low_data_pref', lowDataPreference);
  }, [lowDataPreference]);

  useEffect(() => {
      localStorage.setItem('nc_data_usage', dataUsage.toString());
  }, [dataUsage]);

  useEffect(() => {
    const updateStatus = () => {
      const isOnline = navigator.onLine;
      
      if (!isOnline) {
        setStatus('offline');
        prevStatusRef.current = 'offline';
        return;
      }

      // Check Network Information API
      // @ts-ignore
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      let isSlow = false;

      if (connection) {
        isSlow = connection.saveData || 
                 connection.effectiveType === '2g' || 
                 connection.effectiveType === 'slow-2g';
      }

      // Determine Low Data Status based on Preference
      let effectiveLowData = false;
      if (lowDataPreference === 'on') effectiveLowData = true;
      else if (lowDataPreference === 'off') effectiveLowData = false;
      else effectiveLowData = isSlow; // Auto

      if (effectiveLowData) {
          setStatus('low-data');
      } else {
          setStatus('online');
      }

      // Detect "Back Online" transition for Silent Sync
      if (prevStatusRef.current === 'offline' && isOnline) {
          console.log("Network restored - Triggering silent sync...");
          setLastSyncTime(Date.now());
          // Simulate data usage bump for sync
          setDataUsage(prev => prev + 0.5); 
      }
      prevStatusRef.current = isOnline ? (effectiveLowData ? 'low-data' : 'online') : 'offline';
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    
    // Initial check
    updateStatus();

    // Mock Data Usage Incrementer (simulate usage while app is open)
    const usageInterval = setInterval(() => {
        if (navigator.onLine) {
            setDataUsage(prev => prev + 0.01); // 10KB every 10s
        }
    }, 10000);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      clearInterval(usageInterval);
    };
  }, [lowDataPreference]);

  const clearCache = () => {
      cacheService.prune();
      // Force clear all local storage starting with cache prefix
      Object.keys(localStorage).forEach(key => {
          if (key.startsWith('nc_cache_')) localStorage.removeItem(key);
      });
      // Also reset data usage for this session view
      setDataUsage(0);
  };

  return (
    <NetworkContext.Provider value={{ 
      status, 
      isOnline: status !== 'offline', 
      isLowData: status === 'low-data' || lowDataPreference === 'on',
      lowDataPreference,
      setLowDataPreference,
      dataUsage,
      clearCache,
      lastSyncTime
    }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
