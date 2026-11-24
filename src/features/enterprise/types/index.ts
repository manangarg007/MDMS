import type {
  Alert,
  AuditLog,
  EnterpriseSettings,
  Meter,
  User,
  Zone,
} from '../../../shared/types';

export interface EnterpriseDashboardSummary {
  totalZones: number;
  totalMeters: number;
  criticalAlerts: number;
}

export type EnterpriseZoneRecord = Zone;
export type EnterpriseMeterRecord = Meter;
export type EnterpriseUserRecord = User;
export type EnterpriseAlertRecord = Alert;
export type EnterpriseAuditLogRecord = AuditLog;
export type EnterpriseSettingsRecord = EnterpriseSettings;
