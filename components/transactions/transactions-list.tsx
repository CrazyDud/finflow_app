

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Receipt, Search, Filter, Plus, TrendingUp, TrendingDown, Trash2, Edit3 } from 'lucide-react';
import { EditTransactionDialog } from '@/components/shared/edit-transaction-dialog';
import { useFinance } from '@/hooks/use-finance';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Income, Expense } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useI18n } from '@/components/i18n/i18n-provider';

type Transaction = (Income | Expense) & {
  type: 'income' | 'expense';
  categoryName?: string;
};

export function TransactionsList() {
  const { data, currencyRates, deleteIncome, deleteExpense } = useFinance();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const { t } = useI18n();

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">{t('trans.loading')}</div>
        </CardContent>
      </Card>
    );
  }

  // Combine income and expenses
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
      };
    }),
  ];

  // Filter transactions
  const filteredTransactions = allTransactions
    .filter(transaction => {
      const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (transaction.type === 'expense' && (transaction as any).categoryName?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = selectedType === 'all' || transaction.type === selectedType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDeleteTransaction = (transaction: Transaction) => {
    try {
      if (transaction.type === 'income') {
        deleteIncome(transaction.id);
      } else {
        deleteExpense(transaction.id);
      }
      
      toast({
        title: t('notifications.transactionDeleted') || 'Transaction deleted',
        description: `${transaction.type === 'income' ? 'Income' : 'Expense'} of ${formatCurrency(transaction.amount, transaction.currency, currencyRates)} was removed`,
      });
    } catch (error) {
      toast({
        title: t('common.error') || 'Error',
        description: t('errors.failedToDelete') || 'Failed to delete transaction',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>{t('trans.filters')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder={t('trans.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t('trans.filter.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('trans.filter.all')}</SelectItem>
                <SelectItem value="income">{t('trans.filter.income')}</SelectItem>
                <SelectItem value="expense">{t('trans.filter.expense')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Receipt className="h-5 w-5" />
              <span>{t('trans.header')} ({filteredTransactions.length})</span>
            </CardTitle>
            <Link href="/add">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('trans.add')}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => {
                const isIncome = transaction.type === 'income';
                const Icon = isIncome ? TrendingUp : TrendingDown;
                
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`p-2 rounded-full ${
                        isIncome 
                          ? 'bg-green-500/10 text-green-600' 
                          : 'bg-red-500/10 text-red-600'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-medium">
                          {transaction.description || 
                           (isIncome ? 'Income' : (transaction as any).categoryName || 'Expense')}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-muted-foreground">
                            {formatDate(transaction.date)}
                          </p>
                          <Badge variant={isIncome ? 'default' : 'secondary'} className="text-xs">
                            {isIncome ? 'Income' : (transaction as any).categoryName}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className={`font-semibold ${
                          isIncome ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isIncome ? '+' : '-'}
                          {formatCurrency(transaction.amount, transaction.currency, currencyRates)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.currency}
                        </Badge>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          onClick={() => setTransactionToEdit(transaction)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                               <AlertDialogTitle>{t('trans.delete.title')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                 {t('trans.delete.confirm')} {transaction.type}? {t('trans.delete.undo')}
                                <br /><br />
                                <strong>Amount:</strong> {formatCurrency(transaction.amount, transaction.currency, currencyRates)}
                                <br />
                                <strong>Description:</strong> {transaction.description || (transaction.type === 'income' ? 'Income' : (transaction as any).categoryName)}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                               <AlertDialogCancel>{t('trans.cancel')}</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteTransaction(transaction)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                 {t('trans.delete')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedType !== 'all' ? t('trans.empty.filtered') : t('trans.empty')}
              </p>
              <Link href="/add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('trans.addFirst')}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Transaction Dialog */}
      <EditTransactionDialog
        transaction={transactionToEdit}
        onClose={() => setTransactionToEdit(null)}
        onUpdate={() => {
          // Data will update automatically via the hook
        }}
      />
    </div>
  );
}
