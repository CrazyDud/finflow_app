
import React, { Suspense } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { AddTransactionContent } from '@/components/add-transaction/add-transaction-content';
import { Loader2 } from 'lucide-react';

export default function AddTransactionPage() {
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
        <AddTransactionContent />
      </Suspense>
    </MainLayout>
  );
}
