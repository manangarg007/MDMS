export type BillStatus = 'pending' | 'paid' | 'overdue';

export interface Bill {
  id: string;
  userId: string;
  meterId: string;
  month: string;
  units: number;
  amount: number;
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
