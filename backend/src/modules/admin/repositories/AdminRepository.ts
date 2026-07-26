import { pool } from '../../../config/database/pool';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export class AdminRepository {
  // 1. Dashboard Statistics
  static async getStats(): Promise<any> {
    const usersCountQuery = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'candidate' THEN 1 END) as total_workers,
        COUNT(CASE WHEN role = 'employer' THEN 1 END) as total_employers,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins
      FROM users;
    `;

    const jobsCountQuery = `
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN status = 'PENDING_REVIEW' THEN 1 END) as pending_jobs,
        COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved_jobs,
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected_jobs
      FROM jobs;
    `;

    const appStatsQuery = `
      SELECT
        COUNT(CASE WHEN applied_at >= CURRENT_DATE THEN 1 END) as applications_today,
        COUNT(CASE WHEN applied_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as applications_this_month
      FROM job_applications;
    `;

    const registrationsQuery = `
      SELECT COUNT(*) as new_registrations 
      FROM users 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';
    `;

    const onlineUsersQuery = `
      SELECT COUNT(DISTINCT user_id) as online_users 
      FROM sessions 
      WHERE last_used_at >= CURRENT_TIMESTAMP - INTERVAL '15 minutes' AND revoked = FALSE;
    `;

    const companyCountQuery = `
      SELECT COUNT(DISTINCT company_name) as total_companies 
      FROM users 
      WHERE role = 'employer' AND company_name IS NOT NULL;
    `;

    const [uRes, jRes, aRes, rRes, oRes, cRes] = await Promise.all([
      pool.query(usersCountQuery),
      pool.query(jobsCountQuery),
      pool.query(appStatsQuery),
      pool.query(registrationsQuery),
      pool.query(onlineUsersQuery),
      pool.query(companyCountQuery)
    ]);

    const stats = {
      ...uRes.rows[0],
      ...jRes.rows[0],
      ...aRes.rows[0],
      ...rRes.rows[0],
      ...oRes.rows[0],
      ...cRes.rows[0]
    };

    // Format all numeric fields to integers
    Object.keys(stats).forEach(key => {
      stats[key] = parseInt(stats[key] || '0', 10);
    });

    return stats;
  }

  // Analytics Chart Data
  static async getChartsData(): Promise<any> {
    const dailyRegistrationsQuery = `
      SELECT DATE_TRUNC('day', created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '14 days'
      GROUP BY date ORDER BY date ASC;
    `;

    const dailyJobsQuery = `
      SELECT DATE_TRUNC('day', created_at) as date, COUNT(*) as count
      FROM jobs
      WHERE created_at >= CURRENT_DATE - INTERVAL '14 days'
      GROUP BY date ORDER BY date ASC;
    `;

    const dailyApplicationsQuery = `
      SELECT DATE_TRUNC('day', applied_at) as date, COUNT(*) as count
      FROM job_applications
      WHERE applied_at >= CURRENT_DATE - INTERVAL '14 days'
      GROUP BY date ORDER BY date ASC;
    `;

    const topCategoriesQuery = `
      SELECT COALESCE(NULLIF(j.trade, ''), NULLIF(j.industry, ''), 'General') as category, COUNT(*)::int as count
      FROM jobs j
      GROUP BY COALESCE(NULLIF(j.trade, ''), NULLIF(j.industry, ''), 'General') ORDER BY count DESC LIMIT 5;
    `;

    const topLocationsQuery = `
      SELECT COALESCE(NULLIF(j.midc_zone, ''), NULLIF(j.location, ''), 'Other MIDC') as location, COUNT(*)::int as count
      FROM jobs j
      GROUP BY COALESCE(NULLIF(j.midc_zone, ''), NULLIF(j.location, ''), 'Other MIDC') ORDER BY count DESC LIMIT 5;
    `;

    const [regRes, jobRes, appRes, catRes, locRes] = await Promise.all([
      pool.query(dailyRegistrationsQuery),
      pool.query(dailyJobsQuery),
      pool.query(dailyApplicationsQuery),
      pool.query(topCategoriesQuery),
      pool.query(topLocationsQuery)
    ]);

    return {
      dailyRegistrations: regRes.rows,
      dailyJobs: jobRes.rows,
      dailyApplications: appRes.rows,
      topCategories: catRes.rows,
      topLocations: locRes.rows
    };
  }

  // 2. User Management
  static async getUsers(filters: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    status?: string;
    verified?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<PaginatedResult<any>> {
    const { page, limit, search, role, status, verified, sortBy = 'created_at', sortOrder = 'DESC' } = filters;
    const offset = (page - 1) * limit;

    const queryParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (search) {
      queryParts.push(`(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex} OR company_name ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (role) {
      queryParts.push(`role = $${paramIndex}`);
      values.push(role);
      paramIndex++;
    }

    if (status) {
      queryParts.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (verified !== undefined && verified !== '') {
      const isVerified = verified === 'true';
      queryParts.push(`aadhaar_verified = $${paramIndex}`);
      values.push(isVerified);
      paramIndex++;
    }

    const whereClause = queryParts.length > 0 ? `WHERE ${queryParts.join(' AND ')}` : '';

    // Validate sorting field to avoid SQL injection
    const allowedSortFields = ['name', 'email', 'role', 'status', 'created_at'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const validSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const countQuery = `SELECT COUNT(*) FROM users ${whereClause};`;
    const countRes = await pool.query(countQuery, values);
    const total = parseInt(countRes.rows[0].count, 10);

    const dataQuery = `
      SELECT id, email, name, phone, role, status, aadhaar_verified, company_name, gst_number, profile_picture_url, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY ${validSortBy} ${validSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;

    const dataRes = await pool.query(dataQuery, [...values, limit, offset]);

    return {
      data: dataRes.rows,
      total,
      page,
      limit
    };
  }

  static async getUserDetails(userId: string): Promise<any> {
    const userQuery = 'SELECT * FROM users WHERE id = $1;';
    const userRes = await pool.query(userQuery, [userId]);
    const user = userRes.rows[0];

    if (!user) return null;

    // Fetch user's job applications
    const appsQuery = `
      SELECT ja.*, j.title as job_title, j.company as job_company
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      WHERE ja.user_id = $1
      ORDER BY ja.applied_at DESC;
    `;

    // Fetch jobs posted (if employer)
    const jobsQuery = `
      SELECT id, title, status, openings, (SELECT COUNT(*) FROM job_applications WHERE job_id = jobs.id) as applicants_count, posted_at
      FROM jobs
      WHERE employer_id = $1
      ORDER BY posted_at DESC;
    `;

    const [appsRes, jobsRes] = await Promise.all([
      pool.query(appsQuery, [userId]),
      pool.query(jobsQuery, [userId])
    ]);

    return {
      profile: user,
      applications: appsRes.rows,
      postedJobs: jobsRes.rows
    };
  }

  // 3. Job Approvals & Management
  static async getJobs(filters: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<PaginatedResult<any>> {
    const { page, limit, search, status, sortBy = 'posted_at', sortOrder = 'DESC' } = filters;
    const offset = (page - 1) * limit;

    const queryParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (search) {
      queryParts.push(`(title ILIKE $${paramIndex} OR company ILIKE $${paramIndex} OR location ILIKE $${paramIndex} OR trade ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      queryParts.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    const whereClause = queryParts.length > 0 ? `WHERE ${queryParts.join(' AND ')}` : '';

    const allowedSortFields = ['title', 'company', 'location', 'posted_at', 'status', 'salary_max'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'posted_at';
    const validSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const countQuery = `SELECT COUNT(*) FROM jobs ${whereClause};`;
    const countRes = await pool.query(countQuery, values);
    const total = parseInt(countRes.rows[0].count, 10);

    const dataQuery = `
      SELECT *, (SELECT COUNT(*) FROM job_applications WHERE job_id = jobs.id) as applicants_count
      FROM jobs
      ${whereClause}
      ORDER BY ${validSortBy} ${validSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;

    const dataRes = await pool.query(dataQuery, [...values, limit, offset]);

    return {
      data: dataRes.rows,
      total,
      page,
      limit
    };
  }

  static async getJobDetails(jobId: string): Promise<any> {
    const jobQuery = `
      SELECT j.*, u.name as employer_name, u.email as employer_email, u.phone as employer_phone
      FROM jobs j
      LEFT JOIN users u ON j.employer_id = u.id
      WHERE j.id = $1;
    `;
    const jobRes = await pool.query(jobQuery, [jobId]);
    const job = jobRes.rows[0];

    if (!job) return null;

    const appsQuery = `
      SELECT ja.*, u.name as candidate_name, u.email as candidate_email, u.phone as candidate_phone, u.resume as candidate_resume
      FROM job_applications ja
      JOIN users u ON ja.user_id = u.id
      WHERE ja.job_id = $1
      ORDER BY ja.applied_at DESC;
    `;
    const appsRes = await pool.query(appsQuery, [jobId]);

    return {
      ...job,
      applicantsList: appsRes.rows
    };
  }

  static async updateJobStatus(jobId: string, status: string, rejectReason?: string): Promise<any> {
    const query = `
      UPDATE jobs 
      SET status = $1, reject_reason = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *;
    `;
    const result = await pool.query(query, [status, rejectReason || null, jobId]);
    return result.rows[0];
  }

  // 4. Categories CRUD
  static async getCategories(): Promise<any[]> {
    const query = 'SELECT * FROM categories ORDER BY name ASC;';
    const result = await pool.query(query);
    return result.rows;
  }

  static async createCategory(name: string, icon: string): Promise<any> {
    const query = 'INSERT INTO categories (name, icon) VALUES ($1, $2) RETURNING *;';
    const result = await pool.query(query, [name, icon]);
    return result.rows[0];
  }

  static async updateCategory(id: string, name: string, icon: string, status: string): Promise<any> {
    const query = 'UPDATE categories SET name = $1, icon = $2, status = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *;';
    const result = await pool.query(query, [name, icon, status, id]);
    return result.rows[0];
  }

  static async deleteCategory(id: string): Promise<void> {
    const query = 'DELETE FROM categories WHERE id = $1;';
    await pool.query(query, [id]);
  }

  // 5. Skills CRUD
  static async getSkills(): Promise<any[]> {
    const query = 'SELECT * FROM skills ORDER BY name ASC;';
    const result = await pool.query(query);
    return result.rows;
  }

  static async createSkill(name: string): Promise<any> {
    const query = 'INSERT INTO skills (name) VALUES ($1) RETURNING *;';
    const result = await pool.query(query, [name]);
    return result.rows[0];
  }

  static async updateSkill(id: string, name: string, status: string): Promise<any> {
    const query = 'UPDATE skills SET name = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *;';
    const result = await pool.query(query, [name, status, id]);
    return result.rows[0];
  }

  static async deleteSkill(id: string): Promise<void> {
    const query = 'DELETE FROM skills WHERE id = $1;';
    await pool.query(query, [id]);
  }

  // 6. System Settings
  static async getSettings(): Promise<any> {
    const query = 'SELECT key, value FROM system_settings;';
    const result = await pool.query(query);
    const settings: Record<string, string> = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    return settings;
  }

  static async updateSetting(key: string, value: string): Promise<void> {
    const query = `
      INSERT INTO system_settings (key, value, updated_at) 
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE 
      SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP;
    `;
    await pool.query(query, [key, value]);
  }

  // 7. User Reports
  static async getReports(filters: { page: number; limit: number }): Promise<PaginatedResult<any>> {
    const { page, limit } = filters;
    const offset = (page - 1) * limit;

    const countQuery = 'SELECT COUNT(*) FROM reports;';
    const countRes = await pool.query(countQuery);
    const total = parseInt(countRes.rows[0].count, 10);

    const dataQuery = `
      SELECT r.*, 
             u1.name as reporter_name, u1.email as reporter_email,
             u2.name as reported_user_name, u2.email as reported_user_email
      FROM reports r
      LEFT JOIN users u1 ON r.reporter_id = u1.id
      LEFT JOIN users u2 ON r.reported_user_id = u2.id
      ORDER BY r.created_at DESC
      LIMIT $1 OFFSET $2;
    `;

    const dataRes = await pool.query(dataQuery, [limit, offset]);

    return {
      data: dataRes.rows,
      total,
      page,
      limit
    };
  }

  static async updateReportStatus(reportId: string, status: string, resolvedByUserId: string): Promise<any> {
    const query = `
      UPDATE reports 
      SET status = $1, resolved_at = CURRENT_TIMESTAMP, resolved_by = $2
      WHERE id = $3
      RETURNING *;
    `;
    const result = await pool.query(query, [status, resolvedByUserId, reportId]);
    return result.rows[0];
  }

  // 8. Audit Logs List
  static async getAuditLogs(filters: { page: number; limit: number; search?: string }): Promise<PaginatedResult<any>> {
    const { page, limit, search } = filters;
    const offset = (page - 1) * limit;

    const queryParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (search) {
      queryParts.push(`(al.action ILIKE $${paramIndex} OR al.module ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = queryParts.length > 0 ? `WHERE ${queryParts.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(*) 
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause};
    `;
    const countRes = await pool.query(countQuery, values);
    const total = parseInt(countRes.rows[0].count, 10);

    const dataQuery = `
      SELECT al.*, u.name as admin_name, u.email as admin_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;

    const dataRes = await pool.query(dataQuery, [...values, limit, offset]);

    return {
      data: dataRes.rows,
      total,
      page,
      limit
    };
  }
}
