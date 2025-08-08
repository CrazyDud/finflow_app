

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  Receipt,
  Trash2,
  AlertTriangle,
  Edit3
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useFinance } from '@/hooks/use-finance';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Income, Expense } from '@/lib/types';
import { EditTransactionDialog } from '@/components/shared/edit-transaction-dialog';

type Transaction = (Income | Expense) & {
  type: 'income' | 'expense';
  categoryName?: string;
  icon?: string;
};

export function RecentTransactions() {
  const { data, currencyRates, deleteIncome, deleteExpense } = useFinance();
  const { toast } = useToast();
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;

    try {
      if (transactionToDelete.type === 'income') {
        deleteIncome(transactionToDelete.id);
        toast({
          title: '✅ Income deleted',
          description: `${formatCurrency(transactionToDelete.amount, transactionToDelete.currency, currencyRates)} removed successfully`,
        });
      } else {
        deleteExpense(transactionToDelete.id);
        toast({
          title: '✅ Expense deleted',
          description: `${formatCurrency(transactionToDelete.amount, transactionToDelete.currency, currencyRates)} removed successfully`,
        });
      }
      
      setTransactionToDelete(null);
      // Auto refresh to update stats
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        variant: 'destructive',
      });
    }
  };

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Combine income and expenses into transactions
  const allTransactions: Transaction[] = [
    ...data.income.map(income => ({
      ...income,
      type: 'income' as const,
    })),
    ...data.expenses.map(expense => {
      const category = data.categories.find(cat => cat.id === expense.categoryId);
      return {
        ...expense,
        type: 'expense' as const,
        categoryName: category?.name,
        icon: category?.icon,
      };
    }),
  ];

  // Sort by date (most recent first) and get last 5
  const recentTransactions = allTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Transactions</span>
            </CardTitle>
            <Link href="/transactions">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => {
                const isIncome = transaction.type === 'income';
                const Icon = isIncome ? TrendingUp : TrendingDown;
                
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                  >
                    <div className={`p-2 rounded-full ${
                      isIncome 
                        ? 'bg-green-500/10 text-green-600' 
                        : 'bg-red-500/10 text-red-600'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">
                          {transaction.description || 
                           (isIncome ? 'Income' : transaction.categoryName || 'Expense')}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-semibold ${
                            isIncome ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isIncome ? '+' : '-'}
                            {formatCurrency(
                              transaction.amount, 
                              transaction.currency, 
                              currencyRates
                            )}
                          </span>
                          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-6 w-6 text-blue-500 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                              onClick={() => setTransactionToEdit(transaction)}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                              onClick={() => setTransactionToDelete(transaction)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.date)}
                        </p>
                        <Badge 
                          variant="secondary" 
                          className="text-xs"
                        >
                          {transaction.currency}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center space-y-2">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">No transactions yet</p>
              <p className="text-xs text-muted-foreground">
                Start by adding some income or expenses
              </p>
              <div className="flex justify-center space-x-2 mt-4">
                <Link href="/add?type=income">
                  <Button size="sm" variant="outline">
                    Add Income
                  </Button>
                </Link>
                <Link href="/add?type=expense">
                  <Button size="sm" variant="outline">
                    Add Expense
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!transactionToDelete} onOpenChange={() => setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Delete Transaction</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {transactionToDelete?.type}? 
              <br />
              <strong>
                {transactionToDelete && formatCurrency(
                  transactionToDelete.amount, 
                  transactionToDelete.currency, 
                  currencyRates
                )}
              </strong>
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransaction}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Transaction Dialog */}
      <EditTransactionDialog
        transaction={transactionToEdit}
        onClose={() => setTransactionToEdit(null)}
        onUpdate={() => {
          // Optionally refresh data or let the parent handle it
        }}
      />
    </>
  );
}
