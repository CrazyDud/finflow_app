
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';
import { calculateBudgetUtilization, calculateCategorySpending, filterByDateRange, formatCurrency } from '@/lib/utils';

export function BudgetProgress() {
  const { data, currencyRates } = useFinance();

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-2 bg-muted rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get current month expenses
  const currentMonthExpenses = filterByDateRange(data.expenses, 'monthly');
  const categorySpending = calculateCategorySpending(
    currentMonthExpenses,
    data.categories,
    data.settings.defaultCurrency,
    currencyRates
  );
  
  const budgetUtilization = calculateBudgetUtilization(categorySpending);
  
  // Sort by utilization percentage (highest first) and take top categories
  const topCategories = budgetUtilization
    .filter(({ category, spent }) => category.limit > 0 || spent > 0)
    .sort((a, b) => b.utilization - a.utilization)
    .slice(0, 6);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Budget Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topCategories.length > 0 ? (
          <div className="space-y-4">
            {topCategories.map(({ category, spent, limit, utilization, warning }) => {
              const isOverBudget = utilization > 100;
              const isNearLimit = warning && !isOverBudget;
              const isOnTrack = !warning && !isOverBudget;
              
              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{category.name}</span>
                      {isOverBudget && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      {isNearLimit && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      {isOnTrack && spent > 0 && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(spent, data.settings.defaultCurrency, currencyRates)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        of {formatCurrency(limit, data.settings.defaultCurrency, currencyRates)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Progress 
                      value={Math.min(utilization, 100)} 
                      className={`h-2 ${
                        isOverBudget ? 'bg-red-100' : 
                        isNearLimit ? 'bg-yellow-100' : 'bg-green-100'
                      }`}
                    />
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={
                          isOverBudget ? 'destructive' : 
                          isNearLimit ? 'secondary' : 'default'
                        }
                        className="text-xs"
                      >
                        {utilization.toFixed(0)}% used
                      </Badge>
                      {isOverBudget && (
                        <span className="text-xs text-red-600">
                          {formatCurrency(spent - limit, data.settings.defaultCurrency, currencyRates)} over
                        </span>
                      )}
                      {!isOverBudget && limit > spent && (
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(limit - spent, data.settings.defaultCurrency, currencyRates)} remaining
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center space-y-2">
            <Target className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">No budget data available</p>
            <p className="text-xs text-muted-foreground">
              Set category limits and add expenses to track progress
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
