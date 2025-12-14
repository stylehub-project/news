import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isLoaded: (section: string) => boolean;
  markAsLoaded: (section: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set());

  const markAsLoaded = (section: string) => {
    setLoadedSections((prev) => {
      const newSet = new Set(prev);
      newSet.add(section);
      return newSet;
    });
  };

  const isLoaded = (section: string) => {
    return loadedSections.has(section);
  };

  return (
    <LoadingContext.Provider value={{ isLoaded, markAsLoaded }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};