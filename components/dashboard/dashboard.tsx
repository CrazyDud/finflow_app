

'use client';

import React, { useState, useEffect } from 'react';
import { StatsCards } from './stats-cards';
import { EnhancedSuperQuickActions } from './enhanced-super-quick-actions';
import { SmartQuickActions } from './smart-quick-actions';
import { EnhancedQuickActions } from './enhanced-quick-actions';
import { SpendingChart } from './spending-chart';
import { NewQuickAddCard } from './new-quick-add-card';
import { MonthlyOverview } from './monthly-overview';
import { BudgetProgress } from './budget-progress';
import { RecentTransactions } from './recent-transactions';
import { useFinance } from '@/hooks/use-finance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Settings, 
  GripVertical, 
  ArrowUpDown, 
  Check,
  Eye,
  EyeOff
} from 'lucide-react';

interface DashboardCard {
  id: string;
  name: string;
  component: React.ComponentType;
  order: number;
  visible: boolean;
  proOnly?: boolean;
}

// Registry of stable card definitions. This avoids persisting React components in localStorage.
const CARD_REGISTRY: Record<string, { name: string; component: React.ComponentType; proOnly?: boolean }> = {
  'stats': { name: 'Overview Cards', component: StatsCards },
  'super-quick-actions': { name: 'Lightning Quick Add', component: EnhancedSuperQuickActions },
  'smart-quick-actions': { name: 'Smart Quick Actions', component: SmartQuickActions },
  'monthly-overview': { name: 'Monthly Overview', component: MonthlyOverview },
  'budget-progress': { name: 'Budget Progress', component: BudgetProgress, proOnly: true },
  'spending-chart': { name: 'Spending Chart', component: SpendingChart, proOnly: true },
  'navigation': { name: 'Navigation Tools', component: EnhancedQuickActions },
  'recent-transactions': { name: 'Recent Transactions', component: RecentTransactions },
};

type StoredDashboardCard = {
  id: string;
  order: number;
  visible: boolean;
};

function buildDefaultCards(): DashboardCard[] {
  const ids = [
    'stats',
    'super-quick-actions',
    'smart-quick-actions',
    'monthly-overview',
    'budget-progress',
    'spending-chart',
    'navigation',
    'recent-transactions',
  ];
  return ids.map((id, index) => {
    const def = CARD_REGISTRY[id];
    return {
      id,
      name: def.name,
      component: def.component,
      order: index + 1,
      visible: true,
      proOnly: def.proOnly,
    };
  });
}

export function Dashboard() {
  const { data } = useFinance();
  const [isEditMode, setIsEditMode] = useState(false);
  const [cardOrder, setCardOrder] = useState<DashboardCard[]>([]);
  
  useEffect(() => {
    const defaults = buildDefaultCards();
    // Inject Quick Add card just after Overview Cards
    const withQuickAdd: DashboardCard[] = [
      { id: 'quick-add', name: 'Quick Add', component: NewQuickAddCard, order: 2, visible: true },
      ...defaults.map((c) => ({ ...c, order: c.order >= 2 ? c.order + 1 : c.order })),
    ];

    try {
      const savedRaw = localStorage.getItem('dashboard_card_order');
      if (!savedRaw) {
        setCardOrder(withQuickAdd);
        return;
      }

      const savedParsed = JSON.parse(savedRaw) as Array<StoredDashboardCard | any>;

      // Restore only id/order/visible from saved data, and rehydrate components from registry
      const base = withQuickAdd;
      const restored: DashboardCard[] = base.map((def) => {
        const match = savedParsed.find((c: any) => c && c.id === def.id);
        const order = typeof match?.order === 'number' ? match.order : def.order;
        const visible = typeof match?.visible === 'boolean' ? match.visible : def.visible;
        return { ...def, order, visible };
      });

      // If saved contained unknown cards, ignore; if saved was malformed, fall back to defaults
      const anyInvalid = savedParsed.some((c: any) => c && c.component && typeof c.component !== 'function');
      if (anyInvalid) {
        // Rewrite storage with sanitized structure
        const serialized = restored.map((c) => ({ id: c.id, order: c.order, visible: c.visible }));
        localStorage.setItem('dashboard_card_order', JSON.stringify(serialized));
      }

      setCardOrder(restored.sort((a, b) => a.order - b.order));
    } catch (_e) {
      setCardOrder(defaults);
    }
  }, []);

  const saveOrder = (newOrder: DashboardCard[]) => {
    setCardOrder(newOrder);
    // Persist only serializable fields
    const serialized: StoredDashboardCard[] = newOrder.map((c) => ({ id: c.id, order: c.order, visible: c.visible }));
    localStorage.setItem('dashboard_card_order', JSON.stringify(serialized));
  };

  const toggleCardVisibility = (cardId: string) => {
    const newOrder = cardOrder.map(card => 
      card.id === cardId ? { ...card, visible: !card.visible } : card
    );
    saveOrder(newOrder);
  };

  const moveCard = (cardId: string, direction: 'up' | 'down') => {
    const currentIndex = cardOrder.findIndex(card => card.id === cardId);
    if (currentIndex === -1) return;

    const newOrder = [...cardOrder];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      [newOrder[currentIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[currentIndex]];
      // Update order numbers
      newOrder.forEach((card, index) => {
        card.order = index + 1;
      });
      saveOrder(newOrder);
    }
  };
  
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  const isProMode = data.settings.mode === 'pro';
  const visibleCards = cardOrder
    .filter(card => card.visible && (!card.proOnly || isProMode))
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8">
      {/* Dashboard Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Your financial overview at a glance</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
            className="flex items-center space-x-2"
          >
            {isEditMode ? <Check className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
            <span>{isEditMode ? 'Done' : 'Customize'}</span>
          </Button>
        </div>
      </div>

      {/* Edit Mode Panel */}
      {isEditMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <ArrowUpDown className="h-5 w-5" />
                <span>Dashboard Customization</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Reorder cards and toggle visibility to personalize your dashboard
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {cardOrder.map((card, index) => {
                  const isDisabledByMode = card.proOnly && !isProMode;
                  
                  return (
                    <motion.div
                      key={card.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        card.visible && !isDisabledByMode
                          ? 'bg-background' 
                          : 'bg-muted/50 opacity-60'
                      }`}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center space-x-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{card.name}</span>
                            {card.proOnly && (
                              <Badge variant="secondary" className="text-xs">Pro</Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Order: {index + 1}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Move up/down buttons */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveCard(card.id, 'up')}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveCard(card.id, 'down')}
                          disabled={index === cardOrder.length - 1}
                        >
                          ↓
                        </Button>
                        
                        {/* Visibility toggle */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCardVisibility(card.id)}
                          disabled={isDisabledByMode}
                        >
                          {card.visible ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Dashboard Cards */}
      <div className="space-y-8">
        {visibleCards.map((cardConfig, index) => {
          const Component = cardConfig.component;
          return (
            <motion.div
              key={cardConfig.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Component />
            </motion.div>
          );
        })}
      </div>

      {/* Pro Mode Upgrade Hint */}
      {!isProMode && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
              🚀 Want more powerful features?
            </h3>
            <p className="text-purple-700 dark:text-purple-200 text-sm mb-4">
              Upgrade to Pro mode for advanced analytics, unlimited categories, and detailed budget tracking
            </p>
            <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100">
              Enable Pro Mode
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
