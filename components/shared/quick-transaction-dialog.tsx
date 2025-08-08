
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinance } from '@/hooks/use-finance';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Loader2, Save, DollarSign, Wallet, CreditCard } from 'lucide-react';

interface QuickTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  defaultType?: 'income' | 'expense';
}

export function QuickTransactionDialog({ 
  open, 
  onOpenChange, 
  defaultDate,
  defaultType = 'expense'
}: QuickTransactionDialogProps) {
  const { data, currencyRates, addIncome, addExpense } = useFinance();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(defaultType);
  const [formData, setFormData] = useState({
    amount: '',
    currency: data?.settings.defaultCurrency || 'EUR',
    description: '',
    categoryId: '',
    date: defaultDate || new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data) return;
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid positive number',
        variant: 'destructive',
      });
      return;
    }

    if (transactionType === 'expense' && !formData.categoryId) {
      toast({
        title: 'Category required',
        description: 'Please select a category for this expense',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const transactionData = {
        amount,
        currency: formData.currency,
        description: formData.description || undefined,
        date: new Date(formData.date).toISOString(),
      };

      if (transactionType === 'income') {
        addIncome(transactionData);
      } else {
        addExpense({
          ...transactionData,
          categoryId: formData.categoryId,
        });
      }

      toast({
        title: `${transactionType === 'income' ? 'Income' : 'Expense'} added successfully`,
        description: `${formatCurrency(amount, formData.currency, currencyRates)} has been recorded`,
      });

      // Reset form and close dialog
      setFormData({
        amount: '',
        currency: data.settings.defaultCurrency,
        description: '',
        categoryId: '',
        date: defaultDate || new Date().toISOString().split('T')[0],
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save transaction. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!data) return null;

  const availableCategories = data.categories;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Quick Add Transaction</span>
          </DialogTitle>
          <DialogDescription>
            {defaultDate ? `Adding transaction for ${new Date(defaultDate).toLocaleDateString()}` : 'Add a new transaction quickly'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={transactionType} onValueChange={(value) => setTransactionType(value as 'income' | 'expense')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="income" className="flex items-center space-x-2">
              <Wallet className="h-4 w-4" />
              <span>Income</span>
            </TabsTrigger>
            <TabsTrigger value="expense" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Expense</span>
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  required
                  className="pl-8"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Category (for expenses only) */}
            {transactionType === 'expense' && (
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
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
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder={`Enter a description for this ${transactionType}...`}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={2}
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Add {transactionType === 'income' ? 'Income' : 'Expense'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
