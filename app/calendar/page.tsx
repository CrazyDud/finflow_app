

'use client';

import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { QuickTransactionDialog } from '@/components/shared/quick-transaction-dialog';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingUp,
  TrendingDown,
  Zap,
  DollarSign
} from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';
import { formatCurrency } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';

export default function CalendarPage() {
  const { data, currencyRates } = useFinance();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);

  const calendarData = useMemo(() => {
    if (!data) return null;

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    const calendarDays = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd
    });

    // Group transactions by date
    const transactionsByDate = {} as Record<string, { expenses: any[]; income: any[] }>;
    
    // Process expenses
    data.expenses.forEach(expense => {
      const dateStr = expense.date.split('T')[0]; // Extract just the date part
      if (!transactionsByDate[dateStr]) {
        transactionsByDate[dateStr] = { expenses: [], income: [] };
      }
      const category = data.categories.find(cat => cat.id === expense.categoryId);
      transactionsByDate[dateStr].expenses.push({
        ...expense,
        categoryName: category?.name || 'Unknown Category'
      });
    });
    
    // Process income
    data.income.forEach(income => {
      const dateStr = income.date.split('T')[0]; // Extract just the date part
      if (!transactionsByDate[dateStr]) {
        transactionsByDate[dateStr] = { expenses: [], income: [] };
      }
      transactionsByDate[dateStr].income.push(income);
    });

    // Calculate daily totals
    const dailyTotals = Object.entries(transactionsByDate).reduce((acc, [date, transactions]) => {
      const totalExpenses = transactions.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const totalIncome = transactions.income.reduce((sum, inc) => sum + inc.amount, 0);
      const net = totalIncome - totalExpenses;
      
      acc[date] = {
        expenses: totalExpenses,
        income: totalIncome,
        net,
        transactionCount: transactions.expenses.length + transactions.income.length
      };
      
      return acc;
    }, {} as Record<string, { expenses: number; income: number; net: number; transactionCount: number }>);

    return {
      calendarDays,
      transactionsByDate,
      dailyTotals,
      monthStart,
      monthEnd
    };
  }, [data, currentDate]);

  const selectedDateTransactions = useMemo(() => {
    if (!selectedDate || !calendarData) return null;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return calendarData.transactionsByDate[dateStr] || { expenses: [], income: [] };
  }, [selectedDate, calendarData]);

  const handlePreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  if (!data || !calendarData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Loading calendar...</h3>
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
            <h1 className="text-3xl font-bold tracking-tight">Financial Calendar</h1>
            <p className="text-muted-foreground">
              Track your daily financial activities at a glance
            </p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            <Zap className="h-3 w-3 mr-1" />
            Pro Feature
          </Badge>
        </div>

        {/* Calendar Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>{format(currentDate, 'MMMM yyyy')}</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-background p-3 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {calendarData.calendarDays.map((day, index) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayData = calendarData.dailyTotals[dateStr];
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isTodayDate = isToday(day);
                const hasTransactions = dayData && dayData.transactionCount > 0;
                
                return (
                  <div
                    key={index}
                    className={`bg-background p-2 min-h-[80px] cursor-pointer transition-colors hover:bg-muted/50 ${
                      !isCurrentMonth ? 'opacity-40' : ''
                    } ${isTodayDate ? 'ring-2 ring-primary ring-inset' : ''}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="flex flex-col h-full">
                      <span className={`text-sm ${isTodayDate ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                        {format(day, 'd')}
                      </span>
                      
                      {hasTransactions && (
                        <div className="flex-1 mt-1 space-y-1">
                          {dayData.income > 0 && (
                            <div className="text-xs bg-green-100 text-green-800 rounded px-1 py-0.5 truncate">
                              +{formatCurrency(dayData.income, data.settings.defaultCurrency, currencyRates)}
                            </div>
                          )}
                          {dayData.expenses > 0 && (
                            <div className="text-xs bg-red-100 text-red-800 rounded px-1 py-0.5 truncate">
                              -{formatCurrency(dayData.expenses, data.settings.defaultCurrency, currencyRates)}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {hasTransactions && dayData.transactionCount > 2 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          +{dayData.transactionCount - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div className="text-sm font-medium text-muted-foreground">Monthly Income</div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  data.income
                    .filter(inc => {
                      const incDate = new Date(inc.date);
                      return incDate >= calendarData.monthStart && incDate <= calendarData.monthEnd;
                    })
                    .reduce((sum, inc) => sum + inc.amount, 0),
                  data.settings.defaultCurrency,
                  currencyRates
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <div className="text-sm font-medium text-muted-foreground">Monthly Expenses</div>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(
                  data.expenses
                    .filter(exp => {
                      const expDate = new Date(exp.date);
                      return expDate >= calendarData.monthStart && expDate <= calendarData.monthEnd;
                    })
                    .reduce((sum, exp) => sum + exp.amount, 0),
                  data.settings.defaultCurrency,
                  currencyRates
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <div className="text-sm font-medium text-muted-foreground">Net Monthly</div>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {(() => {
                  const monthlyIncome = data.income
                    .filter(inc => {
                      const incDate = new Date(inc.date);
                      return incDate >= calendarData.monthStart && incDate <= calendarData.monthEnd;
                    })
                    .reduce((sum, inc) => sum + inc.amount, 0);
                  
                  const monthlyExpenses = data.expenses
                    .filter(exp => {
                      const expDate = new Date(exp.date);
                      return expDate >= calendarData.monthStart && expDate <= calendarData.monthEnd;
                    })
                    .reduce((sum, exp) => sum + exp.amount, 0);
                  
                  return formatCurrency(monthlyIncome - monthlyExpenses, data.settings.defaultCurrency, currencyRates);
                })()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Details */}
        <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : ''}
                </span>
              </DialogTitle>
            </DialogHeader>
            
            {selectedDateTransactions && (
              <div className="space-y-4">
                {selectedDateTransactions.income.length === 0 && selectedDateTransactions.expenses.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No transactions</h3>
                    <p className="text-muted-foreground mb-4">
                      No financial activity recorded for this date
                    </p>
                    <Button onClick={() => setShowTransactionDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Transaction
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Income Section */}
                    {selectedDateTransactions.income.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-600 mb-3 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Income ({selectedDateTransactions.income.length})
                        </h4>
                        <div className="space-y-2">
                          {selectedDateTransactions.income.map((income, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                              <div>
                                <div className="font-medium">{income.description || 'Income'}</div>
                              </div>
                              <div className="text-green-600 font-semibold">
                                +{formatCurrency(income.amount, data.settings.defaultCurrency, currencyRates)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expenses Section */}
                    {selectedDateTransactions.expenses.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-600 mb-3 flex items-center">
                          <TrendingDown className="h-4 w-4 mr-2" />
                          Expenses ({selectedDateTransactions.expenses.length})
                        </h4>
                        <div className="space-y-2">
                          {selectedDateTransactions.expenses.map((expense, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                              <div>
                                <div className="font-medium">{expense.description || 'Expense'}</div>
                                <div className="text-sm text-muted-foreground capitalize">{expense.categoryName}</div>
                              </div>
                              <div className="text-red-600 font-semibold">
                                -{formatCurrency(expense.amount, data.settings.defaultCurrency, currencyRates)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Transaction Button */}
                    <div className="border-t pt-4">
                      <div className="flex justify-center mb-4">
                        <Button onClick={() => setShowTransactionDialog(true)} variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Transaction for This Date
                        </Button>
                      </div>
                    </div>

                    {/* Daily Summary */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Daily Summary</h4>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-sm text-muted-foreground">Income</div>
                          <div className="text-lg font-semibold text-green-600">
                            +{formatCurrency(
                              selectedDateTransactions.income.reduce((sum, inc) => sum + inc.amount, 0),
                              data.settings.defaultCurrency,
                              currencyRates
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Expenses</div>
                          <div className="text-lg font-semibold text-red-600">
                            -{formatCurrency(
                              selectedDateTransactions.expenses.reduce((sum, exp) => sum + exp.amount, 0),
                              data.settings.defaultCurrency,
                              currencyRates
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Net</div>
                          <div className="text-lg font-semibold text-blue-600">
                            {formatCurrency(
                              selectedDateTransactions.income.reduce((sum, inc) => sum + inc.amount, 0) -
                              selectedDateTransactions.expenses.reduce((sum, exp) => sum + exp.amount, 0),
                              data.settings.defaultCurrency,
                              currencyRates
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Quick Transaction Dialog */}
        <QuickTransactionDialog
          open={showTransactionDialog}
          onOpenChange={setShowTransactionDialog}
          defaultDate={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined}
        />
      </div>
    </MainLayout>
  );
}
