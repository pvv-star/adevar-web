'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_LANGS, loadLang, translate } from '@/lib/i18n';
import { storageGet, storageSet } from '@/lib/storage';

const LangContext = createContext({
  lang: 'ro',
  setLang: () => {},
  t: (key) => key,
});

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('ro');

  useEffect(() => {
    const saved = storageGet('adevar-lang');
    if (saved && SUPPORTED_LANGS.includes(saved)) {
      loadLang(saved).then(() => setLangState(saved));
    }
  }, []);

  function setLang(l) {
    if (!SUPPORTED_LANGS.includes(l)) return;
    loadLang(l).then(() => {
      setLangState(l);
      storageSet('adevar-lang', l);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = l;
      }
    });
  }

  function t(key) {
    return translate(lang, key);
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
