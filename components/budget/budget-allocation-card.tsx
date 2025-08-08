
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Target, Settings, Save, RotateCcw } from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';
import { useToast } from '@/hooks/use-toast';

export function BudgetAllocationCard() {
  const { data, updateSettings } = useFinance();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [allocation, setAllocation] = useState({
    essentials: data?.settings.budgetAllocation.essentials || 50,
    investments: data?.settings.budgetAllocation.investments || 20,
    fun: data?.settings.budgetAllocation.fun || 30,
  });

  if (!data) return null;

  const handleSave = () => {
    const total = allocation.essentials + allocation.investments + allocation.fun;
    
    if (total !== 100) {
      toast({
        title: 'Invalid allocation',
        description: 'Total allocation must equal 100%',
        variant: 'destructive',
      });
      return;
    }

    updateSettings({
      budgetAllocation: allocation,
      customAllocation: true,
    });

    toast({
      title: 'Budget updated',
      description: 'Your budget allocation has been saved successfully',
    });

    setIsEditing(false);
  };

  const handleReset = () => {
    const defaultAllocation = { essentials: 50, investments: 20, fun: 30 };
    setAllocation(defaultAllocation);
    updateSettings({
      budgetAllocation: defaultAllocation,
      customAllocation: false,
    });
  };

  const handleToggleCustom = (enabled: boolean) => {
    updateSettings({ customAllocation: enabled });
    if (!enabled) {
      handleReset();
      setIsEditing(false);
    }
  };

  const total = allocation.essentials + allocation.investments + allocation.fun;
  const isValidTotal = total === 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Budget Allocation</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Label htmlFor="custom-allocation" className="text-sm">
              Custom
            </Label>
            <Switch
              id="custom-allocation"
              checked={data.settings.customAllocation}
              onCheckedChange={handleToggleCustom}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Allocation Display */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Essentials</Label>
              <Badge variant="secondary">{data.settings.budgetAllocation.essentials}%</Badge>
            </div>
            <Progress value={data.settings.budgetAllocation.essentials} className="h-2" />
            <p className="text-xs text-muted-foreground">Bills, groceries, utilities</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Investments</Label>
              <Badge variant="secondary">{data.settings.budgetAllocation.investments}%</Badge>
            </div>
            <Progress value={data.settings.budgetAllocation.investments} className="h-2" />
            <p className="text-xs text-muted-foreground">Savings, investments</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Fun Money</Label>
              <Badge variant="secondary">{data.settings.budgetAllocation.fun}%</Badge>
            </div>
            <Progress value={data.settings.budgetAllocation.fun} className="h-2" />
            <p className="text-xs text-muted-foreground">Entertainment, hobbies</p>
          </div>
        </div>

        {/* Calculated Allocation based on current month income */}
        <div className="grid gap-4 md:grid-cols-3">
          {(['essentials','investments','fun'] as const).map((key) => {
            const pct = data.settings.budgetAllocation[key];
            const month = new Date().toISOString().slice(0,7);
            const monthIncome = data.income
              .filter(inc => inc.date.startsWith(month))
              .reduce((sum, inc) => sum + inc.amount, 0);
            const allocated = Math.round((monthIncome * pct) / 100);
            return (
              <div key={key} className="text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground capitalize">{key} allocation</span>
                  <span className="font-medium">{allocated.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Edit Mode */}
        {data.settings.customAllocation && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Customize Allocation</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Settings className="h-4 w-4 mr-1" />
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </div>

            {isEditing && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="essentials">Essentials (%)</Label>
                    <Input
                      id="essentials"
                      type="number"
                      min="0"
                      max="100"
                      value={allocation.essentials}
                      onChange={(e) => setAllocation(prev => ({ 
                        ...prev, 
                        essentials: parseInt(e.target.value) || 0 
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="investments">Investments (%)</Label>
                    <Input
                      id="investments"
                      type="number"
                      min="0"
                      max="100"
                      value={allocation.investments}
                      onChange={(e) => setAllocation(prev => ({ 
                        ...prev, 
                        investments: parseInt(e.target.value) || 0 
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fun">Fun Money (%)</Label>
                    <Input
                      id="fun"
                      type="number"
                      min="0"
                      max="100"
                      value={allocation.fun}
                      onChange={(e) => setAllocation(prev => ({ 
                        ...prev, 
                        fun: parseInt(e.target.value) || 0 
                      }))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Total:</span>
                    <Badge variant={isValidTotal ? "default" : "destructive"}>
                      {total}%
                    </Badge>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={!isValidTotal}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
