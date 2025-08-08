
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { QuickTransactionDialog } from '@/components/shared/quick-transaction-dialog';
import { 
  Plus, 
  CreditCard, 
  Wallet, 
  TrendingUp,
  Target,
  PieChart,
  Calendar,
  Settings,
  Zap,
  Save
} from 'lucide-react';
import { MoneySymbol } from '@/components/ui/money-symbol';
import { useFinance } from '@/hooks/use-finance';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  proOnly?: boolean;
}

export function QuickActions() {
  const { data, addIncome, addExpense, currencyRates } = useFinance();
  const { toast } = useToast();
  const isProMode = data?.settings.mode === 'pro';
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [quickExpense, setQuickExpense] = useState({ amount: '', categoryId: '' });
  const [quickIncome, setQuickIncome] = useState({ amount: '', source: '' });

  const handleQuickExpense = async () => {
    if (!data || !quickExpense.amount || !quickExpense.categoryId) {
      toast({
        title: 'Missing information',
        description: 'Please enter amount and select category',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(quickExpense.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid positive number',
        variant: 'destructive',
      });
      return;
    }

    try {
      addExpense({
        amount,
        currency: data.settings.defaultCurrency,
        categoryId: quickExpense.categoryId,
        date: new Date().toISOString(),
        description: 'Quick expense'
      });

      toast({
        title: 'Expense added',
        description: `${formatCurrency(amount, data.settings.defaultCurrency, currencyRates)} recorded successfully`,
      });

      setQuickExpense({ amount: '', categoryId: '' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add expense',
        variant: 'destructive',
      });
    }
  };

  const handleQuickIncome = async () => {
    if (!data || !quickIncome.amount) {
      toast({
        title: 'Missing information',
        description: 'Please enter amount',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(quickIncome.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid positive number',
        variant: 'destructive',
      });
      return;
    }

    try {
      addIncome({
        amount,
        currency: data.settings.defaultCurrency,
        date: new Date().toISOString(),
        description: quickIncome.source || 'Quick income'
      });

      toast({
        title: 'Income added',
        description: `${formatCurrency(amount, data.settings.defaultCurrency, currencyRates)} recorded successfully`,
      });

      setQuickIncome({ amount: '', source: '' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add income',
        variant: 'destructive',
      });
    }
  };

  const actions: QuickAction[] = [
    {
      title: 'View Budget',
      description: 'Check budget progress',
      icon: Target,
      href: '/budget',
      color: 'bg-blue-500/10 text-blue-700 border-blue-200',
    },
    {
      title: 'Analytics',
      description: 'Detailed financial analysis',
      icon: TrendingUp,
      href: '/analytics',
      color: 'bg-purple-500/10 text-purple-700 border-purple-200',
      proOnly: true,
    },
    {
      title: 'Categories',
      description: 'Manage expense categories',
      icon: PieChart,
      href: '/categories',
      color: 'bg-orange-500/10 text-orange-700 border-orange-200',
      proOnly: true,
    },
    {
      title: 'Calendar View',
      description: 'View transactions by date',
      icon: Calendar,
      href: '/calendar',
      color: 'bg-teal-500/10 text-teal-700 border-teal-200',
      proOnly: true,
    },
  ];

  const filteredActions = isProMode ? actions : actions.filter(action => !action.proOnly);

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Super Quick Add Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Super Quick Add</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Quick Income */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-green-600">
                <Wallet className="h-4 w-4" />
                <h4 className="font-medium">Quick Income</h4>
              </div>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={quickIncome.amount}
                    onChange={(e) => setQuickIncome(prev => ({ ...prev, amount: e.target.value }))}
                    className="pl-8"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <MoneySymbol />
                  </span>
                </div>
                <Input
                  placeholder="Source (optional)"
                  value={quickIncome.source}
                  onChange={(e) => setQuickIncome(prev => ({ ...prev, source: e.target.value }))}
                  className="flex-1"
                />
                <Button onClick={handleQuickIncome} disabled={!quickIncome.amount} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Expense */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-red-600">
                <CreditCard className="h-4 w-4" />
                <h4 className="font-medium">Quick Expense</h4>
              </div>
              <div className="flex space-x-2">
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={quickExpense.amount}
                    onChange={(e) => setQuickExpense(prev => ({ ...prev, amount: e.target.value }))}
                    className="pl-8 w-24"
                  />
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                     <MoneySymbol />
                   </span>
                </div>
                <Select 
                  value={quickExpense.categoryId} 
                  onValueChange={(value) => setQuickExpense(prev => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger className="flex-1">
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
                <Button 
                  onClick={handleQuickExpense} 
                  disabled={!quickExpense.amount || !quickExpense.categoryId}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Advanced Add Button */}
          <div className="mt-4 pt-4 border-t flex justify-center">
            <Button variant="outline" onClick={() => setShowTransactionDialog(true)}>
              <Settings className="h-4 w-4 mr-2" />
              More Options
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Traditional Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredActions.map((action) => {
              const Icon = action.icon;
              
              return (
                <Link key={action.title} href={action.href}>
                  <Button
                    variant="ghost"
                    className={`h-auto p-4 flex flex-col items-start space-y-2 w-full text-left hover:shadow-md transition-all duration-200 ${action.color}`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{action.title}</span>
                    </div>
                    <p className="text-xs opacity-70">
                      {action.description}
                    </p>
                  </Button>
                </Link>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              {isProMode 
                ? "You have access to all Pro features" 
                : "Switch to Pro mode for advanced features"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Transaction Dialog */}
      <QuickTransactionDialog
        open={showTransactionDialog}
        onOpenChange={setShowTransactionDialog}
      />
    </div>
  );
}
