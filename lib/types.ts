
export interface Income {
  id: string;
  amount: number;
  currency: string;
  date: string; // ISO string
  description?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  limit: number;
  currency: string;
}

export interface Expense {
  id: string;
  categoryId: string;
  amount: number;
  currency: string;
  date: string; // ISO string
  description?: string;
}

export interface BudgetAllocation {
  essentials: number; // percentage
  investments: number; // percentage
  fun: number; // percentage
}

export interface CurrencyRate {
  code: string;
  name: string;
  rate: number; // rate to EUR
  symbol: string;
}

export interface UserSettings {
  defaultCurrency: string;
  mode: 'simple' | 'pro';
  budgetAllocation: BudgetAllocation;
  customAllocation: boolean;
  notifications: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface FinanceData {
  income: Income[];
  expenses: Expense[];
  categories: ExpenseCategory[];
  settings: UserSettings;
  lastUpdated: string;
}

export interface MonthlyBudget {
  month: string; // YYYY-MM format
  totalIncome: number;
  allocatedEssentials: number;
  allocatedInvestments: number;
  allocatedFun: number;
  spentEssentials: number;
  spentInvestments: number;
  spentFun: number;
  currency: string;
}

export interface DashboardStats {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  budgetUtilization: number;
  savingsRate: number;
  topCategories: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
}

export type TimePeriod = 'daily' | 'weekly' | 'monthly';
export type ChartType = 'spending-breakdown' | 'income-vs-expenses' | 'budget-progress' | 'trends';
