
import { MainLayout } from '@/components/layout/main-layout';
import { AutomaticPayments } from '@/components/features/automatic-payments';

export default function AutomaticPaymentsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automatic Payments</h1>
          <p className="text-muted-foreground">
            Manage recurring expenses with smart automation
          </p>
        </div>
        
        <AutomaticPayments />
      </div>
    </MainLayout>
  );
}
