import type { UserRole } from './user';

export type NavIconName =
  | 'dashboard'
  | 'bills'
  | 'meter-data'
  | 'alerts'
  | 'meters'
  | 'users'
  | 'reports'
  | 'settings'
  | 'zones'
  | 'audit-logs';

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: NavIconName;
}

export type RoleMenuMap = Record<UserRole, MenuItem[]>;

export interface RoleMeta {
  role: UserRole;
  label: string;
  defaultPath: string;
  badgeText: string;
}
