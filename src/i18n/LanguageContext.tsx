import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { loadPreferences } from '../utils/storage';

interface LanguageCtx {
  lang: string;
  setLang: (lang: string) => void;
}

const LanguageContext = createContext<LanguageCtx>({ lang: 'zh', setLang: () => {} });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState('zh');

  useEffect(() => {
    loadPreferences().then(p => {
      if (p?.language) setLangState(p.language);
    });
  }, []);

  const setLang = useCallback((l: string) => setLangState(l), []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageCtx(): LanguageCtx {
  return useContext(LanguageContext);
}
