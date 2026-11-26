import type { Bill, Meter, User, Zone } from '../../../shared/types';

export interface DashboardSummary {
  user: User;
  zone: Zone;
  meter: Meter;
  latestBill: Bill | null;
  latestPendingBill: Bill | null;
  latestPaidBill: Bill | null;
  currentConsumption: number | null;
  outstandingBalance: number;
  currentConsumptionSource: 'reading' | 'bill' | null;
}
