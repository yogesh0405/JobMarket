import { pool } from '../../../config/database/pool';
import { CacheService } from '../../../utils/redisCache';
import { safeJsonParse } from '../../../utils/jsonUtils';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  phone?: string;
  role: string;
  company_name?: string;
  gst_number?: string;
  aadhaar_verified?: boolean;
  trade_specialization?: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  headline?: string;
  location?: string;
  skills?: string[];
  preferred_shift?: string;
  requires_bus?: boolean;
  requires_accommodation?: boolean;
  is_resume_public?: boolean;
  resume?: any;
  experience?: any[];
  education?: any[];
  appliedJobs?: string[];
  profile_picture_url?: string;
  is_two_factor_enabled?: boolean;
}

export class UserRepository {
  static async createUser(userData: Partial<User>, client: any = pool): Promise<User> {
    const {
      email, password_hash, name, phone, role,
      company_name, gst_number, aadhaar_verified, trade_specialization, status, profile_picture_url
    } = userData;

    const query = `
      INSERT INTO users (
        email, password_hash, name, phone, role,
        company_name, gst_number, aadhaar_verified, trade_specialization, status, profile_picture_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, email, name, phone, role, company_name, gst_number, aadhaar_verified, trade_specialization, status, profile_picture_url, created_at, updated_at;
    `;

    const values = [
      email, password_hash, name, phone, role,
      company_name, gst_number, aadhaar_verified, trade_specialization, status || 'PENDING_VERIFICATION',
      profile_picture_url || null
    ];

    const result = await client.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1;';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    return CacheService.getOrSet(`user:profile:${id}`, 900, async () => {
      const query = `
        SELECT id, email, password_hash, name, phone, role, company_name, gst_number, aadhaar_verified, 
               trade_specialization, status, created_at, updated_at, headline, location, bio, midc_zone, skills, 
               preferred_shift, requires_bus, requires_accommodation, resume, experience, education, profile_picture_url,
               COALESCE(is_resume_public, true) as is_resume_public,
               COALESCE(is_two_factor_enabled, false) as is_two_factor_enabled
        FROM users 
        WHERE id = $1;
      `;
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) return null;
      const user = result.rows[0] as User;
      user.resume = safeJsonParse(user.resume, null);
      user.experience = safeJsonParse(user.experience, []);
      user.education = safeJsonParse(user.education, []);

      // Fetch applied job IDs and status
      try {
        const appsQuery = 'SELECT job_id, status, interview_date, interview_time, venue_address, maps_link FROM job_applications WHERE user_id = $1;';
        const appsResult = await pool.query(appsQuery, [id]);
        user.appliedJobs = appsResult.rows.map(row => row.job_id);
        (user as any).appliedJobsWithStatus = appsResult.rows.map(row => ({
          jobId: row.job_id,
          status: row.status,
          interviewDate: row.interview_date,
          interviewTime: row.interview_time,
          venueAddress: row.venue_address,
          mapsLink: row.maps_link
        }));
      } catch (err) {
        console.error('Failed to fetch applied jobs for user:', err);
        user.appliedJobs = [];
        (user as any).appliedJobsWithStatus = [];
      }

      // Fetch saved job IDs
      try {
        const savedQuery = 'SELECT job_id FROM saved_jobs WHERE user_id = $1 ORDER BY created_at DESC;';
        const savedResult = await pool.query(savedQuery, [id]);
        (user as any).savedJobs = savedResult.rows.map(row => row.job_id);
      } catch (err) {
        console.error('Failed to fetch saved jobs for user:', err);
        (user as any).savedJobs = [];
      }

      return user;
    });
  }

  static async toggleSaveJob(userId: string, jobId: string): Promise<{ isSaved: boolean }> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId);
    if (!isUuid) {
      // Gracefully handle mock/fallback non-UUID job IDs without throwing PostgreSQL 500
      return { isSaved: true };
    }

    const checkQuery = 'SELECT id FROM saved_jobs WHERE user_id = $1 AND job_id = $2;';
    const checkResult = await pool.query(checkQuery, [userId, jobId]);

    let res: { isSaved: boolean };
    if (checkResult.rows.length > 0) {
      // Remove saved job
      await pool.query('DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2;', [userId, jobId]);
      res = { isSaved: false };
    } else {
      // Add saved job
      await pool.query('INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2);', [userId, jobId]);
      res = { isSaved: true };
    }

    // Invalidate user profile cache
    await CacheService.invalidate(`user:profile:${userId}`);
    return res;
  }

  static async updateStatus(id: string, status: string, client: any = pool): Promise<void> {
    const query = 'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;';
    await client.query(query, [status, id]);
    await CacheService.invalidate(`user:profile:${id}`);
  }

  static async updateProfile(userId: string, profileData: Partial<User>, client: any = pool): Promise<User> {
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Helper map for camelCase / snake_case properties
    const fieldMap: Record<string, string> = {
      name: 'name',
      phone: 'phone',
      company_name: 'company_name',
      companyName: 'company_name',
      gst_number: 'gst_number',
      gstNumber: 'gst_number',
      trade_specialization: 'trade_specialization',
      tradeSpecialization: 'trade_specialization',
      headline: 'headline',
      location: 'location',
      bio: 'bio',
      midc_zone: 'midc_zone',
      midcZone: 'midc_zone',
      skills: 'skills',
      preferred_shift: 'preferred_shift',
      preferredShift: 'preferred_shift',
      requires_bus: 'requires_bus',
      requiresBus: 'requires_bus',
      requires_accommodation: 'requires_accommodation',
      requiresAccommodation: 'requires_accommodation',
      is_resume_public: 'is_resume_public',
      isResumePublic: 'is_resume_public',
      resume: 'resume',
      experience: 'experience',
      education: 'education',
      profile_picture_url: 'profile_picture_url',
      profilePictureUrl: 'profile_picture_url',
      avatar_url: 'profile_picture_url',
      avatarUrl: 'profile_picture_url',
      avatar: 'profile_picture_url',
      company_logo: 'profile_picture_url',
      companyLogo: 'profile_picture_url',
      logo: 'profile_picture_url',
      logo_url: 'profile_picture_url',
      logoUrl: 'profile_picture_url',
    };

    const updatedColumns = new Set<string>();

    for (const [key, value] of Object.entries(profileData)) {
      const dbColumn = fieldMap[key];
      if (dbColumn && value !== undefined && !updatedColumns.has(dbColumn)) {
        updatedColumns.add(dbColumn);
        if (dbColumn === 'resume' || dbColumn === 'experience' || dbColumn === 'education' || dbColumn === 'skills') {
          fieldsToUpdate.push(`${dbColumn} = $${paramIndex++}::jsonb`);
          const jsonVal = typeof value === 'string' ? value : JSON.stringify(value);
          values.push(value ? jsonVal : null);
        } else {
          fieldsToUpdate.push(`${dbColumn} = $${paramIndex++}`);
          values.push(value);
        }
      }
    }

    if (fieldsToUpdate.length === 0) {
      const user = await this.findById(userId);
      if (!user) throw new Error('User not found');
      return user;
    }

    fieldsToUpdate.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `
      UPDATE users 
      SET ${fieldsToUpdate.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;
    values.push(userId);

    const result = await client.query(query, values);
    await CacheService.invalidate(`user:profile:${userId}`);
    await CacheService.invalidate(`user:profile:${userId.toLowerCase()}`);
    await CacheService.invalidate('cache:candidates:all');
    return result.rows[0];
  }

  static async getAllCandidates(): Promise<any[]> {
    return CacheService.getOrSet('cache:candidates:all', 30, async () => {
      const query = `
        SELECT id, email, name, phone, role, status, created_at, updated_at,
               headline, location, skills, preferred_shift, requires_bus,
               requires_accommodation, resume, experience, education, profile_picture_url,
               trade_specialization as "tradeSpecialization",
               aadhaar_verified as "aadhaarVerified",
               COALESCE(is_resume_public, true) as "isResumePublic"
        FROM users
        WHERE LOWER(role) = 'candidate'
        ORDER BY created_at DESC, name ASC;
      `;
      const result = await pool.query(query);
      return result.rows.map(row => ({
        id: row.id,
        email: row.email,
        name: row.name,
        phone: row.phone,
        role: row.role,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        headline: row.headline,
        location: row.location,
        skills: row.skills,
        preferredShift: row.preferred_shift,
        requiresBus: row.requires_bus,
        requiresAccommodation: row.requires_accommodation,
        isResumePublic: row.isResumePublic !== false,
        resume: safeJsonParse(row.resume, null),
        experience: safeJsonParse(row.experience, []),
        education: safeJsonParse(row.education, []),
        profilePictureUrl: row.profile_picture_url,
        tradeSpecialization: row.tradeSpecialization,
        aadhaarVerified: !!row.aadhaarVerified
      }));
    });
  }
}
