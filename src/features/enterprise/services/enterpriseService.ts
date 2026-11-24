import http from '../../../services/http';
import type { Alert, AuditLog, Zone } from '../../../shared/types';

export async function getEnterpriseZones(): Promise<Zone[]> {
  const response = await http.get<Zone[]>('/zones');
  return response.data;
}

export async function getEnterpriseAlerts(): Promise<Alert[]> {
  const response = await http.get<Alert[]>('/alerts');
  return response.data;
}

export async function getEnterpriseAuditLogs(): Promise<AuditLog[]> {
  const response = await http.get<AuditLog[]>('/auditLogs');
  return response.data;
}
