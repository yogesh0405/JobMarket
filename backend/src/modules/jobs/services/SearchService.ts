import { pool } from '../../../config/database/pool';
import { CacheService } from '../../../utils/redisCache';
import { logger } from '../../../utils/logger';

export interface SearchJobsParams {
  q?: string;
  industry?: string;
  midcZone?: string;
  jobType?: string;
  workMode?: string;
  trade?: string;
  education?: string;
  minExperience?: number;
  page?: number;
  limit?: number;
}

export interface SearchJobsResult {
  jobs: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  source: 'typesense' | 'redis_cache' | 'postgres_fts';
}

export class SearchService {
  /**
   * Search jobs with Redis Caching, Typesense In-Memory Search Engine, and PostgreSQL Full-Text Fallback
   */
  public static async searchJobs(params: SearchJobsParams): Promise<SearchJobsResult> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(params.limit) || 20));
    const offset = (page - 1) * limit;

    const normalizedQ = (params.q || '').trim().toLowerCase();
    const normalizedIndustry = (params.industry || '').trim();
    const normalizedZone = (params.midcZone || '').trim();
    const normalizedType = (params.jobType || '').trim();
    const normalizedMode = (params.workMode || '').trim();

    // Cache key for Redis with normalized filters
    const cacheKey = `search:jobs:q=${encodeURIComponent(normalizedQ)}:ind=${encodeURIComponent(normalizedIndustry)}:zone=${encodeURIComponent(normalizedZone)}:type=${encodeURIComponent(normalizedType)}:mode=${encodeURIComponent(normalizedMode)}:p=${page}:l=${limit}`;

    return await CacheService.getOrSet<SearchJobsResult>(cacheKey, 180, async () => {
      // 1. Try Typesense if configured
      if (process.env.TYPESENSE_HOST && process.env.TYPESENSE_API_KEY) {
        try {
          const typesenseResult = await this.queryTypesense(params, page, limit, offset);
          if (typesenseResult) {
            return typesenseResult;
          }
        } catch (tsErr) {
          logger.warn('Typesense query fallback to PostgreSQL:', tsErr);
        }
      }

      // 2. High-Performance PostgreSQL Full-Text Search Fallback
      return await this.queryPostgresFullText(params, page, limit, offset);
    });
  }

  /**
   * Query PostgreSQL using GIN Full-Text Indexing & Trigram Similarity
   */
  private static async queryPostgresFullText(
    params: SearchJobsParams,
    page: number,
    limit: number,
    offset: number
  ): Promise<SearchJobsResult> {
    const conditions: string[] = ["(j.status = 'APPROVED' OR j.status IS NULL)"];
    const values: any[] = [];
    let paramIndex = 1;

    const q = (params.q || '').trim();
    if (q) {
      conditions.push(`(
        j.title ILIKE $${paramIndex}
        OR j.company ILIKE $${paramIndex}
        OR j.location ILIKE $${paramIndex}
        OR j.industry ILIKE $${paramIndex}
        OR j.trade ILIKE $${paramIndex}
        OR j.description ILIKE $${paramIndex}
      )`);
      values.push(`%${q}%`);
      paramIndex++;
    }

    if (params.industry && params.industry !== 'All Industries' && params.industry !== 'All') {
      conditions.push(`j.industry ILIKE $${paramIndex}`);
      values.push(`%${params.industry}%`);
      paramIndex++;
    }

    if (params.midcZone && params.midcZone !== 'All MIDC Zones' && params.midcZone !== 'All Locations') {
      conditions.push(`(j.location ILIKE $${paramIndex} OR j.midc_zone ILIKE $${paramIndex})`);
      values.push(`%${params.midcZone}%`);
      paramIndex++;
    }

    if (params.jobType && params.jobType !== 'All Types') {
      conditions.push(`(j.job_type = $${paramIndex} OR j.jobType = $${paramIndex})`);
      values.push(params.jobType);
      paramIndex++;
    }

    if (params.workMode && params.workMode !== 'All Modes') {
      conditions.push(`(j.work_mode = $${paramIndex} OR j.workMode = $${paramIndex})`);
      values.push(params.workMode);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Query Total Count
    const countSql = `SELECT COUNT(*) as total FROM jobs j ${whereClause}`;
    const countRes = await pool.query(countSql, values);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    // Query Paginated Jobs
    const querySql = `
      SELECT 
        j.id, j.title, j.company, j.location, j.industry, j.trade,
        j.salary_min, j.salary_max, j.min_experience, j.max_experience,
        j.job_type, j.work_mode, j.skills, j.perks, j.created_at,
        j.company_logo, j.latitude, j.longitude, j.openings,
        u.profile_picture_url as employer_logo
      FROM jobs j
      LEFT JOIN users u ON j.employer_id = u.id
      ${whereClause}
      ORDER BY j.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataRes = await pool.query(querySql, [...values, limit, offset]);

    return {
      jobs: dataRes.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      source: 'postgres_fts',
    };
  }

  /**
   * Typesense Search Engine Query Runner
   */
  private static async queryTypesense(
    params: SearchJobsParams,
    page: number,
    limit: number,
    offset: number
  ): Promise<SearchJobsResult | null> {
    // Dynamic import to prevent crashes if typesense package is optional
    try {
      const Typesense = await import('typesense');
      const client = new (Typesense.default || Typesense).Client({
        nodes: [{
          host: process.env.TYPESENSE_HOST || 'localhost',
          port: parseInt(process.env.TYPESENSE_PORT || '8108', 10),
          protocol: process.env.TYPESENSE_PROTOCOL || 'http',
        }],
        apiKey: process.env.TYPESENSE_API_KEY || '',
        connectionTimeoutSeconds: 2,
      });

      const searchParameters: any = {
        q: params.q || '*',
        query_by: 'title,company,location,industry,trade,skills',
        page,
        per_page: limit,
        filter_by: [],
      };

      if (params.industry && params.industry !== 'All Industries') {
        searchParameters.filter_by.push(`industry:=[\`${params.industry}\`]`);
      }
      if (params.jobType && params.jobType !== 'All Types') {
        searchParameters.filter_by.push(`job_type:=[\`${params.jobType}\`]`);
      }
      if (params.workMode && params.workMode !== 'All Modes') {
        searchParameters.filter_by.push(`work_mode:=[\`${params.workMode}\`]`);
      }

      if (searchParameters.filter_by.length > 0) {
        searchParameters.filter_by = searchParameters.filter_by.join(' && ');
      } else {
        delete searchParameters.filter_by;
      }

      const results: any = await client.collections('jobs').documents().search(searchParameters);
      const jobs = (results.hits || []).map((hit: any) => hit.document);
      const total = results.found || 0;

      return {
        jobs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        source: 'typesense',
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Invalidate Search Cache in Redis when jobs are created/updated/deleted
   */
  public static async invalidateSearchCache(): Promise<void> {
    try {
      await CacheService.invalidatePattern('search:jobs:*');
    } catch (err) {
      logger.warn('Failed to invalidate search cache pattern:', err);
    }
  }
}
