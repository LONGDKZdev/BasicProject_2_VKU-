import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import translations from '../constants/translations';

const LanguageInfo = createContext();

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, segment) => (acc && acc[segment] !== undefined ? acc[segment] : null), obj);
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('hotel_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('hotel_language', language);
  }, [language]);

  const t = useCallback(
    (key, fallbackValue) => {
      const value = getNestedValue(translations[language], key);
      if (typeof value === 'function') {
        return value(fallbackValue);
      }
      if (value !== null && value !== undefined) return value;
      const fallback = getNestedValue(translations.en, key);
      return fallback ?? fallbackValue ?? key;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, t]
  );

  return <LanguageInfo.Provider value={value}>{children}</LanguageInfo.Provider>;
};

export const useLanguage = () => useContext(LanguageInfo);

