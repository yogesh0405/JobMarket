import { pool } from '../../../config/database/pool';

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  module?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: any;
  created_at: Date;
}

export class AuditRepository {
  static async logAction(
    action: string,
    userId?: string,
    module?: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: any,
    client: any = pool
  ): Promise<void> {
    // No-op: disabled to avoid writing logs to PostgreSQL
  }
}
