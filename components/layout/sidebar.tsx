
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  PlusCircle,
  TrendingUp,
  PieChart,
  Calendar,
  Target,
  CreditCard,
  Wallet,
  Settings,
  BarChart3
} from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  proOnly?: boolean;
}

export function Sidebar() {
  const pathname = usePathname();
  const { data } = useFinance();
  
  const isProMode = data?.settings.mode === 'pro';
  
  const sidebarItems: SidebarItem[] = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
    },
    {
      name: 'Add Transaction',
      href: '/add',
      icon: PlusCircle,
    },
    {
      name: 'Expenses',
      href: '/expenses',
      icon: CreditCard,
    },
    {
      name: 'Income',
      href: '/income',
      icon: Wallet,
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      proOnly: true,
    },
    {
      name: 'Budget',
      href: '/budget',
      icon: Target,
    },
    {
      name: 'Categories',
      href: '/categories',
      icon: PieChart,
      proOnly: true,
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: TrendingUp,
      proOnly: true,
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
      proOnly: true,
    },
  ];

  const filteredItems = isProMode 
    ? sidebarItems 
    : sidebarItems.filter(item => !item.proOnly);

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex-1 overflow-auto py-6">
        <nav className="px-3 space-y-1">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href || 
                           (item.href !== '/' && pathname?.startsWith(item.href));
            
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-11 px-3",
                    isActive && "bg-secondary font-medium shadow-sm"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" size="sm">
                      {item.badge}
                    </Badge>
                  )}
                  {item.proOnly && !isProMode && (
                    <Badge variant="outline" size="sm" className="text-xs">
                      Pro
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mode indicator */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-sm font-medium">
              {isProMode ? 'Pro Mode' : 'Simple Mode'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isProMode ? 'Advanced features enabled' : 'Basic features only'}
            </p>
          </div>
          <Badge variant={isProMode ? "default" : "secondary"}>
            {isProMode ? 'PRO' : 'SIMPLE'}
          </Badge>
        </div>
      </div>
    </div>
  );
}
