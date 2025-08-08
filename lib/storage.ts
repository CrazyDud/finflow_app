
import { FinanceData, ExpenseCategory, UserSettings, CurrencyRate } from './types';

const STORAGE_KEY = 'finance_tracker_data';
const RATES_KEY = 'currency_rates';
const RATES_TIMESTAMP_KEY = 'rates_timestamp';

// Default expense categories
export const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  { id: '1', name: 'Groceries', icon: 'ShoppingCart', color: '#22C55E', limit: 400, currency: 'EUR' },
  { id: '2', name: 'Transportation', icon: 'Car', color: '#3B82F6', limit: 150, currency: 'EUR' },
  { id: '3', name: 'Utilities', icon: 'Zap', color: '#F59E0B', limit: 120, currency: 'EUR' },
  { id: '4', name: 'Entertainment', icon: 'Film', color: '#EF4444', limit: 200, currency: 'EUR' },
  { id: '5', name: 'Dining Out', icon: 'UtensilsCrossed', color: '#8B5CF6', limit: 180, currency: 'EUR' },
  { id: '6', name: 'Shopping', icon: 'ShoppingBag', color: '#EC4899', limit: 150, currency: 'EUR' },
  { id: '7', name: 'Healthcare', icon: 'Heart', color: '#10B981', limit: 100, currency: 'EUR' },
  { id: '8', name: 'Education', icon: 'BookOpen', color: '#06B6D4', limit: 80, currency: 'EUR' },
  { id: '9', name: 'Savings & Investments', icon: 'TrendingUp', color: '#84CC16', limit: 500, currency: 'EUR' },
  { id: '10', name: 'Subscriptions', icon: 'Repeat', color: '#F97316', limit: 60, currency: 'EUR' },
];

// Default settings
export const DEFAULT_SETTINGS: UserSettings = {
  defaultCurrency: 'EUR',
  mode: 'simple',
  budgetAllocation: {
    essentials: 50,
    investments: 20,
    fun: 30
  },
  customAllocation: false,
  notifications: true,
  theme: 'system'
};

// Supported currencies
export const SUPPORTED_CURRENCIES: CurrencyRate[] = [
  { code: 'EUR', name: 'Euro', rate: 1, symbol: '€' },
  { code: 'USD', name: 'US Dollar', rate: 1.1, symbol: '$' },
  { code: 'GBP', name: 'British Pound', rate: 0.85, symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', rate: 130, symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', rate: 1.45, symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', rate: 1.65, symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', rate: 0.95, symbol: 'CHF' },
];

class FinanceStorage {
  private data: FinanceData | null = null;

  // Initialize default data
  private getDefaultData(): FinanceData {
    return {
      income: [],
      expenses: [],
      categories: DEFAULT_CATEGORIES,
      settings: DEFAULT_SETTINGS,
      lastUpdated: new Date().toISOString()
    };
  }

  // Load data from localStorage
  loadData(): FinanceData {
    if (typeof window === 'undefined') {
      return this.getDefaultData();
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.data = JSON.parse(stored);
        // Ensure all required fields exist
        this.data = {
          ...this.getDefaultData(),
          ...this.data,
          settings: {
            ...DEFAULT_SETTINGS,
            ...this.data?.settings
          }
        };
      } else {
        this.data = this.getDefaultData();
      }
    } catch (error) {
      console.error('Error loading finance data:', error);
      this.data = this.getDefaultData();
    }

    return this.data;
  }

  // Save data to localStorage
  saveData(data: FinanceData): void {
    if (typeof window === 'undefined') return;

    try {
      data.lastUpdated = new Date().toISOString();
      this.data = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving finance data:', error);
    }
  }

  // Get current data
  getData(): FinanceData {
    if (!this.data) {
      return this.loadData();
    }
    return this.data;
  }

  // Currency rates management
  getCurrencyRates(): CurrencyRate[] {
    if (typeof window === 'undefined') {
      return SUPPORTED_CURRENCIES;
    }

    try {
      const stored = localStorage.getItem(RATES_KEY);
      const timestamp = localStorage.getItem(RATES_TIMESTAMP_KEY);
      
      // Check if rates are older than 1 hour
      if (stored && timestamp) {
        const lastUpdate = parseInt(timestamp);
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - lastUpdate < oneHour) {
          return JSON.parse(stored);
        }
      }
    } catch (error) {
      console.error('Error loading currency rates:', error);
    }

    return SUPPORTED_CURRENCIES;
  }

  // Save currency rates
  saveCurrencyRates(rates: CurrencyRate[]): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(RATES_KEY, JSON.stringify(rates));
      localStorage.setItem(RATES_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error saving currency rates:', error);
    }
  }

  // Export data for backup
  exportData(): string {
    const data = this.getData();
    return JSON.stringify(data, null, 2);
  }

  // Import data from backup
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      // Basic validation
      if (data && typeof data === 'object' && Array.isArray(data.income) && Array.isArray(data.expenses)) {
        this.saveData(data);
        return true;
      }
    } catch (error) {
      console.error('Error importing data:', error);
    }
    return false;
  }

  // Clear all data
  clearData(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(RATES_KEY);
    localStorage.removeItem(RATES_TIMESTAMP_KEY);
    this.data = null;
  }
}

export const financeStorage = new FinanceStorage();
