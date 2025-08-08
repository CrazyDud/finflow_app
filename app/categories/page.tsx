

'use client';

import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Tag, 
  Trash2, 
  Edit3,
  Home,
  Car,
  ShoppingCart,
  Utensils,
  Gamepad2,
  Briefcase,
  Heart,
  Zap,
  Settings2,
  CheckCircle,
  Sparkles,
  MousePointer2,
  Wand2
} from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';
import { formatCurrency } from '@/lib/utils';
import { ExpenseCategory, FinanceData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

// Enhanced category presets with realistic limits based on real-world data
const CATEGORY_PRESETS = {
  'Bills & Essentials': {
    icon: Home,
    color: 'blue',
    allocation: 'essentials',
    subcategories: [
      { name: 'Rent/Mortgage', avgLimit: 800 },
      { name: 'Utilities', avgLimit: 120 },
      { name: 'Insurance', avgLimit: 150 },
      { name: 'Phone', avgLimit: 45 },
      { name: 'Internet', avgLimit: 50 },
      { name: 'Groceries', avgLimit: 400 }
    ]
  },
  'Transportation': {
    icon: Car,
    color: 'green',
    allocation: 'essentials',
    subcategories: [
      { name: 'Fuel/Gas', avgLimit: 120 },
      { name: 'Public Transport', avgLimit: 80 },
      { name: 'Car Maintenance', avgLimit: 100 },
      { name: 'Parking', avgLimit: 60 },
      { name: 'Uber/Taxi', avgLimit: 80 }
    ]
  },
  'Shopping & Personal': {
    icon: ShoppingCart,
    color: 'purple',
    allocation: 'fun',
    subcategories: [
      { name: 'Clothing', avgLimit: 150 },
      { name: 'Electronics', avgLimit: 200 },
      { name: 'Home & Garden', avgLimit: 100 },
      { name: 'Personal Care', avgLimit: 80 },
      { name: 'Gifts', avgLimit: 100 }
    ]
  },
  'Food & Dining': {
    icon: Utensils,
    color: 'orange',
    allocation: 'fun',
    subcategories: [
      { name: 'Restaurants', avgLimit: 200 },
      { name: 'Fast Food', avgLimit: 80 },
      { name: 'Coffee & Drinks', avgLimit: 60 },
      { name: 'Delivery', avgLimit: 120 },
      { name: 'Snacks & Treats', avgLimit: 50 }
    ]
  },
  'Entertainment': {
    icon: Gamepad2,
    color: 'pink',
    allocation: 'fun',
    subcategories: [
      { name: 'Movies & Shows', avgLimit: 40 },
      { name: 'Gaming', avgLimit: 60 },
      { name: 'Sports & Events', avgLimit: 100 },
      { name: 'Hobbies', avgLimit: 80 },
      { name: 'Subscriptions', avgLimit: 50 },
      { name: 'Books & Media', avgLimit: 30 }
    ]
  },
  'Work & Business': {
    icon: Briefcase,
    color: 'indigo',
    allocation: 'investments',
    subcategories: [
      { name: 'Office Supplies', avgLimit: 50 },
      { name: 'Software & Tools', avgLimit: 80 },
      { name: 'Business Meals', avgLimit: 100 },
      { name: 'Travel & Hotels', avgLimit: 200 },
      { name: 'Education & Courses', avgLimit: 150 }
    ]
  },
  'Health & Wellness': {
    icon: Heart,
    color: 'red',
    allocation: 'essentials',
    subcategories: [
      { name: 'Medical & Doctor', avgLimit: 100 },
      { name: 'Pharmacy & Meds', avgLimit: 60 },
      { name: 'Fitness & Gym', avgLimit: 50 },
      { name: 'Beauty & Spa', avgLimit: 80 },
      { name: 'Mental Health', avgLimit: 120 }
    ]
  }
};

export default function CategoriesPage() {
  const { data, addCategory, updateCategory, deleteCategory } = useFinance();
  const { toast } = useToast();
  const [newCategory, setNewCategory] = useState({ name: '', limit: '', allocation: 'essentials' });
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [mainCategory, setMainCategory] = useState<string>('');
  const [subcategoryName, setSubcategoryName] = useState<string>('');

  const categoryStats = useMemo(() => {
    if (!data) return {};
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentExpenses = data.expenses.filter(exp => exp.date.startsWith(currentMonth));
    
    return data.categories.reduce((stats, category) => {
      const spent = currentExpenses
        .filter(exp => exp.categoryId === category.id)
        .reduce((sum, exp) => sum + exp.amount, 0);
      
      stats[category.name] = {
        spent,
        limit: category.limit || 0,
        percentage: category.limit ? (spent / category.limit) * 100 : 0
      };
      
      return stats;
    }, {} as Record<string, { spent: number; limit: number; percentage: number }>);
  }, [data]);

  const handleAddCategory = () => {
    if (!data || !newCategory.name.trim()) return;
    
    // Calculate suggested limit if no limit is provided
    let suggestedLimit = parseFloat(newCategory.limit) || 0;
    
    if (suggestedLimit === 0) {
      const monthlyIncome = data.income.reduce((total, inc) => {
        const incomeDate = new Date(inc.date);
        const currentMonth = new Date();
        if (incomeDate.getMonth() === currentMonth.getMonth() && 
            incomeDate.getFullYear() === currentMonth.getFullYear()) {
          return total + inc.amount;
        }
        return total;
      }, 0);
      
      // Default to 5% of fun allocation if no specific limit is set
      if (monthlyIncome > 0) {
        suggestedLimit = Math.round((monthlyIncome * data.settings.budgetAllocation.fun / 100) * 0.05);
      }
    }
    
    addCategory({
      name: newCategory.name.trim(),
      icon: '💰',
      color: 'blue',
      limit: suggestedLimit,
      currency: data.settings.defaultCurrency,
      allocation: newCategory.allocation as any
    });
    
    setNewCategory({ name: '', limit: '', allocation: 'essentials' });
    
    toast({
      title: 'Category added',
      description: `${newCategory.name.trim()} with ${formatCurrency(suggestedLimit, data.settings.defaultCurrency, [])} monthly limit`,
    });
  };

  const handleEditCategory = (category: ExpenseCategory) => {
    if (!editingCategory) return;
    
    updateCategory(editingCategory.id, category);
    setEditingCategory(null);
    
    toast({
      title: 'Category updated',
      description: `${category.name} has been updated successfully`,
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!data) return;
    
    const category = data.categories.find(cat => cat.id === categoryId);
    deleteCategory(categoryId);
    
    toast({
      title: 'Category deleted',
      description: `${category?.name} has been removed`,
    });
  };

  const handleAddPreset = async () => {
    if (!data || !selectedPreset || isAddingPreset) return;
    
    setIsAddingPreset(true);
    
    const preset = CATEGORY_PRESETS[selectedPreset as keyof typeof CATEGORY_PRESETS];
    const existingNames = new Set(data.categories.map(cat => cat.name.toLowerCase()));
    
    // Calculate income-based limits
    const monthlyIncome = data.income.reduce((total, inc) => {
      const incomeDate = new Date(inc.date);
      const currentMonth = new Date();
      if (incomeDate.getMonth() === currentMonth.getMonth() && 
          incomeDate.getFullYear() === currentMonth.getFullYear()) {
        return total + inc.amount;
      }
      return total;
    }, 0);
    
    const allocation = data.settings.budgetAllocation;
    let allocationPercent = 0;
    
    switch (preset.allocation) {
      case 'essentials':
        allocationPercent = allocation.essentials;
        break;
      case 'fun':
        allocationPercent = allocation.fun;
        break;
      case 'investments':
        allocationPercent = allocation.investments;
        break;
    }
    
    const totalCategoryBudget = Math.round((monthlyIncome * allocationPercent) / 100);
    
    // Filter categories that don't exist yet OR are in selectedSubcategories
    const categoriesToAdd = preset.subcategories.filter(sub => 
      !existingNames.has(sub.name.toLowerCase()) && 
      (selectedSubcategories.length === 0 || selectedSubcategories.includes(sub.name))
    );
    
    if (categoriesToAdd.length === 0) {
      toast({
        title: 'No new categories to add',
        description: selectedSubcategories.length > 0 
          ? 'Selected categories already exist!' 
          : `All categories from ${selectedPreset} preset already exist!`,
        variant: 'default',
      });
      setIsAddingPreset(false);
      setSelectedPreset('');
      setSelectedSubcategories([]);
      return;
    }
    
    // Add all selected categories with realistic limits
    let addedCount = 0;
    for (const sub of categoriesToAdd) {
      // Use income-based limit if available, otherwise use the average limit from preset
      let categoryLimit = sub.avgLimit;
      if (monthlyIncome > 0 && totalCategoryBudget > 0) {
        // Scale the average limit based on user's income and allocation
        const scaleFactor = totalCategoryBudget / preset.subcategories.reduce((sum, s) => sum + s.avgLimit, 0);
        categoryLimit = Math.round(sub.avgLimit * scaleFactor);
      }
      
      addCategory({
        name: sub.name,
        icon: '💰',
        color: preset.color,
        limit: categoryLimit,
        currency: data.settings.defaultCurrency
      });
      
      addedCount++;
      
      // Small delay to ensure proper sequential adding
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    toast({
      title: `✅ Added ${addedCount} categories`,
      description: `Successfully added categories from ${selectedPreset} preset with smart limits based on your ${preset.allocation} allocation.`,
    });
    
    setSelectedPreset('');
    setSelectedSubcategories([]);
    setIsAddingPreset(false);
  };

  const handleSubcategoryToggle = async (subcategoryName: string, presetName: string) => {
    if (!data) return;
    
    const preset = CATEGORY_PRESETS[presetName as keyof typeof CATEGORY_PRESETS];
    const existingNames = new Set(data.categories.map(cat => cat.name.toLowerCase()));
    
    // Check if category already exists
    if (existingNames.has(subcategoryName.toLowerCase())) {
      toast({
        title: 'Category already exists',
        description: `${subcategoryName} is already in your categories`,
        variant: 'default',
      });
      return;
    }

    // Find the subcategory data
    const subcategory = preset.subcategories.find(sub => sub.name === subcategoryName);
    if (!subcategory) return;

    // Calculate income-based limits
    const monthlyIncome = data.income.reduce((total, inc) => {
      const incomeDate = new Date(inc.date);
      const currentMonth = new Date();
      if (incomeDate.getMonth() === currentMonth.getMonth() && 
          incomeDate.getFullYear() === currentMonth.getFullYear()) {
        return total + inc.amount;
      }
      return total;
    }, 0);
    
    const allocation = data.settings.budgetAllocation;
    let allocationPercent = 0;
    
    switch (preset.allocation) {
      case 'essentials':
        allocationPercent = allocation.essentials;
        break;
      case 'fun':
        allocationPercent = allocation.fun;
        break;
      case 'investments':
        allocationPercent = allocation.investments;
        break;
    }
    
    const totalCategoryBudget = Math.round((monthlyIncome * allocationPercent) / 100);
    
    // Calculate smart limit
    let categoryLimit = subcategory.avgLimit;
    if (monthlyIncome > 0 && totalCategoryBudget > 0) {
      const scaleFactor = totalCategoryBudget / preset.subcategories.reduce((sum, s) => sum + s.avgLimit, 0);
      categoryLimit = Math.round(subcategory.avgLimit * scaleFactor);
    }
    
    // Add the category immediately
    addCategory({
      name: subcategoryName,
      icon: '💰',
      color: preset.color,
      limit: categoryLimit,
      currency: data.settings.defaultCurrency,
      allocation: preset.allocation as any
    });
    
    toast({
      title: '✅ Category added',
      description: `${subcategoryName} added with ${formatCurrency(categoryLimit, data.settings.defaultCurrency, [])} limit`,
    });
  };

  const handleAddCustomSubcategory = () => {
    if (!data || !mainCategory || !subcategoryName.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please select main category and enter subcategory name',
        variant: 'destructive',
      });
      return;
    }

    const preset = CATEGORY_PRESETS[mainCategory as keyof typeof CATEGORY_PRESETS];
    if (!preset) return;

    // Calculate limit based on allocation
    const monthlyIncome = data.income.reduce((total, inc) => {
      const incomeDate = new Date(inc.date);
      const currentMonth = new Date();
      if (incomeDate.getMonth() === currentMonth.getMonth() && 
          incomeDate.getFullYear() === currentMonth.getFullYear()) {
        return total + inc.amount;
      }
      return total;
    }, 0);

    const allocation = data.settings.budgetAllocation;
    let allocationPercent = 0;
    
    switch (preset.allocation) {
      case 'essentials':
        allocationPercent = allocation.essentials;
        break;
      case 'fun':
        allocationPercent = allocation.fun;
        break;
      case 'investments':
        allocationPercent = allocation.investments;
        break;
    }

    const defaultLimit = monthlyIncome > 0 
      ? Math.round((monthlyIncome * allocationPercent) / 100 / 10) // 10% of allocation
      : 100;

    addCategory({
      name: subcategoryName.trim(),
      icon: '💰',
      color: preset.color,
      limit: defaultLimit,
      currency: data.settings.defaultCurrency,
      allocation: preset.allocation as any
    });

    toast({
      title: 'Subcategory added',
      description: `${subcategoryName.trim()} added with ${formatCurrency(defaultLimit, data.settings.defaultCurrency, [])} limit`,
    });

    setSubcategoryName('');
  };

  if (!data) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Loading categories...</h3>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isProMode = data.settings.mode === 'pro';

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Smart Categories</h1>
            <p className="text-muted-foreground">
              Organize your spending with intelligent categories and realistic budgets
            </p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            <Sparkles className="h-3 w-3 mr-1" />
            Enhanced
          </Badge>
        </div>

        <Tabs defaultValue="presets" className="space-y-4">
          <TabsList>
            <TabsTrigger value="presets" className="flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <span>Smart Presets</span>
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center space-x-2">
              <Wand2 className="h-4 w-4" />
              <span>Custom Categories</span>
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center space-x-2">
              <Settings2 className="h-4 w-4" />
              <span>Manage Categories</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-4">
            {/* Smart Preset Selection */}
            <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <span>Quick Setup with Smart Presets</span>
                </CardTitle>
                <p className="text-muted-foreground">
                  Select a category group and choose specific subcategories to add with realistic limits
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                    <SelectTrigger className="w-80">
                      <SelectValue placeholder="Choose a preset category group" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_PRESETS).map(([name, preset]) => (
                        <SelectItem key={name} value={name}>
                          <div className="flex items-center space-x-3">
                            <preset.icon className="h-4 w-4" />
                            <span>{name}</span>
                            <Badge variant="outline" className="text-xs">
                              {preset.allocation}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Interactive Preview with Click to Select */}
                {isProMode && selectedPreset && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/60 dark:bg-black/20 rounded-lg p-4 border"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium flex items-center space-x-2">
                        {React.createElement(CATEGORY_PRESETS[selectedPreset as keyof typeof CATEGORY_PRESETS].icon, { className: "h-4 w-4" })}
                        <span>Interactive Preview: {selectedPreset}</span>
                        <Badge variant="outline" className="text-xs">
                          {CATEGORY_PRESETS[selectedPreset as keyof typeof CATEGORY_PRESETS].allocation} allocation
                        </Badge>
                      </h4>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedSubcategories([])}
                          className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/20"
                        >
                          Clear All
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const allSubs = CATEGORY_PRESETS[selectedPreset as keyof typeof CATEGORY_PRESETS]
                              .subcategories
                              .filter(sub => !data.categories.some(cat => cat.name.toLowerCase() === sub.name.toLowerCase()))
                              .map(sub => sub.name);
                            setSelectedSubcategories(allSubs);
                          }}
                          className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/20"
                        >
                          Select All New
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 flex items-center">
                      <MousePointer2 className="h-3 w-3 mr-1" />
                      Click categories to select/deselect them for adding
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      {CATEGORY_PRESETS[selectedPreset as keyof typeof CATEGORY_PRESETS].subcategories.map((sub) => {
                        const exists = data.categories.some(cat => cat.name.toLowerCase() === sub.name.toLowerCase());
                        const isSelected = selectedSubcategories.includes(sub.name);
                        
                        return (
                          <motion.div 
                            key={sub.name} 
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${
                              exists 
                                ? 'bg-yellow-50 border-yellow-300 text-yellow-900 dark:bg-yellow-900/30 dark:border-yellow-600 dark:text-yellow-100 cursor-not-allowed opacity-75' 
                                : isSelected
                                ? 'bg-green-100 border-green-400 text-green-900 dark:bg-green-800/30 dark:border-green-500 dark:text-green-100 ring-2 ring-green-400 shadow-sm' 
                                : 'bg-white border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 shadow-sm'
                            }`}
                            onClick={() => !exists && handleSubcategoryToggle(sub.name, selectedPreset)}
                            whileHover={!exists ? { scale: 1.02 } : {}}
                            whileTap={!exists ? { scale: 0.98 } : {}}
                          >
                            <div className="flex items-center space-x-2">
                              {!exists && (
                                <Checkbox 
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="h-3 w-3"
                                />
                              )}
                              <span className="font-medium">{sub.name}</span>
                            </div>
                            <span className="text-xs">
                              {exists ? '✓ Exists' : `~${formatCurrency(sub.avgLimit, data.settings.defaultCurrency, [])}`}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>

                    {selectedSubcategories.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          {selectedSubcategories.length} categories selected for adding
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Preset Categories Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${!isProMode ? 'pointer-events-none opacity-60' : ''}`}>
              {Object.entries(CATEGORY_PRESETS).map(([name, preset]) => (
                <motion.div
                  key={name}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full border-2 border-dashed border-muted hover:border-primary/50 transition-colors cursor-pointer" 
                        onClick={() => setSelectedPreset(name)}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`p-3 rounded-xl bg-${preset.color}-100 text-${preset.color}-600 dark:bg-${preset.color}-900/20`}>
                          <preset.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{name}</h4>
                          <Badge variant="outline" className="text-xs mt-1">
                            {preset.allocation}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {preset.subcategories.slice(0, 4).map((sub) => (
                          <div key={sub.name} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">• {sub.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ~{formatCurrency(sub.avgLimit, data.settings.defaultCurrency, [])}
                            </span>
                          </div>
                        ))}
                        {preset.subcategories.length > 4 && (
                          <p className="text-xs text-muted-foreground">
                            +{preset.subcategories.length - 4} more categories...
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            {/* Custom Category Workflow */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wand2 className="h-5 w-5" />
                  <span>Create Custom Category</span>
                </CardTitle>
                <p className="text-muted-foreground">
                  Choose a main category first, then add subcategories with smart limit calculations
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Select Main Category */}
                <div>
                  <Label>Step 1: Select Main Category</Label>
                  <Select value={mainCategory} onValueChange={setMainCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose main category type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_PRESETS).map(([name, preset]) => (
                        <SelectItem key={name} value={name}>
                          <div className="flex items-center space-x-3">
                            <preset.icon className="h-4 w-4" />
                            <span>{name}</span>
                            <Badge variant="outline" className="text-xs">
                              {preset.allocation}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Step 2: Add Subcategory */}
                {mainCategory && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 p-4 border rounded-lg bg-muted/20"
                  >
                    <Label>Step 2: Add Subcategory (Optional - defaults to "Other" if not specified)</Label>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Subcategory name (e.g., Coffee & Drinks)"
                        value={subcategoryName}
                        onChange={(e) => setSubcategoryName(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleAddCustomSubcategory} disabled={!mainCategory}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Subcategory
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Limit will be automatically calculated based on your {CATEGORY_PRESETS[mainCategory as keyof typeof CATEGORY_PRESETS]?.allocation} allocation percentage
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4">
            {/* Add New Category */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add Manual Category</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
                    <Label htmlFor="category-name">Category Name</Label>
                    <Input
                      id="category-name"
                      placeholder="e.g., Coffee & Drinks"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
            <div className="sm:w-44">
              <Label>Allocation</Label>
              <Select value={newCategory.allocation} onValueChange={(value) => setNewCategory(prev => ({...prev, allocation: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="essentials">Essentials</SelectItem>
                  <SelectItem value="investments">Investments</SelectItem>
                  <SelectItem value="fun">Fun</SelectItem>
                </SelectContent>
              </Select>
            </div>
                  <div className="sm:w-32">
                    <Label htmlFor="category-limit">Monthly Limit</Label>
                    <Input
                      id="category-limit"
                      type="number"
                      placeholder={(() => {
                        if (!data) return "100";
                        const monthlyIncome = data.income.reduce((total, inc) => {
                          const incomeDate = new Date(inc.date);
                          const currentMonth = new Date();
                          if (incomeDate.getMonth() === currentMonth.getMonth() && 
                              incomeDate.getFullYear() === currentMonth.getFullYear()) {
                            return total + inc.amount;
                          }
                          return total;
                        }, 0);
                        const suggested = monthlyIncome > 0 ? 
                          Math.round((monthlyIncome * data.settings.budgetAllocation.fun / 100) * 0.05) : 100;
                        return `${suggested} (suggested)`;
                      })()}
                      value={newCategory.limit}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, limit: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddCategory} className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Your Categories ({data.categories.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {data.categories.length === 0 ? (
                  <div className="text-center py-8">
                    <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No categories yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Use smart presets above or add your first custom category
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {data.categories.map((category) => {
                      const stats = categoryStats[category.name] || { spent: 0, limit: 0, percentage: 0 };
                      
                      return (
                        <motion.div 
                          key={category.id} 
                          className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all"
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-6 h-6 rounded-full cursor-pointer border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                              style={{ backgroundColor: category.color }}
                              onClick={() => setEditingCategory(category)}
                              title="Click to change color"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium">{category.name}</h4>
                              <div className="flex items-center space-x-4 mt-2">
                                <div className="text-sm text-muted-foreground">
                                  Spent: <span className="font-medium">
                                    {formatCurrency(stats.spent, data.settings.defaultCurrency, [])}
                                  </span>
                                </div>
                                {category.limit > 0 && (
                                  <>
                                    <div className="text-sm text-muted-foreground">
                                      Limit: <span className="font-medium">
                                        {formatCurrency(category.limit, data.settings.defaultCurrency, [])}
                                      </span>
                                    </div>
                                    <div className="flex-1 max-w-32">
                                      <div className="w-full bg-muted rounded-full h-2">
                                        <div 
                                          className={`h-2 rounded-full transition-all ${
                                            stats.percentage > 100 ? 'bg-red-500' : 
                                            stats.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                                          }`}
                                          style={{ width: `${Math.min(stats.percentage, 100)}%` }}
                                        />
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {stats.percentage.toFixed(0)}% used
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingCategory(category)}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Category</DialogTitle>
                                  <DialogDescription>
                                    Modify your category settings
                                  </DialogDescription>
                                </DialogHeader>
                                {editingCategory && (
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="edit-name">Category Name</Label>
                                      <Input
                                        id="edit-name"
                                        value={editingCategory.name}
                                        onChange={(e) => setEditingCategory(prev => 
                                          prev ? { ...prev, name: e.target.value } : null
                                        )}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-limit">Monthly Limit</Label>
                                      <Input
                                        id="edit-limit"
                                        type="number"
                                        value={editingCategory.limit || ''}
                                        onChange={(e) => setEditingCategory(prev => 
                                          prev ? { ...prev, limit: parseFloat(e.target.value) || 0 } : null
                                        )}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-color">Category Color</Label>
                                      <div className="grid grid-cols-8 gap-2 mt-2">
                                        {[
                                          '#ef4444', '#f97316', '#eab308', '#22c55e',
                                          '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
                                          '#64748b', '#059669', '#dc2626', '#ca8a04',
                                          '#0891b2', '#7c3aed', '#be185d', '#475569'
                                        ].map((color) => (
                                          <button
                                            key={color}
                                            type="button"
                                            className={`w-8 h-8 rounded-full border-2 ${
                                              editingCategory.color === color 
                                                ? 'border-gray-900 dark:border-gray-100' 
                                                : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setEditingCategory(prev => prev ? { ...prev, color } : null)}
                                          />
                                        ))}
                                      </div>
                                      <Input
                                        className="mt-2"
                                        type="color"
                                        value={editingCategory.color}
                                        onChange={(e) => setEditingCategory(prev => prev ? { ...prev, color: e.target.value } : null)}
                                      />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                      <Button
                                        variant="outline"
                                        onClick={() => setEditingCategory(null)}
                                      >
                                        Cancel
                                      </Button>
                                      <Select
                                        value={editingCategory.allocation || 'essentials'}
                                        onValueChange={(value) => setEditingCategory(prev => prev ? { ...prev, allocation: value as any } : null)}
                                      >
                                        <SelectTrigger className="w-40">
                                          <SelectValue placeholder="Allocation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="essentials">Essentials</SelectItem>
                                          <SelectItem value="investments">Investments</SelectItem>
                                          <SelectItem value="fun">Fun</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Button
                                        onClick={() => handleEditCategory(editingCategory)}
                                      >
                                        Save Changes
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
