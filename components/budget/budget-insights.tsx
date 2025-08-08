
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle,
  Target,
  DollarSign,
  Calendar
} from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';
import { 
  formatCurrency, 
  calculateMonthlyTotals, 
  getCurrentMonth,
  filterByDateRange,
  calculateCategorySpending 
} from '@/lib/utils';

interface Insight {
  type: 'warning' | 'success' | 'info';
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: string;
}

export function BudgetInsights() {
  const { data, currencyRates, getDashboardStats } = useFinance();

  if (!data) return null;

  const stats = getDashboardStats();
  const currentMonth = getCurrentMonth();
  
  // Get current month data
  const { totalIncome, totalExpenses, balance } = calculateMonthlyTotals(
    data.income,
    data.expenses,
    currentMonth,
    data.settings.defaultCurrency,
    currencyRates
  );

  // Calculate insights
  const insights: Insight[] = [];

  // Savings rate insight
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
  if (savingsRate >= 20) {
    insights.push({
      type: 'success',
      title: 'Excellent Savings Rate',
      description: `You're saving ${savingsRate.toFixed(1)}% of your income. Keep it up!`,
      icon: CheckCircle,
    });
  } else if (savingsRate >= 10) {
    insights.push({
      type: 'info',
      title: 'Good Savings Progress',
      description: `You're saving ${savingsRate.toFixed(1)}% of your income. Try to reach 20%.`,
      icon: Target,
      action: 'Increase savings'
    });
  } else if (savingsRate >= 0) {
    insights.push({
      type: 'warning',
      title: 'Low Savings Rate',
      description: `You're only saving ${savingsRate.toFixed(1)}% of your income. Aim for at least 10%.`,
      icon: AlertCircle,
      action: 'Review expenses'
    });
  } else {
    insights.push({
      type: 'warning',
      title: 'Spending More Than Earning',
      description: `You're spending ${Math.abs(savingsRate).toFixed(1)}% more than you earn this month.`,
      icon: AlertCircle,
      action: 'Urgent review needed'
    });
  }

  // Budget utilization
  if (stats) {
    const budgetUtilization = stats.budgetUtilization;
    if (budgetUtilization > 90) {
      insights.push({
        type: 'warning',
        title: 'High Budget Utilization',
        description: `You've used ${budgetUtilization.toFixed(1)}% of your monthly budget.`,
        icon: AlertCircle,
        action: 'Monitor spending'
      });
    } else if (budgetUtilization > 70) {
      insights.push({
        type: 'info',
        title: 'Moderate Budget Usage',
        description: `You've used ${budgetUtilization.toFixed(1)}% of your monthly budget.`,
        icon: Target,
      });
    }
  }

  // Top spending categories insight
  const currentMonthExpenses = filterByDateRange(data.expenses, 'monthly');
  const categorySpending = calculateCategorySpending(
    currentMonthExpenses,
    data.categories,
    data.settings.defaultCurrency,
    currencyRates
  );

  if (categorySpending.length > 0) {
    const topCategory = categorySpending[0];
    if (topCategory.percentage > 40) {
      insights.push({
        type: 'warning',
        title: 'High Category Concentration',
        description: `${topCategory.category.name} accounts for ${topCategory.percentage.toFixed(1)}% of your spending.`,
        icon: AlertCircle,
        action: 'Diversify spending'
      });
    }
  }

  // Income vs last month
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

  if (lastMonthTotals.totalIncome > 0) {
    const incomeChange = ((totalIncome - lastMonthTotals.totalIncome) / lastMonthTotals.totalIncome) * 100;
    if (incomeChange > 10) {
      insights.push({
        type: 'success',
        title: 'Income Increased',
        description: `Your income is up ${incomeChange.toFixed(1)}% from last month.`,
        icon: TrendingUp,
      });
    } else if (incomeChange < -10) {
      insights.push({
        type: 'warning',
        title: 'Income Decreased',
        description: `Your income is down ${Math.abs(incomeChange).toFixed(1)}% from last month.`,
        icon: TrendingDown,
        action: 'Review income sources'
      });
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5" />
          <span>Budget Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.length > 0 ? (
            insights.map((insight, index) => {
              const Icon = insight.icon;
              const iconColor = {
                success: 'text-green-600',
                warning: 'text-yellow-600',
                info: 'text-blue-600'
              }[insight.type];

              return (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Icon className={`h-5 w-5 mt-0.5 ${iconColor}`} />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{insight.title}</h4>
                      <Badge 
                        variant={insight.type === 'warning' ? 'destructive' : 
                               insight.type === 'success' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {insight.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                    {insight.action && (
                      <Badge variant="outline" className="text-xs">
                        {insight.action}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No insights to display. Keep tracking your finances!
              </p>
            </div>
          )}

          {/* Monthly Summary */}
          <div className="pt-4 border-t space-y-3">
            <h4 className="text-sm font-medium flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>This Month Summary</span>
            </h4>
            
            <div className="grid gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Income</span>
                <span className="font-medium">
                  {formatCurrency(totalIncome, data.settings.defaultCurrency, currencyRates)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Expenses</span>
                <span className="font-medium">
                  {formatCurrency(totalExpenses, data.settings.defaultCurrency, currencyRates)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm pt-1 border-t">
                <span className="font-medium">Net Balance</span>
                <span className={`font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(balance, data.settings.defaultCurrency, currencyRates)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
