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

// In-Memory Fast LRU-style Revocation Set for sub-millisecond local gateway checks
const localRevokedSessions = new Set<string>();

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
    // Supersede previous session ONLY if from the exact same physical device (same user, same IP, and same device name)
    if (userId && ipAddress && deviceName) {
      await client.query(
        `UPDATE sessions 
         SET revoked = TRUE, revoked_at = CURRENT_TIMESTAMP 
         WHERE user_id = $1 
           AND ip_address = $2 
           AND device_name = $3
           AND revoked = FALSE;`,
        [userId, ipAddress, deviceName]
      ).catch(() => {});
    }

    const query = `
      INSERT INTO sessions (
        user_id, refresh_token_hash, expires_at, ip_address, user_agent, device_name, last_used_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING *;
    `;
    const result = await client.query(query, [
      userId, refreshTokenHash, expiresAt, ipAddress, userAgent, deviceName
    ]);
    return result.rows[0];
  }

  static async isSessionRevoked(sessionId: string): Promise<boolean> {
    if (!sessionId) return false;
    if (localRevokedSessions.has(sessionId)) return true;

    return CacheService.getOrSet(`session:revoked_state:${sessionId}`, 60, async () => {
      const query = `
        SELECT revoked, expires_at FROM sessions WHERE id = $1 LIMIT 1;
      `;
      const result = await pool.query(query, [sessionId]);
      if (result.rows.length === 0) {
        return false; // Not in DB -> do not falsely revoke valid access tokens
      }
      const isRevoked = result.rows[0].revoked === true || new Date(result.rows[0].expires_at).getTime() < Date.now();
      if (isRevoked) {
        localRevokedSessions.add(sessionId);
      }
      return isRevoked;
    });
  }

  static async findActiveSession(sessionId: string): Promise<Session | null> {
    if (localRevokedSessions.has(sessionId)) return null;

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
      WHERE user_id = $1 AND revoked = FALSE AND expires_at > CURRENT_TIMESTAMP
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
    localRevokedSessions.add(sessionId);
    const query = 'UPDATE sessions SET revoked = TRUE, revoked_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *';
    const res = await client.query(query, [sessionId]);
    
    await CacheService.invalidate(`session:active:${sessionId}`);
    await CacheService.invalidate(`session:revoked_state:${sessionId}`);

    // If session exists, also revoke any duplicates with identical IP and device_name for that user
    if (res.rows.length > 0) {
      const sess = res.rows[0];
      if (sess.user_id && sess.ip_address) {
        const clusterRes = await client.query(
          `UPDATE sessions 
           SET revoked = TRUE, revoked_at = CURRENT_TIMESTAMP 
           WHERE user_id = $1 AND ip_address = $2 AND revoked = FALSE
           RETURNING id;`,
          [sess.user_id, sess.ip_address]
        );
        for (const row of clusterRes.rows) {
          localRevokedSessions.add(row.id);
          await CacheService.invalidate(`session:active:${row.id}`);
          await CacheService.invalidate(`session:revoked_state:${row.id}`);
        }
      }
    }
  }

  static async revokeAllUserSessions(userId: string, currentSessionId?: string, client: any = pool): Promise<void> {
    let query = 'UPDATE sessions SET revoked = TRUE, revoked_at = CURRENT_TIMESTAMP WHERE user_id = $1';
    const params: any[] = [userId];

    if (currentSessionId) {
      query += ' AND id != $2';
      params.push(currentSessionId);
    }

    const res = await client.query(query + ' RETURNING id', params);
    for (const r of res.rows) {
      localRevokedSessions.add(r.id);
    }

    await CacheService.invalidatePattern('session:active:*');
    await CacheService.invalidatePattern('session:revoked_state:*');
  }

  static async findActiveByUserId(userId: string): Promise<Session[]> {
    return this.findActiveUserSessions(userId);
  }

  static async revoke(sessionId: string, client: any = pool): Promise<void> {
    return this.revokeSession(sessionId, client);
  }
}
