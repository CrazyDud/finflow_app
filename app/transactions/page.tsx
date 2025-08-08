
import { MainLayout } from '@/components/layout/main-layout';
import { TransactionsList } from '@/components/transactions/transactions-list';

export default function TransactionsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">All Transactions</h1>
          <p className="text-muted-foreground">
            Complete history of your income and expense transactions
          </p>
        </div>
        <TransactionsList />
      </div>
    </MainLayout>
  );
}
