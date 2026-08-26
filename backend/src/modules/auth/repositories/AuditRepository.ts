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
    try {
      const query = `
        INSERT INTO audit_logs (user_id, action, module, ip_address, user_agent, metadata, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP);
      `;
      const metaJson = metadata ? JSON.stringify(metadata) : null;
      await client.query(query, [
        userId || null,
        action,
        module || null,
        ipAddress || null,
        userAgent ? userAgent.substring(0, 500) : null,
        metaJson
      ]);
    } catch (err) {
      console.warn('Failed to insert audit log:', err);
    }
  }
}
