

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinance } from '@/hooks/use-finance';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  Coffee, 
  Car, 
  Zap, 
  ShoppingCart,
  Utensils,
  Smartphone,
  Wifi,
  Home,
  Heart,
  Gamepad2,
  Settings,
  RotateCcw,
  Clock,
  Plus,
  Star,
  Gift,
  Briefcase,
  Plane,
  Music
} from 'lucide-react';
import { MoneySymbol } from '@/components/ui/money-symbol';

interface QuickAction {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultAmount: number;
  lastAmount?: number;
  frequency: number;
  color: string;
  bgColor: string;
  categoryKeywords: string[];
  isCustom?: boolean;
}

interface CustomActionForm {
  name: string;
  category: string;
  defaultAmount: string;
  icon: string;
  color: string;
  bgColor: string;
}

// Icon mapping for custom actions
const ICON_OPTIONS = {
  coffee: Coffee,
  car: Car,
  zap: Zap,
  shopping: ShoppingCart,
  utensils: Utensils,
  smartphone: Smartphone,
  wifi: Wifi,
  home: Home,
  heart: Heart,
  gamepad: Gamepad2,
  star: Star,
  gift: Gift,
  briefcase: Briefcase,
  plane: Plane,
  music: Music,
  dollar: Coffee
};

// Color options for custom actions
const COLOR_OPTIONS = [
  { name: 'Blue', color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30' },
  { name: 'Green', color: 'text-green-600', bg: 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30' },
  { name: 'Purple', color: 'text-purple-600', bg: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30' },
  { name: 'Orange', color: 'text-orange-600', bg: 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30' },
  { name: 'Red', color: 'text-red-600', bg: 'bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30' },
  { name: 'Yellow', color: 'text-yellow-600', bg: 'bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30' },
  { name: 'Indigo', color: 'text-indigo-600', bg: 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30' },
  { name: 'Pink', color: 'text-pink-600', bg: 'bg-pink-50 hover:bg-pink-100 dark:bg-pink-900/20 dark:hover:bg-pink-900/30' }
];

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'coffee',
    name: 'Coffee',
    category: 'Coffee & Drinks',
    icon: Coffee,
    defaultAmount: 5,
    frequency: 0,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30',
    categoryKeywords: ['coffee', 'drinks', 'beverage', 'cafe']
  },
  {
    id: 'gas',
    name: 'Gas/Fuel',
    category: 'Fuel/Gas',
    icon: Car,
    defaultAmount: 40,
    frequency: 0,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30',
    categoryKeywords: ['gas', 'fuel', 'car', 'transport']
  },
  {
    id: 'electricity',
    name: 'Electricity',
    category: 'Utilities',
    icon: Zap,
    defaultAmount: 80,
    frequency: 0,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30',
    categoryKeywords: ['electric', 'utility', 'power', 'bill']
  },
  {
    id: 'groceries',
    name: 'Groceries',
    category: 'Groceries',
    icon: ShoppingCart,
    defaultAmount: 50,
    frequency: 0,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30',
    categoryKeywords: ['grocery', 'food', 'supermarket', 'shopping']
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    category: 'Restaurants',
    icon: Utensils,
    defaultAmount: 25,
    frequency: 0,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30',
    categoryKeywords: ['restaurant', 'dining', 'food', 'meal']
  },
  {
    id: 'phone',
    name: 'Phone Bill',
    category: 'Phone',
    icon: Smartphone,
    defaultAmount: 45,
    frequency: 0,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30',
    categoryKeywords: ['phone', 'mobile', 'cellular', 'bill']
  },
  {
    id: 'internet',
    name: 'Internet',
    category: 'Internet',
    icon: Wifi,
    defaultAmount: 50,
    frequency: 0,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30',
    categoryKeywords: ['internet', 'wifi', 'broadband', 'bill']
  },
  {
    id: 'rent',
    name: 'Rent',
    category: 'Rent/Mortgage',
    icon: Home,
    defaultAmount: 800,
    frequency: 0,
    color: 'text-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30',
    categoryKeywords: ['rent', 'mortgage', 'housing', 'home']
  }
];

function coerceIcon(value: unknown): React.ComponentType<{ className?: string }> {
  if (typeof value === 'function') return value as React.ComponentType<{ className?: string }>;
  if (typeof value === 'string') {
    return ICON_OPTIONS[value as keyof typeof ICON_OPTIONS] || Coffee;
  }
  return Coffee;
}

export function SmartQuickActions() {
  const { data, addExpense, deleteExpense } = useFinance();
  const { toast } = useToast();
  const [quickActions, setQuickActions] = useState<QuickAction[]>(DEFAULT_QUICK_ACTIONS);
  const [showAmountDialog, setShowAmountDialog] = useState<QuickAction | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customForm, setCustomForm] = useState<CustomActionForm>({
    name: '',
    category: '',
    defaultAmount: '',
    icon: 'coffee',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30'
  });

  // Load saved quick actions
  useEffect(() => {
    const savedActions = localStorage.getItem('smart_quick_actions');
    if (savedActions) {
      try {
        const parsed = JSON.parse(savedActions);
        // Convert any serialized icon keys back to components for ALL actions
        const fixedActions = parsed.map((action: any) => ({
          ...action,
          icon: coerceIcon(action.icon),
        })) as QuickAction[];
        setQuickActions(fixedActions);
        // Write back a sanitized, serializable version to prevent future issues
        const serializable = fixedActions.map((a) => {
          const iconKey = Object.entries(ICON_OPTIONS).find(([_k, c]) => c === a.icon)?.[0] || 'coffee';
          return { ...a, icon: iconKey };
        });
        localStorage.setItem('smart_quick_actions', JSON.stringify(serializable));
      } catch (error) {
        console.error('Failed to load quick actions:', error);
        setQuickActions(DEFAULT_QUICK_ACTIONS);
      }
    }
  }, []);

  // Save quick actions
  const saveQuickActions = (actions: QuickAction[]) => {
    setQuickActions(actions);
    // Serialize actions with icon names for ALL actions to avoid storing functions
    const serializable = actions.map((action) => {
      const iconKey =
        Object.entries(ICON_OPTIONS).find(([_key, component]) => component === action.icon)?.[0] || 'coffee';
      return { ...action, icon: iconKey };
    });
    localStorage.setItem('smart_quick_actions', JSON.stringify(serializable));
  };

  // Find matching category for quick action
  const findMatchingCategory = (action: QuickAction) => {
    if (!data) return null;
    
    // First try exact name match
    let category = data.categories.find(cat => 
      cat.name.toLowerCase() === action.category.toLowerCase()
    );
    
    // If no exact match, try keyword matching
    if (!category) {
      category = data.categories.find(cat => 
        action.categoryKeywords.some(keyword => 
          cat.name.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }
    
    // If still no match, use first category or create a suggestion
    if (!category && data.categories.length > 0) {
      category = data.categories[0]; // fallback to first category
    }
    
    return category;
  };

  const handleQuickActionClick = (action: QuickAction) => {
    setShowAmountDialog(action);
    setCustomAmount((action.lastAmount || action.defaultAmount).toString());
  };

  const handleRepeatTransaction = (action: QuickAction) => {
    if (!action.lastAmount) return;
    
    const category = findMatchingCategory(action);
    if (!category) {
      toast({
        title: 'No matching category',
        description: `Please create a category for ${action.name} first`,
        variant: 'destructive',
      });
      return;
    }

    executeTransaction(action, action.lastAmount, category.id);
  };

  const executeTransaction = async (action: QuickAction, amount: number, categoryId: string) => {
    if (!data) return;

    try {
      const createdId = addExpense({
        amount,
        currency: data.settings.defaultCurrency,
        categoryId,
        date: new Date().toISOString(),
        description: action.name
      });

      // Update action with last amount and frequency
      const updatedActions = quickActions.map(a => 
        a.id === action.id 
          ? { ...a, lastAmount: amount, frequency: a.frequency + 1 }
          : a
      );
      saveQuickActions(updatedActions);

      toast({
        title: `✅ ${action.name} added`,
        description: `${formatCurrency(amount, data.settings.defaultCurrency, [])} recorded`,
        action: (
          <Button onClick={() => { if (createdId) { deleteExpense(createdId); window.location.reload(); } }}>Undo</Button>
        ),
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to add ${action.name}`,
        variant: 'destructive',
      });
    }
  };

  const handleCustomAmountSubmit = () => {
    if (!showAmountDialog || !data) return;
    
    const amount = parseFloat(customAmount);
    if (amount <= 0) return;

    const category = findMatchingCategory(showAmountDialog);
    if (!category) {
      toast({
        title: 'No matching category',
        description: `Please create a category for ${showAmountDialog.name} first`,
        variant: 'destructive',
      });
      setShowAmountDialog(null);
      return;
    }

    executeTransaction(showAmountDialog, amount, category.id);
    setShowAmountDialog(null);
    setCustomAmount('');
  };

  const handleCreateCustomAction = () => {
    if (!customForm.name || !customForm.defaultAmount) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in name and default amount',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(customForm.defaultAmount);
    if (amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Amount must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    const newAction: QuickAction = {
      id: `custom_${Date.now()}`,
      name: customForm.name,
      category: customForm.category || customForm.name,
      icon: ICON_OPTIONS[customForm.icon as keyof typeof ICON_OPTIONS] || Coffee,
      defaultAmount: amount,
      frequency: 0,
      color: customForm.color,
      bgColor: customForm.bgColor,
      categoryKeywords: [customForm.name.toLowerCase(), customForm.category.toLowerCase()].filter(Boolean),
      isCustom: true
    };

    const updatedActions = [...quickActions, newAction];
    saveQuickActions(updatedActions);

    // Reset form
    setCustomForm({
      name: '',
      category: '',
      defaultAmount: '',
      icon: 'coffee',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30'
    });
    setShowCustomDialog(false);

    toast({
      title: 'Custom action created',
      description: `${newAction.name} added to quick actions`,
    });
  };

  const deleteCustomAction = (actionId: string) => {
    const updatedActions = quickActions.filter(action => action.id !== actionId);
    saveQuickActions(updatedActions);
    toast({
      title: 'Custom action deleted',
      description: 'Action removed from quick actions',
    });
  };

  if (!data) return null;

  return (
    <>
      <Card className="border-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-indigo-900/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
              <Coffee className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Quick Actions
            </span>
          </CardTitle>
          <p className="text-muted-foreground">
            Common expenses with smart repeat functionality
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {quickActions
              .sort((a, b) => b.frequency - a.frequency)
              .map((action, index) => {
                const Icon = coerceIcon(action.icon);
                const hasLastAmount = action.lastAmount && action.lastAmount > 0;
                
                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="relative group"
                  >
                    <Button
                      onClick={() => handleQuickActionClick(action)}
                      variant="outline"
                      className={`w-full h-24 flex flex-col items-center justify-center space-y-2 p-3 ${action.bgColor} border-0 relative`}
                    >
                      {action.frequency > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-blue-500">
                          {action.frequency}
                        </Badge>
                      )}
                      
                      {/* Delete button for custom actions */}
                      {action.isCustom && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute -top-1 -left-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCustomAction(action.id);
                          }}
                        >
                          ×
                        </Button>
                      )}
                      
                      <Icon className={`h-6 w-6 ${action.color}`} />
                      <div className="text-center">
                        <div className="text-xs font-medium leading-tight">
                          {action.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(action.lastAmount || action.defaultAmount, data.settings.defaultCurrency, [])}
                        </div>
                      </div>
                    </Button>
                    
                    {/* Repeat Button */}
                    {hasLastAmount && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRepeatTransaction(action);
                          }}
                          className="h-6 px-2 text-xs bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Repeat
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            
            {/* Add Custom Action Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: quickActions.length * 0.05 }}
            >
              <Button
                onClick={() => setShowCustomDialog(true)}
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center space-y-2 p-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600"
              >
                <Plus className="h-6 w-6 text-gray-500" />
                <div className="text-center">
                  <div className="text-xs font-medium leading-tight text-gray-600 dark:text-gray-300">
                    Add Custom
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Quick Action
                  </div>
                </div>
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Amount Input Dialog */}
      <Dialog open={!!showAmountDialog} onOpenChange={() => setShowAmountDialog(null)}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {showAmountDialog && (() => {
                const DialogIcon = coerceIcon(showAmountDialog.icon);
                return <DialogIcon className="h-5 w-5" />;
              })()}
              <span>{showAmountDialog?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Enter the amount for this expense
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="pl-8"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomAmountSubmit();
                  }
                }}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <MoneySymbol />
              </span>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAmountDialog(null)}>
                Cancel
              </Button>
              <Button onClick={handleCustomAmountSubmit} disabled={!customAmount}>
                Add Expense
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Action Creation Dialog */}
      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Create Custom Quick Action</span>
            </DialogTitle>
            <DialogDescription>
              Add a personalized quick action for frequently used expenses
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Action Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Action Name</label>
              <Input
                placeholder="e.g., Lunch, Gym Membership"
                value={customForm.name}
                onChange={(e) => setCustomForm({...customForm, name: e.target.value})}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">Category (Optional)</label>
              <Input
                placeholder="e.g., Food, Health, Entertainment"
                value={customForm.category}
                onChange={(e) => setCustomForm({...customForm, category: e.target.value})}
              />
            </div>

            {/* Default Amount */}
            <div>
              <label className="block text-sm font-medium mb-1">Default Amount</label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={customForm.defaultAmount}
                  onChange={(e) => setCustomForm({...customForm, defaultAmount: e.target.value})}
                  className="pl-8"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <MoneySymbol />
                </span>
              </div>
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Icon</label>
              <div className="grid grid-cols-8 gap-2">
                {Object.entries(ICON_OPTIONS).map(([key, IconComponent]) => (
                  <Button
                    key={key}
                    variant={customForm.icon === key ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setCustomForm({...customForm, icon: key})}
                  >
                    <IconComponent className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Color Theme</label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_OPTIONS.map((colorOption) => (
                  <Button
                    key={colorOption.name}
                    variant={customForm.color === colorOption.color ? "default" : "outline"}
                    size="sm"
                    className={`h-8 ${colorOption.bg} ${colorOption.color}`}
                    onClick={() => setCustomForm({
                      ...customForm, 
                      color: colorOption.color,
                      bgColor: colorOption.bg
                    })}
                  >
                    <div className={`w-3 h-3 rounded-full bg-current`} />
                  </Button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium mb-2">Preview</label>
              <div className="flex justify-center">
                <div className={`flex flex-col items-center justify-center space-y-2 p-3 rounded-lg border-2 border-dashed w-24 h-20 ${customForm.bgColor}`}>
                  {(() => {
                    const IconComponent = ICON_OPTIONS[customForm.icon as keyof typeof ICON_OPTIONS] || Coffee;
                    return <IconComponent className={`h-5 w-5 ${customForm.color}`} />;
                  })()}
                  <div className="text-xs font-medium text-center leading-tight">
                    {customForm.name || 'Action'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowCustomDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCustomAction} 
                disabled={!customForm.name || !customForm.defaultAmount}
              >
                Create Action
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
