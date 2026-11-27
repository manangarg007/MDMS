import type {
  Alert,
  ChartSeriesPoint,
  Meter,
  MeterStatus,
  SortOrder,
  TariffCategory,
  TimeRange,
  User,
  UserRole,
  UserStatus,
  Zone,
  ZoneSettings,
} from '../../../shared/types';

export interface ZoneDashboardSummary {
  activeMeters: number;
  averageUsageKwh: number;
  pendingAlerts: number;
}

export type ZoneMeterRecord = Meter;
export type ZoneCustomerRecord = User;
export type ZoneAlertRecord = Alert;
export type ZoneSettingsRecord = ZoneSettings;

export interface ZoneConsumptionSeries {
  id: string;
  scope: 'zone';
  scopeId: string;
  range: TimeRange;
  points: ChartSeriesPoint[];
}

export interface ZoneKpiSummary {
  totalMeters: number;
  activeMeters: number;
  inactiveMeters: number;
  maintenanceMeters: number;
  tamperedMeters: number;
  totalUsers: number;
  monthlyConsumptionKwh: number;
  previousMonthlyConsumptionKwh: number;
  openAlerts: number;
  pendingAlerts: number;
}

export interface ZoneDashboardOverview {
  zone: Zone;
  kpis: ZoneKpiSummary;
  consumptionTrend: ChartSeriesPoint[];
}

export interface ZoneMetersQuery {
  zoneId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  search?: string;
  status?: MeterStatus;
  tariffCategory?: TariffCategory;
}

export interface CreateZoneMeterInput {
  meterNumber: string;
  ownerId: string;
  ownerName?: string;
  zoneId: string;
  zoneName?: string;
  address?: string;
  status?: MeterStatus;
  lastReading?: number;
  installedDate: string;
  tariffCategory: TariffCategory;
}

export type UpdateZoneMeterInput = Partial<Omit<Meter, 'id'>>;

export interface ZoneUsersQuery {
  zoneId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  search?: string;
  status?: UserStatus;
  role?: UserRole;
}

export type UpdateZoneUserInput = Partial<
  Pick<User, 'name' | 'email' | 'phone' | 'status' | 'zoneId' | 'zoneName'>
>;

export interface ZoneUserDetails {
  user: User;
  meters: Meter[];
}
