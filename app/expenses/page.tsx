
import { MainLayout } from '@/components/layout/main-layout';
import { ExpensesList } from '@/components/transactions/expenses-list';

export default function ExpensesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            View and manage all your expense transactions
          </p>
        </div>
        <ExpensesList />
      </div>
    </MainLayout>
  );
}
