'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { I18N, translate } from '@/lib/i18n';
import { storageGet, storageSet } from '@/lib/storage';

const LangContext = createContext({
  lang: 'ro',
  setLang: () => {},
  t: (key) => key,
  I18N,
});

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('ro');

  useEffect(() => {
    const saved = storageGet('adevar-lang');
    if (saved && I18N[saved]) setLangState(saved);
  }, []);

  function setLang(l) {
    if (!I18N[l]) return;
    setLangState(l);
    storageSet('adevar-lang', l);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = l;
    }
  }

  function t(key) {
    return translate(lang, key);
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t, I18N }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
