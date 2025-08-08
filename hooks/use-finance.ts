

'use client';

import { useState, useEffect, useCallback } from 'react';
import { FinanceData, Income, Expense, ExpenseCategory, UserSettings, CurrencyRate, DashboardStats } from '@/lib/types';
import { financeStorage, SUPPORTED_CURRENCIES } from '@/lib/storage';
import { calculateCategorySpending, calculateMonthlyTotals, getCurrentMonth, convertCurrency } from '@/lib/utils';

export function useFinance() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>(SUPPORTED_CURRENCIES);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = () => {
      try {
        const financeData = financeStorage.loadData();
        const rates = financeStorage.getCurrencyRates();
        setData(financeData);
        setCurrencyRates(rates);
      } catch (error) {
        console.error('Error loading finance data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Save data helper
  const saveData = useCallback((newData: FinanceData) => {
    setData(newData);
    financeStorage.saveData(newData);
  }, []);

  // Income operations
  const addIncome = useCallback((income: Omit<Income, 'id'>): string | undefined => {
    if (!data) return;
    
    const newIncome: Income = {
      ...income,
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9)
    };
    
    const newData = {
      ...data,
      income: [...data.income, newIncome]
    };
    
    saveData(newData);
    try { localStorage.setItem('needs_recalc', 'income'); } catch {}
    return newIncome.id;
  }, [data, saveData]);

  const updateIncome = useCallback((id: string, updates: Partial<Income>) => {
    if (!data) return;
    
    const newData = {
      ...data,
      income: data.income.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    };
    
    saveData(newData);
  }, [data, saveData]);

  const deleteIncome = useCallback((id: string) => {
    if (!data) return;
    
    const newData = {
      ...data,
      income: data.income.filter(item => item.id !== id)
    };
    
    saveData(newData);
  }, [data, saveData]);

  // Expense operations
  const addExpense = useCallback((expense: Omit<Expense, 'id'>): string | undefined => {
    if (!data) return;
    
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9)
    };
    
    const newData = {
      ...data,
      expenses: [...data.expenses, newExpense]
    };
    
    saveData(newData);
    return newExpense.id;
  }, [data, saveData]);

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    if (!data) return;
    
    const newData = {
      ...data,
      expenses: data.expenses.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    };
    
    saveData(newData);
  }, [data, saveData]);

  const deleteExpense = useCallback((id: string) => {
    if (!data) return;
    
    const newData = {
      ...data,
      expenses: data.expenses.filter(item => item.id !== id)
    };
    
    saveData(newData);
  }, [data, saveData]);

  // Category operations
  const addCategory = useCallback((category: Omit<ExpenseCategory, 'id'>) => {
    if (!data) return;
    
    const newCategory: ExpenseCategory = {
      ...category,
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9)
    };
    
    const newData = {
      ...data,
      categories: [...data.categories, newCategory]
    };
    
    saveData(newData);
  }, [data, saveData]);

  const updateCategory = useCallback((id: string, updates: Partial<ExpenseCategory>) => {
    if (!data) return;
    
    const newData = {
      ...data,
      categories: data.categories.map(cat => 
        cat.id === id ? { ...cat, ...updates } : cat
      )
    };
    
    saveData(newData);
  }, [data, saveData]);

  const deleteCategory = useCallback((id: string) => {
    if (!data) return;
    
    const newData = {
      ...data,
      categories: data.categories.filter(cat => cat.id !== id)
    };
    
    saveData(newData);
  }, [data, saveData]);

  // Settings operations
  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    if (!data) return;
    
    const newData = {
      ...data,
      settings: { ...data.settings, ...updates }
    };
    
    saveData(newData);
    if (Object.prototype.hasOwnProperty.call(updates, 'budgetAllocation')) {
      try { localStorage.setItem('needs_recalc', 'allocation'); } catch {}
    }
  }, [data, saveData]);

  // Recalculate category limits from allocation for a given basis month
  const recalcCategoryLimits = useCallback((basisMonth?: string) => {
    if (!data) return false;
    const month = basisMonth || data.settings.budgetBasisMonth || new Date().toISOString().slice(0,7);
    const monthIncome = data.income.filter(i => i.date.startsWith(month)).reduce((s,i)=>s+i.amount,0);
    if (monthIncome <= 0) return false;

    const pools = {
      essentials: (monthIncome * data.settings.budgetAllocation.essentials) / 100,
      investments: (monthIncome * data.settings.budgetAllocation.investments) / 100,
      fun: (monthIncome * data.settings.budgetAllocation.fun) / 100,
    } as const;

    const byBucket: Record<'essentials'|'investments'|'fun', ExpenseCategory[]> = {
      essentials: [], investments: [], fun: []
    };
    data.categories.forEach(c => {
      const bucket = (c.allocation || 'essentials') as 'essentials'|'investments'|'fun';
      byBucket[bucket].push(c);
    });

    const updatedCategories = data.categories.map(cat => ({ ...cat }));
    (Object.keys(byBucket) as Array<keyof typeof byBucket>).forEach(bucket => {
      const list = byBucket[bucket];
      if (list.length === 0) return;
      const per = Math.round(pools[bucket] / list.length);
      list.forEach(c => {
        const idx = updatedCategories.findIndex(x => x.id === c.id);
        if (idx >= 0) updatedCategories[idx].limit = per;
      });
    });

    saveData({ ...data, categories: updatedCategories });
    return true;
  }, [data, saveData]);

  // Dashboard statistics
  const getDashboardStats = useCallback((): DashboardStats | null => {
    if (!data) return null;
    
    const currentMonth = getCurrentMonth();
    const { totalIncome, totalExpenses, balance } = calculateMonthlyTotals(
      data.income, 
      data.expenses, 
      currentMonth,
      data.settings.defaultCurrency,
      currencyRates
    );
    
    const categorySpending = calculateCategorySpending(
      data.expenses.filter(exp => {
        const expDate = new Date(exp.date);
        const monthStart = new Date(`${currentMonth}-01`);
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
        return expDate >= monthStart && expDate <= monthEnd;
      }),
      data.categories,
      data.settings.defaultCurrency,
      currencyRates
    );
    
    const budgetUtilization = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
    
    return {
      currentBalance: balance,
      monthlyIncome: totalIncome,
      monthlyExpenses: totalExpenses,
      budgetUtilization,
      savingsRate,
      topCategories: categorySpending.slice(0, 5).map(({ category, spent, percentage }) => ({
        name: category.name,
        amount: spent,
        percentage
      }))
    };
  }, [data, currencyRates]);

  // Currency operations
  const updateCurrencyRates = useCallback(async () => {
    // In a real app, you'd fetch from an API like fixer.io or exchangerate-api.com
    // For now, we'll use mock data with slight variations
    try {
      const updatedRates = SUPPORTED_CURRENCIES.map(rate => ({
        ...rate,
        rate: rate.code === 'EUR' ? 1 : rate.rate * (0.95 + Math.random() * 0.1) // Mock rate fluctuation
      }));
      
      setCurrencyRates(updatedRates);
      financeStorage.saveCurrencyRates(updatedRates);
    } catch (error) {
      console.error('Error updating currency rates:', error);
    }
  }, []);

  // Export/Import operations
  const exportData = useCallback(() => {
    return financeStorage.exportData();
  }, []);

  const importData = useCallback((jsonData: string): boolean => {
    const success = financeStorage.importData(jsonData);
    if (success && data) {
      const newData = financeStorage.loadData();
      setData(newData);
    }
    return success;
  }, [data]);

  const clearAllData = useCallback(() => {
    financeStorage.clearData();
    const newData = financeStorage.loadData();
    setData(newData);
  }, []);

  return {
    // Data
    data,
    currencyRates,
    loading,
    
    // Income operations
    addIncome,
    updateIncome,
    deleteIncome,
    
    // Expense operations
    addExpense,
    updateExpense,
    deleteExpense,
    
    // Category operations
    addCategory,
    updateCategory,
    deleteCategory,
    recalcCategoryLimits,
    
    // Settings operations
    updateSettings,
    
    // Analytics
    getDashboardStats,
    
    // Currency operations
    updateCurrencyRates,
    
    // Data management
    exportData,
    importData,
    clearAllData
  };
}
