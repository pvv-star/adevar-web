'use client';
import { createContext, useContext, useState } from 'react';
import { getTranslations } from '@/lib/i18n';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState('ro');
  const t = (key) => getTranslations(lang)[key] ?? key;
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LangContext);
}

export function useLang() {
  return useContext(LangContext);
}
