
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Wallet, Search, Plus } from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

export function IncomeList() {
  const { data, currencyRates } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading income...</div>
        </CardContent>
      </Card>
    );
  }

  // Filter income
  const filteredIncome = data.income
    .filter(income => 
      income.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search income..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Income List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="h-5 w-5" />
              <span>Income ({filteredIncome.length})</span>
            </CardTitle>
            <Link href="/add?type=income">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Income
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {filteredIncome.length > 0 ? (
            <div className="space-y-3">
              {filteredIncome.map((income) => (
                <div
                  key={income.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
                      €
                    </div>
                    
                    <div>
                      <p className="font-medium">
                        {income.description || 'Income'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(income.date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      +{formatCurrency(income.amount, income.currency, currencyRates)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {income.currency}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No income matches your search' : 'No income recorded yet'}
              </p>
              <Link href="/add?type=income">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Income
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
