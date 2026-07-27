import { pool } from '../../../config/database/pool';

export interface JobData {
  title: string;
  industry: string;
  location: string;
  description: string;
  openings: number;
  minExperience: number;
  maxExperience: number;
  salaryMin: number;
  salaryMax: number;
  jobType: string;
  workMode: string;
  perks: string[];
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  trade?: string;
  midcZone?: string;
  shiftDetails?: string;
  overtime?: boolean;
  accommodation?: boolean;
  busFacility?: boolean;
  canteen?: boolean;
  joiningBonus?: boolean;
  attendanceBonus?: boolean;
  contractDuration?: string;
  walkInDate?: string;
  interviewAddress?: string;
  companyLogo?: string;
  companyColor?: string;
  filledOpenings?: number;
  status?: string;
}

export class JobRepository {
  private static mapDbJobToApi(row: any): any {
    return {
      id: row.id,
      employerId: row.employer_id,
      company: row.company,
      companyLogo: row.company_logo,
      companyColor: row.company_color,
      title: row.title,
      industry: row.industry,
      location: row.location,
      jobType: row.job_type,
      workMode: row.work_mode,
      minExperience: row.min_experience,
      maxExperience: row.max_experience,
      salaryMin: row.salary_min,
      salaryMax: row.salary_max,
      openings: row.openings,
      filledOpenings: row.filled_openings || 0,
      minAge: row.min_age,
      maxAge: row.max_age,
      gender: row.gender,
      description: row.description,
      responsibilities: typeof row.responsibilities === 'string' ? JSON.parse(row.responsibilities) : (row.responsibilities || []),
      requirements: typeof row.requirements === 'string' ? JSON.parse(row.requirements) : (row.requirements || []),
      skills: typeof row.skills === 'string' ? JSON.parse(row.skills) : (row.skills || []),
      perks: typeof row.perks === 'string' ? JSON.parse(row.perks) : (row.perks || []),
      featured: row.featured,
      status: row.status === 'APPROVED' ? 'active' : 'closed',
      dbStatus: row.status,
      rejectReason: row.reject_reason,
      views: row.views || 0,
      postedAt: row.posted_at ? new Date(row.posted_at).toISOString() : new Date().toISOString(),
      midcZone: row.midc_zone,
      shiftDetails: row.shift_details,
      overtime: row.overtime,
      accommodation: row.accommodation,
      busFacility: row.bus_facility,
      canteen: row.canteen,
      joiningBonus: row.joining_bonus,
      attendanceBonus: row.attendance_bonus,
      contractDuration: row.contract_duration,
      walkInDate: row.walk_in_date,
      interviewAddress: row.interview_address,
      trade: row.trade,
      applicants: row.applicants || []
    };
  }

  static async getJobs(): Promise<any[]> {
    // Return all approved jobs
    const query = `
      SELECT * FROM jobs 
      WHERE status = 'APPROVED'
      ORDER BY posted_at DESC
    `;
    const result = await pool.query(query);
    return result.rows.map(this.mapDbJobToApi);
  }

  static async getJobById(id: string): Promise<any | null> {
    const query = 'SELECT * FROM jobs WHERE id = $1';
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return null;
    return this.mapDbJobToApi(result.rows[0]);
  }

  static async getJobsByEmployer(employerId: string): Promise<any[]> {
    const query = `
      SELECT 
        j.*,
        COALESCE(
          json_agg(
            json_build_object(
              'userId', ja.user_id,
              'name', u.name,
              'email', u.email,
              'phone', u.phone,
              'appliedAt', ja.applied_at,
              'status', ja.status,
              'resume', u.resume,
              'tradeSpecialization', u.trade_specialization,
              'location', u.location,
              'headline', u.headline,
              'skills', u.skills,
              'preferredShift', u.preferred_shift,
              'requiresBus', u.requires_bus,
              'requiresAccommodation', u.requires_accommodation,
              'experience', u.experience,
              'education', u.education,
              'profilePictureUrl', u.profile_picture_url,
              'aadhaarVerified', u.aadhaar_verified,
              'createdAt', u.created_at
            )
          ) FILTER (WHERE ja.user_id IS NOT NULL), '[]'
        ) as applicants
      FROM jobs j
      LEFT JOIN job_applications ja ON j.id = ja.job_id
      LEFT JOIN users u ON ja.user_id = u.id
      WHERE j.employer_id = $1
      GROUP BY j.id
      ORDER BY j.posted_at DESC
    `;
    const result = await pool.query(query, [employerId]);
    return result.rows.map((row: any) => this.mapDbJobToApi(row));
  }

  static async createJob(employerId: string, company: string, jobData: JobData): Promise<any> {
    const companyColor = jobData.companyColor || '#344BFD';
    const query = `
      INSERT INTO jobs (
        employer_id, company, company_logo, company_color, title, industry, location, 
        job_type, work_mode, min_experience, max_experience, salary_min, salary_max, 
        openings, description, responsibilities, requirements, skills, perks, 
        trade, midc_zone, shift_details, overtime, accommodation, bus_facility, 
        canteen, joining_bonus, attendance_bonus, contract_duration, walk_in_date, 
        interview_address, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, 
        $8, $9, $10, $11, $12, $13, 
        $14, $15, $16, $17, $18, $19, 
        $20, $21, $22, $23, $24, $25, 
        $26, $27, $28, $29, $30, 
        $31, 'PENDING_REVIEW'
      ) RETURNING *
    `;

    const values = [
      employerId,
      company,
      jobData.companyLogo || null,
      companyColor,
      jobData.title,
      jobData.industry,
      jobData.location,
      jobData.jobType,
      jobData.workMode,
      jobData.minExperience,
      jobData.maxExperience,
      jobData.salaryMin,
      jobData.salaryMax,
      jobData.openings,
      jobData.description,
      JSON.stringify(jobData.responsibilities),
      JSON.stringify(jobData.requirements),
      JSON.stringify(jobData.skills),
      JSON.stringify(jobData.perks),
      jobData.trade || null,
      jobData.midcZone || null,
      jobData.shiftDetails || null,
      jobData.overtime || false,
      jobData.accommodation || false,
      jobData.busFacility || false,
      jobData.canteen || false,
      jobData.joiningBonus || false,
      jobData.attendanceBonus || false,
      jobData.contractDuration || null,
      jobData.walkInDate || null,
      jobData.interviewAddress || null
    ];

    // Auto-register custom category under PENDING_REVIEW status for admin moderation queue
    if (jobData.industry) {
      try {
        await pool.query(
          `INSERT INTO categories (name, icon, status) 
           VALUES ($1, '💼', 'PENDING_REVIEW') 
           ON CONFLICT (name) DO NOTHING;`,
          [jobData.industry]
        );
      } catch (catErr) {
        console.warn('Custom category auto-registration notice:', catErr);
      }
    }

    const result = await pool.query(query, values);
    return this.mapDbJobToApi(result.rows[0]);
  }

  static async updateJob(jobId: string, employerId: string, jobData: Partial<JobData>): Promise<any> {
    // Verify ownership
    const checkQuery = 'SELECT * FROM jobs WHERE id = $1 AND employer_id = $2';
    const checkResult = await pool.query(checkQuery, [jobId, employerId]);
    if (checkResult.rows.length === 0) {
      throw new Error('Job not found or unauthorized');
    }

    const currentJob = checkResult.rows[0];

    const query = `
      UPDATE jobs SET
        title = COALESCE($1, title),
        industry = COALESCE($2, industry),
        location = COALESCE($3, location),
        description = COALESCE($4, description),
        openings = COALESCE($5, openings),
        min_experience = COALESCE($6, min_experience),
        max_experience = COALESCE($7, max_experience),
        salary_min = COALESCE($8, salary_min),
        salary_max = COALESCE($9, salary_max),
        job_type = COALESCE($10, job_type),
        work_mode = COALESCE($11, work_mode),
        perks = COALESCE($12, perks),
        responsibilities = COALESCE($13, responsibilities),
        requirements = COALESCE($14, requirements),
        skills = COALESCE($15, skills),
        trade = COALESCE($16, trade),
        midc_zone = COALESCE($17, midc_zone),
        shift_details = COALESCE($18, shift_details),
        overtime = COALESCE($19, overtime),
        accommodation = COALESCE($20, accommodation),
        bus_facility = COALESCE($21, bus_facility),
        canteen = COALESCE($22, canteen),
        joining_bonus = COALESCE($23, joining_bonus),
        attendance_bonus = COALESCE($24, attendance_bonus),
        contract_duration = COALESCE($25, contract_duration),
        walk_in_date = COALESCE($26, walk_in_date),
        interview_address = COALESCE($27, interview_address),
        company_logo = COALESCE($28, company_logo),
        filled_openings = COALESCE($29, filled_openings),
        status = COALESCE($30, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $31 AND employer_id = $32
      RETURNING *
    `;

    const values = [
      jobData.title || null,
      jobData.industry || null,
      jobData.location || null,
      jobData.description || null,
      jobData.openings !== undefined ? jobData.openings : null,
      jobData.minExperience !== undefined ? jobData.minExperience : null,
      jobData.maxExperience !== undefined ? jobData.maxExperience : null,
      jobData.salaryMin !== undefined ? jobData.salaryMin : null,
      jobData.salaryMax !== undefined ? jobData.salaryMax : null,
      jobData.jobType || null,
      jobData.workMode || null,
      jobData.perks ? JSON.stringify(jobData.perks) : null,
      jobData.responsibilities ? JSON.stringify(jobData.responsibilities) : null,
      jobData.requirements ? JSON.stringify(jobData.requirements) : null,
      jobData.skills ? JSON.stringify(jobData.skills) : null,
      jobData.trade !== undefined ? jobData.trade : null,
      jobData.midcZone !== undefined ? jobData.midcZone : null,
      jobData.shiftDetails !== undefined ? jobData.shiftDetails : null,
      jobData.overtime !== undefined ? jobData.overtime : null,
      jobData.accommodation !== undefined ? jobData.accommodation : null,
      jobData.busFacility !== undefined ? jobData.busFacility : null,
      jobData.canteen !== undefined ? jobData.canteen : null,
      jobData.joiningBonus !== undefined ? jobData.joiningBonus : null,
      jobData.attendanceBonus !== undefined ? jobData.attendanceBonus : null,
      jobData.contractDuration !== undefined ? jobData.contractDuration : null,
      jobData.walkInDate !== undefined ? jobData.walkInDate : null,
      jobData.interviewAddress !== undefined ? jobData.interviewAddress : null,
      jobData.companyLogo !== undefined ? jobData.companyLogo : null,
      jobData.filledOpenings !== undefined ? jobData.filledOpenings : null,
      jobData.status !== undefined ? (jobData.status === 'active' ? 'APPROVED' : 'CLOSED') : null,
      jobId,
      employerId
    ];

    const result = await pool.query(query, values);
    return this.mapDbJobToApi(result.rows[0]);
  }

  static async deleteJob(jobId: string, employerId: string): Promise<boolean> {
    const query = 'DELETE FROM jobs WHERE id = $1 AND employer_id = $2';
    const result = await pool.query(query, [jobId, employerId]);
    return (result.rowCount ?? 0) > 0;
  }

  static async applyToJob(jobId: string, userId: string): Promise<any> {
    const query = `
      INSERT INTO job_applications (job_id, user_id, status)
      VALUES ($1, $2, 'applied')
      ON CONFLICT (job_id, user_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await pool.query(query, [jobId, userId]);
    return result.rows[0];
  }

  static async getApplicantsForJob(jobId: string, employerId: string): Promise<any[]> {
    // Verify job belongs to employer
    const checkQuery = 'SELECT id FROM jobs WHERE id = $1 AND employer_id = $2';
    const checkResult = await pool.query(checkQuery, [jobId, employerId]);
    if (checkResult.rows.length === 0) {
      throw new Error('Unauthorized or job not found');
    }

    const query = `
      SELECT 
        ja.user_id as "userId",
        u.name,
        u.email,
        u.phone,
        ja.applied_at as "appliedAt",
        ja.status,
        u.resume,
        u.trade_specialization as "tradeSpecialization",
        u.location,
        u.headline,
        u.skills,
        u.preferred_shift as "preferredShift",
        u.requires_bus as "requiresBus",
        u.requires_accommodation as "requiresAccommodation",
        u.experience,
        u.education,
        u.profile_picture_url as "profilePictureUrl",
        u.aadhaar_verified as "aadhaarVerified",
        u.created_at as "createdAt"
      FROM job_applications ja
      JOIN users u ON ja.user_id = u.id
      WHERE ja.job_id = $1
      ORDER BY ja.applied_at DESC
    `;
    const result = await pool.query(query, [jobId]);
    return result.rows;
  }

  static async updateApplicantStatus(jobId: string, userId: string, employerId: string, status: string): Promise<any> {
    // Verify job belongs to employer
    const checkQuery = 'SELECT id FROM jobs WHERE id = $1 AND employer_id = $2';
    const checkResult = await pool.query(checkQuery, [jobId, employerId]);
    if (checkResult.rows.length === 0) {
      throw new Error('Unauthorized or job not found');
    }

    const query = `
      UPDATE job_applications
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE job_id = $2 AND user_id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [status, jobId, userId]);
    return result.rows[0];
  }

  static async scheduleInterview(
    jobId: string, 
    userId: string, 
    employerId: string, 
    details: { interviewDate: string; interviewTime: string; venueAddress: string; mapsLink?: string }
  ): Promise<any> {
    // Verify job belongs to employer
    const checkQuery = 'SELECT id FROM jobs WHERE id = $1 AND employer_id = $2';
    const checkResult = await pool.query(checkQuery, [jobId, employerId]);
    if (checkResult.rows.length === 0) {
      throw new Error('Unauthorized or job not found');
    }

    const query = `
      UPDATE job_applications
      SET 
        status = 'shortlisted', 
        interview_date = $1, 
        interview_time = $2, 
        venue_address = $3, 
        maps_link = $4, 
        updated_at = CURRENT_TIMESTAMP
      WHERE job_id = $5 AND user_id = $6
      RETURNING *
    `;
    const result = await pool.query(query, [
      details.interviewDate,
      details.interviewTime,
      details.venueAddress,
      details.mapsLink || null,
      jobId,
      userId
    ]);
    return result.rows[0];
  }
}
