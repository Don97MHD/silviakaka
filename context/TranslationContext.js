import React, { createContext, useContext } from 'react';

const TranslationContext = createContext(null);

export const TranslationProvider = ({ translations, children }) => {
  const t = (key) => {
    return translations[key] || key;
  };

  return (
    <TranslationContext.Provider value={{ t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);