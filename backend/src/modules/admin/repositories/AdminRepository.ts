import { pool } from '../../../config/database/pool';
import { CacheService } from '../../../utils/redisCache';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export class AdminRepository {
  // 1. Dashboard Statistics
  static async getStats(): Promise<any> {
    return CacheService.getOrSet('cache:admin:stats', 10, async () => {
      const usersCountQuery = `
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN LOWER(TRIM(role)) IN ('candidate', 'job_seeker', 'worker') THEN 1 END) as total_workers,
          COUNT(CASE WHEN LOWER(TRIM(role)) IN ('employer', 'recruiter') THEN 1 END) as total_employers,
          COUNT(CASE WHEN LOWER(TRIM(role)) IN ('admin', 'superadmin') THEN 1 END) as total_admins
        FROM users;
      `;

      const jobsCountQuery = `
        SELECT 
          COUNT(*) as total_jobs,
          COUNT(CASE WHEN UPPER(status) IN ('PENDING_REVIEW', 'PENDING', 'PENDING_APPROVAL', 'IN_REVIEW', 'UNDER_APPROVAL', 'DRAFT') THEN 1 END) as pending_jobs,
          COUNT(CASE WHEN UPPER(status) IN ('APPROVED', 'ACTIVE') THEN 1 END) as approved_jobs,
          COUNT(CASE WHEN UPPER(status) IN ('REJECTED', 'CLOSED') THEN 1 END) as rejected_jobs,
          COUNT(CASE WHEN posted_at >= CURRENT_DATE OR created_at >= CURRENT_DATE THEN 1 END) as jobs_today
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
        WHERE LOWER(TRIM(role)) IN ('employer', 'recruiter') AND company_name IS NOT NULL;
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
    });
  }

  // Analytics Chart Data
  static async getChartsData(): Promise<any> {
    return CacheService.getOrSet('cache:admin:charts', 10, async () => {
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

      const userDistributionQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN LOWER(TRIM(role)) IN ('candidate', 'job_seeker', 'worker') THEN 1 END)::int as job_seekers,
          COUNT(CASE WHEN LOWER(TRIM(role)) IN ('employer', 'recruiter') THEN 1 END)::int as employers,
          COUNT(CASE WHEN LOWER(TRIM(role)) IN ('admin', 'superadmin') THEN 1 END)::int as admins
        FROM users;
      `;

      const growthQuery = `
        WITH days_14 AS (
          SELECT generate_series(
            DATE_TRUNC('day', CURRENT_DATE - INTERVAL '13 days'),
            DATE_TRUNC('day', CURRENT_DATE),
            '1 day'::interval
          ) as day
        ),
        days_30 AS (
          SELECT generate_series(
            DATE_TRUNC('day', CURRENT_DATE - INTERVAL '29 days'),
            DATE_TRUNC('day', CURRENT_DATE),
            '1 day'::interval
          ) as day
        )
        SELECT
          (
            SELECT json_agg(u14) FROM (
              SELECT 
                TO_CHAR(d.day, 'DD Mon') as label,
                TO_CHAR(d.day, 'YYYY-MM-DD') as date,
                COALESCE(COUNT(u.id), 0)::int as count
              FROM days_14 d
              LEFT JOIN users u ON DATE_TRUNC('day', u.created_at) = d.day
              GROUP BY d.day ORDER BY d.day ASC
            ) u14
          ) as user_growth_14d,
          (
            SELECT json_agg(j14) FROM (
              SELECT 
                TO_CHAR(d.day, 'DD Mon') as label,
                TO_CHAR(d.day, 'YYYY-MM-DD') as date,
                COALESCE(COUNT(j.id), 0)::int as posted,
                COALESCE(SUM(COALESCE(j.filled_openings, 0)), 0)::int as filled
              FROM days_14 d
              LEFT JOIN jobs j ON DATE_TRUNC('day', j.created_at) = d.day
              GROUP BY d.day ORDER BY d.day ASC
            ) j14
          ) as job_trends_14d,
          (
            SELECT json_agg(u30) FROM (
              SELECT 
                TO_CHAR(d.day, 'DD Mon') as label,
                TO_CHAR(d.day, 'YYYY-MM-DD') as date,
                COALESCE(COUNT(u.id), 0)::int as count
              FROM days_30 d
              LEFT JOIN users u ON DATE_TRUNC('day', u.created_at) = d.day
              GROUP BY d.day ORDER BY d.day ASC
            ) u30
          ) as user_growth_30d,
          (
            SELECT json_agg(j30) FROM (
              SELECT 
                TO_CHAR(d.day, 'DD Mon') as label,
                TO_CHAR(d.day, 'YYYY-MM-DD') as date,
                COALESCE(COUNT(j.id), 0)::int as posted,
                COALESCE(SUM(COALESCE(j.filled_openings, 0)), 0)::int as filled
              FROM days_30 d
              LEFT JOIN jobs j ON DATE_TRUNC('day', j.created_at) = d.day
              GROUP BY d.day ORDER BY d.day ASC
            ) j30
          ) as job_trends_30d,
          (
            SELECT json_agg(um) FROM (
              SELECT 
                TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as label,
                COUNT(*)::int as count
              FROM users
              GROUP BY DATE_TRUNC('month', created_at)
              ORDER BY DATE_TRUNC('month', created_at) ASC
            ) um
          ) as user_growth_monthly,
          (
            SELECT json_agg(jm) FROM (
              SELECT 
                TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as label,
                COUNT(*)::int as posted,
                COALESCE(SUM(COALESCE(filled_openings, 0)), 0)::int as filled
              FROM jobs
              GROUP BY DATE_TRUNC('month', created_at)
              ORDER BY DATE_TRUNC('month', created_at) ASC
            ) jm
          ) as job_trends_monthly;
      `;

      const [regRes, jobRes, appRes, catRes, locRes, uDistRes, growthRes] = await Promise.all([
        pool.query(dailyRegistrationsQuery),
        pool.query(dailyJobsQuery),
        pool.query(dailyApplicationsQuery),
        pool.query(topCategoriesQuery),
        pool.query(topLocationsQuery),
        pool.query(userDistributionQuery),
        pool.query(growthQuery)
      ]);

      const uDist = uDistRes.rows[0] || {};
      const totalU = parseInt(uDist.total || '0', 10);
      const jsCount = parseInt(uDist.job_seekers || '0', 10);
      const empCount = parseInt(uDist.employers || '0', 10);
      const admCount = parseInt(uDist.admins || '0', 10);

      const calcPct = (c: number) => totalU > 0 ? Number(((c / totalU) * 100).toFixed(1)) : 0;

      const userDistribution = [
        {
          key: 'job_seekers',
          label: 'Job Seekers (Candidates)',
          count: jsCount,
          percentage: calcPct(jsCount),
          color: '#0EA5E9'
        },
        {
          key: 'employers',
          label: 'Employers',
          count: empCount,
          percentage: calcPct(empCount),
          color: '#8B5CF6'
        },
        {
          key: 'admins',
          label: 'Admins (System)',
          count: admCount,
          percentage: calcPct(admCount),
          color: '#64748B'
        }
      ];

      const gRow = growthRes.rows[0] || {};

      return {
        dailyRegistrations: regRes.rows,
        dailyJobs: jobRes.rows,
        dailyApplications: appRes.rows,
        topCategories: catRes.rows,
        topLocations: locRes.rows,
        userDistribution,
        userDistributionTotal: totalU,
        userGrowth14d: gRow.user_growth_14d || [],
        jobTrends14d: gRow.job_trends_14d || [],
        userGrowth30d: gRow.user_growth_30d || [],
        jobTrends30d: gRow.job_trends_30d || [],
        userGrowthMonthly: gRow.user_growth_monthly || [],
        jobTrendsMonthly: gRow.job_trends_monthly || []
      };
    });
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
    const safePage = isNaN(Number(page)) || Number(page) < 1 ? 1 : Math.floor(Number(page));
    const safeLimit = isNaN(Number(limit)) || Number(limit) < 1 ? 10 : Math.floor(Number(limit));
    const offset = (safePage - 1) * safeLimit;

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

    const dataRes = await pool.query(dataQuery, [...values, safeLimit, offset]);

    return {
      data: dataRes.rows,
      total,
      page: safePage,
      limit: safeLimit
    };
  }

  static async getUserDetails(userId: string): Promise<any> {
    const userQuery = 'SELECT id, email, name, phone, role, status, company_name, gst_number, aadhaar_verified, trade_specialization, headline, location, skills, preferred_shift, requires_bus, requires_accommodation, resume, experience, education, profile_picture_url, created_at, updated_at FROM users WHERE id = $1;';
    const userRes = await pool.query(userQuery, [userId]);
    const user = userRes.rows[0];

    if (!user) return null;

    const compIdentifier = (user.company_name || user.name || '').trim();

    // 1. Fetch company information
    let company: any = {};
    try {
      const companyQuery = `
        SELECT * FROM companies 
        WHERE (employer_id = $1) 
           OR ($2 != '' AND LOWER(name) = LOWER($2))
        LIMIT 1;
      `;
      const compRes = await pool.query(companyQuery, [userId, compIdentifier]);
      if (compRes.rows.length > 0) {
        company = compRes.rows[0];
      }
    } catch (err) {
      // Table fallback
    }

    // 2. Applications submitted by user
    const appsQuery = `
      SELECT ja.id, ja.job_id, ja.user_id, ja.status, ja.applied_at, ja.updated_at,
             ja.interview_date, ja.interview_time, ja.venue_address, ja.maps_link,
             ja.reject_reason, ja.interview_rating, ja.interview_feedback, ja.interview_status,
             j.title as job_title, j.company as job_company, j.location as job_location,
             j.salary_min, j.salary_max, j.job_type, j.status as job_status
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      WHERE ja.user_id = $1
      ORDER BY ja.applied_at DESC;
    `;

    // 3. Jobs posted (if employer)
    const jobsQuery = `
      SELECT id, title, company, status, openings, salary_min, salary_max, location, industry, midc_zone, 
             (SELECT COUNT(*) FROM job_applications WHERE job_id = jobs.id) as applicants_count, 
             posted_at
      FROM jobs
      WHERE (employer_id = $1) 
         OR ($2 != '' AND LOWER(company) = LOWER($2))
      ORDER BY posted_at DESC;
    `;

    // 4. Saved jobs by user
    const savedQuery = `
      SELECT sj.id as saved_id, sj.created_at as saved_at,
             j.id as job_id, j.title, j.company, j.location, j.job_type, j.work_mode,
             j.salary_min, j.salary_max, j.status as job_status, j.industry, j.midc_zone,
             j.posted_at
      FROM saved_jobs sj
      LEFT JOIN jobs j ON (sj.job_id = j.id OR sj.job_id::text = j.id::text)
      WHERE sj.user_id = $1
      ORDER BY sj.created_at DESC;
    `;

    // 5. Support tickets
    const ticketsQuery = `
      SELECT st.id, st.ticket_number, st.full_name, st.email, st.phone, st.category,
             st.subject, st.description, st.attachment, st.preferred_contact,
             st.priority::text as priority, st.status::text as status,
             st.created_at, st.updated_at, st.last_reply_at,
             (SELECT COUNT(*) FROM support_messages sm WHERE sm.ticket_id = st.id) as message_count
      FROM support_tickets st
      WHERE st.user_id = $1 OR (st.email = $2 AND $2 != '')
      ORDER BY st.created_at DESC;
    `;

    // 6. Audit logs
    const auditQuery = `
      SELECT al.id, al.action, al.module, al.ip_address, al.user_agent, al.metadata, al.created_at
      FROM audit_logs al
      WHERE al.user_id = $1
         OR (al.metadata->>'targetUserId' = $1::text)
         OR (al.metadata->>'userId' = $1::text)
      ORDER BY al.created_at DESC
      LIMIT 100;
    `;

    // 7. Active / recent sessions
    const sessionsQuery = `
      SELECT id, ip_address, user_agent, device_name, expires_at, revoked, created_at, last_used_at
      FROM sessions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 20;
    `;

    // 8. Employer received applications (if employer)
    const employerAppsQuery = `
      SELECT ja.id, ja.status, ja.applied_at, ja.updated_at,
             ja.interview_date, ja.interview_time, ja.venue_address, ja.maps_link,
             ja.reject_reason, ja.interview_rating, ja.interview_feedback, ja.interview_status,
             j.title as job_title, j.company as job_company,
             u.id as applicant_id, u.name as applicant_name, u.email as applicant_email,
             u.phone as applicant_phone, u.profile_picture_url as applicant_avatar
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      JOIN users u ON ja.user_id = u.id
      WHERE j.employer_id = $1
      ORDER BY ja.applied_at DESC
      LIMIT 50;
    `;

    const [appsRes, jobsRes, savedRes, ticketsRes, auditRes, sessionsRes, empAppsRes] = await Promise.all([
      pool.query(appsQuery, [userId]).catch(() => ({ rows: [] })),
      pool.query(jobsQuery, [userId, compIdentifier]).catch(() => ({ rows: [] })),
      pool.query(savedQuery, [userId]).catch(() => ({ rows: [] })),
      pool.query(ticketsQuery, [userId, user.email || '']).catch(() => ({ rows: [] })),
      pool.query(auditQuery, [userId]).catch(() => ({ rows: [] })),
      pool.query(sessionsQuery, [userId]).catch(() => ({ rows: [] })),
      pool.query(employerAppsQuery, [userId]).catch(() => ({ rows: [] }))
    ]);

    // Unified chronological activity stream construction
    const rawActivities: any[] = [];

    // Map audit logs (excluding login, logout, and auth session activities)
    auditRes.rows.forEach(r => {
      const actUpper = (r.action || '').toUpperCase();
      if (actUpper.includes('LOGIN') || actUpper.includes('LOGOUT') || actUpper.includes('SESSION')) {
        return; // Exclude login/logout/session auth events per requirement
      }

      let title = r.action ? r.action.replace(/_/g, ' ') : 'System Action';
      let type = 'AUDIT';
      if (actUpper.includes('PASSWORD')) { 
        type = 'SECURITY'; 
        title = 'Password Reset Processed'; 
      } else if (actUpper.includes('STATUS')) { 
        type = 'ADMIN_ACTION'; 
        title = `Account Status Changed to ${r.metadata?.status || 'Updated'}`; 
      } else if (actUpper.includes('JOB')) { 
        type = 'JOB'; 
        title = r.action.replace(/_/g, ' '); 
      } else if (actUpper.includes('REPORT')) {
        type = 'REPORT';
        title = 'Report Handled';
      }

      rawActivities.push({
        id: `audit-${r.id}`,
        type,
        action: r.action,
        module: r.module || 'System',
        title,
        description: r.metadata ? (typeof r.metadata === 'object' ? JSON.stringify(r.metadata) : String(r.metadata)) : (r.user_agent || 'Platform interaction'),
        ipAddress: r.ip_address,
        userAgent: r.user_agent,
        timestamp: r.created_at,
        status: r.action?.includes('FAILED') || r.action?.includes('BLOCKED') ? 'error' : 'success'
      });
    });

    // Map applications submitted
    appsRes.rows.forEach(a => {
      rawActivities.push({
        id: `app-act-${a.id}`,
        type: 'APPLICATION',
        action: 'JOB_APPLICATION',
        module: 'Applications',
        title: `Applied for ${a.job_title || 'Job Position'}`,
        description: `At ${a.job_company || 'Employer'} • Status: ${(a.status || 'applied').toUpperCase()}`,
        timestamp: a.applied_at || a.updated_at,
        status: a.status === 'shortlisted' || a.status === 'hired' ? 'success' : a.status === 'rejected' ? 'error' : 'info',
        metadata: { jobId: a.job_id, status: a.status }
      });
    });

    // Map saved jobs
    savedRes.rows.forEach(s => {
      rawActivities.push({
        id: `saved-act-${s.saved_id}`,
        type: 'SAVED_JOB',
        action: 'JOB_SAVED',
        module: 'Bookmarks',
        title: `Saved Job: ${s.title || 'Job Listing'}`,
        description: `${s.company || 'Company'} • Location: ${s.location || 'N/A'}`,
        timestamp: s.saved_at,
        status: 'info',
        metadata: { jobId: s.job_id }
      });
    });

    // Map support tickets
    ticketsRes.rows.forEach(t => {
      rawActivities.push({
        id: `ticket-act-${t.id}`,
        type: 'SUPPORT',
        action: 'TICKET_CREATED',
        module: 'Support',
        title: `Support Ticket #${t.ticket_number}: ${t.subject}`,
        description: `Category: ${t.category} • Priority: ${(t.priority || 'medium').toUpperCase()} • Status: ${(t.status || 'open').toUpperCase()}`,
        timestamp: t.created_at,
        status: t.status === 'resolved' || t.status === 'closed' ? 'success' : 'warning',
        metadata: { ticketId: t.id, ticketNumber: t.ticket_number }
      });
    });

    // Account creation milestone
    if (user.created_at) {
      rawActivities.push({
        id: `reg-${user.id}`,
        type: 'ACCOUNT',
        action: 'USER_REGISTERED',
        module: 'Auth',
        title: 'User Registered on JobMarket',
        description: `Account created with role: ${(user.role || 'candidate').toUpperCase()}`,
        timestamp: user.created_at,
        status: 'success'
      });
    }

    // Sort descending by timestamp
    rawActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Deduplicate identical action & timestamp
    const activities: any[] = [];
    const seenKeys = new Set<string>();
    for (const act of rawActivities) {
      const key = `${act.action}-${new Date(act.timestamp).getTime()}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        activities.push(act);
      }
    }

    const enrichedProfile = {
      ...user,
      company_name: user.company_name || company.name || user.name,
      company_logo: user.profile_picture_url || company.logo,
      company_description: company.description || user.headline,
      company_type: company.company_type || 'Private Limited',
      industry: company.industry || user.trade_specialization || 'Manufacturing & Industrial',
      website: company.website,
      address: company.address,
      location: company.address || company.city || user.location,
      city: company.city,
      company_size: company.company_size,
      founded_year: company.founded_year,
      midc_zone: company.midc_zone,
      gst_number: user.gst_number || company.gst_number
    };

    return {
      profile: enrichedProfile,
      applications: appsRes.rows,
      receivedApplications: empAppsRes.rows,
      savedJobs: savedRes.rows,
      supportTickets: ticketsRes.rows,
      activities,
      postedJobs: jobsRes.rows,
      jobs: jobsRes.rows,
      stats: {
        applicationsCount: appsRes.rows.length,
        receivedApplicationsCount: empAppsRes.rows.length,
        savedJobsCount: savedRes.rows.length,
        supportTicketsCount: ticketsRes.rows.length,
        activityCount: activities.length,
        postedJobsCount: jobsRes.rows.length
      }
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
    const safePage = isNaN(Number(page)) || Number(page) < 1 ? 1 : Math.floor(Number(page));
    const safeLimit = isNaN(Number(limit)) || Number(limit) < 1 ? 10 : Math.floor(Number(limit));
    const offset = (safePage - 1) * safeLimit;

    const queryParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (search) {
      queryParts.push(`(j.title ILIKE $${paramIndex} OR j.company ILIKE $${paramIndex} OR j.location ILIKE $${paramIndex} OR j.trade ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (status && status.toUpperCase() !== 'ALL') {
      const s = status.toUpperCase();
      if (s === 'PENDING_REVIEW' || s === 'PENDING' || s === 'PENDING_APPROVAL') {
        queryParts.push(`UPPER(j.status) IN ('PENDING_REVIEW', 'PENDING', 'PENDING_APPROVAL', 'IN_REVIEW', 'UNDER_APPROVAL', 'DRAFT')`);
      } else if (s === 'APPROVED' || s === 'ACTIVE') {
        queryParts.push(`UPPER(j.status) IN ('APPROVED', 'ACTIVE')`);
      } else if (s === 'REJECTED' || s === 'CLOSED') {
        queryParts.push(`UPPER(j.status) IN ('REJECTED', 'CLOSED')`);
      } else {
        queryParts.push(`UPPER(j.status) = $${paramIndex}`);
        values.push(s);
        paramIndex++;
      }
    }

    const whereClause = queryParts.length > 0 ? `WHERE ${queryParts.join(' AND ')}` : '';

    const allowedSortFields = ['title', 'company', 'location', 'posted_at', 'status', 'salary_max', 'created_at'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'posted_at';
    const validSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const countQuery = `SELECT COUNT(*) FROM jobs j LEFT JOIN users u ON j.employer_id = u.id ${whereClause};`;
    const countRes = await pool.query(countQuery, values);
    const total = parseInt(countRes.rows[0].count, 10);

    const dataQuery = `
      SELECT j.id, j.employer_id, j.company, j.company_logo, j.company_color, j.title, j.industry, j.location,
             j.job_type, j.work_mode, j.min_experience, j.max_experience, j.salary_min, j.salary_max,
             j.openings, j.filled_openings, j.featured, j.status, j.posted_at, j.created_at, j.overtime, j.trade, j.midc_zone,
             j.description, j.responsibilities, j.requirements, j.reject_reason,
             u.name as employer_name, u.email as employer_email, u.phone as employer_phone, u.company_name as user_company_name,
             (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id) as applicants_count
      FROM jobs j
      LEFT JOIN users u ON j.employer_id = u.id
      ${whereClause}
      ORDER BY j.${validSortBy} ${validSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;

    const dataRes = await pool.query(dataQuery, [...values, safeLimit, offset]);

    return {
      data: dataRes.rows,
      total,
      page: safePage,
      limit: safeLimit
    };
  }

  static async getJobStats(): Promise<any> {
    return CacheService.getOrSet('cache:admin:job_stats', 5, async () => {
      const q = `
        SELECT 
          COUNT(*) as total_jobs,
          COUNT(CASE WHEN UPPER(status) IN ('PENDING_REVIEW', 'PENDING', 'PENDING_APPROVAL', 'IN_REVIEW', 'UNDER_APPROVAL', 'DRAFT') THEN 1 END)::int as pending,
          COUNT(CASE WHEN UPPER(status) IN ('APPROVED', 'ACTIVE') THEN 1 END)::int as approved,
          COUNT(CASE WHEN UPPER(status) IN ('REJECTED', 'CLOSED') THEN 1 END)::int as rejected,
          COUNT(CASE WHEN posted_at >= CURRENT_DATE OR created_at >= CURRENT_DATE THEN 1 END)::int as today
        FROM jobs;
      `;
      const res = await pool.query(q);
      const row = res.rows[0] || {};
      return {
        total: parseInt(row.total_jobs || '0', 10),
        pending: parseInt(row.pending || '0', 10),
        approved: parseInt(row.approved || '0', 10),
        rejected: parseInt(row.rejected || '0', 10),
        today: parseInt(row.today || '0', 10)
      };
    });
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
    await CacheService.invalidatePattern('cache:jobs:*');
    await CacheService.invalidate('cache:admin:stats');
    return result.rows[0];
  }

  // 4. Categories CRUD
  static async getCategories(): Promise<any[]> {
    return CacheService.getOrSet('cache:categories:all', 600, async () => {
      const query = 'SELECT * FROM categories ORDER BY name ASC;';
      const result = await pool.query(query);
      return result.rows;
    });
  }

  static async createCategory(name: string, icon: string, status: string = 'ACTIVE'): Promise<any> {
    const query = `
      INSERT INTO categories (name, icon, status) 
      VALUES ($1, $2, $3) 
      ON CONFLICT (name) DO UPDATE SET status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP 
      RETURNING *;
    `;
    const result = await pool.query(query, [name, icon, status]);
    await CacheService.invalidate('cache:categories:all');
    return result.rows[0];
  }

  static async updateCategory(id: string, name: string, icon: string, status: string): Promise<any> {
    const query = 'UPDATE categories SET name = $1, icon = $2, status = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *;';
    const result = await pool.query(query, [name, icon, status, id]);
    await CacheService.invalidate('cache:categories:all');
    return result.rows[0];
  }

  static async deleteCategory(id: string): Promise<void> {
    const query = 'DELETE FROM categories WHERE id = $1;';
    await pool.query(query, [id]);
    await CacheService.invalidate('cache:categories:all');
  }

  // 5. Skills CRUD
  static async getSkills(): Promise<any[]> {
    return CacheService.getOrSet('cache:skills:all', 600, async () => {
      const query = 'SELECT * FROM skills ORDER BY name ASC;';
      const result = await pool.query(query);
      return result.rows;
    });
  }

  static async createSkill(name: string): Promise<any> {
    const query = 'INSERT INTO skills (name) VALUES ($1) RETURNING *;';
    const result = await pool.query(query, [name]);
    await CacheService.invalidate('cache:skills:all');
    return result.rows[0];
  }

  static async updateSkill(id: string, name: string, status: string): Promise<any> {
    const query = 'UPDATE skills SET name = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *;';
    const result = await pool.query(query, [name, status, id]);
    await CacheService.invalidate('cache:skills:all');
    return result.rows[0];
  }

  static async deleteSkill(id: string): Promise<void> {
    const query = 'DELETE FROM skills WHERE id = $1;';
    await pool.query(query, [id]);
    await CacheService.invalidate('cache:skills:all');
  }

  // 6. System Settings
  static async getSettings(): Promise<any> {
    return CacheService.getOrSet('cache:system:settings', 600, async () => {
      const query = 'SELECT key, value FROM system_settings;';
      const result = await pool.query(query);
      const settings: Record<string, string> = {
        platform_name: 'JobMarket',
        job_approval_toggle: 'true',
        maintenance_mode: 'false'
      };
      result.rows.forEach(row => {
        settings[row.key] = row.value;
      });
      return settings;
    });
  }

  static async updateSetting(key: string, value: string): Promise<void> {
    const query = `
      INSERT INTO system_settings (key, value, updated_at) 
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE 
      SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP;
    `;
    await pool.query(query, [key, value]);
    await CacheService.invalidate('cache:system:settings');
  }

  // 7. User Reports
  static async getReports(filters: { page: number; limit: number }): Promise<PaginatedResult<any>> {
    const { page, limit } = filters;
    const safePage = isNaN(Number(page)) || Number(page) < 1 ? 1 : Math.floor(Number(page));
    const safeLimit = isNaN(Number(limit)) || Number(limit) < 1 ? 10 : Math.floor(Number(limit));
    const offset = (safePage - 1) * safeLimit;

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

    const dataRes = await pool.query(dataQuery, [safeLimit, offset]);

    return {
      data: dataRes.rows,
      total,
      page: safePage,
      limit: safeLimit
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
    const safePage = isNaN(Number(page)) || Number(page) < 1 ? 1 : Math.floor(Number(page));
    const safeLimit = isNaN(Number(limit)) || Number(limit) < 1 ? 10 : Math.floor(Number(limit));
    const offset = (safePage - 1) * safeLimit;

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

    const dataRes = await pool.query(dataQuery, [...values, safeLimit, offset]);

    return {
      data: dataRes.rows,
      total,
      page: safePage,
      limit: safeLimit
    };
  }
}
