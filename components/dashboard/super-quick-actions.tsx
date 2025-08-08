

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useFinance } from '@/hooks/use-finance';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Plus, 
  Settings, 
  Car, 
  Home, 
  Coffee, 
  ShoppingCart, 
  Utensils, 
  CreditCard,
  Trash2,
  Edit3,
  Fuel,
  Lightbulb,
  Building,
  Wifi
} from 'lucide-react';
import { MoneySymbol } from '@/components/ui/money-symbol';

interface QuickActionButton {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  icon: string;
  color: string;
}

const DEFAULT_QUICK_ACTIONS: Omit<QuickActionButton, 'id' | 'categoryId'>[] = [
  { name: 'Gas/Fuel', amount: 45, icon: 'Car', color: 'blue' },
  { name: 'Coffee', amount: 5, icon: 'Coffee', color: 'amber' },
  { name: 'Lunch', amount: 12, icon: 'Utensils', color: 'orange' },
  { name: 'Groceries', amount: 25, icon: 'ShoppingCart', color: 'green' },
  { name: 'Electricity', amount: 80, icon: 'Lightbulb', color: 'yellow' },
  { name: 'Internet', amount: 50, icon: 'Wifi', color: 'purple' },
  { name: 'Rent Payment', amount: 800, icon: 'Home', color: 'red' },
];

const getIconComponent = (iconName: string) => {
  const icons: { [key: string]: any } = {
    Car, Home, Coffee, ShoppingCart, Utensils, CreditCard, Fuel, Lightbulb, Building, Wifi
  };
  return icons[iconName] || CreditCard;
};

export function SuperQuickActions() {
  const { data, addExpense } = useFinance();
  const { toast } = useToast();
  const [quickActions, setQuickActions] = useState<QuickActionButton[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAction, setNewAction] = useState({
    name: '',
    amount: '',
    categoryId: '',
    icon: 'CreditCard',
    color: 'blue'
  });

  // Initialize quick actions from localStorage or defaults
  React.useEffect(() => {
    const stored = localStorage.getItem('quick_actions');
    if (stored) {
      setQuickActions(JSON.parse(stored));
    } else if (data && data.categories && data.categories.length > 0) {
      // Create default quick actions with matching categories
      const defaultActions = DEFAULT_QUICK_ACTIONS.map((action, index) => {
        const category = data.categories.find(cat => 
          cat.name.toLowerCase().includes(action.name.toLowerCase()) ||
          action.name.toLowerCase().includes(cat.name.toLowerCase())
        ) || data.categories[index % data.categories.length];
        
        return {
          id: `quick_${Date.now()}_${index}`,
          ...action,
          categoryId: category.id
        };
      });
      
      setQuickActions(defaultActions);
      localStorage.setItem('quick_actions', JSON.stringify(defaultActions));
    }
  }, [data]);

  const handleQuickExpense = async (quickAction: QuickActionButton) => {
    if (!data) return;

    try {
      addExpense({
        amount: quickAction.amount,
        currency: data.settings.defaultCurrency,
        categoryId: quickAction.categoryId,
        date: new Date().toISOString(),
        description: `Quick: ${quickAction.name}`
      });

      toast({
        title: '⚡ Quick expense added',
        description: `${quickAction.name}: ${formatCurrency(quickAction.amount, data.settings.defaultCurrency, [])}`,
      });

      // Auto refresh to update dashboard
      setTimeout(() => window.location.reload(), 1200);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add expense',
        variant: 'destructive',
      });
    }
  };

  const handleAddQuickAction = () => {
    if (!newAction.name || !newAction.amount || !newAction.categoryId) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    const action: QuickActionButton = {
      id: `quick_${Date.now()}`,
      name: newAction.name,
      amount: parseFloat(newAction.amount),
      categoryId: newAction.categoryId,
      icon: newAction.icon,
      color: newAction.color
    };

    const updatedActions = [...quickActions, action];
    setQuickActions(updatedActions);
    localStorage.setItem('quick_actions', JSON.stringify(updatedActions));

    setNewAction({
      name: '',
      amount: '',
      categoryId: '',
      icon: 'CreditCard',
      color: 'blue'
    });
    setShowAddDialog(false);

    toast({
      title: 'Quick action added',
      description: `${action.name} is now available for quick expenses`,
    });
  };

  const handleDeleteQuickAction = (actionId: string) => {
    const updatedActions = quickActions.filter(action => action.id !== actionId);
    setQuickActions(updatedActions);
    localStorage.setItem('quick_actions', JSON.stringify(updatedActions));

    toast({
      title: 'Quick action removed',
      description: 'The quick action has been deleted',
    });
  };

  if (!data) return null;

  return (
    <Card className="border-0 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-900/20 dark:via-purple-900/20 dark:to-fuchsia-900/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white">
              <Zap className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Quick Actions
            </span>
          </CardTitle>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Action
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Quick Action</DialogTitle>
                <DialogDescription>
                  Create a quick button for common expenses
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Action Name</label>
                  <Input
                    placeholder="e.g., Morning Coffee"
                    value={newAction.name}
                    onChange={(e) => setNewAction(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Typical Amount</label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newAction.amount}
                      onChange={(e) => setNewAction(prev => ({ ...prev, amount: e.target.value }))}
                      className="pl-8"
                    />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <MoneySymbol />
                  </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={newAction.categoryId} onValueChange={(value) => setNewAction(prev => ({ ...prev, categoryId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddQuickAction}>
                    Add Quick Action
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-muted-foreground text-sm">
          One-tap buttons for your most common expenses
        </p>
      </CardHeader>
      
      <CardContent>
        {quickActions.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {quickActions.map((action, index) => {
              const category = data.categories.find(cat => cat.id === action.categoryId);
              const Icon = getIconComponent(action.icon);
              
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="group relative"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => handleQuickExpense(action)}
                      variant="outline"
                      className="w-full h-20 flex flex-col items-center justify-center space-y-1 p-3 bg-white/60 dark:bg-black/20 hover:shadow-md transition-all"
                    >
                      <Icon className={`h-5 w-5 text-${action.color}-600`} />
                      <span className="text-xs font-medium text-center leading-tight">
                        {action.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(action.amount, data.settings.defaultCurrency, [])}
                      </span>
                    </Button>
                  </motion.div>
                  
                  {/* Delete button - shown on hover */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteQuickAction(action.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </motion.div>
              );
            })}
            
            {/* Add more button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: quickActions.length * 0.05 }}
            >
              <Button
                onClick={() => setShowAddDialog(true)}
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center space-y-1 p-3 border-dashed bg-white/30 dark:bg-black/10 hover:bg-white/50 dark:hover:bg-black/20"
              >
                <Plus className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Add More</span>
              </Button>
            </motion.div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Zap className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              No quick actions set up yet
            </p>
            <Button onClick={() => setShowAddDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create First Quick Action
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
