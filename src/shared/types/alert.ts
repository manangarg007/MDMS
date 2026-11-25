export type AlertSeverity = 'critical' | 'warning' | 'info';

export type AlertStatus = 'pending' | 'acknowledged' | 'resolved';

export interface Alert {
  id: string;
  zoneId: string;
  zoneName?: string;
  meterId?: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: string;
}

export type NotificationType =
  | 'bill_generated'
  | 'payment_due'
  | 'payment_received'
  | 'high_consumption'
  | 'maintenance';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}
