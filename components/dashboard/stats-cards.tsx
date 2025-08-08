
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  PiggyBank,
  Target
} from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';
import { formatCurrency, getCurrentMonth, calculateMonthlyTotals, animateValue } from '@/lib/utils';

interface StatCard {
  title: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  suffix?: string;
}

export function StatsCards() {
  const { data, currencyRates, getDashboardStats } = useFinance();
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
  // Force recalculation by tracking data changes
  useEffect(() => {
    if (data) {
      setLastUpdate(Date.now());
    }
  }, [data?.income.length, data?.expenses.length, data?.settings]);

  const stats = getDashboardStats();
  
  useEffect(() => {
    if (stats) {
      // Reset and animate the stat values
      const valuesToAnimate = {
        balance: stats.currentBalance,
        income: stats.monthlyIncome,
        expenses: stats.monthlyExpenses,
        savings: stats.savingsRate
      };
      
      Object.entries(valuesToAnimate).forEach(([key, endValue]) => {
        animateValue(0, endValue, 800, (value) => {
          setAnimatedValues(prev => ({ ...prev, [key]: value }));
        });
      });
    }
  }, [stats, lastUpdate]);

  if (!data || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded"></div>
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
      value: animatedValues.balance || stats.currentBalance,
      change: balanceChange,
      trend: balanceChange >= 0 ? 'up' : 'down',
      icon: Wallet,
      color: stats.currentBalance >= 0 ? 'text-green-600' : 'text-red-600',
    },
    {
      title: 'Monthly Income',
      value: animatedValues.income || stats.monthlyIncome,
      change: incomeChange,
      trend: incomeChange >= 0 ? 'up' : 'down',
      icon: TrendingUp,
      color: 'text-blue-600',
    },
    {
      title: 'Monthly Expenses',
      value: animatedValues.expenses || stats.monthlyExpenses,
      change: expenseChange,
      trend: expenseChange <= 0 ? 'up' : 'down',
      icon: CreditCard,
      color: 'text-orange-600',
    },
    {
      title: 'Savings Rate',
      value: animatedValues.savings || stats.savingsRate,
      change: stats.savingsRate - (lastMonthTotals.balance > 0 ? (lastMonthTotals.balance / lastMonthTotals.totalIncome) * 100 : 0),
      trend: stats.savingsRate >= 20 ? 'up' : stats.savingsRate >= 10 ? 'neutral' : 'down',
      icon: PiggyBank,
      color: 'text-purple-600',
      suffix: '%',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const isPositive = stat.trend === 'up';
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;
        
        return (
          <Card 
            key={`${stat.title}-${lastUpdate}`}
            className="card-hover transition-all duration-300 hover:shadow-lg hover:scale-105"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-muted/50 ${stat.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  <div className={`text-2xl font-bold animate-number ${stat.color}`}>
                    {stat.suffix === '%' 
                      ? `${stat.value.toFixed(1)}${stat.suffix}`
                      : formatCurrency(stat.value, data.settings.defaultCurrency, currencyRates)
                    }
                  </div>
                </div>
                
                {Math.abs(stat.change) > 0.01 && (
                  <div className="flex items-center space-x-1">
                    <TrendIcon className={`h-3 w-3 ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`} />
                    <span className={`text-xs ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.abs(stat.change).toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
