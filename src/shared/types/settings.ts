export interface ZoneSettings {
  id: string;
  zoneId: string;
  highConsumptionThreshold: number;
  lowConsumptionThreshold: number;
  abnormalFrequencyMinutes: number;
  inactiveMeterHours: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export interface EnterpriseSettings {
  id: string;
  dataRetentionDays: number;
  autoLogoutMinutes: number;
  auditLogRetentionDays: number;
  timezone: string;
  defaultLanguage: string;
  currency: string;
  defaultEmailNotifications: boolean;
  defaultSmsNotifications: boolean;
}
