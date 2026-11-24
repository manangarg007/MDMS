export type AuditLogStatus = 'success' | 'failed';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  status: AuditLogStatus;
}
