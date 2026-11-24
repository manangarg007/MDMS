import type { Alert, Meter, User, ZoneSettings } from '../../../shared/types';

export interface ZoneDashboardSummary {
  activeMeters: number;
  averageUsageKwh: number;
  pendingAlerts: number;
}

export type ZoneMeterRecord = Meter;
export type ZoneCustomerRecord = User;
export type ZoneAlertRecord = Alert;
export type ZoneSettingsRecord = ZoneSettings;
