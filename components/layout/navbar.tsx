
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Settings, 
  Wallet, 
  Moon, 
  Sun, 
  Monitor,
  Globe,
  Download,
  Upload,
  Trash2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useFinance } from '@/hooks/use-finance';
import { formatCurrency } from '@/lib/utils';

interface NavbarProps {
  onOpenSettings?: () => void;
}

export function Navbar({ onOpenSettings }: NavbarProps) {
  const { setTheme, theme } = useTheme();
  const { data, currencyRates, updateSettings, exportData, importData, clearAllData } = useFinance();

  const handleModeToggle = () => {
    if (!data) return;
    const newMode = data.settings.mode === 'simple' ? 'pro' : 'simple';
    updateSettings({ mode: newMode });
    // Force immediate page refresh to show mode changes
    window.location.reload();
  };

  const handleExport = () => {
    try {
      const dataStr = exportData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = event.target?.result as string;
            const success = importData(data);
            if (success) {
              alert('Data imported successfully!');
            } else {
              alert('Failed to import data. Please check the file format.');
            }
          } catch (error) {
            alert('Error importing data');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearAllData();
    }
  };

  const stats = data ? {
    totalBalance: data.income.reduce((sum, inc) => sum + inc.amount, 0) - 
                  data.expenses.reduce((sum, exp) => sum + exp.amount, 0),
    currency: data.settings.defaultCurrency
  } : { totalBalance: 0, currency: 'EUR' };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold leading-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">FinFlow</h1>
              <p className="text-xs text-muted-foreground">Smart Finance Manager</p>
            </div>
          </div>

          {/* Balance Display */}
          {data && (
            <div className="hidden md:flex items-center space-x-2">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className={`text-lg font-semibold animate-number ${
                  stats.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(stats.totalBalance, stats.currency, currencyRates)}
                </p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {/* Mode Toggle */}
            {data && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleModeToggle}
                className="flex items-center space-x-2"
              >
                {data.settings.mode === 'simple' ? (
                  <>
                    <ToggleLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Simple</span>
                  </>
                ) : (
                  <>
                    <ToggleRight className="h-4 w-4" />
                    <span className="hidden sm:inline">Pro</span>
                  </>
                )}
                <Badge variant="secondary" className="ml-1">
                  {data.settings.mode}
                </Badge>
              </Button>
            )}

            {/* Direct Settings Link */}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Open settings menu</span>
              </Link>
            </Button>

            {/* Simple Theme Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                if (theme === 'light') {
                  setTheme('dark');
                } else if (theme === 'dark') {
                  setTheme('system');
                } else {
                  setTheme('light');
                }
              }}
            >
              {theme === 'dark' ? (
                <Moon className="h-4 w-4" />
              ) : theme === 'light' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Monitor className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
