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
}
