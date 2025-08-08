'use client';

import { useEffect } from 'react';
import { useFinance } from '@/hooks/use-finance';
import { useToast } from '@/hooks/use-toast';

export function ClientRecalcWatcher() {
  const { data, recalcCategoryLimits } = useFinance();
  const { toast } = useToast();

  useEffect(() => {
    if (!data) return;
    const flag = typeof window !== 'undefined' ? localStorage.getItem('needs_recalc') : null;
    if (!flag) return;
    localStorage.removeItem('needs_recalc');
    if (!data.settings.autoCalcLimits) {
      toast({
        title: 'Recalculate limits?',
        description: 'Income or allocation changed. Recalculate category limits now?',
        action: (
          <button
            onClick={() => {
              const ok = recalcCategoryLimits();
              toast({ title: ok ? 'Limits updated' : 'No income for selected month' });
            }}
            className="px-2 py-1 border rounded"
          >
            Run now
          </button>
        ),
      });
    } else {
      const ok = recalcCategoryLimits();
      toast({ title: ok ? 'Category limits recalculated' : 'No income for selected month' });
    }
  }, [data, recalcCategoryLimits, toast]);

  return null;
}


