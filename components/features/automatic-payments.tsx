
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useFinance } from '@/hooks/use-finance';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  Calendar,
  Clock,
  CreditCard,
  Plus,
  Trash2,
  Pause,
  Play,
  RefreshCcw,
  AlertCircle,
  DollarSign
} from 'lucide-react';

interface AutomaticPayment {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextDue: string;
  active: boolean;
  timesExecuted?: number;
  maxExecutions?: number; // null for continuous
  createdAt: string;
}

export function AutomaticPayments() {
  const { data, addExpense } = useFinance();
  const { toast } = useToast();
  const [payments, setPayments] = useState<AutomaticPayment[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPayment, setNewPayment] = useState({
    name: '',
    amount: '',
    categoryId: '',
    frequency: 'monthly' as const,
    startDate: new Date().toISOString().split('T')[0],
    maxExecutions: '',
    continuous: true
  });

  // Load automatic payments from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('automatic_payments');
    if (saved) {
      setPayments(JSON.parse(saved));
    }
  }, []);

  // Save payments to localStorage
  const savePayments = (updatedPayments: AutomaticPayment[]) => {
    setPayments(updatedPayments);
    localStorage.setItem('automatic_payments', JSON.stringify(updatedPayments));
  };

  // Check for due payments and execute them
  useEffect(() => {
    const checkDuePayments = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      payments.forEach(payment => {
        if (payment.active && payment.nextDue <= today) {
          executePayment(payment);
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkDuePayments, 60000);
    // Check immediately
    checkDuePayments();

    return () => clearInterval(interval);
  }, [payments, data]);

  const calculateNextDue = (currentDate: string, frequency: 'weekly' | 'monthly' | 'yearly'): string => {
    const date = new Date(currentDate);
    
    switch (frequency) {
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    
    return date.toISOString().split('T')[0];
  };

  const executePayment = (payment: AutomaticPayment) => {
    if (!data) return;

    try {
      // Add the expense
      addExpense({
        amount: payment.amount,
        currency: data.settings.defaultCurrency,
        categoryId: payment.categoryId,
        date: new Date().toISOString(),
        description: `Auto: ${payment.name}`
      });

      // Update payment record
      const updatedPayments = payments.map(p => {
        if (p.id === payment.id) {
          const timesExecuted = (p.timesExecuted || 0) + 1;
          const shouldDeactivate = p.maxExecutions && timesExecuted >= p.maxExecutions;
          
          return {
            ...p,
            timesExecuted,
            active: !shouldDeactivate,
            nextDue: shouldDeactivate ? p.nextDue : calculateNextDue(p.nextDue, p.frequency)
          };
        }
        return p;
      });

      savePayments(updatedPayments);

      toast({
        title: '💳 Automatic payment executed',
        description: `${payment.name}: ${formatCurrency(payment.amount, data.settings.defaultCurrency, [])}`,
      });

    } catch (error) {
      toast({
        title: 'Payment failed',
        description: `Failed to execute automatic payment for ${payment.name}`,
        variant: 'destructive',
      });
    }
  };

  const handleAddPayment = () => {
    if (!data || !newPayment.name || !newPayment.amount || !newPayment.categoryId) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const payment: AutomaticPayment = {
      id: `auto_${Date.now()}`,
      name: newPayment.name,
      amount: parseFloat(newPayment.amount),
      categoryId: newPayment.categoryId,
      frequency: newPayment.frequency,
      nextDue: newPayment.startDate,
      active: true,
      timesExecuted: 0,
      maxExecutions: newPayment.continuous ? undefined : parseInt(newPayment.maxExecutions) || undefined,
      createdAt: new Date().toISOString()
    };

    savePayments([...payments, payment]);
    
    setNewPayment({
      name: '',
      amount: '',
      categoryId: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      maxExecutions: '',
      continuous: true
    });
    setShowAddDialog(false);

    toast({
      title: 'Automatic payment created',
      description: `${payment.name} will be processed ${payment.frequency}`,
    });
  };

  const togglePaymentStatus = (paymentId: string) => {
    const updatedPayments = payments.map(p => 
      p.id === paymentId ? { ...p, active: !p.active } : p
    );
    savePayments(updatedPayments);
  };

  const deletePayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    savePayments(payments.filter(p => p.id !== paymentId));
    
    toast({
      title: 'Payment deleted',
      description: `${payment?.name} automatic payment removed`,
    });
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return '📅';
      case 'monthly': return '🗓️';
      case 'yearly': return '🎂';
      default: return '⏰';
    }
  };

  if (!data) return null;

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                <RefreshCcw className="h-5 w-5" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Automatic Payments
              </span>
            </CardTitle>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Auto Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Automatic Payment</DialogTitle>
                  <DialogDescription>
                    Set up a recurring expense that will be automatically added on the specified schedule
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="payment-name">Payment Name</Label>
                    <Input
                      id="payment-name"
                      placeholder="e.g., Rent, Netflix Subscription"
                      value={newPayment.name}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="payment-amount">Amount</Label>
                    <div className="relative">
                      <Input
                        id="payment-amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newPayment.amount}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                        className="pl-8"
                      />
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="payment-category">Category</Label>
                    <Select value={newPayment.categoryId} onValueChange={(value) => setNewPayment(prev => ({ ...prev, categoryId: value }))}>
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
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="payment-frequency">Frequency</Label>
                      <Select value={newPayment.frequency} onValueChange={(value: any) => setNewPayment(prev => ({ ...prev, frequency: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="payment-start">Start Date</Label>
                      <Input
                        id="payment-start"
                        type="date"
                        value={newPayment.startDate}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="continuous"
                        checked={newPayment.continuous}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, continuous: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="continuous">Continuous payments</Label>
                    </div>
                    
                    {!newPayment.continuous && (
                      <div>
                        <Label htmlFor="max-executions">Number of payments</Label>
                        <Input
                          id="max-executions"
                          type="number"
                          min="1"
                          placeholder="How many times?"
                          value={newPayment.maxExecutions}
                          onChange={(e) => setNewPayment(prev => ({ ...prev, maxExecutions: e.target.value }))}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddPayment}>
                      Create Auto Payment
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-muted-foreground">
            Set up recurring expenses to be automatically processed on schedule
          </p>
        </CardHeader>
        
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No automatic payments yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first automatic payment to streamline recurring expenses
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Payment
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {payments.map((payment, index) => {
                const category = data.categories.find(cat => cat.id === payment.categoryId);
                const isOverdue = new Date(payment.nextDue) < new Date();
                
                return (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={`p-4 rounded-lg border transition-all ${
                      payment.active 
                        ? 'bg-white dark:bg-gray-800 hover:shadow-md' 
                        : 'bg-muted/50 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">
                          {getFrequencyIcon(payment.frequency)}
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold">{payment.name}</h4>
                            <Badge variant={payment.active ? 'default' : 'secondary'}>
                              {payment.active ? 'Active' : 'Paused'}
                            </Badge>
                            {isOverdue && payment.active && (
                              <Badge variant="destructive" className="animate-pulse">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Due
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                            <span>{formatCurrency(payment.amount, data.settings.defaultCurrency, [])}</span>
                            <span>•</span>
                            <span className="capitalize">{payment.frequency}</span>
                            <span>•</span>
                            <span>{category?.name || 'Unknown Category'}</span>
                            <span>•</span>
                            <span>Next: {payment.nextDue}</span>
                          </div>
                          
                          {payment.maxExecutions && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Executed {payment.timesExecuted || 0} of {payment.maxExecutions} times
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePaymentStatus(payment.id)}
                        >
                          {payment.active ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePayment(payment.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
