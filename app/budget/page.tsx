"use client";

import { BudgetPage } from '@/components/budget/budget-page';
import { MainLayout } from '@/components/layout/main-layout';
import { useEffect } from 'react';
import { useOnboarding, type OnboardingStep } from '@/components/shared/onboarding/OnboardingProvider';

export default function Budget() {
  const { startIfFirstVisit } = useOnboarding();
  useEffect(() => {
    const steps: OnboardingStep[] = [
      { id: 'allocation', target: '[data-tour="budget.allocation"]', title: 'Allocation', body: 'Set your percentage split and basis month.' },
      { id: 'limits', target: '[data-tour="budget.limits"]', title: 'Category Limits', body: 'Review and recalculate limits per allocation.' },
      { id: 'insights', target: '[data-tour="budget.insights"]', title: 'Insights', body: 'See tips and warnings for this month.' },
    ];
    startIfFirstVisit('budget', steps);
  }, [startIfFirstVisit]);

  return (
    <MainLayout>
      <div data-tour="budget.allocation">
        <BudgetPage />
      </div>
    </MainLayout>
  );
}
