import { pool } from '../../../config/database/pool';
import { GeocodingService } from '../services/geocodingService';
import { CacheService } from '../../../utils/redisCache';
import { safeJsonParse } from '../../../utils/jsonUtils';

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
  latitude?: number;
  longitude?: number;
  acceptResume?: boolean;
  resubmit?: boolean;
  targetIti?: boolean;
  itiTrade?: string | null;
  experienceRequired?: boolean;
  discloseSalary?: boolean;
  genderPreference?: string;
  minAge?: number;
  maxAge?: number;
  isWalkIn?: boolean;
  walkInTime?: string;
  acceptFreshers?: boolean;
  acceptExperienced?: boolean;
  maxApplicants?: number;
  applicationDeadline?: string;
  pf?: boolean;
  esic?: boolean;
  uniform?: boolean;
  medicalInsurance?: boolean;
  transport?: boolean;
  hiringMethod?: string;
  walkInStartTime?: string;
  walkInEndTime?: string;
  walkInContactPerson?: string;
  walkInContactNumber?: string;
  walkInDocuments?: string;
  educationRequirement?: string;
}

export interface MapBoundsParams {
  north?: number;
  south?: number;
  east?: number;
  west?: number;
  search?: string;
  workMode?: string;
  jobType?: string;
  salaryMin?: number;
  salaryMax?: number;
  minExperience?: number;
  maxExperience?: number;
  industry?: string;
  skills?: string;
  featured?: boolean;
  urgent?: boolean;
  limit?: number;
}

export interface NearbyParams {
  latitude: number;
  longitude: number;
  radius: number; // in km
  search?: string;
  workMode?: string;
  jobType?: string;
  salaryMin?: number;
  limit?: number;
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
      latitude: row.latitude !== null && row.latitude !== undefined ? parseFloat(row.latitude) : null,
      longitude: row.longitude !== null && row.longitude !== undefined ? parseFloat(row.longitude) : null,
      geocodingStatus: row.geocoding_status || 'PENDING',
      lastGeocodedAt: row.last_geocoded_at ? new Date(row.last_geocoded_at).toISOString() : null,
      locationAccuracy: row.location_accuracy || 'APPROXIMATE',
      jobType: row.job_type,
      workMode: row.work_mode,
      minExperience: row.min_experience,
      maxExperience: row.max_experience,
      salaryMin: row.salary_min,
      salaryMax: row.salary_max,
      openings: row.openings,
      filledOpenings: row.filled_openings || 0,
      description: row.description,
      responsibilities: safeJsonParse(row.responsibilities, []),
      requirements: safeJsonParse(row.requirements, []),
      skills: safeJsonParse(row.skills, []),
      perks: safeJsonParse(row.perks, []),
      featured: row.featured,
      status: row.status === 'APPROVED' ? 'active' : (row.status === 'REJECTED' ? 'rejected' : (row.status === 'CLOSED' ? 'closed' : 'pending')),
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
      genderPreference: row.gender_preference || row.gender || 'No Preference',
      minAge: row.min_age !== null && row.min_age !== undefined ? parseInt(row.min_age) : 18,
      maxAge: row.max_age !== null && row.max_age !== undefined ? parseInt(row.max_age) : 60,
      isWalkIn: !!row.is_walk_in,
      walkInTime: row.walk_in_time,
      acceptFreshers: row.accept_freshers !== false,
      acceptExperienced: row.accept_experienced !== false,
      maxApplicants: row.max_applicants !== null && row.max_applicants !== undefined ? parseInt(row.max_applicants) : 0,
      applicationDeadline: row.application_deadline ? new Date(row.application_deadline).toISOString().split('T')[0] : null,
      pf: !!row.pf,
      esic: !!row.esic,
      uniform: !!row.uniform,
      medicalInsurance: !!row.medical_insurance,
      transport: !!row.transport,
      hiringMethod: row.hiring_method || (row.is_walk_in ? 'WALK_IN' : 'STANDARD'),
      walkInStartTime: row.walk_in_start_time || null,
      walkInEndTime: row.walk_in_end_time || null,
      walkInContactPerson: row.walk_in_contact_person || null,
      walkInContactNumber: row.walk_in_contact_number || null,
      walkInDocuments: row.walk_in_documents || null,
      educationRequirement: row.education_requirement || (typeof row.education === 'string' ? row.education : '10th Pass'),
      applicants: typeof row.applicants === 'string' ? safeJsonParse(row.applicants, []) : (Array.isArray(row.applicants) ? row.applicants : [])
    };
  }

  static async getJobs(): Promise<any[]> {
    return CacheService.getOrSet('cache:jobs:active', 120, async () => {
      const query = `
        SELECT id, employer_id, company, company_logo, company_color, title, industry, location,
               latitude, longitude, geocoding_status, last_geocoded_at, location_accuracy,
               job_type, work_mode, min_experience, max_experience, salary_min, salary_max,
               openings, filled_openings, min_age, max_age, gender, description, responsibilities,
               requirements, skills, perks, featured, status, reject_reason, views, posted_at,
               midc_zone, shift_details, overtime, accommodation, bus_facility, canteen,
               joining_bonus, attendance_bonus, contract_duration, walk_in_date, interview_address, trade,
               education_requirement
        FROM jobs 
        WHERE status = 'APPROVED'
        ORDER BY posted_at DESC
      `;
      const result = await pool.query(query);
      return result.rows.map((row) => this.mapDbJobToApi(row));
    });
  }

  static async getJobById(id: string): Promise<any | null> {
    return CacheService.getOrSet(`cache:job:${id}`, 180, async () => {
      const query = `
        SELECT j.*, 
               COALESCE(NULLIF(j.company_logo, ''), NULLIF(u.profile_picture_url, '')) as company_logo
        FROM jobs j
        LEFT JOIN users u ON j.employer_id = u.id
        WHERE j.id = $1
      `;
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) return null;
      return this.mapDbJobToApi(result.rows[0]);
    });
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

  // --- MAP & GEOGRAPHIC SEARCH METHODS ---

  /**
   * Get visible jobs bounded by viewport rectangle (north, south, east, west)
   */
  static async getMapJobs(params: MapBoundsParams): Promise<any[]> {
    const conditions: string[] = ["status = 'APPROVED'"];
    const values: any[] = [];
    let paramIndex = 1;

    // Direct Latitude/Longitude Bounding Box check if provided
    if (
      params.north !== undefined &&
      params.south !== undefined &&
      params.east !== undefined &&
      params.west !== undefined
    ) {
      conditions.push(`latitude IS NOT NULL AND longitude IS NOT NULL`);
      conditions.push(`latitude BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      values.push(params.south, params.north);
      paramIndex += 2;

      conditions.push(`longitude BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      values.push(params.west, params.east);
      paramIndex += 2;
    } else {
      // If bounds omitted, return all jobs with valid coordinates
      conditions.push(`latitude IS NOT NULL AND longitude IS NOT NULL`);
    }

    // Keyword Search (Title, Company, Location, Description, Skills, Industry)
    if (params.search && params.search.trim() !== '') {
      const searchTerm = `%${params.search.trim().toLowerCase()}%`;
      conditions.push(
        `(LOWER(title) LIKE $${paramIndex} OR LOWER(company) LIKE $${paramIndex} OR LOWER(location) LIKE $${paramIndex} OR LOWER(industry) LIKE $${paramIndex} OR LOWER(description) LIKE $${paramIndex})`
      );
      values.push(searchTerm);
      paramIndex++;
    }

    // Work Mode Filter (Remote, Hybrid, On-site)
    if (params.workMode && params.workMode !== 'All') {
      conditions.push(`LOWER(work_mode) = $${paramIndex}`);
      values.push(params.workMode.toLowerCase());
      paramIndex++;
    }

    // Job Type Filter (Full-time, Part-time, Contract, Internship)
    if (params.jobType && params.jobType !== 'All') {
      conditions.push(`LOWER(job_type) = $${paramIndex}`);
      values.push(params.jobType.toLowerCase());
      paramIndex++;
    }

    // Salary Min Filter
    if (params.salaryMin !== undefined && params.salaryMin > 0) {
      conditions.push(`salary_max >= $${paramIndex}`);
      values.push(params.salaryMin);
      paramIndex++;
    }

    // Salary Max Filter
    if (params.salaryMax !== undefined && params.salaryMax > 0) {
      conditions.push(`salary_min <= $${paramIndex}`);
      values.push(params.salaryMax);
      paramIndex++;
    }

    // Featured Filter
    if (params.featured) {
      conditions.push(`featured = TRUE`);
    }

    const limit = params.limit || 500;
    values.push(limit);

    const query = `
      SELECT 
        id, employer_id, company, company_logo, company_color, title, industry, location,
        latitude, longitude, geocoding_status, last_geocoded_at, location_accuracy,
        job_type, work_mode, min_experience, max_experience, salary_min, salary_max,
        openings, filled_openings, featured, status, posted_at, overtime, trade, midc_zone
      FROM jobs
      WHERE ${conditions.join(' AND ')}
      ORDER BY featured DESC, posted_at DESC
      LIMIT $${paramIndex}
    `;

    const result = await pool.query(query, values);
    return result.rows.map((row) => this.mapDbJobToApi(row));
  }

  /**
   * Radius Search using SQL Haversine Distance Formula
   */
  static async getNearbyJobs(params: NearbyParams): Promise<any[]> {
    const radiusKm = params.radius || 20; // default 20km
    const limit = params.limit || 100;

    const values: any[] = [params.latitude, params.longitude, radiusKm];
    let paramIndex = 4;

    const additionalConditions: string[] = [];

    if (params.search && params.search.trim() !== '') {
      const searchTerm = `%${params.search.trim().toLowerCase()}%`;
      additionalConditions.push(
        `(LOWER(title) LIKE $${paramIndex} OR LOWER(company) LIKE $${paramIndex} OR LOWER(location) LIKE $${paramIndex})`
      );
      values.push(searchTerm);
      paramIndex++;
    }

    if (params.workMode && params.workMode !== 'All') {
      additionalConditions.push(`LOWER(work_mode) = $${paramIndex}`);
      values.push(params.workMode.toLowerCase());
      paramIndex++;
    }

    const whereClause = additionalConditions.length > 0 ? `AND ${additionalConditions.join(' AND ')}` : '';

    values.push(limit);

    // Haversine Distance calculation in Kilometers
    const query = `
      SELECT * FROM (
        SELECT 
          id, employer_id, company, company_logo, company_color, title, industry, location,
          latitude, longitude, geocoding_status, last_geocoded_at, location_accuracy,
          job_type, work_mode, min_experience, max_experience, salary_min, salary_max,
          openings, filled_openings, featured, status, posted_at, overtime, trade, midc_zone,
          (
            6371 * acos(
              least(1.0, greatest(-1.0, 
                cos(radians($1)) * cos(radians(latitude)) * 
                cos(radians(longitude) - radians($2)) + 
                sin(radians($1)) * sin(radians(latitude))
              ))
            )
          ) AS distance_km
        FROM jobs
        WHERE status = 'APPROVED' 
          AND latitude IS NOT NULL 
          AND longitude IS NOT NULL
          ${whereClause}
      ) sub
      WHERE distance_km <= $3
      ORDER BY distance_km ASC
      LIMIT $${paramIndex}
    `;

    const result = await pool.query(query, values);
    return result.rows.map((row) => {
      const apiJob = this.mapDbJobToApi(row);
      apiJob.distanceKm = row.distance_km ? parseFloat(parseFloat(row.distance_km).toFixed(2)) : 0;
      return apiJob;
    });
  }

  // --- JOB CREATION AND EDIT WITH AUTOMATIC PERMANENT GEOCODING ---

  static async createJob(employerId: string, company: string, jobData: JobData): Promise<any> {
    const companyColor = jobData.companyColor || '#344BFD';

    // 1. Perform Geocoding or Extraction ONCE during job creation
    let latitude = jobData.latitude || null;
    let longitude = jobData.longitude || null;
    let geocodingStatus = 'PENDING';
    let locationAccuracy = 'APPROXIMATE';

    if (latitude !== null && longitude !== null && latitude !== undefined && longitude !== undefined) {
      geocodingStatus = 'SUCCESS';
      locationAccuracy = 'EXACT';
    } else {
      const fullAddress = [jobData.location, jobData.interviewAddress, jobData.midcZone]
        .filter(Boolean)
        .join(', ');
      const geoResult = await GeocodingService.geocodeAddress(fullAddress);
      if (geoResult.status === 'SUCCESS' && geoResult.latitude !== null && geoResult.longitude !== null) {
        latitude = geoResult.latitude;
        longitude = geoResult.longitude;
        geocodingStatus = 'SUCCESS';
        locationAccuracy = geoResult.accuracy;
      } else {
        geocodingStatus = 'FAILED';
      }
    }

    const query = `
      INSERT INTO jobs (
        employer_id, company, company_logo, company_color, title, industry, location, 
        job_type, work_mode, min_experience, max_experience, salary_min, salary_max, 
        openings, description, responsibilities, requirements, skills, perks, 
        trade, midc_zone, shift_details, overtime, accommodation, bus_facility, 
        canteen, joining_bonus, attendance_bonus, contract_duration, walk_in_date, 
        interview_address, latitude, longitude, geocoding_status, last_geocoded_at, location_accuracy,
        accept_resume, target_iti, iti_trade, experience_required, disclose_salary,
        gender_preference, min_age, max_age, is_walk_in, walk_in_time, accept_freshers,
        accept_experienced, max_applicants, application_deadline, pf, esic, uniform,
        medical_insurance, transport, hiring_method, walk_in_start_time, walk_in_end_time,
        walk_in_contact_person, walk_in_contact_number, walk_in_documents, education_requirement, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, 
        $8, $9, $10, $11, $12, $13, 
        $14, $15, $16, $17, $18, $19, 
        $20, $21, $22, $23, $24, $25, 
        $26, $27, $28, $29, $30, 
        $31, $32, $33, $34, CURRENT_TIMESTAMP, $35,
        $36, $37, $38, $39, $40,
        $41, $42, $43, $44, $45, $46,
        $47, $48, $49, $50, $51, $52,
        $53, $54, $55, $56, $57, $58, $59, $60, $61, 'PENDING_REVIEW'
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
      jobData.interviewAddress || null,
      latitude,
      longitude,
      geocodingStatus,
      locationAccuracy,
      jobData.acceptResume !== false,
      !!jobData.targetIti,
      jobData.targetIti ? (jobData.itiTrade || null) : null,
      jobData.experienceRequired !== false,
      jobData.discloseSalary !== false,
      jobData.genderPreference || 'No Preference',
      jobData.minAge !== undefined ? jobData.minAge : 18,
      jobData.maxAge !== undefined ? jobData.maxAge : 60,
      !!jobData.isWalkIn,
      jobData.walkInTime || null,
      jobData.acceptFreshers !== false,
      jobData.acceptExperienced !== false,
      jobData.maxApplicants !== undefined ? jobData.maxApplicants : 0,
      jobData.applicationDeadline || null,
      !!jobData.pf,
      !!jobData.esic,
      !!jobData.uniform,
      !!jobData.medicalInsurance,
      !!jobData.transport,
      jobData.hiringMethod || 'STANDARD',
      jobData.walkInStartTime || null,
      jobData.walkInEndTime || null,
      jobData.walkInContactPerson || null,
      jobData.walkInContactNumber || null,
      jobData.walkInDocuments || null,
      jobData.educationRequirement || '10th Pass'
    ];

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
    await CacheService.invalidatePattern('cache:jobs:*');
    await CacheService.invalidate('cache:admin:stats');
    return this.mapDbJobToApi(result.rows[0]);
  }

  static async updateJob(jobId: string, employerId: string, jobData: Partial<JobData>): Promise<any> {
    const checkQuery = 'SELECT * FROM jobs WHERE id = $1 AND employer_id = $2';
    const checkResult = await pool.query(checkQuery, [jobId, employerId]);
    if (checkResult.rows.length === 0) {
      throw new Error('Job not found or unauthorized');
    }

    const currentJob = checkResult.rows[0];

    // Check if location changed
    let latitude = currentJob.latitude;
    let longitude = currentJob.longitude;
    let geocodingStatus = currentJob.geocoding_status || 'PENDING';
    let locationAccuracy = currentJob.location_accuracy || 'APPROXIMATE';

    const locationChanged =
      (jobData.location && jobData.location !== currentJob.location) ||
      (jobData.interviewAddress && jobData.interviewAddress !== currentJob.interview_address) ||
      (jobData.midcZone && jobData.midcZone !== currentJob.midc_zone);

    // Only re-geocode if location changed or coordinates are missing
    if (locationChanged || (latitude === null && geocodingStatus !== 'SUCCESS')) {
      const fullAddress = [
        jobData.location || currentJob.location,
        jobData.interviewAddress || currentJob.interview_address,
        jobData.midcZone || currentJob.midc_zone
      ]
        .filter(Boolean)
        .join(', ');

      const geoResult = await GeocodingService.geocodeAddress(fullAddress);
      if (geoResult.status === 'SUCCESS' && geoResult.latitude !== null && geoResult.longitude !== null) {
        latitude = geoResult.latitude;
        longitude = geoResult.longitude;
        geocodingStatus = 'SUCCESS';
        locationAccuracy = geoResult.accuracy;
      } else {
        geocodingStatus = 'FAILED';
      }
    }

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
        latitude = $31,
        longitude = $32,
        geocoding_status = $33,
        location_accuracy = $34,
        accept_resume = COALESCE($35, accept_resume),
        target_iti = COALESCE($36, target_iti),
        iti_trade = COALESCE($37, iti_trade),
        experience_required = COALESCE($38, experience_required),
        disclose_salary = COALESCE($39, disclose_salary),
        education_requirement = COALESCE($40, education_requirement),
        last_geocoded_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $41 AND employer_id = $42
      RETURNING *
    `;

    let targetStatus: string | null = null;
    if (currentJob.status === 'REJECTED' || jobData.resubmit) {
      targetStatus = 'PENDING_REVIEW';
    } else if (jobData.status !== undefined) {
      targetStatus = jobData.status === 'active' ? 'APPROVED' : (jobData.status === 'pending' ? 'PENDING_REVIEW' : 'CLOSED');
    }

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
      targetStatus,
      latitude,
      longitude,
      geocodingStatus,
      locationAccuracy,
      jobData.acceptResume !== undefined ? jobData.acceptResume : null,
      jobData.targetIti !== undefined ? jobData.targetIti : null,
      jobData.itiTrade !== undefined ? jobData.itiTrade : null,
      jobData.experienceRequired !== undefined ? jobData.experienceRequired : null,
      jobData.discloseSalary !== undefined ? jobData.discloseSalary : null,
      jobData.educationRequirement || null,
      jobId,
      employerId
    ];

    const result = await pool.query(query, values);
    return this.mapDbJobToApi(result.rows[0]);
  }

  /**
   * Batch geocoding for pending/un-geocoded jobs (e.g., initial seed jobs or missing coordinates)
   */
  static async geocodePendingJobs(): Promise<{ totalProcessed: number; successCount: number; failedCount: number }> {
    const query = `
      SELECT id, location, interview_address, midc_zone 
      FROM jobs 
      WHERE latitude IS NULL OR geocoding_status = 'PENDING'
    `;
    const result = await pool.query(query);
    const jobsToGeocode = result.rows;

    let successCount = 0;
    let failedCount = 0;

    for (const job of jobsToGeocode) {
      const fullAddress = [job.location, job.interview_address, job.midc_zone].filter(Boolean).join(', ');
      const geoResult = await GeocodingService.geocodeAddress(fullAddress);

      if (geoResult.status === 'SUCCESS' && geoResult.latitude !== null && geoResult.longitude !== null) {
        await pool.query(
          `UPDATE jobs SET 
             latitude = $1, 
             longitude = $2, 
             geocoding_status = 'SUCCESS', 
             location_accuracy = $3, 
             last_geocoded_at = CURRENT_TIMESTAMP 
           WHERE id = $4`,
          [geoResult.latitude, geoResult.longitude, geoResult.accuracy, job.id]
        );
        successCount++;
      } else {
        await pool.query(
          `UPDATE jobs SET 
             geocoding_status = 'FAILED', 
             last_geocoded_at = CURRENT_TIMESTAMP 
           WHERE id = $4`,
          [job.id]
        );
        failedCount++;
      }
    }

    return { totalProcessed: jobsToGeocode.length, successCount, failedCount };
  }

  /**
   * Admin Map Analytics Data
   */
  static async getAdminMapAnalytics(): Promise<any> {
    const totalsQuery = `
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) as geocoded_jobs,
        COUNT(CASE WHEN geocoding_status = 'PENDING' OR latitude IS NULL THEN 1 END) as pending_jobs,
        COUNT(CASE WHEN geocoding_status = 'FAILED' THEN 1 END) as failed_jobs
      FROM jobs
    `;
    const totalsRes = await pool.query(totalsQuery);

    const cityBreakdownQuery = `
      SELECT 
        COALESCE(NULLIF(TRIM(location), ''), 'Unknown') as city,
        COUNT(*) as job_count,
        COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) as geocoded_count
      FROM jobs
      GROUP BY city
      ORDER BY job_count DESC
      LIMIT 20
    `;
    const cityRes = await pool.query(cityBreakdownQuery);

    return {
      overview: totalsRes.rows[0] || {},
      topLocations: cityRes.rows || []
    };
  }

  static async deleteJob(jobId: string, employerId: string): Promise<boolean> {
    const query = 'DELETE FROM jobs WHERE id = $1 AND employer_id = $2';
    const result = await pool.query(query, [jobId, employerId]);
    return (result.rowCount ?? 0) > 0;
  }

  static async getMyAppliedJobs(userId: string): Promise<any[]> {
    const query = `
      SELECT 
        j.*,
        ja.status as "applicationStatus",
        ja.applied_at as "appliedAt",
        ja.interview_date as "interviewDate",
        ja.interview_time as "interviewTime",
        ja.venue_address as "venueAddress",
        ja.maps_link as "mapsLink",
        ja.reject_reason as "rejectReason"
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      WHERE ja.user_id = $1
      ORDER BY ja.applied_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows.map((row) => ({
      ...this.mapDbJobToApi(row),
      applicationStatus: row.applicationStatus,
      appliedAt: row.appliedAt,
      interviewDate: row.interviewDate,
      interviewTime: row.interviewTime,
      venueAddress: row.venueAddress,
      mapsLink: row.mapsLink,
      rejectReason: row.rejectReason
    }));
  }

  static async getMySavedJobs(userId: string): Promise<any[]> {
    const query = `
      SELECT 
        j.*
      FROM saved_jobs sj
      JOIN jobs j ON sj.job_id::text = j.id::text
      WHERE sj.user_id = $1
      ORDER BY sj.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows.map((row) => this.mapDbJobToApi(row));
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
    const checkQuery = 'SELECT id, accept_resume FROM jobs WHERE id = $1 AND employer_id = $2';
    const checkResult = await pool.query(checkQuery, [jobId, employerId]);
    if (checkResult.rows.length === 0) {
      throw new Error('Unauthorized or job not found');
    }
    const acceptResume = checkResult.rows[0].accept_resume !== false;

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
    return result.rows.map(row => ({
      ...row,
      resume: acceptResume ? safeJsonParse(row.resume, null) : null,
      experience: safeJsonParse(row.experience, []),
      education: safeJsonParse(row.education, []),
      skills: safeJsonParse(row.skills, []),
      aadhaarVerified: !!row.aadhaarVerified
    }));
  }

  static async updateApplicantStatus(jobId: string, userId: string, employerId: string, status: string): Promise<any> {
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

  static async getEmployerAnalytics(employerId: string): Promise<any> {
    const jobsCountRes = await pool.query(
      `SELECT 
        COUNT(*) as total_jobs,
        COUNT(*) FILTER (WHERE UPPER(status) IN ('APPROVED', 'ACTIVE')) as active_jobs
       FROM jobs 
       WHERE employer_id::text = $1::text`,
      [employerId]
    );

    const funnelRes = await pool.query(
      `SELECT 
        COUNT(*) as total_applications,
        COUNT(*) FILTER (WHERE LOWER(ja.status) IN ('shortlisted', 'accepted', 'approved', 'under_review', 'evaluated')) as shortlisted,
        COUNT(*) FILTER (WHERE LOWER(ja.status) IN ('interview', 'interview_scheduled', 'interviewed', 'called', 'applied') OR ja.interview_date IS NOT NULL) as interviewed,
        COUNT(*) FILTER (WHERE LOWER(ja.status) IN ('hired', 'joined', 'offered', 'selected')) as hired,
        COUNT(*) FILTER (WHERE LOWER(ja.status) IN ('rejected', 'declined')) as rejected
       FROM job_applications ja
       JOIN jobs j ON ja.job_id::text = j.id::text
       WHERE j.employer_id::text = $1::text`,
      [employerId]
    );

    const totalJobs = parseInt(jobsCountRes.rows[0]?.total_jobs || '0', 10);
    const activeJobs = parseInt(jobsCountRes.rows[0]?.active_jobs || '0', 10);
    const totalApplications = parseInt(funnelRes.rows[0]?.total_applications || '0', 10);
    const shortlisted = parseInt(funnelRes.rows[0]?.shortlisted || '0', 10);
    const interviewed = parseInt(funnelRes.rows[0]?.interviewed || '0', 10);
    const hired = parseInt(funnelRes.rows[0]?.hired || '0', 10);
    const rejected = parseInt(funnelRes.rows[0]?.rejected || '0', 10);

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      shortlisted,
      interviewed,
      hired,
      rejected,
      avgResponseTimeHours: 24,
    };
  }

  /**
   * GET /api/v1/jobs/interviews/my-interviews
   * Returns all shortlisted/hired applications with interview_date set for a candidate,
   * split into { upcoming: [], past: [] } based on today's date.
   */
  static async getInterviewsForCandidate(userId: string) {
    const result = await pool.query(
      `SELECT
        ja.id            AS application_id,
        ja.job_id,
        ja.status,
        ja.applied_at,
        ja.interview_date,
        ja.interview_time,
        ja.venue_address,
        ja.maps_link,
        j.title          AS job_title,
        j.company,
        j.company_logo,
        j.company_color,
        j.location       AS job_location,
        j.industry,
        j.job_type,
        j.work_mode,
        j.salary_min,
        j.salary_max,
        u.name           AS employer_name,
        u.company_name
      FROM job_applications ja
      JOIN jobs j          ON ja.job_id::text = j.id::text
      JOIN users u         ON j.employer_id::text = u.id::text
      WHERE ja.user_id::text = $1::text
        AND ja.interview_date IS NOT NULL
        AND ja.status IN ('shortlisted', 'hired', 'rejected')
      ORDER BY ja.interview_date DESC, ja.interview_time DESC`,
      [userId]
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming: any[] = [];
    const past: any[] = [];

    for (const row of result.rows) {
      const interviewDate = row.interview_date ? new Date(row.interview_date) : null;
      if (interviewDate) {
        interviewDate.setHours(0, 0, 0, 0);
        if (interviewDate >= today) {
          upcoming.push(row);
        } else {
          past.push(row);
        }
      }
    }

    // Sort upcoming: soonest first
    upcoming.sort((a, b) => new Date(a.interview_date).getTime() - new Date(b.interview_date).getTime());
    // Sort past: most recent first
    past.sort((a, b) => new Date(b.interview_date).getTime() - new Date(a.interview_date).getTime());

    return { upcoming, past };
  }
}
