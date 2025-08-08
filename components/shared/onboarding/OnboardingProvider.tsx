'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type OnboardingStep = {
  id: string;
  target: string; // CSS selector e.g. [data-tour="dashboard.quickAdd"]
  title: string;
  body: string;
};

type TourState = {
  pageKey: string | null;
  steps: OnboardingStep[];
  index: number;
  open: boolean;
};

type OnboardingContextType = {
  start: (pageKey: string, steps: OnboardingStep[]) => void;
  startIfFirstVisit: (pageKey: string, steps: OnboardingStep[]) => void;
  stop: () => void;
  next: () => void;
  back: () => void;
  state: TourState;
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TourState>({ pageKey: null, steps: [], index: 0, open: false });

  const start = useCallback((pageKey: string, steps: OnboardingStep[]) => {
    if (!steps || steps.length === 0) return;
    setState({ pageKey, steps, index: 0, open: true });
  }, []);

  const markSeen = (pageKey: string) => {
    try {
      const key = `onboarding_v1_seen_${pageKey}`;
      localStorage.setItem(key, '1');
    } catch {}
  };

  const startIfFirstVisit = useCallback((pageKey: string, steps: OnboardingStep[]) => {
    try {
      const url = new URL(window.location.href);
      const force = url.searchParams.get('tour');
      const key = `onboarding_v1_seen_${pageKey}`;
      const seen = localStorage.getItem(key);
      if (force === '1' || !seen) start(pageKey, steps);
    } catch {
      start(pageKey, steps);
    }
  }, [start]);

  const stop = useCallback(() => {
    setState(prev => {
      if (prev.pageKey) markSeen(prev.pageKey);
      return { pageKey: null, steps: [], index: 0, open: false };
    });
  }, []);

  const next = useCallback(() => {
    setState(prev => {
      const nextIdx = prev.index + 1;
      if (nextIdx >= prev.steps.length) {
        if (prev.pageKey) markSeen(prev.pageKey);
        return { pageKey: null, steps: [], index: 0, open: false };
      }
      return { ...prev, index: nextIdx };
    });
  }, []);

  const back = useCallback(() => {
    setState(prev => ({ ...prev, index: Math.max(0, prev.index - 1) }));
  }, []);

  const value = useMemo(() => ({ start, startIfFirstVisit, stop, next, back, state }), [start, startIfFirstVisit, stop, next, back, state]);

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      <OnboardingOverlay />
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}

function OnboardingOverlay() {
  const { state, next, back, stop } = useOnboarding();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const step = state.open ? state.steps[state.index] : null;
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!step) { setRect(null); return; }
    const el = document.querySelector(step.target) as HTMLElement | null;
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect(r);
    const onResize = () => setRect(el.getBoundingClientRect());
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [step]);

  if (!step || !rect) return null;

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    top: rect.bottom + 8,
    left: Math.max(8, Math.min(rect.left, window.innerWidth - 300 - 8)),
    width: 300,
    zIndex: 60,
  };

  return (
    <div>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={stop}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }}
      />
      {/* Highlight */}
      <div
        style={{
          position: 'fixed',
          top: rect.top - 6,
          left: rect.left - 6,
          width: rect.width + 12,
          height: rect.height + 12,
          border: '2px solid #60a5fa',
          borderRadius: 8,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
          zIndex: 55,
        }}
      />
      {/* Tooltip */}
      <div style={tooltipStyle} className="rounded-md border bg-background text-foreground shadow-lg">
        <div className="p-3 border-b font-semibold">{step.title}</div>
        <div className="p-3 text-sm">{step.body}</div>
        <div className="p-3 flex items-center justify-between">
          <button onClick={stop} className="text-xs text-muted-foreground hover:underline">Skip</button>
          <div className="space-x-2">
            <button onClick={back} disabled={state.index === 0} className="px-2 py-1 border rounded disabled:opacity-50">Back</button>
            <button onClick={next} className="px-2 py-1 border rounded bg-primary text-primary-foreground">{state.index === state.steps.length - 1 ? 'Done' : 'Next'}</button>
          </div>
        </div>
        <div className="px-3 pb-2 text-xs text-muted-foreground">Step {state.index + 1} / {state.steps.length}</div>
      </div>
    </div>
  );
}

export type { OnboardingStep };


