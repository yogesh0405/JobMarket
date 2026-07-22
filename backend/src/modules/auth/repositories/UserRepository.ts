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
    return result.rows[0] || null;
  }

  static async updateStatus(id: string, status: string, client: any = pool): Promise<void> {
    const query = 'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;';
    await client.query(query, [status, id]);
  }

  static async updateProfile(userId: string, profileData: Partial<User>, client: any = pool): Promise<User> {
    const {
      name, phone, company_name, gst_number, trade_specialization,
      headline, location, skills, preferred_shift, requires_bus, requires_accommodation,
      resume
    } = profileData;

    const query = `
      UPDATE users 
      SET 
        name = $1,
        phone = $2,
        company_name = $3,
        gst_number = $4,
        trade_specialization = $5,
        headline = $6,
        location = $7,
        skills = $8,
        preferred_shift = $9,
        requires_bus = $10,
        requires_accommodation = $11,
        resume = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *;
    `;

    const values = [
      name, phone, company_name, gst_number, trade_specialization,
      headline, location, skills, preferred_shift, requires_bus, requires_accommodation,
      resume ? JSON.stringify(resume) : null,
      userId
    ];

    const result = await client.query(query, values);
    return result.rows[0];
  }
}
