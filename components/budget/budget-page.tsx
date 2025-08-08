
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BudgetAllocationCard } from './budget-allocation-card';
import { CategoryLimitsCard } from './category-limits-card';
import { BudgetInsights } from './budget-insights';
import { useFinance } from '@/hooks/use-finance';
import { Loader2 } from 'lucide-react';
import { useI18n } from '@/components/i18n/i18n-provider';

export function BudgetPage() {
  const { loading, data } = useFinance();
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t('budget.loading')}</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">{t('budget.unable')}</p>
      </div>
    );
  }

  const isProMode = data.settings.mode === 'pro';

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('budget.title')}</h1>
          <p className="text-muted-foreground">
            {isProMode ? t('budget.subtitle.pro') : t('budget.subtitle.simple')}
          </p>
        </div>
      </motion.div>

      {/* Budget Allocation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div data-tour="budget.allocation">
          <BudgetAllocationCard />
        </div>
      </motion.div>

      {/* Category Limits and Insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div data-tour="budget.limits">
            <CategoryLimitsCard />
          </div>
        </motion.div>

        {isProMode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div data-tour="budget.insights">
              <BudgetInsights />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
