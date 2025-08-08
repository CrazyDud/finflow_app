
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useFinance } from '@/hooks/use-finance';
import { calculateMonthlyTotals, formatCurrency } from '@/lib/utils';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';

export function MonthlyOverview() {
  const { data, currencyRates } = useFinance();

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-64 bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  // Get last 6 months data
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const monthKey = `${year}-${month}`;
    
    const totals = calculateMonthlyTotals(
      data.income,
      data.expenses,
      monthKey,
      data.settings.defaultCurrency,
      currencyRates
    );
    
    months.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      income: totals.totalIncome,
      expenses: totals.totalExpenses,
      balance: totals.balance,
    });
  }

  const currentMonth = months[months.length - 1];
  const previousMonth = months[months.length - 2];
  
  const incomeChange = previousMonth?.income > 0 
    ? ((currentMonth?.income - previousMonth.income) / previousMonth.income) * 100
    : 0;
  
  const expenseChange = previousMonth?.expenses > 0
    ? ((currentMonth?.expenses - previousMonth.expenses) / previousMonth.expenses) * 100
    : 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Monthly Overview</span>
          </CardTitle>
          <Badge variant="secondary">6 Months</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months} margin={{ bottom: 20, left: 20, right: 20 }}>
                <XAxis 
                  dataKey="month" 
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  height={30}
                />
                <YAxis 
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  label={{ 
                    value: 'Amount', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: 11 }
                  }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value, data.settings.defaultCurrency, currencyRates),
                    name.charAt(0).toUpperCase() + name.slice(1)
                  ]}
                  labelStyle={{ fontSize: 11 }}
                  contentStyle={{ fontSize: 11 }}
                />
                <Legend 
                  verticalAlign="top" 
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Bar 
                  dataKey="income" 
                  fill="#60B5FF" 
                  radius={[4, 4, 0, 0]} 
                  name="income"
                />
                <Bar 
                  dataKey="expenses" 
                  fill="#FF9149" 
                  radius={[4, 4, 0, 0]} 
                  name="expenses"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-muted-foreground">Income</span>
              </div>
              <p className="text-sm font-semibold">
                {formatCurrency(currentMonth?.income || 0, data.settings.defaultCurrency, currencyRates)}
              </p>
              {Math.abs(incomeChange) > 0.1 && (
                <p className={`text-xs flex items-center space-x-1 ${
                  incomeChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {incomeChange >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(incomeChange).toFixed(1)}%</span>
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <TrendingDown className="h-3 w-3 text-red-600" />
                <span className="text-xs text-muted-foreground">Expenses</span>
              </div>
              <p className="text-sm font-semibold">
                {formatCurrency(currentMonth?.expenses || 0, data.settings.defaultCurrency, currencyRates)}
              </p>
              {Math.abs(expenseChange) > 0.1 && (
                <p className={`text-xs flex items-center space-x-1 ${
                  expenseChange <= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {expenseChange <= 0 ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : (
                    <TrendingUp className="h-3 w-3" />
                  )}
                  <span>{Math.abs(expenseChange).toFixed(1)}%</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
