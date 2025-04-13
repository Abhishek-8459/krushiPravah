import React, { createContext, useState, useContext, useEffect } from 'react';

type Language = 'english' | 'marathi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (englishText: string, marathiText: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize language from localStorage with a default value
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    return (savedLanguage === 'english' || savedLanguage === 'marathi') ? savedLanguage : 'english';
  });

  // Update language in state and localStorage
  const setLanguage = (lang: Language) => {
    console.log('Setting language to:', lang);
    setLanguageState(lang);
    localStorage.setItem('preferredLanguage', lang);
    // Force document language for better accessibility
    document.documentElement.lang = lang === 'english' ? 'en' : 'mr';
  };

  // Translation function
  const translate = (englishText: string, marathiText: string): string => {
    console.log('Translating:', { englishText, marathiText, currentLanguage: language });
    return language === 'english' ? englishText : marathiText;
  };

  // Update language if localStorage changes in another tab
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'preferredLanguage') {
        const newLanguage = e.newValue as Language;
        if (newLanguage === 'english' || newLanguage === 'marathi') {
          setLanguageState(newLanguage);
          document.documentElement.lang = newLanguage === 'english' ? 'en' : 'mr';
        }
      }
    };

    // Set initial document language
    document.documentElement.lang = language === 'english' ? 'en' : 'mr';

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [language]);

  // Provide the language context to children
  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for using the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
