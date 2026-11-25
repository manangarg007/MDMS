export type ZoneStatus = 'active' | 'deactivated';

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
}
