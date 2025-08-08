

'use client';

import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  PieChart,
  BarChart3,
  Zap,
  Filter
} from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';
import { formatCurrency } from '@/lib/utils';

export default function ReportsPage() {
  const { data, currencyRates } = useFinance();
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const reportData = useMemo(() => {
    if (!data) return null;

    let startDate: string;
    let endDate: string;
    const now = new Date();

    switch (selectedPeriod) {
      case 'current-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'last-month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate = lastMonth.toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
        break;
      case 'last-3-months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'current-year':
        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    }

    // Filter expenses by period and category
    let filteredExpenses = data.expenses.filter(exp => 
      exp.date >= startDate && exp.date <= endDate
    );

    if (selectedCategory !== 'all') {
      const category = data.categories.find(cat => cat.name === selectedCategory);
      if (category) {
        filteredExpenses = filteredExpenses.filter(exp => exp.categoryId === category.id);
      }
    }

    // Filter income by period
    const filteredIncome = data.income.filter(inc => 
      inc.date >= startDate && inc.date <= endDate
    );

    // Calculate totals
    const totalIncome = filteredIncome.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netSavings = totalIncome - totalExpenses;

    // Category breakdown
    const categoryBreakdown = filteredExpenses.reduce((acc, exp) => {
      const category = data.categories.find(cat => cat.id === exp.categoryId);
      const categoryName = category?.name || 'Other';
      acc[categoryName] = (acc[categoryName] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    const sortedCategories = Object.entries(categoryBreakdown)
      .sort(([,a], [,b]) => b - a);

    // Daily spending (for current month only)
    const dailySpending = selectedPeriod === 'current-month' ? 
      filteredExpenses.reduce((acc, exp) => {
        const day = new Date(exp.date).getDate();
        acc[day] = (acc[day] || 0) + exp.amount;
        return acc;
      }, {} as Record<number, number>) : {};

    // Budget comparison (only for current month)
    const budgetComparison = selectedPeriod === 'current-month' ? 
      data.categories
        .filter(cat => cat.limit > 0)
        .map(cat => {
          const spent = categoryBreakdown[cat.name] || 0;
          return {
            category: cat.name,
            budget: cat.limit,
            spent,
            remaining: cat.limit - spent,
            percentage: (spent / cat.limit) * 100
          };
        }) : [];

    return {
      period: selectedPeriod,
      startDate,
      endDate,
      totalIncome,
      totalExpenses,
      netSavings,
      transactionCount: filteredExpenses.length,
      averageTransaction: filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0,
      categoryBreakdown: sortedCategories,
      dailySpending,
      budgetComparison
    };
  }, [data, selectedPeriod, selectedCategory]);

  const generatePDFReport = () => {
    // This would integrate with a PDF generation library
    // For now, we'll create a downloadable text report
    if (!reportData || !data) return;

    const reportContent = `
FinFlow - Financial Report
Period: ${reportData.startDate} to ${reportData.endDate}

SUMMARY
===============================
Total Income: ${formatCurrency(reportData.totalIncome, data.settings.defaultCurrency, currencyRates)}
Total Expenses: ${formatCurrency(reportData.totalExpenses, data.settings.defaultCurrency, currencyRates)}
Net Savings: ${formatCurrency(reportData.netSavings, data.settings.defaultCurrency, currencyRates)}
Transaction Count: ${reportData.transactionCount}
Average Transaction: ${formatCurrency(reportData.averageTransaction, data.settings.defaultCurrency, currencyRates)}

CATEGORY BREAKDOWN
===============================
${reportData.categoryBreakdown.map(([cat, amount]) => 
  `${cat}: ${formatCurrency(amount, data.settings.defaultCurrency, currencyRates)}`
).join('\n')}

${reportData.budgetComparison.length > 0 ? `
BUDGET ANALYSIS
===============================
${reportData.budgetComparison.map(item => 
  `${item.category}: ${formatCurrency(item.spent, data.settings.defaultCurrency, currencyRates)} / ${formatCurrency(item.budget, data.settings.defaultCurrency, currencyRates)} (${item.percentage.toFixed(1)}%)`
).join('\n')}
` : ''}

Generated on: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finflow-report-${reportData.startDate}-to-${reportData.endDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!data || !reportData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Loading reports...</h3>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              Detailed financial reports and analysis
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="px-3 py-1">
              <Zap className="h-3 w-3 mr-1" />
              Pro Feature
            </Badge>
            <Button onClick={generatePDFReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Report Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Time Period</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current-month">Current Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                    <SelectItem value="current-year">Current Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {data.categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div className="text-sm font-medium text-muted-foreground">Income</div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(reportData.totalIncome, data.settings.defaultCurrency, currencyRates)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <div className="text-sm font-medium text-muted-foreground">Expenses</div>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(reportData.totalExpenses, data.settings.defaultCurrency, currencyRates)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-600" />
                <div className="text-sm font-medium text-muted-foreground">Net Savings</div>
              </div>
              <div className={`text-2xl font-bold ${
                reportData.netSavings >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(reportData.netSavings, data.settings.defaultCurrency, currencyRates)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-violet-600" />
                <div className="text-sm font-medium text-muted-foreground">Transactions</div>
              </div>
              <div className="text-2xl font-bold text-violet-600">
                {reportData.transactionCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg: {formatCurrency(reportData.averageTransaction, data.settings.defaultCurrency, currencyRates)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Category Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.categoryBreakdown.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No expenses in selected period
                </div>
              ) : (
                <div className="space-y-4">
                  {reportData.categoryBreakdown.map(([category, amount]) => {
                    const percentage = (amount / reportData.totalExpenses) * 100;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{category}</span>
                          <span>{formatCurrency(amount, data.settings.defaultCurrency, currencyRates)} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget Analysis (Current Month Only) */}
          {selectedPeriod === 'current-month' && reportData.budgetComparison.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Budget Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.budgetComparison.map((item) => (
                    <div key={item.category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.category}</span>
                        <span className={`${
                          item.percentage > 100 ? 'text-red-600' : 
                          item.percentage > 80 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {formatCurrency(item.spent, data.settings.defaultCurrency, currencyRates)} / {formatCurrency(item.budget, data.settings.defaultCurrency, currencyRates)}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            item.percentage > 100 ? 'bg-red-500' : 
                            item.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.remaining >= 0 ? 
                          `${formatCurrency(item.remaining, data.settings.defaultCurrency, currencyRates)} remaining` :
                          `${formatCurrency(Math.abs(item.remaining), data.settings.defaultCurrency, currencyRates)} over budget`
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Period Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Period Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Period:</span>
                <div className="font-medium">
                  {new Date(reportData.startDate).toLocaleDateString()} - {new Date(reportData.endDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Total Transactions:</span>
                <div className="font-medium">{reportData.transactionCount}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Savings Rate:</span>
                <div className="font-medium">
                  {reportData.totalIncome > 0 ? 
                    `${((reportData.netSavings / reportData.totalIncome) * 100).toFixed(1)}%` : 
                    'N/A'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
