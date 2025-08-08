

'use client';

import React, { useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { useOnboarding, type OnboardingStep } from '@/components/shared/onboarding/OnboardingProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  PieChart,
  BarChart3,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';
import { formatCurrency, calculateCategorySpending } from '@/lib/utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useI18n } from '@/components/i18n/i18n-provider';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsPage() {
  const { data, currencyRates } = useFinance();
  const { t } = useI18n();
  const { startIfFirstVisit } = useOnboarding();
  useEffect(() => {
    const steps: OnboardingStep[] = [
      { id: 'analytics', target: '[data-tour=\"analytics.main\"]', title: 'Analytics', body: 'Explore trends and breakdowns (Pro).' },
    ];
    startIfFirstVisit('analytics', steps);
  }, [startIfFirstVisit]);

  const analytics = useMemo(() => {
    if (!data) return null;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentExpenses = data.expenses.filter(exp => 
      exp.date.startsWith(currentMonth)
    );
    const currentIncome = data.income.filter(inc => 
      inc.date.startsWith(currentMonth)
    );

    // Monthly trends (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      
      const monthExpenses = data.expenses
        .filter(exp => exp.date.startsWith(monthKey))
        .reduce((sum, exp) => sum + exp.amount, 0);
      
      const monthIncome = data.income
        .filter(inc => inc.date.startsWith(monthKey))
        .reduce((sum, inc) => sum + inc.amount, 0);

      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        income: monthIncome,
        expenses: monthExpenses,
        savings: monthIncome - monthExpenses
      });
    }

    // Category spending
    const categorySpending = currentExpenses.reduce((acc, exp) => {
      const category = data.categories.find(cat => cat.id === exp.categoryId);
      const categoryName = category?.name || 'Other';
      acc[categoryName] = (acc[categoryName] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const topCategories = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Weekly spending pattern
    const weeklyPattern = Array.from({ length: 7 }, (_, i) => {
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i];
      const daySpending = currentExpenses
        .filter(exp => new Date(exp.date).getDay() === i)
        .reduce((sum, exp) => sum + exp.amount, 0);
      
      return { day: dayName, amount: daySpending };
    });

    return {
      monthlyData,
      categorySpending,
      topCategories,
      weeklyPattern,
      currentExpenses: currentExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      currentIncome: currentIncome.reduce((sum, inc) => sum + inc.amount, 0),
      averageDaily: currentExpenses.reduce((sum, exp) => sum + exp.amount, 0) / new Date().getDate()
    };
  }, [data]);

  if (!data || !analytics) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">{t('analytics.empty.title')}</h3>
            <p className="text-muted-foreground">{t('analytics.empty.desc')}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const trendLineData = {
    labels: analytics.monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Income',
        data: analytics.monthlyData.map(d => d.income),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Expenses',
        data: analytics.monthlyData.map(d => d.expenses),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const categoryChartData = {
    labels: analytics.topCategories.map(([cat]) => cat),
    datasets: [{
      data: analytics.topCategories.map(([, amount]) => amount),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)', 
        'rgba(245, 101, 101, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const weeklyBarData = {
    labels: analytics.weeklyPattern.map(d => d.day),
    datasets: [{
      label: 'Daily Spending',
      data: analytics.weeklyPattern.map(d => d.amount),
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderRadius: 4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6" data-tour="analytics.main">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('analytics.title')}</h1>
            <p className="text-muted-foreground">{t('analytics.subtitle')}</p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            <Zap className="h-3 w-3 mr-1" />
            {t('common.proFeature')}
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div className="text-sm font-medium text-muted-foreground">{t('analytics.thisMonth')}</div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(analytics.currentIncome, data.settings.defaultCurrency, currencyRates)}
              </div>
              <p className="text-xs text-muted-foreground">{t('analytics.income')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <div className="text-sm font-medium text-muted-foreground">{t('analytics.thisMonth')}</div>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(analytics.currentExpenses, data.settings.defaultCurrency, currencyRates)}
              </div>
              <p className="text-xs text-muted-foreground">{t('analytics.expenses')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-600" />
                <div className="text-sm font-medium text-muted-foreground">{t('analytics.net')}</div>
              </div>
              <div className={`text-2xl font-bold ${
                analytics.currentIncome - analytics.currentExpenses >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(analytics.currentIncome - analytics.currentExpenses, data.settings.defaultCurrency, currencyRates)}
              </div>
              <p className="text-xs text-muted-foreground">{t('analytics.savings')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-violet-600" />
                <div className="text-sm font-medium text-muted-foreground">{t('analytics.dailyAvg')}</div>
              </div>
              <div className="text-2xl font-bold text-violet-600">
                {formatCurrency(analytics.averageDaily, data.settings.defaultCurrency, currencyRates)}
              </div>
              <p className="text-xs text-muted-foreground">{t('analytics.spending')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>{t('analytics.tab.trends')}</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center space-x-2">
              <PieChart className="h-4 w-4" />
              <span>{t('analytics.tab.categories')}</span>
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>{t('analytics.tab.patterns')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.trendTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Line data={trendLineData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.topCategories')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Doughnut data={categoryChartData} options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.categoryBreakdown')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topCategories.map(([category, amount], index) => (
                      <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full`} style={{
                            backgroundColor: categoryChartData.datasets[0].backgroundColor[index]
                          }} />
                          <span className="font-medium capitalize">{category}</span>
                        </div>
                        <span className="font-semibold">
                          {formatCurrency(amount, data.settings.defaultCurrency, currencyRates)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.weeklyPattern')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Bar data={weeklyBarData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
