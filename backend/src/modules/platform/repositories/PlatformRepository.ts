import { pool } from '../../../config/database/pool';
import { CacheService } from '../../../utils/redisCache';

export class PlatformRepository {
  /**
   * System settings used across backend (maintenance mode, job approval toggle, etc.)
   */
  static async getSettings(): Promise<Record<string, string>> {
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

  /**
   * Categories lookup for jobs
   */
  static async getCategories(): Promise<any[]> {
    return CacheService.getOrSet('cache:categories:all', 600, async () => {
      const query = 'SELECT * FROM categories ORDER BY name ASC;';
      const result = await pool.query(query);
      return result.rows;
    });
  }

  /**
   * Skills lookup for jobs
   */
  static async getSkills(): Promise<any[]> {
    return CacheService.getOrSet('cache:skills:all', 600, async () => {
      const query = 'SELECT * FROM skills ORDER BY name ASC;';
      const result = await pool.query(query);
      return result.rows;
    });
  }
}
