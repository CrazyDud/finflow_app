
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useFinance } from '@/hooks/use-finance';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Plus, 
  Settings, 
  Wallet,
  CreditCard,
  Clock,
  TrendingUp
} from 'lucide-react';
import { MoneySymbol } from '@/components/ui/money-symbol';

interface QuickActionButton {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  icon: string;
  color: string;
  lastUsed?: number;
  frequency?: number;
}

export function EnhancedSuperQuickActions() {
  const { data, addIncome, addExpense, deleteIncome, deleteExpense } = useFinance();
  const { toast } = useToast();
  const [quickActions, setQuickActions] = useState<QuickActionButton[]>([]);
  const [showAmountDialog, setShowAmountDialog] = useState<QuickActionButton | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [quickIncomeAmount, setQuickIncomeAmount] = useState('');
  const [quickExpenseAmount, setQuickExpenseAmount] = useState('');
  const [quickExpenseCategory, setQuickExpenseCategory] = useState('');
  const [lastAmounts, setLastAmounts] = useState<Record<string, number>>({});

  // Load saved quick actions and last amounts
  useEffect(() => {
    const savedActions = localStorage.getItem('enhanced_quick_actions');
    const savedAmounts = localStorage.getItem('last_amounts');
    
    if (savedActions) {
      setQuickActions(JSON.parse(savedActions));
    }
    if (savedAmounts) {
      setLastAmounts(JSON.parse(savedAmounts));
    }
  }, []);

  // Save last amounts
  const saveLastAmount = (key: string, amount: number) => {
    const updated = { ...lastAmounts, [key]: amount };
    setLastAmounts(updated);
    localStorage.setItem('last_amounts', JSON.stringify(updated));
  };

  const handleQuickIncome = async (amount?: number) => {
    const finalAmount = amount || parseFloat(quickIncomeAmount);
    if (!data || !finalAmount || finalAmount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      const createdId = addIncome({
        amount: finalAmount,
        currency: data.settings.defaultCurrency,
        date: new Date().toISOString(),
        description: 'Quick income'
      });
      if (data.settings.autoCalcLimits) {
        try { localStorage.setItem('needs_recalc', 'income'); } catch {}
      }

      saveLastAmount('income', finalAmount);
      setQuickIncomeAmount('');
      
      toast({
        title: '💰 Income added',
        description: `${formatCurrency(finalAmount, data.settings.defaultCurrency, [])} recorded`,
        action: (
          <Button onClick={() => createdId && deleteIncome(createdId)}>Undo</Button>
        ),
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add income',
        variant: 'destructive',
      });
    }
  };

  const handleQuickExpense = async (amount?: number, categoryId?: string) => {
    const finalAmount = amount || parseFloat(quickExpenseAmount);
    const finalCategoryId = categoryId || quickExpenseCategory;
    
    if (!data || !finalAmount || !finalCategoryId || finalAmount <= 0) {
      toast({
        title: 'Missing information',
        description: 'Please enter amount and select category',
        variant: 'destructive',
      });
      return;
    }

    try {
      const createdId = addExpense({
        amount: finalAmount,
        currency: data.settings.defaultCurrency,
        categoryId: finalCategoryId,
        date: new Date().toISOString(),
        description: 'Quick expense'
      });

      saveLastAmount('expense', finalAmount);
      setQuickExpenseAmount('');
      setQuickExpenseCategory('');
      
      toast({
        title: '💸 Expense added',
        description: `${formatCurrency(finalAmount, data.settings.defaultCurrency, [])} recorded`,
        action: (
          <Button onClick={() => createdId && deleteExpense(createdId)}>Undo</Button>
        ),
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add expense',
        variant: 'destructive',
      });
    }
  };

  const handleActionClick = (action: QuickActionButton) => {
    setShowAmountDialog(action);
    setCustomAmount(action.amount.toString());
  };

  const handleCustomAmountSubmit = () => {
    if (!showAmountDialog) return;
    
    const amount = parseFloat(customAmount);
    if (amount > 0) {
      // Update the action's default amount
      const updatedActions = quickActions.map(a => 
        a.id === showAmountDialog.id 
          ? { ...a, amount, lastUsed: Date.now(), frequency: (a.frequency || 0) + 1 }
          : a
      );
      setQuickActions(updatedActions);
      localStorage.setItem('enhanced_quick_actions', JSON.stringify(updatedActions));

      // Execute the expense (this will handle the refresh)
      handleQuickExpense(amount, showAmountDialog.categoryId);
      
      // Close dialog immediately
      setShowAmountDialog(null);
      setCustomAmount('');
    } else {
      setShowAmountDialog(null);
      setCustomAmount('');
    }
  };

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Priority: Quick Income & Expense First */}
      <Card className="border-0 bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-emerald-900/20 dark:via-blue-900/20 dark:to-purple-900/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Lightning Quick Add
            </span>
          </CardTitle>
          <p className="text-muted-foreground">
            Add income or expenses instantly with smart memory
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Quick Income */}
            <div className="space-y-4 p-6 rounded-2xl bg-white/60 dark:bg-black/20 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Wallet className="h-5 w-5 text-emerald-600" />
                  <h4 className="font-semibold text-emerald-700 dark:text-emerald-300">Quick Income</h4>
                </div>
                {lastAmounts.income && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs border-emerald-300"
                    onClick={() => handleQuickIncome(lastAmounts.income)}
                  >
                    {formatCurrency(lastAmounts.income, data.settings.defaultCurrency, [])}
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={quickIncomeAmount}
                    onChange={(e) => setQuickIncomeAmount(e.target.value)}
                    className="pl-8"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">
                    <MoneySymbol />
                  </span>
                </div>
                <Button 
                  onClick={() => handleQuickIncome()} 
                  disabled={!quickIncomeAmount}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Expense */}
            <div className="space-y-4 p-6 rounded-2xl bg-white/60 dark:bg-black/20 border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold text-red-700 dark:text-red-300">Quick Expense</h4>
                </div>
                {lastAmounts.expense && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs border-red-300"
                    onClick={() => handleQuickExpense(lastAmounts.expense, quickExpenseCategory)}
                  >
                    {formatCurrency(lastAmounts.expense, data.settings.defaultCurrency, [])}
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={quickExpenseAmount}
                      onChange={(e) => setQuickExpenseAmount(e.target.value)}
                      className="pl-8"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500">
                      <MoneySymbol />
                    </span>
                  </div>
                  <Button 
                    onClick={() => handleQuickExpense()} 
                    disabled={!quickExpenseAmount || !quickExpenseCategory}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <Select value={quickExpenseCategory} onValueChange={setQuickExpenseCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <Card className="border-0 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-900/20 dark:via-purple-900/20 dark:to-fuchsia-900/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                <Zap className="h-5 w-5" />
              </div>
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Smart Quick Actions
              </span>
            </CardTitle>
            <p className="text-muted-foreground">
              Your most used expenses with smart amount suggestions
            </p>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {quickActions
                .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
                .map((action, index) => {
                  const category = data.categories.find(cat => cat.id === action.categoryId);
                  
                  return (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Button
                        onClick={() => handleActionClick(action)}
                        variant="outline"
                        className="w-full h-20 flex flex-col items-center justify-center space-y-1 p-3 bg-white/60 dark:bg-black/20 hover:shadow-md transition-all relative"
                      >
                        {action.frequency && action.frequency > 1 && (
                          <Badge className="absolute -top-2 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-purple-500">
                            {action.frequency}
                          </Badge>
                        )}
                        
                        <span className="text-lg">{category?.name.charAt(0) || '💰'}</span>
                        <span className="text-xs font-medium text-center leading-tight">
                          {action.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(action.amount, data.settings.defaultCurrency, [])}
                        </span>
                        
                        {action.lastUsed && (
                          <span className="text-xs text-purple-500 flex items-center">
                            <Clock className="h-2 w-2 mr-1" />
                            Recent
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Amount Input Dialog */}
      <Dialog open={!!showAmountDialog} onOpenChange={() => setShowAmountDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showAmountDialog?.name}</DialogTitle>
            <DialogDescription>
              Enter the amount for this expense
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="pl-8"
                autoFocus
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <MoneySymbol />
              </span>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAmountDialog(null)}>
                Cancel
              </Button>
              <Button onClick={handleCustomAmountSubmit} disabled={!customAmount}>
                Add Expense
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
