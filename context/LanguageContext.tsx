import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type LanguageCode = 'en' | 'hi';

interface LanguageContextType {
  appLanguage: LanguageCode;
  setAppLanguage: (lang: LanguageCode) => void;
  contentLanguage: LanguageCode;
  setContentLanguage: (lang: LanguageCode) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appLanguage, setAppLanguageState] = useState<LanguageCode>(() => {
      return (localStorage.getItem('app_language') as LanguageCode) || 'en';
  });
  
  const [contentLanguage, setContentLanguageState] = useState<LanguageCode>(() => {
      return (localStorage.getItem('content_language') as LanguageCode) || 'en';
  });

  const setAppLanguage = (lang: LanguageCode) => {
      setAppLanguageState(lang);
      localStorage.setItem('app_language', lang);
  };

  const setContentLanguage = (lang: LanguageCode) => {
      setContentLanguageState(lang);
      localStorage.setItem('content_language', lang);
  };

  return (
    <LanguageContext.Provider value={{ appLanguage, setAppLanguage, contentLanguage, setContentLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};