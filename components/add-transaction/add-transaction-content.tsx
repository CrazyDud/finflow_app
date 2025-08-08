
'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TransactionForm } from '@/components/forms/transaction-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Wallet, CreditCard } from 'lucide-react';

export function AddTransactionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialType = (searchParams?.get('type') as 'income' | 'expense') || 'expense';
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(initialType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Add Transaction</h1>
        <p className="text-muted-foreground">
          Record a new {transactionType === 'income' ? 'income source' : 'expense'} to track your finances
        </p>
      </div>

      {/* Transaction Type Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PlusCircle className="h-5 w-5" />
            <span>Transaction Type</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button
              variant={transactionType === 'income' ? 'default' : 'outline'}
              onClick={() => setTransactionType('income')}
              className="flex items-center space-x-2"
            >
              <Wallet className="h-4 w-4" />
              <span>Income</span>
              {transactionType === 'income' && (
                <Badge className="ml-2">Selected</Badge>
              )}
            </Button>
            <Button
              variant={transactionType === 'expense' ? 'default' : 'outline'}
              onClick={() => setTransactionType('expense')}
              className="flex items-center space-x-2"
            >
              <CreditCard className="h-4 w-4" />
              <span>Expense</span>
              {transactionType === 'expense' && (
                <Badge className="ml-2">Selected</Badge>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Form */}
      <TransactionForm 
        type={transactionType}
        onSuccess={() => {
          router.push('/');
        }}
      />
    </div>
  );
}
