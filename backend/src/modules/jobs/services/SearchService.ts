import { pool } from '../../../config/database/pool';
import { CacheService } from '../../../utils/redisCache';
import { logger } from '../../../utils/logger';

export interface SearchJobsParams {
  q?: string;
  industry?: string;
  industries?: string[];
  midcZone?: string;
  locations?: string[];
  jobType?: string;
  jobTypes?: string[];
  workMode?: string;
  workModes?: string[];
  trade?: string;
  jobRoles?: string[];
  education?: string;
  educations?: string[];
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
   * Helper to normalize single strings, comma-delimited strings, or arrays into string arrays
   */
  private static parseList(arr?: string[] | string, single?: string, allToken?: string): string[] {
    const result = new Set<string>();
    const processVal = (val?: string[] | string) => {
      if (!val) return;
      if (Array.isArray(val)) {
        val.forEach((item) => {
          const s = String(item).trim();
          if (s && s !== allToken && !s.toLowerCase().startsWith('all ')) {
            result.add(s);
          }
        });
      } else if (typeof val === 'string') {
        val.split(',').forEach((item) => {
          const s = item.trim();
          if (s && s !== allToken && !s.toLowerCase().startsWith('all ')) {
            result.add(s);
          }
        });
      }
    };

    processVal(arr);
    processVal(single);
    return Array.from(result);
  }

  /**
   * Search jobs with Redis Caching, Typesense In-Memory Search Engine, and PostgreSQL Full-Text Fallback
   */
  public static async searchJobs(params: SearchJobsParams): Promise<SearchJobsResult> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(params.limit) || 20));
    const offset = (page - 1) * limit;

    const normalizedQ = (params.q || '').trim().toLowerCase();
    const industries = this.parseList(params.industries, params.industry, 'All Industries');
    const locations = this.parseList(params.locations, params.midcZone, 'All MIDC Zones');
    const workModes = this.parseList(params.workModes, params.workMode, 'All Modes');
    const jobRoles = this.parseList(params.jobRoles, params.trade, 'All Roles');
    const educations = this.parseList(params.educations, params.education, 'All Education Levels');
    const jobTypes = this.parseList(params.jobTypes, params.jobType, 'All Types');

    // Cache key for Redis with normalized filters
    const cacheKey = `search:jobs:q=${encodeURIComponent(normalizedQ)}:ind=${encodeURIComponent(industries.sort().join(','))}:loc=${encodeURIComponent(locations.sort().join(','))}:mode=${encodeURIComponent(workModes.sort().join(','))}:roles=${encodeURIComponent(jobRoles.sort().join(','))}:edu=${encodeURIComponent(educations.sort().join(','))}:types=${encodeURIComponent(jobTypes.sort().join(','))}:p=${page}:l=${limit}`;

    return await CacheService.getOrSet<SearchJobsResult>(cacheKey, 180, async () => {
      // 1. Try Typesense if configured
      if (process.env.TYPESENSE_HOST && process.env.TYPESENSE_API_KEY) {
        try {
          const typesenseResult = await this.queryTypesense(params, industries, locations, workModes, jobRoles, jobTypes, page, limit, offset);
          if (typesenseResult) {
            return typesenseResult;
          }
        } catch (tsErr) {
          logger.warn('Typesense query fallback to PostgreSQL:', tsErr);
        }
      }

      // 2. High-Performance PostgreSQL Full-Text Search Fallback
      return await this.queryPostgresFullText(
        params,
        industries,
        locations,
        workModes,
        jobRoles,
        educations,
        jobTypes,
        page,
        limit,
        offset
      );
    });
  }

  /**
   * Query PostgreSQL using GIN Full-Text Indexing & Trigram Similarity
   */
  private static async queryPostgresFullText(
    params: SearchJobsParams,
    industries: string[],
    locations: string[],
    workModes: string[],
    jobRoles: string[],
    educations: string[],
    jobTypes: string[],
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

    if (industries.length > 0) {
      const indClauses = industries.map((ind) => {
        values.push(`%${ind}%`);
        return `j.industry ILIKE $${paramIndex++}`;
      });
      conditions.push(`(${indClauses.join(' OR ')})`);
    }

    if (locations.length > 0) {
      const locClauses = locations.map((loc) => {
        values.push(`%${loc}%`);
        return `(j.location ILIKE $${paramIndex} OR j.midc_zone ILIKE $${paramIndex++})`;
      });
      conditions.push(`(${locClauses.join(' OR ')})`);
    }

    if (jobRoles.length > 0) {
      const roleClauses = jobRoles.map((role) => {
        values.push(`%${role}%`);
        return `(j.trade ILIKE $${paramIndex} OR j.title ILIKE $${paramIndex++})`;
      });
      conditions.push(`(${roleClauses.join(' OR ')})`);
    }

    if (workModes.length > 0) {
      const wmClauses = workModes.map((wm) => {
        values.push(`%${wm}%`);
        return `(j.work_mode ILIKE $${paramIndex} OR j.workMode ILIKE $${paramIndex++})`;
      });
      conditions.push(`(${wmClauses.join(' OR ')})`);
    }

    if (jobTypes.length > 0) {
      const jtClauses = jobTypes.map((jt) => {
        values.push(`%${jt}%`);
        return `(j.job_type ILIKE $${paramIndex} OR j.jobType ILIKE $${paramIndex++})`;
      });
      conditions.push(`(${jtClauses.join(' OR ')})`);
    }

    if (educations.length > 0) {
      const eduClauses = educations.map((edu) => {
        values.push(`%${edu}%`);
        return `(j.title ILIKE $${paramIndex} OR j.description ILIKE $${paramIndex} OR j.requirements::text ILIKE $${paramIndex} OR j.education_requirement ILIKE $${paramIndex++})`;
      });
      conditions.push(`(${eduClauses.join(' OR ')})`);
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
   * Typesense Search Engine Query Runner (Zero-dependency HTTP REST API)
   */
  private static async queryTypesense(
    params: SearchJobsParams,
    industries: string[],
    locations: string[],
    workModes: string[],
    jobRoles: string[],
    jobTypes: string[],
    page: number,
    limit: number,
    offset: number
  ): Promise<SearchJobsResult | null> {
    try {
      const host = process.env.TYPESENSE_HOST || 'localhost';
      const port = process.env.TYPESENSE_PORT || '8108';
      const protocol = process.env.TYPESENSE_PROTOCOL || 'http';
      const apiKey = process.env.TYPESENSE_API_KEY || '';

      if (!apiKey) return null;

      const queryParams = new URLSearchParams({
        q: params.q || '*',
        query_by: 'title,company,location,industry,trade,skills',
        page: String(page),
        per_page: String(limit),
      });

      const filters: string[] = [];
      if (industries.length > 0) {
        filters.push(`industry:=[${industries.join(',')}]`);
      }
      if (jobTypes.length > 0) {
        filters.push(`job_type:=[${jobTypes.join(',')}]`);
      }
      if (workModes.length > 0) {
        filters.push(`work_mode:=[${workModes.join(',')}]`);
      }
      if (jobRoles.length > 0) {
        filters.push(`trade:=[${jobRoles.join(',')}]`);
      }
      if (filters.length > 0) {
        queryParams.set('filter_by', filters.join(' && '));
      }

      const url = `${protocol}://${host}:${port}/collections/jobs/documents/search?${queryParams.toString()}`;
      const response = await fetch(url, {
        headers: {
          'X-TYPESENSE-API-KEY': apiKey,
        },
        signal: AbortSignal.timeout(2000),
      });

      if (!response.ok) return null;
      const results: any = await response.json();
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
