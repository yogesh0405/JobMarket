import { pool } from '../../../config/database/pool';
import { CacheService } from '../../../utils/redisCache';
import { NotificationRepository } from '../../notifications/repositories/NotificationRepository';
import {
  Advertisement,
  CreateAdvertisementInput,
  UpdateAdvertisementInput,
  AdvertisementAnalytics,
  SystemNotification,
} from '../types/advertisement.types';

export class AdvertisementRepository {
  /**
   * Fetch active, approved/published non-expired advertisements for homepage carousel
   */
  static async findPublicActive(limit: number = 20): Promise<Advertisement[]> {
    const query = `
      SELECT 
        a.*,
        j.title as job_title,
        j.company as job_company,
        j.location as job_location,
        u.name as employer_name,
        u.company_name as company_name
      FROM advertisements a
      LEFT JOIN jobs j ON a.linked_job_id = j.id
      LEFT JOIN users u ON a.owner_id = u.id
      WHERE (a.status = 'APPROVED' OR a.status = 'PUBLISHED')
        AND a.approval_status = 'APPROVED'
        AND a.is_active = TRUE
        AND (a.start_date IS NULL OR a.start_date <= CURRENT_TIMESTAMP + INTERVAL '1 hour')
        AND (a.end_date IS NULL OR a.end_date >= CURRENT_TIMESTAMP)
      ORDER BY 
        CASE a.priority
          WHEN 'CRITICAL' THEN 4
          WHEN 'HIGH' THEN 3
          WHEN 'MEDIUM' THEN 2
          WHEN 'LOW' THEN 1
          ELSE 0
        END DESC,
        a.created_at DESC,
        a.end_date ASC
      LIMIT $1;
    `;
    const { rows } = await pool.query(query, [limit]);
    return rows;
  }

  /**
   * Fetch single advertisement by ID
   */
  static async findById(id: string): Promise<Advertisement | null> {
    const adQuery = `
      SELECT 
        a.*,
        COALESCE(a.rejection_reason, app.reason) as rejection_reason,
        app.reason as admin_reason,
        j.title as job_title,
        j.company as job_company,
        j.location as job_location,
        u.name as employer_name,
        u.company_name as company_name
      FROM advertisements a
      LEFT JOIN (
        SELECT DISTINCT ON (advertisement_id) advertisement_id, reason, status
        FROM advertisement_approvals
        ORDER BY advertisement_id, approved_at DESC
      ) app ON a.id = app.advertisement_id
      LEFT JOIN jobs j ON a.linked_job_id = j.id
      LEFT JOIN users u ON a.owner_id = u.id
      WHERE a.id = $1;
    `;
    const { rows } = await pool.query(adQuery, [id]);
    if (rows.length === 0) return null;
    
    const ad = rows[0];

    const viewsRes = await pool.query(`SELECT COUNT(*)::int as count FROM advertisement_views WHERE advertisement_id = $1`, [id]);
    const clicksRes = await pool.query(`SELECT COUNT(*)::int as count FROM advertisement_clicks WHERE advertisement_id = $1`, [id]);

    const views = viewsRes.rows[0]?.count || 0;
    const clicks = clicksRes.rows[0]?.count || 0;

    ad.views_count = views;
    ad.clicks_count = clicks;
    ad.ctr = views > 0 ? parseFloat(((clicks / views) * 100).toFixed(2)) : 0;
    return ad;
  }

  /**
   * Fetch all advertisements created by an employer
   */
  static async findByOwner(ownerId: string): Promise<Advertisement[]> {
    const query = `
      SELECT 
        a.*,
        COALESCE(a.rejection_reason, app.reason) as rejection_reason,
        app.reason as admin_reason,
        j.title as job_title,
        j.company as job_company,
        j.location as job_location,
        COALESCE(v.views_count, 0)::int as views_count,
        COALESCE(c.clicks_count, 0)::int as clicks_count
      FROM advertisements a
      LEFT JOIN (
        SELECT DISTINCT ON (advertisement_id) advertisement_id, reason, status
        FROM advertisement_approvals
        ORDER BY advertisement_id, approved_at DESC
      ) app ON a.id = app.advertisement_id
      LEFT JOIN jobs j ON a.linked_job_id = j.id
      LEFT JOIN (
        SELECT advertisement_id, COUNT(*) as views_count 
        FROM advertisement_views 
        GROUP BY advertisement_id
      ) v ON a.id = v.advertisement_id
      LEFT JOIN (
        SELECT advertisement_id, COUNT(*) as clicks_count 
        FROM advertisement_clicks 
        GROUP BY advertisement_id
      ) c ON a.id = c.advertisement_id
      WHERE a.owner_id = $1
      ORDER BY a.created_at DESC;
    `;
    const { rows } = await pool.query(query, [ownerId]);
    return rows.map((ad) => {
      const views = ad.views_count || 0;
      const clicks = ad.clicks_count || 0;
      return {
        ...ad,
        views_count: views,
        clicks_count: clicks,
        ctr: views > 0 ? parseFloat(((clicks / views) * 100).toFixed(2)) : 0,
      };
    });
  }

  /**
   * Fetch all advertisements for Admin Moderation
   */
  static async findAllAdmin(statusFilter?: string): Promise<Advertisement[]> {
    let query = `
      SELECT 
        a.*,
        COALESCE(a.rejection_reason, app.reason) as rejection_reason,
        app.reason as admin_reason,
        j.title as job_title,
        j.company as job_company,
        j.location as job_location,
        u.name as employer_name,
        u.email as employer_email,
        u.company_name as company_name,
        COALESCE(v.views_count, 0)::int as views_count,
        COALESCE(c.clicks_count, 0)::int as clicks_count
      FROM advertisements a
      LEFT JOIN (
        SELECT DISTINCT ON (advertisement_id) advertisement_id, reason, status
        FROM advertisement_approvals
        ORDER BY advertisement_id, approved_at DESC
      ) app ON a.id = app.advertisement_id
      LEFT JOIN jobs j ON a.linked_job_id = j.id
      LEFT JOIN users u ON a.owner_id = u.id
      LEFT JOIN (
        SELECT advertisement_id, COUNT(*) as views_count 
        FROM advertisement_views 
        GROUP BY advertisement_id
      ) v ON a.id = v.advertisement_id
      LEFT JOIN (
        SELECT advertisement_id, COUNT(*) as clicks_count 
        FROM advertisement_clicks 
        GROUP BY advertisement_id
      ) c ON a.id = c.advertisement_id
    `;

    const values: any[] = [];
    if (statusFilter && statusFilter !== 'ALL') {
      query += ` WHERE a.status = $1`;
      values.push(statusFilter);
    }

    query += ` ORDER BY a.created_at DESC;`;

    const { rows } = await pool.query(query, values);
    return rows.map((ad) => {
      const views = ad.views_count || 0;
      const clicks = ad.clicks_count || 0;
      return {
        ...ad,
        views_count: views,
        clicks_count: clicks,
        ctr: views > 0 ? parseFloat(((clicks / views) * 100).toFixed(2)) : 0,
      };
    });
  }

  /**
   * Create a new Advertisement
   */
  static async create(
    ownerId: string,
    ownerType: 'EMPLOYER' | 'ADMIN',
    data: CreateAdvertisementInput
  ): Promise<Advertisement> {
    const status = ownerType === 'ADMIN' ? (data.status || 'APPROVED') : 'PENDING_APPROVAL';
    const approvalStatus = status === 'APPROVED' || status === 'PUBLISHED' ? 'APPROVED' : 'PENDING';
    const isActive = ownerType === 'ADMIN' ? true : false;

    const rawImg = (data as any).banner_image || (data as any).bannerImage;
    const bannerImage =
      rawImg && String(rawImg).trim().length > 5
        ? String(rawImg).trim()
        : 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80';
    const adType = (data as any).advertisement_type || (data as any).advertisementType || 'FEATURED_JOB';
    const linkedJobId = (data as any).linked_job_id || (data as any).jobId || (data as any).linkedJobId || null;
    const redirectUrl = (data as any).redirect_url || (data as any).redirectUrl || null;
    const buttonText = (data as any).button_text || (data as any).buttonText || 'Apply Now';
    const priority = (data as any).priority || 'MEDIUM';
    const startDate = (data as any).start_date || (data as any).startDate || new Date().toISOString();
    const endDate = (data as any).end_date || (data as any).endDate || new Date(Date.now() + 14 * 86400000).toISOString();
    const targetAudience = (data as any).target_audience || (data as any).targetAudience || null;

    const query = `
      INSERT INTO advertisements (
        title,
        description,
        banner_image,
        advertisement_type,
        owner_type,
        owner_id,
        linked_job_id,
        redirect_url,
        button_text,
        priority,
        status,
        approval_status,
        start_date,
        end_date,
        is_active,
        target_audience
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *;
    `;

    const values = [
      data.title,
      data.description || null,
      bannerImage,
      adType,
      ownerType,
      ownerId,
      linkedJobId,
      redirectUrl,
      buttonText,
      priority,
      status,
      approvalStatus,
      startDate,
      endDate,
      isActive,
      targetAudience,
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  /**
   * Update an existing Advertisement
   */
  static async update(id: string, data: UpdateAdvertisementInput): Promise<Advertisement | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const bannerImage = (data as any).banner_image || (data as any).bannerImage;
    const adType = (data as any).advertisement_type || (data as any).advertisementType;
    const linkedJobId = (data as any).linked_job_id || (data as any).jobId || (data as any).linkedJobId;
    const redirectUrl = (data as any).redirect_url || (data as any).redirectUrl;
    const buttonText = (data as any).button_text || (data as any).buttonText;
    const startDate = (data as any).start_date || (data as any).startDate;
    const endDate = (data as any).end_date || (data as any).endDate;
    const targetAudience = (data as any).target_audience || (data as any).targetAudience;

    if (data.title !== undefined) { fields.push(`title = $${idx++}`); values.push(data.title); }
    if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description); }
    if (bannerImage !== undefined) { fields.push(`banner_image = $${idx++}`); values.push(bannerImage); }
    if (adType !== undefined) { fields.push(`advertisement_type = $${idx++}`); values.push(adType); }
    if (linkedJobId !== undefined) { fields.push(`linked_job_id = $${idx++}`); values.push(linkedJobId || null); }
    if (redirectUrl !== undefined) { fields.push(`redirect_url = $${idx++}`); values.push(redirectUrl || null); }
    if (buttonText !== undefined) { fields.push(`button_text = $${idx++}`); values.push(buttonText); }
    if (data.priority !== undefined) { fields.push(`priority = $${idx++}`); values.push(data.priority); }
    if (startDate !== undefined) { fields.push(`start_date = $${idx++}`); values.push(startDate); }
    if (endDate !== undefined) { fields.push(`end_date = $${idx++}`); values.push(endDate); }
    if (targetAudience !== undefined) { fields.push(`target_audience = $${idx++}`); values.push(targetAudience); }
    if (data.status !== undefined) { fields.push(`status = $${idx++}`); values.push(data.status); }
    if (data.is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(data.is_active); }
    const reasonVal = (data as any).rejection_reason ?? (data as any).rejectionReason ?? (data as any).reason ?? (data as any).notes;
    if (reasonVal !== undefined) { fields.push(`rejection_reason = $${idx++}`); values.push(reasonVal); }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (fields.length === 1) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE advertisements 
      SET ${fields.join(', ')} 
      WHERE id = $${idx}
      RETURNING *;
    `;

    const { rows } = await pool.query(query, values);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Moderate (Approve or Reject) Advertisement
   */
  static async updateStatus(
    id: string,
    adminId: string,
    status: 'APPROVED' | 'PUBLISHED' | 'REJECTED',
    reason?: string
  ): Promise<Advertisement | null> {
    const approvalStatus = status === 'REJECTED' ? 'REJECTED' : 'APPROVED';

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const isActive = status === 'APPROVED' || status === 'PUBLISHED';
      const updateQuery = `
        UPDATE advertisements 
        SET 
          status = $1,
          approval_status = $2,
          rejection_reason = $3,
          is_active = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *;
      `;
      const { rows } = await client.query(updateQuery, [status, approvalStatus, reason || null, isActive, id]);
      if (rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      // Log in audit table
      await client.query(
        `INSERT INTO advertisement_approvals (advertisement_id, admin_id, status, reason) VALUES ($1, $2, $3, $4)`,
        [id, adminId, status, reason || null]
      );

      await client.query('COMMIT');
      return rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete an Advertisement
   */
  static async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM advertisements WHERE id = $1;`;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Record Advertisement Click
   */
  static async recordClick(adId: string, userId?: string, ipAddress?: string): Promise<void> {
    const query = `
      INSERT INTO advertisement_clicks (advertisement_id, user_id, ip_address)
      VALUES ($1, $2, $3);
    `;
    await pool.query(query, [adId, userId || null, ipAddress || null]);
  }

  /**
   * Record Advertisement View / Impression
   */
  static async recordView(adId: string, userId?: string): Promise<void> {
    const query = `
      INSERT INTO advertisement_views (advertisement_id, user_id)
      VALUES ($1, $2);
    `;
    await pool.query(query, [adId, userId || null]);
  }

  /**
   * Get Analytics for Employer
   */
  static async getEmployerAnalytics(employerId: string): Promise<AdvertisementAnalytics> {
    return CacheService.getOrSet(`cache:ads:employer_analytics:${employerId}`, 180, async () => {
      const summaryQuery = `
        SELECT 
          COUNT(*)::int as total_advertisements,
          COUNT(CASE WHEN status IN ('APPROVED', 'PUBLISHED') AND is_active = TRUE AND CURRENT_TIMESTAMP BETWEEN start_date AND end_date THEN 1 END)::int as active_advertisements,
          COUNT(CASE WHEN status = 'PENDING_APPROVAL' THEN 1 END)::int as pending_approval,
          COUNT(CASE WHEN status = 'REJECTED' THEN 1 END)::int as rejected_advertisements
        FROM advertisements
        WHERE owner_id = $1;
      `;
      const summaryRes = await pool.query(summaryQuery, [employerId]);
      const summary = summaryRes.rows[0];

      const metricsQuery = `
        SELECT 
          COALESCE(COUNT(DISTINCT v.id), 0)::int as total_views,
          COALESCE(COUNT(DISTINCT c.id), 0)::int as total_clicks
        FROM advertisements a
        LEFT JOIN advertisement_views v ON a.id = v.advertisement_id
        LEFT JOIN advertisement_clicks c ON a.id = c.advertisement_id
        WHERE a.owner_id = $1;
      `;
      const metricsRes = await pool.query(metricsQuery, [employerId]);
      const metrics = metricsRes.rows[0];

      const views = parseInt(metrics.total_views || '0', 10);
      const clicks = parseInt(metrics.total_clicks || '0', 10);
      const avgCtr = views > 0 ? parseFloat(((clicks / views) * 100).toFixed(2)) : 0;

      const topQuery = `
        SELECT 
          a.id,
          a.title,
          a.banner_image,
          a.advertisement_type,
          COUNT(DISTINCT c.id)::int as clicks_count,
          COUNT(DISTINCT v.id)::int as views_count
        FROM advertisements a
        LEFT JOIN advertisement_clicks c ON a.id = c.advertisement_id
        LEFT JOIN advertisement_views v ON a.id = v.advertisement_id
        WHERE a.owner_id = $1
        GROUP BY a.id
        ORDER BY clicks_count DESC, views_count DESC
        LIMIT 5;
      `;
      const topRes = await pool.query(topQuery, [employerId]);
      const topClicked = topRes.rows.map((row) => {
        const v = row.views_count || 0;
        const cl = row.clicks_count || 0;
        return {
          id: row.id,
          title: row.title,
          banner_image: row.banner_image,
          advertisement_type: row.advertisement_type,
          clicks_count: cl,
          views_count: v,
          ctr: v > 0 ? parseFloat(((cl / v) * 100).toFixed(2)) : 0,
        };
      });

      return {
        total_advertisements: summary.total_advertisements || 0,
        active_advertisements: summary.active_advertisements || 0,
        pending_approval: summary.pending_approval || 0,
        rejected_advertisements: summary.rejected_advertisements || 0,
        total_views: views,
        total_clicks: clicks,
        avg_ctr: avgCtr,
        top_clicked: topClicked,
      };
    });
  }

  /**
   * Get System-Wide Analytics for Admin
   */
  static async getAdminAnalytics(): Promise<AdvertisementAnalytics> {
    return CacheService.getOrSet('cache:ads:admin_analytics', 180, async () => {
      const summaryQuery = `
        SELECT 
          COUNT(*)::int as total_advertisements,
          COUNT(CASE WHEN status IN ('APPROVED', 'PUBLISHED') AND is_active = TRUE AND CURRENT_TIMESTAMP BETWEEN start_date AND end_date THEN 1 END)::int as active_advertisements,
          COUNT(CASE WHEN status = 'PENDING_APPROVAL' THEN 1 END)::int as pending_approval,
          COUNT(CASE WHEN status = 'REJECTED' THEN 1 END)::int as rejected_advertisements
        FROM advertisements;
      `;
      const summaryRes = await pool.query(summaryQuery);
      const summary = summaryRes.rows[0];

      const metricsQuery = `
        SELECT 
          COALESCE(COUNT(DISTINCT v.id), 0)::int as total_views,
          COALESCE(COUNT(DISTINCT c.id), 0)::int as total_clicks
        FROM advertisements a
        LEFT JOIN advertisement_views v ON a.id = v.advertisement_id
        LEFT JOIN advertisement_clicks c ON a.id = c.advertisement_id;
      `;
      const metricsRes = await pool.query(metricsQuery);
      const metrics = metricsRes.rows[0];

      const views = parseInt(metrics.total_views || '0', 10);
      const clicks = parseInt(metrics.total_clicks || '0', 10);
      const avgCtr = views > 0 ? parseFloat(((clicks / views) * 100).toFixed(2)) : 0;

      const topQuery = `
        SELECT 
          a.id,
          a.title,
          a.banner_image,
          a.advertisement_type,
          COUNT(DISTINCT c.id)::int as clicks_count,
          COUNT(DISTINCT v.id)::int as views_count
        FROM advertisements a
        LEFT JOIN advertisement_clicks c ON a.id = c.advertisement_id
        LEFT JOIN advertisement_views v ON a.id = v.advertisement_id
        GROUP BY a.id
        ORDER BY clicks_count DESC, views_count DESC
        LIMIT 5;
      `;
      const topRes = await pool.query(topQuery);
      const topClicked = topRes.rows.map((row) => {
        const v = row.views_count || 0;
        const cl = row.clicks_count || 0;
        return {
          id: row.id,
          title: row.title,
          banner_image: row.banner_image,
          advertisement_type: row.advertisement_type,
          clicks_count: cl,
          views_count: v,
          ctr: v > 0 ? parseFloat(((cl / v) * 100).toFixed(2)) : 0,
        };
      });

      return {
        total_advertisements: summary.total_advertisements || 0,
        active_advertisements: summary.active_advertisements || 0,
        pending_approval: summary.pending_approval || 0,
        rejected_advertisements: summary.rejected_advertisements || 0,
        total_views: views,
        total_clicks: clicks,
        avg_ctr: avgCtr,
        top_clicked: topClicked,
      };
    });
  }

  /**
   * System Notification Helpers
   */
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: string,
    link?: string
  ): Promise<SystemNotification> {
    const rec = await NotificationRepository.createNotification(userId, title, message, type, link);
    return rec as any;
  }

  static async getUserNotifications(userId: string): Promise<SystemNotification[]> {
    const rows = await NotificationRepository.getNotificationsForUser(userId);
    return rows as any[];
  }

  static async markNotificationRead(notificationId: string, userId: string): Promise<void> {
    await NotificationRepository.markAsRead(notificationId, userId);
  }

  static async markAllNotificationsRead(userId: string): Promise<void> {
    await NotificationRepository.markAllAsRead(userId);
  }

  static async deleteNotification(notificationId: string, userId: string): Promise<void> {
    await NotificationRepository.deleteNotification(notificationId, userId);
  }
}
