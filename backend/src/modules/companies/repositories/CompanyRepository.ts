import { pool } from '../../../config/database/pool';
import { CSN_COMPANIES } from '../../../database/seeders/companiesData';
import { CacheService } from '../../../utils/redisCache';
import { S3Util } from '../../../utils/s3';

export interface Company {
  id: string;
  employer_id?: string;
  name: string;
  logo?: string;
  color?: string;
  industry?: string;
  company_type?: string;
  description?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  email?: string;
  phone?: string;
  company_size?: string;
  founded_year?: number;
  midc_zone?: string;
  specializations?: string[];
  gst_number?: string;
  verified?: boolean;
  completion_percentage?: number;
  created_at?: Date;
  updated_at?: Date;
}

export class CompanyRepository {
  /**
   * Fetch all companies registered in database or seed data with open job counts
   */
  static async getAllCompanies(searchQuery?: string, industryFilter?: string, zoneFilter?: string): Promise<any[]> {
    try {
      const allCompanies = await CacheService.getOrSet('cache:companies:all', 300, async () => {
        // 1. Fetch real companies from companies table with real open jobs count
        const dbQuery = `
          SELECT 
            c.*, 
            u.gst_number, 
            u.aadhaar_verified,
            COUNT(j.id) FILTER (WHERE j.status IS NULL OR LOWER(j.status) = 'active' OR LOWER(j.status) = 'approved') as open_jobs_count
          FROM companies c 
          LEFT JOIN users u ON c.employer_id = u.id 
          LEFT JOIN jobs j ON (
            (c.employer_id IS NOT NULL AND j.employer_id = c.employer_id)
            OR (c.employer_id IS NULL AND LOWER(TRIM(j.company)) = LOWER(TRIM(c.name)))
          )
          GROUP BY c.id, u.gst_number, u.aadhaar_verified
          ORDER BY open_jobs_count DESC, c.name ASC;
        `;
        const res = await pool.query(dbQuery);

        const companyMap = new Map<string, any>();

        res.rows.forEach(row => {
          const compName = (row.name || '').trim();
          if (!compName) return;
          const key = compName.toLowerCase();

          companyMap.set(key, {
            id: row.id,
            employer_id: row.employer_id,
            name: compName,
            logo: row.logo || null,
            color: row.color || '#2563EB',
            industry: row.industry || '',
            company_type: row.company_type || '',
            description: row.description || '',
            website: row.website || '',
            address: row.address || '',
            city: row.city || '',
            state: row.state || 'Maharashtra',
            pincode: row.pincode || '',
            latitude: row.latitude,
            longitude: row.longitude,
            email: row.email || '',
            phone: row.phone || '',
            company_size: row.company_size || '',
            founded_year: row.founded_year ? Number(row.founded_year) : undefined,
            midc_zone: row.midc_zone || '',
            specializations: Array.isArray(row.specializations) ? row.specializations : [],
            gst_number: row.gst_number || '',
            verified: row.verified !== false && row.aadhaar_verified !== false,
            open_jobs_count: parseInt(row.open_jobs_count || '0', 10),
            created_at: row.created_at
          });
        });

        // 2. Fetch distinct companies directly from jobs table in PostgreSQL database
        const jobsCompQuery = `
          SELECT 
            j.company as name,
            COUNT(j.id) as open_jobs_count,
            MIN(j.location) as city,
            MIN(j.midc_zone) as midc_zone,
            MIN(j.industry) as industry,
            MIN(j.company_logo) as logo,
            (ARRAY_REMOVE(ARRAY_AGG(j.employer_id), NULL))[1] as employer_id
          FROM jobs j
          WHERE j.status IS NULL OR LOWER(j.status) = 'active' OR LOWER(j.status) = 'approved'
          GROUP BY j.company;
        `;
        const jobsCompRes = await pool.query(jobsCompQuery);

        jobsCompRes.rows.forEach((row, idx) => {
          const compName = (row.name || '').trim();
          if (!compName) return;
          const key = compName.toLowerCase();

          const count = parseInt(row.open_jobs_count || '0', 10);

          if (!companyMap.has(key)) {
            companyMap.set(key, {
              id: row.employer_id || `job-comp-${idx + 1}`,
              employer_id: row.employer_id,
              name: compName,
              logo: row.logo,
              color: '#2563EB',
              industry: row.industry || '',
              company_type: '',
              description: '',
              city: row.city || '',
              state: 'Maharashtra',
              midc_zone: row.midc_zone || '',
              company_size: '',
              founded_year: undefined,
              verified: true,
              open_jobs_count: count
            });
          }
        });

        // 3. Fetch employer user accounts from users table
        try {
          const usersCompQuery = `
            SELECT 
              u.id as employer_id,
              u.name,
              u.email,
              u.company_name,
              u.profile_picture_url as company_logo,
              u.phone,
              u.location,
              u.gst_number,
              u.aadhaar_verified,
              COUNT(j.id) FILTER (WHERE j.status IS NULL OR LOWER(j.status) = 'active' OR LOWER(j.status) = 'approved') as open_jobs_count
            FROM users u
            LEFT JOIN jobs j ON j.employer_id = u.id
            WHERE (u.role = 'employer' OR u.role = 'recruiter' OR u.email ILIKE 'noreply%')
              AND (
                (u.company_name IS NOT NULL AND u.company_name != '') OR
                (u.name IS NOT NULL AND u.name != '')
              )
            GROUP BY u.id, u.name, u.email, u.company_name, u.profile_picture_url, u.phone, u.location, u.gst_number, u.aadhaar_verified;
          `;
          const usersCompRes = await pool.query(usersCompQuery);

          usersCompRes.rows.forEach((row) => {
            const compName = (row.company_name || row.company || row.name || '').trim();
            if (!compName) return;
            const key = compName.toLowerCase();
            const count = parseInt(row.open_jobs_count || '0', 10);

            if (!companyMap.has(key)) {
              companyMap.set(key, {
                id: row.employer_id,
                employer_id: row.employer_id,
                name: compName,
                logo: row.company_logo,
                color: '#2563EB',
                industry: 'Industrial Manufacturing',
                company_type: 'Private Limited',
                description: 'Registered employer enterprise on JobMarket platform.',
                city: row.location || 'Chhatrapati Sambhajinagar',
                state: 'Maharashtra',
                midc_zone: 'Waluj MIDC',
                email: row.email,
                phone: row.phone,
                gst_number: row.gst_number,
                verified: row.aadhaar_verified !== false,
                company_size: '100+ employees',
                founded_year: 2020,
                open_jobs_count: count
              });
            } else {
              const existing = companyMap.get(key);
              if (!existing.email) existing.email = row.email;
              if (!existing.phone) existing.phone = row.phone;
              if (row.employer_id) existing.employer_id = row.employer_id;
            }
          });
        } catch (uErr) {
          console.error('Error fetching employer users for company list:', uErr);
        }

        // CSN_COMPANIES seed data removed — single source of truth is strictly database records

        return Array.from(companyMap.values());
      });

      let companies = Array.isArray(allCompanies) ? [...allCompanies] : [];

      // Apply search and filter
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        companies = companies.filter(c =>
          c.name.toLowerCase().includes(q) ||
          (c.industry || '').toLowerCase().includes(q) ||
          (c.midc_zone || '').toLowerCase().includes(q) ||
          (c.city || '').toLowerCase().includes(q)
        );
      }

      if (industryFilter && industryFilter !== 'all' && industryFilter !== 'All Companies') {
        companies = companies.filter(c => (c.industry || '').toLowerCase().includes(industryFilter.toLowerCase()));
      }

      if (zoneFilter && zoneFilter !== 'all' && zoneFilter !== 'All Zones') {
        companies = companies.filter(c => (c.midc_zone || '').toLowerCase() === zoneFilter.toLowerCase());
      }

      return companies;
    } catch (err) {
      console.error('Error fetching companies in repository:', err);
      return [];
    }
  }

  /**
   * Fetch company by ID, employer ID, or company name/slug
   */
  static async getCompanyById(identifier: string): Promise<Company | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    const decodedName = decodeURIComponent(identifier).trim();

    return CacheService.getOrSet(`company:profile:${identifier}`, 5, async () => {
      let query = '';
      let params: any[] = [];

      if (isUuid) {
        query = `
          SELECT c.*, u.gst_number, u.aadhaar_verified 
          FROM companies c 
          LEFT JOIN users u ON c.employer_id = u.id 
          WHERE c.id = $1 OR c.employer_id = $1 OR c.name ILIKE $2;
        `;
        params = [identifier, decodedName];
      } else {
        query = `
          SELECT c.*, u.gst_number, u.aadhaar_verified 
          FROM companies c 
          LEFT JOIN users u ON c.employer_id = u.id 
          WHERE c.name ILIKE $1 OR REPLACE(LOWER(c.name), ' ', '-') = LOWER($1);
        `;
        params = [decodedName];
      }

      const res = await pool.query(query, params);

      if (res.rows.length > 0) {
        const row = res.rows[0];
        const company: Company = {
          id: row.id,
          employer_id: row.employer_id,
          name: row.name,
          logo: row.logo,
          color: row.color || '#2563EB',
          industry: row.industry || '',
          company_type: row.company_type || '',
          description: row.description || '',
          website: row.website || '',
          address: row.address || '',
          city: row.city || '',
          state: row.state || 'Maharashtra',
          pincode: row.pincode || '',
          latitude: row.latitude,
          longitude: row.longitude,
          email: row.email || '',
          phone: row.phone || '',
          company_size: row.company_size || '',
          founded_year: row.founded_year ? Number(row.founded_year) : undefined,
          midc_zone: row.midc_zone || '',
          specializations: Array.isArray(row.specializations) ? row.specializations : [],
          gst_number: row.gst_number || '',
          verified: row.verified !== false && row.aadhaar_verified !== false,
          created_at: row.created_at,
          updated_at: row.updated_at,
        };
        const companyJobs = await this.getCompanyJobs(row.name, row.employer_id);
        (company as any).open_jobs_count = companyJobs.length;
        company.completion_percentage = this.calculateProfileCompletion(company);
        return company;
      }

      // Check if user table has an employer matching this name, company name, or ID
      const userCheckQuery = 'SELECT * FROM users WHERE id = $1 OR company_name ILIKE $2 OR name ILIKE $2 LIMIT 1;';
      const userCheckRes = await pool.query(userCheckQuery, [isUuid ? identifier : '00000000-0000-0000-0000-000000000000', decodedName]);
      if (userCheckRes.rows.length > 0) {
        const u = userCheckRes.rows[0];
        const compName = u.company_name || u.name || 'My Company';
        const company: Company = {
          id: u.id,
          employer_id: u.id,
          name: compName,
          logo: u.profile_picture_url || null,
          industry: u.trade_specialization || '',
          company_type: '',
          description: u.bio || '',
          address: u.location || '',
          city: u.location || '',
          state: 'Maharashtra',
          email: u.email || '',
          phone: u.phone || '',
          gst_number: u.gst_number || '',
          company_size: '',
          founded_year: undefined,
          midc_zone: u.midc_zone || '',
          verified: u.aadhaar_verified !== false,
        };
        const companyJobs = await this.getCompanyJobs(compName, u.id);
        (company as any).open_jobs_count = companyJobs.length;
        company.completion_percentage = this.calculateProfileCompletion(company);
        return company;
      }

      return null;
    });
  }

  /**
   * Fetch job postings belonging to a specific company or employer account
   */
  static async getCompanyJobs(companyName: string, employerId?: string): Promise<any[]> {
    const decodedName = decodeURIComponent(companyName || '').trim();
    const isUuid = employerId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(employerId) && employerId !== '00000000-0000-0000-0000-000000000000';

    // 1. Strict primary check: If employer account ID is known, query ONLY jobs posted by this employer
    if (isUuid) {
      const query = `
        SELECT 
          j.id, j.title, j.company, j.company_logo as "companyLogo", j.company_color as "companyColor",
          j.industry, j.location, j.job_type as "jobType", j.work_mode as "workMode",
          j.min_experience as "minExperience", j.max_experience as "maxExperience",
          j.salary_min as "salaryMin", j.salary_max as "salaryMax", j.openings,
          j.description, j.trade, j.midc_zone as "midcZone", j.shift_details as "shiftDetails",
          j.posted_at as "postedAt", j.status, j.employer_id as "employerId",
          COUNT(ja.id)::int as "applicantsCount"
        FROM jobs j
        LEFT JOIN job_applications ja ON j.id = ja.job_id
        WHERE (
          j.status IS NULL 
          OR LOWER(j.status) = 'approved' 
          OR LOWER(j.status) = 'active'
        )
        AND j.employer_id = $1
        GROUP BY j.id
        ORDER BY j.posted_at DESC;
      `;
      const res = await pool.query(query, [employerId]);
      return res.rows;
    }

    // 2. Secondary check: If no employer ID is available, match strictly by exact normalized company name
    if (decodedName) {
      const query = `
        SELECT 
          j.id, j.title, j.company, j.company_logo as "companyLogo", j.company_color as "companyColor",
          j.industry, j.location, j.job_type as "jobType", j.work_mode as "workMode",
          j.min_experience as "minExperience", j.max_experience as "maxExperience",
          j.salary_min as "salaryMin", j.salary_max as "salaryMax", j.openings,
          j.description, j.trade, j.midc_zone as "midcZone", j.shift_details as "shiftDetails",
          j.posted_at as "postedAt", j.status, j.employer_id as "employerId",
          COUNT(ja.id)::int as "applicantsCount"
        FROM jobs j
        LEFT JOIN job_applications ja ON j.id = ja.job_id
        WHERE (
          j.status IS NULL 
          OR LOWER(j.status) = 'approved' 
          OR LOWER(j.status) = 'active'
        )
        AND LOWER(TRIM(j.company)) = LOWER(TRIM($1))
        GROUP BY j.id
        ORDER BY j.posted_at DESC;
      `;
      const res = await pool.query(query, [decodedName]);
      return res.rows;
    }

    return [];
  }

  /**
   * Update company profile (Employer action)
   */
  static async updateCompanyProfile(identifier: string, employerId: string, updateData: Partial<Company>): Promise<Company> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    const isEmployerIdUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(employerId);
    const safeEmployerId = isEmployerIdUuid ? employerId : null;

    // 1. Fetch or identify company
    let company = await this.getCompanyById(identifier);
    if (!company) {
      // If company row doesn't exist yet, query employer user directly
      const empUserRes = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1;', [safeEmployerId || '00000000-0000-0000-0000-000000000000']);
      const empUser = empUserRes.rows[0];
      company = {
        id: employerId,
        employer_id: employerId,
        name: updateData.name || empUser?.company_name || empUser?.name || 'My Company',
        email: empUser?.email || '',
        phone: empUser?.phone || '',
      };
    }

    // If logo is a base64 string, upload to S3 first
    if (updateData.logo && typeof updateData.logo === 'string' && updateData.logo.startsWith('data:image/')) {
      try {
        const customKey = `company_logo_${employerId}_${Date.now()}`;
        const s3LogoUrl = await S3Util.uploadImage(updateData.logo, 'logos', customKey);
        updateData.logo = s3LogoUrl;
      } catch (s3Err) {
        console.error('S3 Company logo upload error in CompanyRepository:', s3Err);
      }
    }

    // Check if actual row exists in companies table
    const checkRes = await pool.query(
      'SELECT id, employer_id, name FROM companies WHERE id = $1 OR employer_id = $2 OR name ILIKE $3 LIMIT 1;',
      [isUuid ? company.id : '00000000-0000-0000-0000-000000000000', safeEmployerId || '00000000-0000-0000-0000-000000000000', updateData.name || company.name]
    );

    let companyDbId = '';
    if (checkRes.rows.length === 0) {
      const insertQuery = `
        INSERT INTO companies (
          employer_id, name, logo, color, industry, company_type, description, website,
          address, city, state, pincode, email, phone, company_size, founded_year, midc_zone, verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, TRUE)
        ON CONFLICT (name) DO UPDATE SET
          employer_id = COALESCE(EXCLUDED.employer_id, companies.employer_id),
          logo = COALESCE(EXCLUDED.logo, companies.logo),
          industry = COALESCE(EXCLUDED.industry, companies.industry),
          company_type = COALESCE(EXCLUDED.company_type, companies.company_type),
          description = COALESCE(EXCLUDED.description, companies.description),
          website = COALESCE(EXCLUDED.website, companies.website),
          address = COALESCE(EXCLUDED.address, companies.address),
          city = COALESCE(EXCLUDED.city, companies.city),
          phone = COALESCE(EXCLUDED.phone, companies.phone),
          email = COALESCE(EXCLUDED.email, companies.email),
          company_size = COALESCE(EXCLUDED.company_size, companies.company_size),
          founded_year = COALESCE(EXCLUDED.founded_year, companies.founded_year),
          midc_zone = COALESCE(EXCLUDED.midc_zone, companies.midc_zone),
          updated_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;
      const yrVal = Number(updateData.founded_year || (updateData as any).foundedYear || company.founded_year);
      const safeYear = yrVal && yrVal > 1800 ? yrVal : 2005;
      const insertParams = [
        safeEmployerId,
        (updateData.name || company.name || 'My Company').trim(),
        updateData.logo || company.logo || null,
        updateData.color || company.color || '#2563EB',
        updateData.industry || company.industry || 'Automotive & Auto Components',
        updateData.company_type || (updateData as any).companyType || company.company_type || 'Private Limited',
        updateData.description || company.description || '',
        updateData.website || company.website || '',
        updateData.address || company.address || '',
        updateData.city || company.city || '',
        updateData.state || company.state || 'Maharashtra',
        updateData.pincode || company.pincode || '',
        updateData.email || company.email || '',
        updateData.phone || company.phone || '',
        updateData.company_size || (updateData as any).companySize || company.company_size || '200-500 employees',
        safeYear,
        updateData.midc_zone || (updateData as any).midcZone || company.midc_zone || ''
      ];
      const inserted = await pool.query(insertQuery, insertParams);
      companyDbId = inserted.rows[0].id;
    } else {
      companyDbId = checkRes.rows[0].id;
      if (safeEmployerId && (!checkRes.rows[0].employer_id || checkRes.rows[0].employer_id !== safeEmployerId)) {
        await pool.query('UPDATE companies SET employer_id = $1 WHERE id = $2;', [safeEmployerId, companyDbId]);
      }
    }

    const fieldsToUpdate: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowedColumns: Record<string, string> = {
      name: 'name',
      logo: 'logo',
      color: 'color',
      industry: 'industry',
      company_type: 'company_type',
      companyType: 'company_type',
      description: 'description',
      website: 'website',
      address: 'address',
      city: 'city',
      state: 'state',
      pincode: 'pincode',
      email: 'email',
      phone: 'phone',
      company_size: 'company_size',
      companySize: 'company_size',
      founded_year: 'founded_year',
      foundedYear: 'founded_year',
      midc_zone: 'midc_zone',
      midcZone: 'midc_zone',
    };

    const addedColumns = new Set<string>();
    for (const [key, value] of Object.entries(updateData)) {
      const col = allowedColumns[key];
      if (col && value !== undefined && value !== null && !addedColumns.has(col)) {
        addedColumns.add(col);
        if (col === 'founded_year') {
          const yr = Number(value);
          if (yr && yr > 1800) {
            fieldsToUpdate.push(`${col} = $${idx++}`);
            values.push(yr);
          }
        } else {
          fieldsToUpdate.push(`${col} = $${idx++}`);
          values.push(typeof value === 'string' ? value.trim() : value);
        }
      }
    }

    if (fieldsToUpdate.length > 0) {
      fieldsToUpdate.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(companyDbId);

      const updateQuery = `
        UPDATE companies 
        SET ${fieldsToUpdate.join(', ')} 
        WHERE id = $${idx} 
        RETURNING *;
      `;
      await pool.query(updateQuery, values);
    }

    // Sync changes to user profile if employer user exists
    if (safeEmployerId) {
      const userUpdateFields: string[] = [];
      const userValues: any[] = [];
      let uIdx = 1;

      if (updateData.name) {
        userUpdateFields.push(`company_name = $${uIdx++}`);
        userValues.push(updateData.name);
      }
      if (updateData.industry) {
        userUpdateFields.push(`trade_specialization = $${uIdx++}`);
        userValues.push(updateData.industry);
      }
      if (updateData.description || (updateData as any).bio) {
        userUpdateFields.push(`bio = $${uIdx++}`);
        userValues.push((updateData.description || (updateData as any).bio).trim());
      }
      if (updateData.midc_zone || (updateData as any).midcZone) {
        userUpdateFields.push(`midc_zone = $${uIdx++}`);
        userValues.push((updateData.midc_zone || (updateData as any).midcZone).trim());
      }
      if (updateData.address || updateData.city) {
        const addr = (updateData.address || '').trim();
        const cty = (updateData.city || '').trim();
        let loc = addr;
        if (cty && !addr.toLowerCase().includes(cty.toLowerCase())) {
          loc = addr ? `${addr}, ${cty}` : cty;
        }
        userUpdateFields.push(`location = $${uIdx++}`);
        userValues.push(loc || cty);
      }
      if (updateData.logo) {
        userUpdateFields.push(`profile_picture_url = $${uIdx++}`);
        userValues.push(updateData.logo);
      }
      if (updateData.phone) {
        userUpdateFields.push(`phone = $${uIdx++}`);
        userValues.push(updateData.phone);
      }
      if (updateData.gst_number || (updateData as any).gstNumber) {
        userUpdateFields.push(`gst_number = $${uIdx++}`);
        userValues.push(updateData.gst_number || (updateData as any).gstNumber);
      }

      if (userUpdateFields.length > 0) {
        userUpdateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        userValues.push(safeEmployerId);

        await pool.query(
          `UPDATE users SET ${userUpdateFields.join(', ')} WHERE id = $${uIdx};`,
          userValues
        );
      }

      // Sync changes to all active job listings posted by this employer
      if (updateData.name || updateData.logo) {
        const jobUpdateFields: string[] = [];
        const jobValues: any[] = [];
        let jIdx = 1;
        if (updateData.name) {
          jobUpdateFields.push(`company = $${jIdx++}`);
          jobValues.push(updateData.name.trim());
        }
        if (updateData.logo) {
          jobUpdateFields.push(`company_logo = $${jIdx++}`);
          jobValues.push(updateData.logo.trim());
        }
        jobValues.push(safeEmployerId);
        await pool.query(
          `UPDATE jobs SET ${jobUpdateFields.join(', ')} WHERE employer_id = $${jIdx};`,
          jobValues
        );
      }
    }

    // Invalidate caches
    await CacheService.invalidatePattern('company:*');
    await CacheService.invalidatePattern('cache:companies:*');
    await CacheService.invalidatePattern('jobs:*');
    await CacheService.invalidatePattern('cache:jobs:*');
    if (safeEmployerId) {
      await CacheService.invalidate(`user:profile:${safeEmployerId}`);
      await CacheService.invalidate(`user:profile:${safeEmployerId.toLowerCase()}`);
    }

    const updatedCompany = await this.getCompanyById(companyDbId);
    return updatedCompany!;
  }

  /**
   * Dynamic calculation of profile completion percentage
   */
  private static calculateProfileCompletion(company: Company): number {
    const fieldsToTrack = [
      company.name,
      company.logo,
      company.industry,
      company.description,
      company.website,
      company.address,
      company.city,
      company.phone,
      company.email,
      company.company_size,
      company.founded_year,
      company.midc_zone,
    ];

    const completed = fieldsToTrack.filter(val => val !== undefined && val !== null && String(val).trim() !== '').length;
    return Math.round((completed / fieldsToTrack.length) * 100);
  }
}
