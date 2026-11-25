import type { RoleMenuMap, RoleMeta, UserRole } from '../types';

const ROLE_STORAGE_KEY = 'mdms_active_role';

export const ROLE_META: Record<UserRole, RoleMeta> = {
  'end-user': {
    role: 'end-user',
    label: 'End-user',
    defaultPath: '/user/dashboard',
    badgeText: 'Customer Portal',
  },
  zone: {
    role: 'zone',
    label: 'Zone Admin',
    defaultPath: '/zone/dashboard',
    badgeText: 'Zone Operations',
  },
  enterprise: {
    role: 'enterprise',
    label: 'Enterprise',
    defaultPath: '/enterprise/dashboard',
    badgeText: 'Enterprise Admin',
  },
};

export const ROLE_MENU_CONFIG: RoleMenuMap = {
  'end-user': [
    { id: 'user-dashboard', label: 'Dashboard', path: '/user/dashboard', icon: 'dashboard' },
    { id: 'user-bills', label: 'Bills & Payments', path: '/user/bills', icon: 'bills' },
    { id: 'user-meter-data', label: 'Meter Data', path: '/user/meter-data', icon: 'meter-data' },
    { id: 'user-alerts', label: 'Alerts', path: '/user/alerts', icon: 'alerts' },
  ],
  zone: [
    { id: 'zone-dashboard', label: 'Dashboard', path: '/zone/dashboard', icon: 'dashboard' },
    { id: 'zone-meters', label: 'Meter Management', path: '/zone/meters', icon: 'meters' },
    { id: 'zone-users', label: 'User Management', path: '/zone/users', icon: 'users' },
    { id: 'zone-reports', label: 'Reports & Analytics', path: '/zone/reports', icon: 'reports' },
    { id: 'zone-alerts', label: 'Alerts', path: '/zone/alerts', icon: 'alerts' },
    { id: 'zone-settings', label: 'Settings', path: '/zone/settings', icon: 'settings' },
  ],
  enterprise: [
    { id: 'ent-dashboard', label: 'Dashboard', path: '/enterprise/dashboard', icon: 'dashboard' },
    { id: 'ent-zones', label: 'Zone Management', path: '/enterprise/zones', icon: 'zones' },
    { id: 'ent-meters', label: 'Meter Management', path: '/enterprise/meters', icon: 'meters' },
    { id: 'ent-users', label: 'User & Role Management', path: '/enterprise/users', icon: 'users' },
    { id: 'ent-reports', label: 'Reports & Analytics', path: '/enterprise/reports', icon: 'reports' },
    { id: 'ent-alerts', label: 'Alerts', path: '/enterprise/alerts', icon: 'alerts' },
    { id: 'ent-audit-logs', label: 'Audit Logs', path: '/enterprise/audit-logs', icon: 'audit-logs' },
    { id: 'ent-settings', label: 'Settings', path: '/enterprise/settings', icon: 'settings' },
  ],
};

export function resolveRoleFromPath(pathname: string, fallback: UserRole): UserRole {
  if (pathname.startsWith('/user')) {
    return 'end-user';
  }
  if (pathname.startsWith('/zone')) {
    return 'zone';
  }
  if (pathname.startsWith('/enterprise')) {
    return 'enterprise';
  }
  return fallback;
}

export function getStoredRole(): UserRole {
  if (typeof window === 'undefined') {
    return 'end-user';
  }
  const saved = window.localStorage.getItem(ROLE_STORAGE_KEY);
  if (saved === 'end-user' || saved === 'zone' || saved === 'enterprise') {
    return saved;
  }
  return 'end-user';
}

export function setStoredRole(role: UserRole): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(ROLE_STORAGE_KEY, role);
  }
}

export function getAlertsPathForRole(role: UserRole): string {
  if (role === 'end-user') {
    return '/user/alerts';
  }
  if (role === 'zone') {
    return '/zone/alerts';
  }
  return '/enterprise/alerts';
}
