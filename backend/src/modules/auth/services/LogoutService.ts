import { pool } from '../../../config/database/pool';
import { SessionRepository } from '../repositories/SessionRepository';
import { AuditRepository } from '../repositories/AuditRepository';
import { logger } from '../../../utils/logger';

export class LogoutService {
  static async execute(sessionId: string, userId: string, ipAddress?: string, userAgent?: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      await SessionRepository.revokeSession(sessionId, client);
      
      await AuditRepository.logAction(
        'USER_LOGOUT',
        userId,
        'Auth',
        ipAddress,
        userAgent,
        { sessionId },
        client
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Logout failed', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async logoutAll(userId: string, currentSessionId?: string, ipAddress?: string, userAgent?: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      await SessionRepository.revokeAllUserSessions(userId, currentSessionId, client);
      
      await AuditRepository.logAction(
        'USER_LOGOUT_ALL',
        userId,
        'Auth',
        ipAddress,
        userAgent,
        { exceptSessionId: currentSessionId },
        client
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Logout All failed', error);
      throw error;
    } finally {
      client.release();
    }
  }
}
