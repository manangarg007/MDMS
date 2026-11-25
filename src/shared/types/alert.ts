import type { ListQueryParams } from './common';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export type AlertStatus = 'pending' | 'acknowledged' | 'resolved';

/**
 * Operational alert scoped to a zone and optionally a specific meter.
 */
export interface Alert {
  id: string;
  zoneId: string;
  zoneName?: string;
  meterId?: string;
  meterNumber?: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface AlertQueryParams extends ListQueryParams {
  zoneId?: string;
  meterId?: string;
  severity?: AlertSeverity;
  status?: AlertStatus;
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
