
'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Settings, 
  User, 
  Palette, 
  Globe,
  Shield,
  Database,
  Download,
  Upload,
  Trash2,
  Moon,
  Sun,
  Monitor,
  Zap,
  CreditCard,
  Bell,
  Lock
} from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from 'next-themes';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';
import { SUPPORTED_CURRENCIES } from '@/lib/storage';

export default function SettingsPage() {
  const { data, updateSettings, exportData, importData, clearAllData } = useFinance();
  const { theme, setTheme } = useTheme();
  const [importFile, setImportFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  if (!data) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Loading settings...</h3>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleExportData = () => {
    try {
      const exportedData = exportData();
      const blob = new Blob([exportedData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finflow-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleImportData = () => {
    if (!importFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const success = importData(jsonData);
        
        if (success) {
          toast.success('Data imported successfully!');
          setImportFile(null);
        } else {
          toast.error('Invalid data format');
        }
      } catch (error) {
        toast.error('Failed to import data');
      }
    };
    reader.readAsText(importFile);
  };

  const handleClearAllData = () => {
    clearAllData();
    toast.success('All data cleared successfully!');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Customize your FinFlow experience and manage your data
            </p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            <Settings className="h-3 w-3 mr-1" />
            Personal
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger 
              value="general" 
              className="flex items-center space-x-2"
              onClick={() => setActiveTab('general')}
            >
              <User className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger 
              value="appearance" 
              className="flex items-center space-x-2"
              onClick={() => setActiveTab('appearance')}
            >
              <Palette className="h-4 w-4" />
              <span>Appearance</span>
            </TabsTrigger>
            <TabsTrigger 
              value="budget" 
              className="flex items-center space-x-2"
              onClick={() => setActiveTab('budget')}
            >
              <CreditCard className="h-4 w-4" />
              <span>Budget</span>
            </TabsTrigger>
            <TabsTrigger 
              value="data" 
              className="flex items-center space-x-2"
              onClick={() => setActiveTab('data')}
            >
              <Database className="h-4 w-4" />
              <span>Data</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select
                    value={data.settings.defaultCurrency}
                    onValueChange={(value) => updateSettings({ defaultCurrency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <div className="flex items-center space-x-2">
                            <span>{currency.symbol}</span>
                            <span>{currency.code}</span>
                            <span className="text-muted-foreground">- {currency.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>App Mode</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={data.settings.mode === 'pro'}
                        onCheckedChange={(checked) => 
                          updateSettings({ mode: checked ? 'pro' : 'simple' })
                        }
                      />
                      <span className="text-sm">
                        {data.settings.mode === 'pro' ? 'Pro Mode' : 'Simple Mode'}
                      </span>
                    </div>
                    {data.settings.mode === 'pro' && (
                      <Badge variant="default">
                        <Zap className="h-3 w-3 mr-1" />
                        Pro Features Enabled
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pro mode unlocks advanced features like analytics, categories, and detailed reporting
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('light')}
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('dark')}
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === 'system' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('system')}
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      System
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notifications</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={data.settings.notifications}
                      onCheckedChange={(checked) => 
                        updateSettings({ notifications: checked })
                      }
                    />
                    <span className="text-sm">Enable budget notifications</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Budget Allocation</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Set how you want to allocate your monthly income
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="essentials">Essentials ({data.settings.budgetAllocation.essentials}%)</Label>
                    <Input
                      id="essentials"
                      type="number"
                      min="0"
                      max="100"
                      value={data.settings.budgetAllocation.essentials}
                      onChange={(e) => updateSettings({
                        budgetAllocation: {
                          ...data.settings.budgetAllocation,
                          essentials: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fun">Fun & Entertainment ({data.settings.budgetAllocation.fun}%)</Label>
                    <Input
                      id="fun"
                      type="number"
                      min="0"
                      max="100"
                      value={data.settings.budgetAllocation.fun}
                      onChange={(e) => updateSettings({
                        budgetAllocation: {
                          ...data.settings.budgetAllocation,
                          fun: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="investments">Savings & Investments ({data.settings.budgetAllocation.investments}%)</Label>
                    <Input
                      id="investments"
                      type="number"
                      min="0"
                      max="100"
                      value={data.settings.budgetAllocation.investments}
                      onChange={(e) => updateSettings({
                        budgetAllocation: {
                          ...data.settings.budgetAllocation,
                          investments: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    Total: {data.settings.budgetAllocation.essentials + data.settings.budgetAllocation.fun + data.settings.budgetAllocation.investments}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tip: A healthy allocation is typically 50% essentials, 30% fun, 20% savings
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Auto calculate limits</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={!!data.settings.autoCalcLimits}
                        onCheckedChange={(checked) => updateSettings({ autoCalcLimits: checked })}
                      />
                      <span className="text-sm">Recalculate category limits when income or allocation changes</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Budget basis month</Label>
                    <Input
                      type="month"
                      value={data.settings.budgetBasisMonth || new Date().toISOString().slice(0,7)}
                      onChange={(e) => updateSettings({ budgetBasisMonth: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Export, import, or clear your financial data
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Export Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Download all your data as a JSON file
                      </p>
                    </div>
                    <Button onClick={handleExportData}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">Import Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Import data from a previously exported file
                      </p>
                      <Input
                        type="file"
                        accept=".json"
                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                        className="mt-2"
                      />
                    </div>
                    <Button 
                      onClick={handleImportData}
                      disabled={!importFile}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                    <div>
                      <h4 className="font-medium text-destructive">Clear All Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete all your financial data
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear Data
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all
                            your financial data, including income, expenses, categories, and settings.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleClearAllData}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Yes, clear all data
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
