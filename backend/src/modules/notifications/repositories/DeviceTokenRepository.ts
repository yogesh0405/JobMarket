import { pool } from '../../../config/database/pool';
import { logger } from '../../../utils/logger';

export interface DeviceTokenRecord {
  id: string;
  user_id: string;
  fcm_token: string;
  device_type: 'android' | 'ios';
  created_at: Date;
  updated_at: Date;
}

export class DeviceTokenRepository {
  /**
   * Upsert a user device push token
   */
  static async upsertToken(
    userId: string,
    fcmToken: string,
    deviceType: string = 'android'
  ): Promise<DeviceTokenRecord | null> {
    try {
      const query = `
        INSERT INTO user_device_tokens (user_id, fcm_token, device_type, created_at, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (fcm_token)
        DO UPDATE SET
          user_id = EXCLUDED.user_id,
          device_type = EXCLUDED.device_type,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;
      const { rows } = await pool.query(query, [userId, fcmToken, deviceType]);
      return rows[0] || null;
    } catch (error: any) {
      logger.error('Error upserting device token:', error?.message || error);
      return null;
    }
  }

  /**
   * Delete a specific device token (e.g. on user logout)
   */
  static async deleteToken(fcmToken: string, userId?: string): Promise<boolean> {
    try {
      let query = 'DELETE FROM user_device_tokens WHERE fcm_token = $1';
      const params: any[] = [fcmToken];

      if (userId) {
        query += ' AND user_id = $2';
        params.push(userId);
      }

      const result = await pool.query(query, params);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      logger.error('Error deleting device token:', error?.message || error);
      return false;
    }
  }

  /**
   * Bulk delete tokens that have become invalid or unregistered
   */
  static async deleteTokens(fcmTokens: string[]): Promise<number> {
    if (!fcmTokens || fcmTokens.length === 0) return 0;
    try {
      const query = 'DELETE FROM user_device_tokens WHERE fcm_token = ANY($1::text[])';
      const result = await pool.query(query, [fcmTokens]);
      return result.rowCount ?? 0;
    } catch (error: any) {
      logger.error('Error bulk deleting invalid device tokens:', error?.message || error);
      return 0;
    }
  }

  /**
   * Fetch all active device tokens for a given user ID
   */
  static async getTokensForUser(userId: string): Promise<string[]> {
    try {
      const query = 'SELECT fcm_token FROM user_device_tokens WHERE user_id = $1';
      const { rows } = await pool.query(query, [userId]);
      return rows.map((r: any) => r.fcm_token).filter(Boolean);
    } catch (error: any) {
      logger.error('Error getting device tokens for user:', error?.message || error);
      return [];
    }
  }

  /**
   * Fetch all active device tokens for a list of user IDs
   */
  static async getTokensForUsers(userIds: string[]): Promise<string[]> {
    if (!userIds || userIds.length === 0) return [];
    try {
      const query = 'SELECT fcm_token FROM user_device_tokens WHERE user_id = ANY($1::uuid[])';
      const { rows } = await pool.query(query, [userIds]);
      return rows.map((r: any) => r.fcm_token).filter(Boolean);
    } catch (error: any) {
      logger.error('Error getting device tokens for users:', error?.message || error);
      return [];
    }
  }
}
