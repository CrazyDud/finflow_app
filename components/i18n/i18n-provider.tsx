'use client';

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useFinance } from '@/hooks/use-finance';
import { LANGUAGE_META, translations } from './translations';
import type { Language } from './translations';

type I18nContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: Array<{ code: Language; name: string; flag: string }>;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { data, updateSettings } = useFinance();
  const language = (data?.settings.language || 'en') as Language;

  const setLanguage = (lang: Language) => {
    updateSettings({ language: lang });
  };

  const t = (key: string): string => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || key;
  };

  const languages = useMemo(() => (
    (['en', 'tr', 'el', 'es', 'fr'] as Language[]).map(code => ({
      code,
      name: LANGUAGE_META[code].name,
      flag: LANGUAGE_META[code].flag,
    }))
  ), []);

  const value: I18nContextValue = useMemo(() => ({ language, setLanguage, t, languages }), [language]);

  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = language;
      }
    } catch {}
  }, [language]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export const LANGUAGES: Array<{ code: Language; name: string; flag: string }> = (
  ['en', 'tr', 'el', 'es', 'fr'] as Language[]
).map(code => ({ code, name: LANGUAGE_META[code].name, flag: LANGUAGE_META[code].flag }));


