
import { MainLayout } from '@/components/layout/main-layout';
import { IncomeList } from '@/components/transactions/income-list';

export default function IncomePage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Income</h1>
          <p className="text-muted-foreground">
            View and manage all your income transactions
          </p>
        </div>
        <IncomeList />
      </div>
    </MainLayout>
  );
}
