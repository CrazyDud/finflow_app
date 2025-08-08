'use client';

import React, { useEffect, useRef } from 'react';
import { useI18n } from '@/components/i18n/i18n-provider';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

const LANGUAGE_CODE_MAP: Record<string, string> = {
  en: 'en',
  tr: 'tr',
  el: 'el',
  es: 'es',
  fr: 'fr',
};

export function GlobalAutoTranslate() {
  const { language } = useI18n();
  const scriptLoadedRef = useRef(false);
  const initializedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    // Inject Google Translate script once
    if (scriptLoadedRef.current) return;

    const init = () => {
      if (initializedRef.current) return;
      initializedRef.current = true;
      try {
        if (!window.google || !window.google.translate) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // Create the translate element into the hidden container
        // Included languages restricted to the ones we support
        // @ts-ignore
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,tr,el,es,fr',
            autoDisplay: false,
          },
          containerRef.current?.id || 'google_translate_element'
        );
      } catch {
        // ignore
      }
    };

    window.googleTranslateElementInit = init;

    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onload = () => {
      scriptLoadedRef.current = true;
      try { window.googleTranslateElementInit && window.googleTranslateElementInit(); } catch {}
    };
    document.body.appendChild(script);

    return () => {
      // don't remove script; keep once loaded
    };
  }, []);

  useEffect(() => {
    // Apply selected language via the hidden combo when available
    const targetLang = LANGUAGE_CODE_MAP[language] || 'en';

    // Also set cookies used by the widget to persist selection
    const setCookie = (name: string, value: string) => {
      try {
        document.cookie = `${name}=${value}; expires=Tue, 31 Dec 2030 23:59:59 GMT; path=/`;
        // set for domain root as well
        const host = location.hostname.replace(/^www\./, '');
        document.cookie = `${name}=${value}; expires=Tue, 31 Dec 2030 23:59:59 GMT; path=/; domain=.${host}`;
      } catch {}
    };
    const path = `/en/${targetLang}`;
    setCookie('googtrans', path);
    setCookie('googtrans', path);

    const attemptApply = () => {
      const combo: HTMLSelectElement | null = document.querySelector('select.goog-te-combo');
      if (!combo) return false;

      if (combo.value !== targetLang) {
        combo.value = targetLang;
        combo.dispatchEvent(new Event('change'));
      }
      return true;
    };

    // If English, reset any previous translation by setting cookie and triggering change
    if (targetLang === 'en') {
      attemptApply();
      return;
    }

    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      const applied = attemptApply();
      if (applied || tries > 50) {
        clearInterval(timer);
      }
    }, 200);

    return () => clearInterval(timer);
  }, [language]);

  // Re-apply translation when DOM changes (dynamic content)
  useEffect(() => {
    if (observerRef.current) return;

    const reapply = () => {
      const combo: HTMLSelectElement | null = document.querySelector('select.goog-te-combo');
      if (!combo) return;
      // Trigger change on current value to force re-translate dynamic nodes
      combo.dispatchEvent(new Event('change'));
    };

    const observer = new MutationObserver(() => {
      // Throttle reapply
      window.requestAnimationFrame(reapply);
    });
    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, []);

  return (
    <div style={{ position: 'fixed', width: 0, height: 0, overflow: 'hidden' }}>
      {/* Hidden container for Google Translate element */}
      <div id="google_translate_element" ref={containerRef} />
      <style>{`
        .skiptranslate, .goog-te-banner-frame { display: none !important; }
        .goog-logo-link { display: none !important; }
        .goog-te-gadget { position: absolute !important; left: -9999px !important; }
        body { top: 0 !important; }
      `}</style>
    </div>
  );
}


