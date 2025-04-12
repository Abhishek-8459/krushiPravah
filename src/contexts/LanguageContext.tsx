
import React, { createContext, useState, useContext, useEffect } from 'react';

type Language = 'english' | 'marathi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (englishText: string, marathiText: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get language preference from localStorage, default to English
    return (localStorage.getItem('preferredLanguage') as Language) || 'english';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  const translate = (englishText: string, marathiText: string): string => {
    return language === 'english' ? englishText : marathiText;
  };

  // Update language if localStorage changes in another tab
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'preferredLanguage') {
        setLanguageState((e.newValue as Language) || 'english');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
