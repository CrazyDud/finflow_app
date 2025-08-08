
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  ArrowRight,
  DollarSign,
  Sparkles,
  Activity,
  BarChart3,
  FileText
} from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  bgGradient: string;
  proOnly?: boolean;
}

export function EnhancedQuickActions() {
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
        title: '✅ Expense added',
        description: `${formatCurrency(amount, data.settings.defaultCurrency, currencyRates)} recorded successfully`,
      });

      setQuickExpense({ amount: '', categoryId: '' });
      
      // Auto refresh to update dashboard stats
      setTimeout(() => window.location.reload(), 1200);
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
        title: '💰 Income added',
        description: `${formatCurrency(amount, data.settings.defaultCurrency, currencyRates)} recorded successfully`,
      });

      setQuickIncome({ amount: '', source: '' });
      
      // Auto refresh to update dashboard stats
      setTimeout(() => window.location.reload(), 1200);
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
      title: 'Budget Overview',
      description: 'Track your monthly budget and limits',
      icon: Target,
      href: '/budget',
      color: 'text-blue-600',
      bgGradient: 'from-blue-500/10 via-indigo-500/10 to-purple-500/10',
    },
    {
      title: 'Analytics Hub',
      description: 'Comprehensive financial insights',
      icon: BarChart3,
      href: '/analytics',
      color: 'text-purple-600',
      bgGradient: 'from-purple-500/10 via-violet-500/10 to-indigo-500/10',
      proOnly: true,
    },
    {
      title: 'Categories',
      description: 'Organize your spending categories',
      icon: PieChart,
      href: '/categories',
      color: 'text-orange-600',
      bgGradient: 'from-orange-500/10 via-amber-500/10 to-yellow-500/10',
      proOnly: true,
    },
    {
      title: 'Auto Payments',
      description: 'Set up recurring expenses',
      icon: Activity,
      href: '/automatic-payments',
      color: 'text-indigo-600',
      bgGradient: 'from-indigo-500/10 via-blue-500/10 to-purple-500/10',
      proOnly: true,
    },
    {
      title: 'Calendar View',
      description: 'Timeline of all your transactions',
      icon: Calendar,
      href: '/calendar',
      color: 'text-teal-600',
      bgGradient: 'from-teal-500/10 via-cyan-500/10 to-blue-500/10',
      proOnly: true,
    },
    {
      title: 'Reports',
      description: 'Export and analyze your data',
      icon: FileText,
      href: '/reports',
      color: 'text-emerald-600',
      bgGradient: 'from-emerald-500/10 via-green-500/10 to-teal-500/10',
      proOnly: true,
    },
    {
      title: 'Settings',
      description: 'Customize your experience',
      icon: Settings,
      href: '/settings',
      color: 'text-gray-600',
      bgGradient: 'from-gray-500/10 via-slate-500/10 to-zinc-500/10',
    },
  ];

  const filteredActions = isProMode ? actions : actions.filter(action => !action.proOnly);

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Enhanced Navigation Actions */}
      <Card className="border-0 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/50 dark:to-gray-900/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3 text-2xl">
            <Activity className="h-6 w-6 text-slate-600" />
            <span>Navigate & Analyze</span>
          </CardTitle>
          <p className="text-muted-foreground text-base">
            Explore powerful financial tools and insights
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredActions.map((action, index) => {
              const Icon = action.icon;
              
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link href={action.href}>
                    <Card className={`h-32 hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br ${action.bgGradient}`}>
                      <CardContent className="p-6 h-full flex flex-col justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-xl bg-white/20 dark:bg-black/20 ${action.color} transform transition-transform duration-300 group-hover:scale-110`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-semibold text-base">{action.title}</h4>
                            <p className="text-sm opacity-70">{action.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          {action.proOnly && (
                            <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                              Pro
                            </div>
                          )}
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
          
          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-sm text-muted-foreground">
              {isProMode 
                ? "🎉 You have access to all Pro features" 
                : "🚀 Upgrade to Pro mode for advanced analytics and unlimited categories"}
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
