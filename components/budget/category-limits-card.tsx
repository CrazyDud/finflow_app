
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PieChart, Edit3, Save, X, AlertTriangle, CheckCircle, RefreshCcw } from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, calculateCategorySpending, calculateBudgetUtilization, filterByDateRange } from '@/lib/utils';

export function CategoryLimitsCard() {
  const { data, currencyRates, updateCategory, recalcCategoryLimits } = useFinance();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  if (!data) return null;

  // Get current month expenses and calculate spending
  const currentMonthExpenses = filterByDateRange(data.expenses, 'monthly');
  const categorySpending = calculateCategorySpending(
    currentMonthExpenses,
    data.categories,
    data.settings.defaultCurrency,
    currencyRates
  );
  
  const budgetUtilization = calculateBudgetUtilization(categorySpending);

  const handleEdit = (categoryId: string, currentLimit: number) => {
    setEditingId(categoryId);
    setEditValue(currentLimit.toString());
  };

  const handleSave = (categoryId: string) => {
    const newLimit = parseFloat(editValue);
    if (isNaN(newLimit) || newLimit < 0) {
      toast({
        title: 'Invalid limit',
        description: 'Please enter a valid positive number',
        variant: 'destructive',
      });
      return;
    }

    updateCategory(categoryId, { limit: newLimit });
    
    toast({
      title: 'Limit updated',
      description: 'Category spending limit has been updated',
    });

    setEditingId(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const recalcLimits = () => { recalcCategoryLimits(); };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PieChart className="h-5 w-5" />
          <span>Category Limits</span>
          <Button size="sm" variant="outline" className="ml-auto" onClick={recalcLimits}>
            <RefreshCcw className="h-3 w-3 mr-1" /> Recalculate
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-auto">
          {budgetUtilization
            .sort((a, b) => b.utilization - a.utilization)
            .map(({ category, spent, limit, utilization, warning }) => {
              const isEditing = editingId === category.id;
              const isOverBudget = utilization > 100;
              const isNearLimit = warning && !isOverBudget;
              const isOnTrack = !warning && !isOverBudget;

              return (
                <div key={category.id} className="p-4 border rounded-lg space-y-3">
                  {/* Category Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
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
                    
                    <div className="flex items-center space-x-2">
                      {!isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category.id, category.limit)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Spending vs Limit */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Spent</span>
                      <span className="font-medium">
                        {formatCurrency(spent, data.settings.defaultCurrency, currencyRates)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Limit</span>
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-24 h-8 text-xs"
                          />
                          <Button size="sm" onClick={() => handleSave(category.id)}>
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancel}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="font-medium">
                          {formatCurrency(limit, data.settings.defaultCurrency, currencyRates)}
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <Progress 
                      value={Math.min(utilization, 100)} 
                      className="h-2"
                    />

                    {/* Status */}
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
                        <span className="text-xs text-green-600">
                          {formatCurrency(limit - spent, data.settings.defaultCurrency, currencyRates)} left
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
