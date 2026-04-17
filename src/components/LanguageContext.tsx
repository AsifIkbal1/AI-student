import React, { createContext, useContext, useEffect, useState } from 'react';
import { en } from '../locales/en';
import { bn } from '../locales/bn';

type Language = 'en' | 'bn';
type TranslationKeys = keyof typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys, params?: Record<string, any>) => string;
  currentTopic: string;
  setCurrentTopic: (topic: string) => void;
}

const translations = { en, bn };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const [currentTopic, setCurrentTopic] = useState<string>(() => {
    return localStorage.getItem('currentTopic') || "";
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('currentTopic', currentTopic);
  }, [currentTopic]);

  const t = (key: TranslationKeys, params?: Record<string, any>): string => {
    let text = translations[language][key] || translations['en'][key] || key;
    
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentTopic, setCurrentTopic }}>
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
