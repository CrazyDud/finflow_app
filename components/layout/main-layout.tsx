

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useFinance } from '@/hooks/use-finance';
import {
  Home,
  PieChart,
  Calendar,
  Settings,
  Target,
  BarChart3,
  FileText,
  Menu,
  X,
  Sparkles,
  RefreshCcw,
  Zap,
  Crown,
  Receipt
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  proOnly?: boolean;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
  { name: 'Budget', href: '/budget', icon: Target },
  { name: 'Categories', href: '/categories', icon: PieChart, proOnly: true },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, proOnly: true },
  { name: 'Calendar', href: '/calendar', icon: Calendar, proOnly: true },
  { name: 'Reports', href: '/reports', icon: FileText, proOnly: true },
  { name: 'Auto Payments', href: '/automatic-payments', icon: RefreshCcw, proOnly: true },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, updateSettings } = useFinance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isProMode = data?.settings?.mode === 'pro';

  const handleModeToggle = (checked: boolean) => {
    if (data) {
      updateSettings({
        mode: checked ? 'pro' : 'simple'
      });
      // Send user to Dashboard when switching modes
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FF</span>
              </div>
              <span className="font-semibold text-lg">FinFlow</span>
            </Link>
          </div>

          {/* Mode Toggle */}
          <div className="px-4 py-4 border-b">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${isProMode ? 'bg-purple-500 text-white' : 'bg-gray-400 text-white'}`}>
                  {isProMode ? <Crown className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {isProMode ? 'Pro Mode' : 'Simple Mode'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isProMode ? 'All features' : 'Basic features'}
                  </p>
                </div>
              </div>
              <Switch
                checked={isProMode}
                onCheckedChange={handleModeToggle}
                className="data-[state=checked]:bg-purple-500"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {(isProMode ? navigation : navigation.filter(n => !n.proOnly)).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span>{item.name}</span>
                  {item.proOnly && isProMode && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Pro
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Pro Mode Status */}
          <div className="px-4 py-4 border-t">
            <div className={`p-3 rounded-lg ${
              isProMode 
                ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20' 
                : 'bg-muted'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {isProMode ? 'Pro Features Active' : 'Simple Mode Active'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isProMode ? 'All features unlocked' : 'Toggle above to enable Pro'}
                  </p>
                </div>
                {isProMode && (
                  <Sparkles className="h-5 w-5 text-purple-600" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="px-4 py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
