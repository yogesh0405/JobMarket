import { pool } from '../../../config/database/pool';

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
  resume?: any;
  experience?: any[];
  education?: any[];
  appliedJobs?: string[];
  profile_picture_url?: string;
}

export class UserRepository {
  static async createUser(userData: Partial<User>, client: any = pool): Promise<User> {
    const {
      email, password_hash, name, phone, role,
      company_name, gst_number, aadhaar_verified, trade_specialization, status
    } = userData;

    const query = `
      INSERT INTO users (
        email, password_hash, name, phone, role,
        company_name, gst_number, aadhaar_verified, trade_specialization, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const values = [
      email, password_hash, name, phone, role,
      company_name, gst_number, aadhaar_verified, trade_specialization, status || 'PENDING_VERIFICATION'
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
    const query = 'SELECT * FROM users WHERE id = $1;';
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return null;
    const user = result.rows[0] as User;

    // Fetch applied job IDs
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

    return user;
  }

  static async updateStatus(id: string, status: string, client: any = pool): Promise<void> {
    const query = 'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;';
    await client.query(query, [status, id]);
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
      skills: 'skills',
      preferred_shift: 'preferred_shift',
      preferredShift: 'preferred_shift',
      requires_bus: 'requires_bus',
      requiresBus: 'requires_bus',
      requires_accommodation: 'requires_accommodation',
      requiresAccommodation: 'requires_accommodation',
      resume: 'resume',
      experience: 'experience',
      education: 'education',
      profile_picture_url: 'profile_picture_url',
      profilePictureUrl: 'profile_picture_url'
    };

    for (const [key, value] of Object.entries(profileData)) {
      const dbColumn = fieldMap[key];
      if (dbColumn && value !== undefined) {
        fieldsToUpdate.push(`${dbColumn} = $${paramIndex++}`);
        if (dbColumn === 'resume' || dbColumn === 'experience' || dbColumn === 'education') {
          values.push(value ? JSON.stringify(value) : null);
        } else {
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
    return result.rows[0];
  }

  static async getAllCandidates(): Promise<User[]> {
    const query = `
      SELECT id, email, name, phone, role, status, created_at, updated_at,
             headline, location, skills, preferred_shift, requires_bus,
             requires_accommodation, resume, experience, education, profile_picture_url,
             trade_specialization as "tradeSpecialization"
      FROM users
      WHERE role = 'candidate'
      ORDER BY name ASC;
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
      resume: typeof row.resume === 'string' ? JSON.parse(row.resume) : row.resume,
      experience: typeof row.experience === 'string' ? JSON.parse(row.experience) : row.experience,
      education: typeof row.education === 'string' ? JSON.parse(row.education) : row.education,
      profilePictureUrl: row.profile_picture_url,
      tradeSpecialization: row.tradeSpecialization
    }));
  }
}
