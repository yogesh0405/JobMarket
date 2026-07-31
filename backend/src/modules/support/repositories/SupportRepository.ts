import { pool } from '../../../config/database/pool';
import { logger } from '../../../utils/logger';
import { CacheService } from '../../../utils/redisCache';
import { NotificationRepository } from '../../notifications/repositories/NotificationRepository';

export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  category: string;
  subject: string;
  description: string;
  attachment: string | null;
  preferred_contact: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'waiting_for_user' | 'resolved' | 'closed';
  assigned_admin: string | null;
  created_at: Date;
  updated_at: Date;
  last_reply_at: Date;
  ip_address: string | null;
  browser: string | null;
  device: string | null;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string | null;
  message: string;
  attachment: string | null;
  seen: boolean;
  created_at: Date;
  sender_name?: string;
  sender_role?: string;
}

export interface InAppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: Date;
}

export class SupportRepository {
  static async generateTicketNumber(client: any = pool): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `SUP-${year}-`;
    
    // Fetch latest ticket number for current year
    const result = await client.query(
      `SELECT ticket_number FROM support_tickets WHERE ticket_number LIKE $1 ORDER BY ticket_number DESC LIMIT 1`,
      [`${prefix}%`]
    );

    let nextSeq = 1;
    if (result.rows.length > 0) {
      const latestNum = result.rows[0].ticket_number;
      const parts = latestNum.split('-');
      if (parts.length === 3) {
        const seqPart = parseInt(parts[2], 10);
        if (!isNaN(seqPart)) {
          nextSeq = seqPart + 1;
        }
      }
    }
    
    const seqStr = String(nextSeq).padStart(6, '0');
    return `${prefix}${seqStr}`;
  }

  static async createTicket(ticket: Omit<SupportTicket, 'id' | 'ticket_number' | 'created_at' | 'updated_at' | 'last_reply_at'>): Promise<SupportTicket> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const ticketNumber = await this.generateTicketNumber(client);
      
      const query = `
        INSERT INTO support_tickets (
          ticket_number, user_id, full_name, email, phone, category, subject, description, 
          attachment, preferred_contact, priority, status, assigned_admin, ip_address, browser, device
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *;
      `;
      
      const values = [
        ticketNumber, ticket.user_id, ticket.full_name, ticket.email, ticket.phone, ticket.category,
        ticket.subject, ticket.description, ticket.attachment, ticket.preferred_contact,
        ticket.priority, ticket.status, ticket.assigned_admin, ticket.ip_address, ticket.browser, ticket.device
      ];
      
      const result = await client.query(query, values);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to create support ticket in DB:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id: string): Promise<SupportTicket | null> {
    const query = `SELECT * FROM support_tickets WHERE id = $1;`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByUserId(userId: string): Promise<SupportTicket[]> {
    const query = `SELECT * FROM support_tickets WHERE user_id = $1 ORDER BY last_reply_at DESC;`;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async findAllForAdmin(filters: {
    status?: string;
    priority?: string;
    category?: string;
    assignedAdmin?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ tickets: SupportTicket[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(filters.status);
    }
    if (filters.priority) {
      conditions.push(`priority = $${paramIndex++}`);
      values.push(filters.priority);
    }
    if (filters.category) {
      conditions.push(`category = $${paramIndex++}`);
      values.push(filters.category);
    }
    if (filters.assignedAdmin) {
      if (filters.assignedAdmin === 'unassigned') {
        conditions.push(`assigned_admin IS NULL`);
      } else {
        conditions.push(`assigned_admin = $${paramIndex++}`);
        values.push(filters.assignedAdmin);
      }
    }
    if (filters.search) {
      conditions.push(`(ticket_number ILIKE $${paramIndex} OR full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR subject ILIKE $${paramIndex})`);
      values.push(`%${filters.search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Count total query
    const countQuery = `SELECT COUNT(*) FROM support_tickets ${whereClause};`;
    const countRes = await pool.query(countQuery, values);
    const total = parseInt(countRes.rows[0].count, 10);

    // Limit and Offset
    const limit = filters.limit || 10;
    const offset = filters.offset || 0;
    
    const selectQuery = `
      SELECT * FROM support_tickets 
      ${whereClause} 
      ORDER BY last_reply_at DESC 
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;
    const selectValues = [...values, limit, offset];
    
    const result = await pool.query(selectQuery, selectValues);
    return { tickets: result.rows, total };
  }

  static async updateTicket(id: string, updates: Partial<SupportTicket>): Promise<SupportTicket | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) return this.findById(id);

    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `
      UPDATE support_tickets 
      SET ${fields.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *;
    `;
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async createMessage(message: Omit<SupportMessage, 'id' | 'created_at' | 'seen'>): Promise<SupportMessage> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const query = `
        INSERT INTO support_messages (ticket_id, sender_id, message, attachment)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      const result = await client.query(query, [message.ticket_id, message.sender_id, message.message, message.attachment]);
      
      // Update last_reply_at on ticket
      await client.query(
        `UPDATE support_tickets SET last_reply_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [message.ticket_id]
      );
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to create support message in DB:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async findMessagesByTicketId(ticketId: string): Promise<SupportMessage[]> {
    const query = `
      SELECT m.*, u.name as sender_name, u.role as sender_role
      FROM support_messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.ticket_id = $1
      ORDER BY m.created_at ASC;
    `;
    const result = await pool.query(query, [ticketId]);
    return result.rows;
  }

  static async markMessagesAsSeen(ticketId: string, currentUserId: string): Promise<void> {
    const query = `
      UPDATE support_messages 
      SET seen = TRUE 
      WHERE ticket_id = $1 AND sender_id != $2 AND seen = FALSE;
    `;
    await pool.query(query, [ticketId, currentUserId]);
  }

  static async createNotification(notification: Omit<InAppNotification, 'id' | 'created_at' | 'is_read'>): Promise<InAppNotification> {
    const rec = await NotificationRepository.createNotification(
      notification.user_id,
      notification.title,
      notification.message,
      'SUPPORT',
      notification.link
    );
    return {
      id: rec.id,
      user_id: rec.user_id,
      title: rec.title,
      message: rec.message,
      is_read: rec.read,
      link: rec.link || null,
      created_at: rec.created_at
    };
  }

  static async broadcastNotifications(userIds: string[], title: string, message: string, link?: string): Promise<number> {
    return NotificationRepository.broadcastNotifications(userIds, title, message, 'BROADCAST', link);
  }

  static async findNotificationsByUserId(userId: string): Promise<InAppNotification[]> {
    const rows = await NotificationRepository.getNotificationsForUser(userId);
    return rows.map(rec => ({
      id: rec.id,
      user_id: rec.user_id,
      title: rec.title,
      message: rec.message,
      is_read: rec.read,
      link: rec.link || null,
      created_at: rec.created_at
    }));
  }

  static async markNotificationAsRead(id: string, userId: string): Promise<InAppNotification | null> {
    const rec = await NotificationRepository.markAsRead(id, userId);
    if (!rec) return null;
    return {
      id: rec.id,
      user_id: rec.user_id,
      title: rec.title,
      message: rec.message,
      is_read: rec.read,
      link: rec.link || null,
      created_at: rec.created_at
    };
  }

  static async deleteTicket(id: string): Promise<boolean> {
    const query = `DELETE FROM support_tickets WHERE id = $1;`;
    const result = await pool.query(query, [id]);
    await CacheService.invalidate('cache:support:analytics');
    return (result.rowCount ?? 0) > 0;
  }

  static async getAnalytics(client: any = pool): Promise<any> {
    return CacheService.getOrSet('cache:support:analytics', 180, async () => {
      const totalQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
          COUNT(CASE WHEN status = 'waiting_for_user' THEN 1 END) as waiting_for_user,
          COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
          COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed,
          COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today
        FROM support_tickets;
      `;
      
      const weeklyQuery = `
        SELECT COUNT(*) as weekly_count FROM support_tickets WHERE created_at >= NOW() - INTERVAL '7 days';
      `;

      const monthlyQuery = `
        SELECT COUNT(*) as monthly_count FROM support_tickets WHERE created_at >= NOW() - INTERVAL '30 days';
      `;

      const categoriesQuery = `
        SELECT category, COUNT(*) as count 
        FROM support_tickets 
        GROUP BY category 
        ORDER BY count DESC;
      `;

      const totalResult = await client.query(totalQuery);
      const weeklyResult = await client.query(weeklyQuery);
      const monthlyResult = await client.query(monthlyQuery);
      const categoriesResult = await client.query(categoriesQuery);

      const stats = totalResult.rows[0];
      const weekly = weeklyResult.rows[0]?.weekly_count || 0;
      const monthly = monthlyResult.rows[0]?.monthly_count || 0;
      const categories = categoriesResult.rows;

      // Calculate resolution rate
      const totalTickets = parseInt(stats.total, 10);
      const resolvedClosedTickets = parseInt(stats.resolved, 10) + parseInt(stats.closed, 10);
      const resolutionRate = totalTickets > 0 ? ((resolvedClosedTickets / totalTickets) * 100).toFixed(1) : '100';

      return {
        total: totalTickets,
        open: parseInt(stats.open, 10),
        in_progress: parseInt(stats.in_progress, 10),
        waiting_for_user: parseInt(stats.waiting_for_user, 10),
        resolved: parseInt(stats.resolved, 10),
        closed: parseInt(stats.closed, 10),
        today: parseInt(stats.today, 10),
        weekly: parseInt(weekly, 10),
        monthly: parseInt(monthly, 10),
        resolutionRate: parseFloat(resolutionRate),
        categories
      };
    });
  }
}
