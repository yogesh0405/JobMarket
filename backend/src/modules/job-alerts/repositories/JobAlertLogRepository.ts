import { pool } from '../../../config/database/pool';
import { CandidateProfile, JobListing } from '../services/ProfileJobMatcher';

export interface JobAlertRecord {
  id: string;
  userId: string;
  jobId: string;
  matchScore: number;
  matchReasons: string[];
  channel: string;
  status: string;
  sentAt: string;
}

export class JobAlertLogRepository {
  /**
   * Fast targeted query to find candidates matching role keywords, trade or region
   */
  static async findCandidatePoolForJob(job: JobListing): Promise<CandidateProfile[]> {
    const tradeTerm = (job.trade || job.iti_trade || job.itiTrade || '').trim();
    const titleTerm = (job.title || '').trim();
    const midcTerm = (job.midc_zone || job.midcZone || '').trim();
    const locTerm = (job.location || '').trim();

    // Extract search keywords for SQL pre-filtering
    const tradeKeywords = [tradeTerm, titleTerm]
      .join(' ')
      .split(/[\s,/-]+/)
      .map((k) => k.trim())
      .filter((k) => k.length > 2 && !['and', 'the', 'for', 'with', 'male', 'female', 'need'].includes(k.toLowerCase()))
      .slice(0, 8);

    const patterns = tradeKeywords.map((k) => `%${k}%`);
    const locPattern = midcTerm ? `%${midcTerm}%` : locTerm ? `%${locTerm.split(',')[0].trim()}%` : '%';

    let query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.phone, 
        u.trade_specialization, 
        u.skills, 
        u.location, 
        u.headline, 
        u.experience, 
        u.education, 
        u.preferred_shift
      FROM users u
      WHERE LOWER(u.role) = 'candidate'
        AND COALESCE(u.status, 'ACTIVE') != 'SUSPENDED'
    `;

    const params: any[] = [];

    if (patterns.length > 0) {
      params.push(patterns);
      params.push(locPattern);
      query += `
        AND (
          u.trade_specialization ILIKE ANY($1)
          OR u.headline ILIKE ANY($1)
          OR u.location ILIKE $2
          OR u.trade_specialization IS NULL
        )
      `;
    }

    query += ` ORDER BY u.created_at DESC LIMIT 500`;

    try {
      const { rows } = await pool.query(query, params);
      return rows;
    } catch (err) {
      const fallbackQuery = `
        SELECT id, name, email, phone, trade_specialization, skills, location, headline, experience, education, preferred_shift
        FROM users
        WHERE LOWER(role) = 'candidate' AND COALESCE(status, 'ACTIVE') != 'SUSPENDED'
        LIMIT 250
      `;
      const { rows } = await pool.query(fallbackQuery);
      return rows;
    }
  }

  /**
   * Anti-Spam Check: Has this user already received a notification for this job?
   */
  static async hasUserBeenAlerted(userId: string, jobId: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM job_alert_logs 
      WHERE user_id = $1 AND job_id = $2 
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [userId, jobId]);
    return rows.length > 0;
  }

  /**
   * Frequency Capping: Count notifications sent to this candidate in the last 24 hours
   */
  static async getDailyAlertCount(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*)::int AS count 
      FROM job_alert_logs 
      WHERE user_id = $1 
        AND sent_at >= NOW() - INTERVAL '24 hours'
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows[0]?.count || 0;
  }

  /**
   * Log an alert dispatch
   */
  static async logAlert(
    userId: string,
    jobId: string,
    matchScore: number,
    matchReasons: string[],
    channel: string = 'PUSH',
    status: string = 'SENT'
  ): Promise<void> {
    const query = `
      INSERT INTO job_alert_logs (user_id, job_id, match_score, match_reasons, channel, status, sent_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (user_id, job_id) 
      DO UPDATE SET 
        match_score = EXCLUDED.match_score,
        sent_at = NOW(),
        status = EXCLUDED.status
    `;
    await pool.query(query, [userId, jobId, matchScore, JSON.stringify(matchReasons), channel, status]);
  }

  /**
   * Fetch recent job match alerts for candidate's personalized dashboard
   */
  static async getUserAlertHistory(userId: string, limit: number = 20): Promise<any[]> {
    const query = `
      SELECT 
        l.id AS alert_id,
        l.match_score,
        l.match_reasons,
        l.sent_at,
        j.id AS job_id,
        j.title,
        j.company,
        j.company_logo,
        j.location,
        j.midc_zone,
        j.trade,
        j.salary_min,
        j.salary_max,
        j.min_experience,
        j.max_experience,
        j.job_type,
        j.status AS job_status,
        j.posted_at
      FROM job_alert_logs l
      JOIN jobs j ON l.job_id = j.id
      WHERE l.user_id = $1
      ORDER BY l.sent_at DESC
      LIMIT $2
    `;
    const { rows } = await pool.query(query, [userId, limit]);
    return rows;
  }

  /**
   * Metrics for recruiter / admin on alert reach
   */
  static async getJobAlertMetrics(jobId: string): Promise<any> {
    const query = `
      SELECT 
        COUNT(*)::int AS total_notified,
        ROUND(AVG(match_score)) AS avg_match_score,
        COUNT(CASE WHEN match_score >= 75 THEN 1 END)::int AS top_matches_count,
        MIN(sent_at) AS first_alert_at,
        MAX(sent_at) AS last_alert_at
      FROM job_alert_logs
      WHERE job_id = $1
    `;
    const { rows } = await pool.query(query, [jobId]);
    return rows[0] || { total_notified: 0, avg_match_score: 0, top_matches_count: 0 };
  }
}
