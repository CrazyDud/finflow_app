
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity
} from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';
import { formatCurrency, getCurrentMonth, calculateMonthlyTotals, animateValue } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatCard {
  title: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGradient: string;
  suffix?: string;
}

export function NewStatsCards() {
  const { data, currencyRates, getDashboardStats } = useFinance();
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});
  
  const stats = getDashboardStats();
  
  useEffect(() => {
    if (stats) {
      // Animate the stat values
      const valuesToAnimate = {
        balance: stats.currentBalance,
        income: stats.monthlyIncome,
        expenses: stats.monthlyExpenses,
        savings: stats.savingsRate
      };
      
      Object.entries(valuesToAnimate).forEach(([key, endValue]) => {
        animateValue(0, endValue, 1500, (value) => {
          setAnimatedValues(prev => ({ ...prev, [key]: value }));
        });
      });
    }
  }, [stats]);

  if (!data || !stats) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse h-48">
            <CardContent className="p-8">
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const currentMonth = getCurrentMonth();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
  
  const lastMonthTotals = calculateMonthlyTotals(
    data.income,
    data.expenses,
    lastMonthKey,
    data.settings.defaultCurrency,
    currencyRates
  );

  const incomeChange = lastMonthTotals.totalIncome > 0 
    ? ((stats.monthlyIncome - lastMonthTotals.totalIncome) / lastMonthTotals.totalIncome) * 100
    : 0;

  const expenseChange = lastMonthTotals.totalExpenses > 0
    ? ((stats.monthlyExpenses - lastMonthTotals.totalExpenses) / lastMonthTotals.totalExpenses) * 100
    : 0;

  const balanceChange = lastMonthTotals.balance !== 0
    ? ((stats.currentBalance - lastMonthTotals.balance) / Math.abs(lastMonthTotals.balance)) * 100
    : 0;

  const statCards: StatCard[] = [
    {
      title: 'Current Balance',
      value: animatedValues.balance || 0,
      change: balanceChange,
      trend: balanceChange >= 0 ? 'up' : 'down',
      icon: Wallet,
      color: stats.currentBalance >= 0 ? 'text-emerald-600' : 'text-red-500',
      bgGradient: stats.currentBalance >= 0 
        ? 'from-emerald-500/10 via-teal-500/10 to-blue-500/10' 
        : 'from-red-500/10 via-pink-500/10 to-rose-500/10',
    },
    {
      title: 'Monthly Income',
      value: animatedValues.income || 0,
      change: incomeChange,
      trend: incomeChange >= 0 ? 'up' : 'down',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgGradient: 'from-blue-500/10 via-indigo-500/10 to-purple-500/10',
    },
    {
      title: 'Monthly Expenses',
      value: animatedValues.expenses || 0,
      change: expenseChange,
      trend: expenseChange <= 0 ? 'up' : 'down',
      icon: CreditCard,
      color: 'text-orange-600',
      bgGradient: 'from-orange-500/10 via-amber-500/10 to-yellow-500/10',
    },
    {
      title: 'Savings Rate',
      value: animatedValues.savings || 0,
      change: stats.savingsRate - (lastMonthTotals.balance > 0 ? (lastMonthTotals.balance / lastMonthTotals.totalIncome) * 100 : 0),
      trend: stats.savingsRate >= 20 ? 'up' : stats.savingsRate >= 10 ? 'neutral' : 'down',
      icon: PiggyBank,
      color: 'text-purple-600',
      bgGradient: 'from-purple-500/10 via-violet-500/10 to-indigo-500/10',
      suffix: '%',
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const isPositive = stat.trend === 'up';
        const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
        
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className={`relative overflow-hidden h-48 hover:shadow-2xl transition-all duration-300 group cursor-pointer bg-gradient-to-br ${stat.bgGradient} border-0`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/0 dark:from-white/5 dark:to-white/0" />
              
              <CardContent className="relative p-8 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      {stat.title}
                    </p>
                    <div className={`text-3xl font-bold ${stat.color} transition-all duration-300 group-hover:scale-105`}>
                      {stat.suffix === '%' 
                        ? `${stat.value.toFixed(1)}${stat.suffix}`
                        : formatCurrency(stat.value, data.settings.defaultCurrency, currencyRates)
                      }
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-2xl bg-white/20 dark:bg-black/20 ${stat.color} transform transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-8 w-8" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  {Math.abs(stat.change) > 0.01 && (
                    <div className="flex items-center space-x-2">
                      <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                        isPositive 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        <TrendIcon className="h-3 w-3" />
                        <span>{Math.abs(stat.change).toFixed(1)}%</span>
                      </div>
                      <span className="text-xs text-muted-foreground">vs last month</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Activity className="h-3 w-3" />
                    <span>Live</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
