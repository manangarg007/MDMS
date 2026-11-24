export type UserRole = 'end-user' | 'zone' | 'enterprise';

export type UserStatus = 'active' | 'deactivated';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  zoneId?: string;
  zoneName?: string;
  meterCount?: number;
  status: UserStatus;
}
