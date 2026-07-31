import { pool } from '../../../config/database/pool';
import { logger } from '../../../utils/logger';

export interface NotificationRecord {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  created_at: Date;
  updated_at: Date;
}

export class NotificationRepository {
  /**
   * Create a single in-app notification for a user
   */
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: string = 'SYSTEM',
    link?: string | null
  ): Promise<NotificationRecord> {
    try {
      const query = `
        INSERT INTO notifications (user_id, title, message, type, read, link, created_at, updated_at)
        VALUES ($1, $2, $3, $4, FALSE, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *;
      `;
      const { rows } = await pool.query(query, [userId, title, message, type, link || null]);
      return rows[0];
    } catch (error) {
      logger.error('Error creating notification in DB:', error);
      throw error;
    }
  }

  /**
   * Broadcast in-app notifications to multiple users efficiently
   */
  static async broadcastNotifications(
    userIds: string[],
    title: string,
    message: string,
    type: string = 'BROADCAST',
    link?: string | null
  ): Promise<number> {
    if (!userIds || userIds.length === 0) return 0;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let count = 0;
      // Batch insert in chunks of 100 for maximum performance
      const chunkSize = 100;
      for (let i = 0; i < userIds.length; i += chunkSize) {
        const chunk = userIds.slice(i, i + chunkSize);
        const valueRows: string[] = [];
        const params: any[] = [];
        let paramIdx = 1;

        chunk.forEach(uId => {
          valueRows.push(`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, FALSE, $${paramIdx++}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`);
          params.push(uId, title, message, type, link || null);
        });

        const insertQuery = `
          INSERT INTO notifications (user_id, title, message, type, read, link, created_at, updated_at)
          VALUES ${valueRows.join(', ')};
        `;
        const res = await client.query(insertQuery, params);
        count += res.rowCount || chunk.length;
      }

      await client.query('COMMIT');
      return count;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error broadcasting notifications to DB:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get notifications for a user sorted by newest first
   */
  static async getNotificationsForUser(userId: string, limit: number = 30): Promise<NotificationRecord[]> {
    const query = `
      SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2;
    `;
    const { rows } = await pool.query(query, [userId, limit]);
    return rows;
  }

  /**
   * Count unread notifications for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*)::int as count 
      FROM notifications
      WHERE user_id = $1 AND read = FALSE;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows[0]?.count || 0;
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(id: string, userId: string): Promise<NotificationRecord | null> {
    const query = `
      UPDATE notifications
      SET read = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [id, userId]);
    return rows[0] || null;
  }

  /**
   * Mark all unread notifications for a user as read
   */
  static async markAllAsRead(userId: string): Promise<number> {
    const query = `
      UPDATE notifications
      SET read = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND read = FALSE;
    `;
    const res = await pool.query(query, [userId]);
    return res.rowCount || 0;
  }

  /**
   * Delete a single notification
   */
  static async deleteNotification(id: string, userId: string): Promise<boolean> {
    const query = `
      DELETE FROM notifications
      WHERE id = $1 AND user_id = $2;
    `;
    const res = await pool.query(query, [id, userId]);
    return (res.rowCount || 0) > 0;
  }

  /**
   * Clear all notifications for a user
   */
  static async clearAll(userId: string): Promise<number> {
    const query = `
      DELETE FROM notifications
      WHERE user_id = $1;
    `;
    const res = await pool.query(query, [userId]);
    return res.rowCount || 0;
  }
}
