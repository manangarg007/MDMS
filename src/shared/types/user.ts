import type { ListQueryParams } from './common';

export type UserRole = 'end-user' | 'zone' | 'enterprise';

export type UserStatus = 'active' | 'deactivated';

/**
 * System user entity (End-user consumer, Zone admin, or Enterprise admin).
 * A consumer can own one or more meters within their assigned zone.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  zoneId?: string;
  zoneName?: string;
  meterCount?: number;
  assignedMeterIds?: string[];
  status: UserStatus;
  createdAt?: string;
}

export interface UserQueryParams extends ListQueryParams {
  role?: UserRole;
  zoneId?: string;
  status?: UserStatus;
}
