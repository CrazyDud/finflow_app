
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ExpenseCategory, Expense, Income, CurrencyRate, TimePeriod } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency with proper symbol and decimals
export function formatCurrency(amount: number, currency: string = 'EUR', rates: CurrencyRate[] = []): string {
  const currencyInfo = rates.find(r => r.code === currency);
  const symbol = currencyInfo?.symbol || currency;
  
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return `${symbol}${formatter.format(Math.abs(amount))}`;
}

// Convert amount between currencies
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: CurrencyRate[]
): number {
  if (fromCurrency === toCurrency) return amount;
  
  const fromRate = rates.find(r => r.code === fromCurrency)?.rate || 1;
  const toRate = rates.find(r => r.code === toCurrency)?.rate || 1;
  
  // Convert to EUR first, then to target currency
  const eurAmount = amount / fromRate;
  return eurAmount * toRate;
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get date range for time period
export function getDateRange(period: TimePeriod, date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date);
  const end = new Date(date);
  
  switch (period) {
    case 'daily':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case 'monthly':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }
  
  return { start, end };
}

// Filter data by date range
export function filterByDateRange<T extends { date: string }>(
  data: T[],
  period: TimePeriod,
  referenceDate?: Date
): T[] {
  const { start, end } = getDateRange(period, referenceDate);
  
  return data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= start && itemDate <= end;
  });
}

// Calculate spending by category
export function calculateCategorySpending(
  expenses: Expense[],
  categories: ExpenseCategory[],
  targetCurrency: string = 'EUR',
  rates: CurrencyRate[] = []
): Array<{ category: ExpenseCategory; spent: number; percentage: number }> {
  const categorySpending = new Map<string, number>();
  let totalSpent = 0;
  
  expenses.forEach(expense => {
    const convertedAmount = convertCurrency(expense.amount, expense.currency, targetCurrency, rates);
    const currentSpent = categorySpending.get(expense.categoryId) || 0;
    categorySpending.set(expense.categoryId, currentSpent + convertedAmount);
    totalSpent += convertedAmount;
  });
  
  return categories.map(category => {
    const spent = categorySpending.get(category.id) || 0;
    return {
      category,
      spent,
      percentage: totalSpent > 0 ? (spent / totalSpent) * 100 : 0
    };
  }).sort((a, b) => b.spent - a.spent);
}

// Calculate budget utilization
export function calculateBudgetUtilization(
  categorySpending: Array<{ category: ExpenseCategory; spent: number; percentage: number }>
): Array<{ category: ExpenseCategory; spent: number; limit: number; utilization: number; warning: boolean }> {
  return categorySpending.map(({ category, spent }) => {
    const utilization = category.limit > 0 ? (spent / category.limit) * 100 : 0;
    return {
      category,
      spent,
      limit: category.limit,
      utilization,
      warning: utilization >= 80 // Warning when 80% or more of limit is used
    };
  });
}

// Calculate monthly totals
export function calculateMonthlyTotals(
  income: Income[],
  expenses: Expense[],
  month: string, // YYYY-MM format
  targetCurrency: string = 'EUR',
  rates: CurrencyRate[] = []
): { totalIncome: number; totalExpenses: number; balance: number } {
  const monthStart = new Date(`${month}-01`);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
  
  const monthIncome = income.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= monthStart && itemDate <= monthEnd;
  });
  
  const monthExpenses = expenses.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= monthStart && itemDate <= monthEnd;
  });
  
  const totalIncome = monthIncome.reduce((sum, item) => 
    sum + convertCurrency(item.amount, item.currency, targetCurrency, rates), 0);
  
  const totalExpenses = monthExpenses.reduce((sum, item) => 
    sum + convertCurrency(item.amount, item.currency, targetCurrency, rates), 0);
  
  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses
  };
}

// Format date for display
export function formatDate(date: string | Date, format: 'short' | 'long' | 'month-year' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    case 'long':
      return d.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'long', 
        day: 'numeric' 
      });
    case 'month-year':
      return d.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'long' 
      });
    default:
      return d.toLocaleDateString();
  }
}

// Get current month in YYYY-MM format
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Check if amount is within budget percentage
export function isWithinBudget(spent: number, limit: number, warningThreshold: number = 80): {
  withinBudget: boolean;
  warning: boolean;
  percentage: number;
} {
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  return {
    withinBudget: percentage <= 100,
    warning: percentage >= warningThreshold,
    percentage
  };
}

// Animate number counting up
export function animateValue(
  start: number,
  end: number,
  duration: number,
  callback: (value: number) => void
): void {
  let startTimestamp: number | null = null;
  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const currentValue = start + (end - start) * progress;
    callback(currentValue);
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };
  requestAnimationFrame(step);
}
