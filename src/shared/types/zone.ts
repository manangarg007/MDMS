import type { ListQueryParams } from './common';

export type ZoneStatus = 'active' | 'deactivated';

/**
 * Distribution zone managed by a single Zone admin and monitored by Enterprise.
 */
export interface Zone {
  id: string;
  name: string;
  location: string;
  pincode: string;
  description?: string;
  adminId: string;
  adminName?: string;
  totalMeters: number;
  status: ZoneStatus;
  createdAt?: string;
}

export interface ZoneQueryParams extends ListQueryParams {
  status?: ZoneStatus;
  adminId?: string;
}
