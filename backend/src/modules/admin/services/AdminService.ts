import bcrypt from 'bcrypt';
import { AdminRepository } from '../repositories/AdminRepository';
import { UserRepository } from '../../auth/repositories/UserRepository';
import { AuditRepository } from '../../auth/repositories/AuditRepository';
import { BadRequestError, NotFoundError } from '../../../errors/AppError';
import { pool } from '../../../config/database/pool';
import { SupportRepository } from '../../support/repositories/SupportRepository';
import { EmailService } from '../../auth/services/EmailService';
import { logger } from '../../../utils/logger';

export class AdminService {
  // Stats & Charts
  static async getDashboardData() {
    const stats = await AdminRepository.getStats();
    const charts = await AdminRepository.getChartsData();
    return { stats, charts };
  }

  // User CRUD & RBAC Control
  static async listUsers(filters: any) {
    return AdminRepository.getUsers(filters);
  }

  static async getUserDetails(userId: string) {
    const details = await AdminRepository.getUserDetails(userId);
    if (!details) {
      throw new NotFoundError('User not found');
    }
    return details;
  }

  static async updateUserStatus(userId: string, status: string, adminId: string, ip?: string, ua?: string) {
    if (!['ACTIVE', 'INACTIVE', 'BLOCKED'].includes(status)) {
      throw new BadRequestError('Invalid user status. Allowed: ACTIVE, INACTIVE, BLOCKED');
    }

    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await UserRepository.updateStatus(userId, status);
    await AuditRepository.logAction('USER_STATUS_UPDATED', adminId, 'Admin', ip, ua, { targetUserId: userId, status });

    return { success: true, message: `User status successfully updated to ${status}` };
  }

  static async deleteUser(userId: string, adminId: string, ip?: string, ua?: string) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    await AuditRepository.logAction('USER_DELETED', adminId, 'Admin', ip, ua, { targetUserId: userId, email: user.email });

    return { success: true, message: 'User successfully deleted' };
  }

  static async resetUserPassword(userId: string, adminId: string, ip?: string, ua?: string) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const tempPassword = 'Password123!';
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    await pool.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashedPassword, userId]);
    await AuditRepository.logAction('USER_PASSWORD_RESET', adminId, 'Admin', ip, ua, { targetUserId: userId });

    return { success: true, tempPassword, message: 'Password successfully reset' };
  }

  // Job Approvals
  static async listJobs(filters: any) {
    return AdminRepository.getJobs(filters);
  }

  static async getJobDetails(jobId: string) {
    const details = await AdminRepository.getJobDetails(jobId);
    if (!details) {
      throw new NotFoundError('Job listing not found');
    }
    return details;
  }

  static async approveJob(jobId: string, adminId: string, ip?: string, ua?: string) {
    const job = await AdminRepository.getJobDetails(jobId);
    if (!job) {
      throw new NotFoundError('Job listing not found');
    }

    const updatedJob = await AdminRepository.updateJobStatus(jobId, 'APPROVED');
    await AuditRepository.logAction('JOB_APPROVED', adminId, 'Admin', ip, ua, { jobId, title: job.title });

    return { success: true, job: updatedJob };
  }

  static async rejectJob(jobId: string, rejectReason: string, adminId: string, ip?: string, ua?: string) {
    if (!rejectReason || rejectReason.trim() === '') {
      throw new BadRequestError('A rejection reason must be provided');
    }

    const job = await AdminRepository.getJobDetails(jobId);
    if (!job) {
      throw new NotFoundError('Job listing not found');
    }

    const updatedJob = await AdminRepository.updateJobStatus(jobId, 'REJECTED', rejectReason);
    await AuditRepository.logAction('JOB_REJECTED', adminId, 'Admin', ip, ua, { jobId, title: job.title, reason: rejectReason });

    return { success: true, job: updatedJob };
  }

  static async unpublishJob(jobId: string, adminId: string, ip?: string, ua?: string) {
    const job = await AdminRepository.getJobDetails(jobId);
    if (!job) {
      throw new NotFoundError('Job listing not found');
    }

    const updatedJob = await AdminRepository.updateJobStatus(jobId, 'UNPUBLISHED');
    await AuditRepository.logAction('JOB_UNPUBLISHED', adminId, 'Admin', ip, ua, { jobId, title: job.title });

    return { success: true, job: updatedJob };
  }

  static async deleteJob(jobId: string, adminId: string, ip?: string, ua?: string) {
    const job = await AdminRepository.getJobDetails(jobId);
    if (!job) {
      throw new NotFoundError('Job listing not found');
    }

    await pool.query('DELETE FROM jobs WHERE id = $1', [jobId]);
    await AuditRepository.logAction('JOB_DELETED', adminId, 'Admin', ip, ua, { jobId, title: job.title });

    return { success: true, message: 'Job listing deleted successfully' };
  }

  // Categories CRUD
  static async listCategories() {
    return AdminRepository.getCategories();
  }

  static async createCategory(name: string, icon: string, status: string = 'ACTIVE', adminId?: string, ip?: string, ua?: string) {
    if (!name || !icon) {
      throw new BadRequestError('Category name and icon are required');
    }
    const cat = await AdminRepository.createCategory(name, icon, status);
    if (adminId) {
      await AuditRepository.logAction('CATEGORY_CREATED', adminId, 'Admin', ip, ua, { categoryId: cat.id, name, status });
    }
    return cat;
  }

  static async updateCategory(id: string, name: string, icon: string, status: string, adminId: string, ip?: string, ua?: string) {
    if (!name || !icon || !status) {
      throw new BadRequestError('Category name, icon, and status are required');
    }
    const cat = await AdminRepository.updateCategory(id, name, icon, status);
    await AuditRepository.logAction('CATEGORY_UPDATED', adminId, 'Admin', ip, ua, { categoryId: id, name, status });
    return cat;
  }

  static async deleteCategory(id: string, adminId: string, ip?: string, ua?: string) {
    await AdminRepository.deleteCategory(id);
    await AuditRepository.logAction('CATEGORY_DELETED', adminId, 'Admin', ip, ua, { categoryId: id });
    return { success: true };
  }

  // Skills CRUD
  static async listSkills() {
    return AdminRepository.getSkills();
  }

  static async createSkill(name: string, adminId: string, ip?: string, ua?: string) {
    if (!name) {
      throw new BadRequestError('Skill name is required');
    }
    const skill = await AdminRepository.createSkill(name);
    await AuditRepository.logAction('SKILL_CREATED', adminId, 'Admin', ip, ua, { skillId: skill.id, name });
    return skill;
  }

  static async updateSkill(id: string, name: string, status: string, adminId: string, ip?: string, ua?: string) {
    if (!name || !status) {
      throw new BadRequestError('Skill name and status are required');
    }
    const skill = await AdminRepository.updateSkill(id, name, status);
    await AuditRepository.logAction('SKILL_UPDATED', adminId, 'Admin', ip, ua, { skillId: id, name, status });
    return skill;
  }

  static async deleteSkill(id: string, adminId: string, ip?: string, ua?: string) {
    await AdminRepository.deleteSkill(id);
    await AuditRepository.logAction('SKILL_DELETED', adminId, 'Admin', ip, ua, { skillId: id });
    return { success: true };
  }

  static async broadcastNotifications(data: {
    targetAudience: 'ALL' | 'WORKERS' | 'EMPLOYERS' | 'CATEGORY_WORKERS';
    category?: string;
    channels: ('IN_APP' | 'EMAIL')[];
    subject: string;
    message: string;
    actionLink?: string;
  }, adminId: string, ip?: string, ua?: string) {
    const { targetAudience, category, channels, subject, message, actionLink } = data;

    if (!channels || channels.length === 0) {
      throw new BadRequestError('At least one notification channel (IN_APP or EMAIL) must be selected');
    }
    if (!subject || !subject.trim() || !message || !message.trim()) {
      throw new BadRequestError('Subject and message body are required');
    }

    let query = 'SELECT id, email, name, role, trade_specialization FROM users WHERE status != \'BLOCKED\'';
    const values: any[] = [];

    if (targetAudience === 'WORKERS') {
      query += ' AND role = \'candidate\'';
    } else if (targetAudience === 'EMPLOYERS') {
      query += ' AND role = \'employer\'';
    } else if (targetAudience === 'CATEGORY_WORKERS' && category) {
      query += ' AND role = \'candidate\' AND (LOWER(trade_specialization) = LOWER($1) OR headline ILIKE $2)';
      values.push(category, `%${category}%`);
    }

    const { rows: targetUsers } = await pool.query(query, values);

    let inAppDelivered = 0;
    let emailsSent = 0;

    // 1. Deliver In-App Notifications in Batch
    if (channels.includes('IN_APP')) {
      const userIds = targetUsers.map(u => u.id);
      inAppDelivered = await SupportRepository.broadcastNotifications(userIds, subject, message, actionLink);
    }

    // 2. Dispatch Email Broadcasts asynchronously via EmailService
    if (channels.includes('EMAIL')) {
      for (const u of targetUsers) {
        EmailService.sendBroadcastNotification(u.email, u.name || 'User', subject, message, actionLink)
          .then(success => { if (success) emailsSent++; })
          .catch(err => logger.error(`Broadcast email failed for ${u.email}:`, err));
      }
    }

    try {
      await AuditRepository.logAction('BROADCAST_SENT', adminId, 'Admin', ip, ua, {
        targetAudience,
        category,
        channels,
        totalRecipients: targetUsers.length,
        subject
      });
    } catch (auditErr) {
      logger.error('Audit logging failed for broadcast:', auditErr);
    }

    return {
      success: true,
      totalRecipients: targetUsers.length,
      inAppDelivered,
      message: `Broadcast successfully dispatched to ${targetUsers.length} users across selected channels.`
    };
  }

  // Settings
  static async getSettings() {
    return AdminRepository.getSettings();
  }

  static async updateSettings(settings: Record<string, string>, adminId: string, ip?: string, ua?: string) {
    const previousSettings = await AdminRepository.getSettings();

    for (const [key, value] of Object.entries(settings)) {
      await AdminRepository.updateSetting(key, value);
      await AuditRepository.logAction('SETTINGS_UPDATED', adminId, 'Admin', ip, ua, {
        key,
        oldValue: previousSettings[key],
        newValue: value
      });
    }

    return { success: true };
  }

  // Reports
  static async listReports(filters: any) {
    return AdminRepository.getReports(filters);
  }

  static async resolveReport(reportId: string, resolutionAction: string, adminId: string, ip?: string, ua?: string) {
    if (!['ignore', 'delete_content', 'suspend_user'].includes(resolutionAction)) {
      throw new BadRequestError('Invalid resolution action');
    }

    const reportRes = await pool.query('SELECT * FROM reports WHERE id = $1;', [reportId]);
    const report = reportRes.rows[0];

    if (!report) {
      throw new NotFoundError('Report not found');
    }

    if (resolutionAction === 'ignore') {
      await AdminRepository.updateReportStatus(reportId, 'IGNORED', adminId);
    } else {
      await clientTransaction(async (client) => {
        if (resolutionAction === 'suspend_user') {
          // Suspend reported user
          await client.query("UPDATE users SET status = 'INACTIVE' WHERE id = $1;", [report.reported_user_id]);
        } else if (resolutionAction === 'delete_content') {
          if (report.reported_content_type === 'JOB') {
            await client.query('DELETE FROM jobs WHERE id = $1;', [report.reported_content_id]);
          }
        }
        await client.query("UPDATE reports SET status = 'RESOLVED', resolved_at = CURRENT_TIMESTAMP, resolved_by = $1 WHERE id = $2;", [adminId, reportId]);
      });
    }

    await AuditRepository.logAction('REPORT_RESOLVED', adminId, 'Admin', ip, ua, { reportId, action: resolutionAction });
    return { success: true };
  }

  // Audit Logs
  static async listAuditLogs(filters: any) {
    return AdminRepository.getAuditLogs(filters);
  }
}

// Transaction Helper
async function clientTransaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
