import { pool } from '../../../config/database/pool';

export interface OTP {
  id: string;
  email: string;
  otp_code: string;
  expires_at: Date;
  attempts: number;
  created_at: Date;
}

export class OTPRepository {
  static async storeOTP(email: string, otpCode: string, client: any = pool): Promise<void> {
    // Expires in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    // First invalidate any existing OTP for this email
    await client.query('DELETE FROM otps WHERE email = $1', [email]);
    
    const query = `
      INSERT INTO otps (email, otp_code, expires_at)
      VALUES ($1, $2, $3)
    `;
    await client.query(query, [email, otpCode, expiresAt]);
  }

  static async getValidOTP(email: string): Promise<OTP | null> {
    const query = `
      SELECT * FROM otps 
      WHERE email = $1 AND expires_at > CURRENT_TIMESTAMP
      ORDER BY created_at DESC LIMIT 1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async incrementAttempts(id: string): Promise<void> {
    const query = 'UPDATE otps SET attempts = attempts + 1 WHERE id = $1';
    await pool.query(query, [id]);
  }

  static async deleteOTP(id: string, client: any = pool): Promise<void> {
    const query = 'DELETE FROM otps WHERE id = $1';
    await client.query(query, [id]);
  }
}
