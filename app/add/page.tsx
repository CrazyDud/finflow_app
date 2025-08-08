
"use client";
import React, { Suspense, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { AddTransactionContent } from '@/components/add-transaction/add-transaction-content';
import { Loader2 } from 'lucide-react';
import { useOnboarding, type OnboardingStep } from '@/components/shared/onboarding/OnboardingProvider';

export default function AddTransactionPage() {
  const { startIfFirstVisit } = useOnboarding();
  useEffect(() => {
    const steps: OnboardingStep[] = [
      { id: 'form', target: '[data-tour="add.form"]', title: 'Quick Add', body: 'Enter amount, category and description.' },
    ];
    startIfFirstVisit('add', steps);
  }, [startIfFirstVisit]);
  return (
    <MainLayout>
      <Suspense 
        fallback={
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        }
      >
        <div data-tour="add.form">
          <AddTransactionContent />
        </div>
      </Suspense>
    </MainLayout>
  );
}
