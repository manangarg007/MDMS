import type { ListQueryParams } from './common';

export type BillStatus = 'pending' | 'paid' | 'overdue';

/**
 * Monthly electricity bill generated for a customer's meter.
 */
export interface Bill {
  id: string;
  userId: string;
  userName?: string;
  meterId: string;
  meterNumber?: string;
  month: string;
  units: number;
  amount: number;
  generatedDate?: string;
  dueDate: string;
  paidDate?: string;
  status: BillStatus;
}

export interface BillDay {
  id: string;
  billId: string;
  date: string;
  reading: number;
  consumption: number;
  cost: number;
}

export interface BillQueryParams extends ListQueryParams {
  userId?: string;
  meterId?: string;
  status?: BillStatus;
  month?: string;
}
