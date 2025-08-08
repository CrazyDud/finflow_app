'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
  const [overrideLanguage, setOverrideLanguage] = useState<Language | null>(null);

  const readCookieLang = (): Language | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/(?:^|; )lang=([^;]+)/);
    return (match ? (decodeURIComponent(match[1]) as Language) : null);
  };

  const cookieLang = readCookieLang();
  const language = (overrideLanguage ?? cookieLang ?? (data?.settings.language || 'en')) as Language;

  const setLanguage = (lang: Language) => {
    setOverrideLanguage(lang);
    updateSettings({ language: lang });
    try {
      const maxAge = 60 * 60 * 24 * 365; // 1 year
      document.cookie = `lang=${encodeURIComponent(lang)}; path=/; max-age=${maxAge}`;
    } catch {}
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

  useEffect(() => {
    if (overrideLanguage && data?.settings.language === overrideLanguage) {
      setOverrideLanguage(null);
    }
  }, [data?.settings.language, overrideLanguage]);

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


