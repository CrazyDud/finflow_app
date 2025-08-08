'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoneySymbol } from '@/components/ui/money-symbol';
import { useFinance } from '@/hooks/use-finance';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Loader2, Plus } from 'lucide-react';

export function NewQuickAddCard() {
  const { data, addIncome, addExpense } = useFinance();
  const { toast } = useToast();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  if (!data) return null;

  const onSubmit = async () => {
    if (!amount) return;
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;
    if (type === 'expense' && !categoryId) return;
    setSaving(true);
    try {
      if (type === 'income') {
        addIncome({
          amount: num,
          currency: data.settings.defaultCurrency,
          description: description || undefined,
          date: new Date().toISOString(),
        });
      } else {
        addExpense({
          amount: num,
          currency: data.settings.defaultCurrency,
          categoryId,
          description: description || undefined,
          date: new Date().toISOString(),
        });
      }
      toast({
        title: type === 'income' ? 'Income added' : 'Expense added',
        description: formatCurrency(num, data.settings.defaultCurrency, []),
      });
      setAmount('');
      setCategoryId('');
      setDescription('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-indigo-50 dark:from-emerald-900/20 dark:via-sky-900/20 dark:to-indigo-900/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Quick Add</span>
          <Tabs value={type} onValueChange={(v) => setType(v as 'income' | 'expense')}>
            <TabsList>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expense</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-1">
            <Label>Amount</Label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-8"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><MoneySymbol /></span>
            </div>
          </div>
          {type === 'expense' && (
            <div className="md:col-span-1">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {data.categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="md:col-span-2">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={onSubmit} disabled={saving || !amount || (type==='expense' && !categoryId)}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Add {type === 'income' ? 'Income' : 'Expense'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


