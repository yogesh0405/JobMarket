import { pool } from '../../../config/database/pool';
import { CacheService } from '../../../utils/redisCache';

export interface Session {
  id: string;
  user_id: string;
  refresh_token_hash: string;
  ip_address?: string;
  user_agent?: string;
  device_name?: string;
  expires_at: Date;
  revoked: boolean;
  revoked_at?: Date;
  created_at: Date;
  updated_at: Date;
  last_used_at: Date;
}

export class SessionRepository {
  static async createSession(
    userId: string,
    refreshTokenHash: string,
    expiresAt: Date,
    ipAddress?: string,
    userAgent?: string,
    deviceName?: string,
    client: any = pool
  ): Promise<Session> {
    const query = `
      INSERT INTO sessions (
        user_id, refresh_token_hash, expires_at, ip_address, user_agent, device_name
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const result = await client.query(query, [
      userId, refreshTokenHash, expiresAt, ipAddress, userAgent, deviceName
    ]);
    return result.rows[0];
  }

  static async findActiveSession(sessionId: string): Promise<Session | null> {
    return CacheService.getOrSet(`session:active:${sessionId}`, 300, async () => {
      const query = `
        SELECT id, user_id, refresh_token_hash, ip_address, user_agent, device_name, expires_at, revoked, created_at, last_used_at 
        FROM sessions 
        WHERE id = $1 AND revoked = FALSE AND expires_at > CURRENT_TIMESTAMP;
      `;
      const result = await pool.query(query, [sessionId]);
      return result.rows[0] || null;
    });
  }

  static async findActiveUserSessions(userId: string): Promise<Session[]> {
    const query = `
      SELECT id, user_id, ip_address, user_agent, device_name, expires_at, revoked, created_at, last_used_at
      FROM sessions
      WHERE user_id = $1 AND revoked = FALSE
      ORDER BY last_used_at DESC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async updateLastUsed(sessionId: string, client: any = pool): Promise<void> {
    const query = 'UPDATE sessions SET last_used_at = CURRENT_TIMESTAMP WHERE id = $1';
    await client.query(query, [sessionId]);
    await CacheService.invalidate(`session:active:${sessionId}`);
  }

  static async revokeSession(sessionId: string, client: any = pool): Promise<void> {
    const query = 'UPDATE sessions SET revoked = TRUE, revoked_at = CURRENT_TIMESTAMP WHERE id = $1';
    await client.query(query, [sessionId]);
    await CacheService.invalidate(`session:active:${sessionId}`);
  }

  static async revokeAllUserSessions(userId: string, currentSessionId?: string, client: any = pool): Promise<void> {
    let query = 'UPDATE sessions SET revoked = TRUE, revoked_at = CURRENT_TIMESTAMP WHERE user_id = $1';
    const params: any[] = [userId];

    if (currentSessionId) {
      query += ' AND id != $2';
      params.push(currentSessionId);
    }

    await client.query(query, params);
    await CacheService.invalidatePattern('session:active:*');
  }
}
