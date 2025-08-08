
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useFinance } from '@/hooks/use-finance';
import { calculateCategorySpending, filterByDateRange, formatCurrency } from '@/lib/utils';
import { PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#FF6363', '#80D8C3', '#A19AD3', '#72BF78'];

export function SpendingChart() {
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

  // Get current month expenses
  const currentMonthExpenses = filterByDateRange(data.expenses, 'monthly');
  const categorySpending = calculateCategorySpending(
    currentMonthExpenses,
    data.categories,
    data.settings.defaultCurrency,
    currencyRates
  );

  // Filter out categories with no spending and prepare chart data
  const chartData = categorySpending
    .filter(({ spent }) => spent > 0)
    .slice(0, 8) // Top 8 categories
    .map(({ category, spent, percentage }) => ({
      name: category.name,
      value: spent,
      percentage: percentage,
      color: category.color,
    }));

  const totalSpending = chartData.reduce((sum, item) => sum + item.value, 0);
  const hasData = chartData.length > 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <PieChartIcon className="h-5 w-5" />
            <span>Spending Breakdown</span>
          </CardTitle>
          <Badge variant="secondary">This Month</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [
                      formatCurrency(value, data.settings.defaultCurrency, currencyRates),
                      'Amount'
                    ]}
                    labelStyle={{ fontSize: 11 }}
                    contentStyle={{ fontSize: 11 }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    wrapperStyle={{ fontSize: 11 }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Spending</span>
                <span className="text-lg font-bold">
                  {formatCurrency(totalSpending, data.settings.defaultCurrency, currencyRates)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {chartData.slice(0, 4).map((item, index) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.value, data.settings.defaultCurrency, currencyRates)} 
                        ({item.percentage.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center space-y-2">
            <PieChartIcon className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              No expenses recorded this month
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Add some expenses to see your spending breakdown
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
