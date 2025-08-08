"use client";
import { MainLayout } from '@/components/layout/main-layout';
import { TransactionsList } from '@/components/transactions/transactions-list';
import { useEffect } from 'react';
import { useOnboarding, type OnboardingStep } from '@/components/shared/onboarding/OnboardingProvider';

export default function TransactionsPage() {
  const { startIfFirstVisit } = useOnboarding();
  useEffect(() => {
    const steps: OnboardingStep[] = [
      { id: 'list', target: '[data-tour="transactions.list"]', title: 'Transactions', body: 'Browse, filter and manage all records.' },
    ];
    startIfFirstVisit('transactions', steps);
  }, [startIfFirstVisit]);
  return (
    <MainLayout>
      <div className="space-y-6" data-tour="transactions.list">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">All Transactions</h1>
          <p className="text-muted-foreground">
            Complete history of your income and expense transactions
          </p>
        </div>
        <TransactionsList />
      </div>
    </MainLayout>
  );
}
