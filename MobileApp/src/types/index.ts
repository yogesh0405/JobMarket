export type UserRole = 'candidate' | 'employer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  company_name?: string;
  companyName?: string;
  gst_number?: string;
  gstNumber?: string;
  trade_specialization?: string;
  tradeSpecialization?: string;
  status?: string;
  profile_picture_url?: string;
  profilePictureUrl?: string;
  company_logo?: string;
  companyLogo?: string;
  company_description?: string;
  companyDescription?: string;
  address?: string;
  location?: string;
  headline?: string;
  aadhaar_verified?: boolean;
  aadhaarVerified?: boolean;
  website?: string;
  industry?: string;
  midcZone?: string;
  midc_zone?: string;
  contactPerson?: string;
  contact_person?: string;
  experience?: string;
  education?: string;
  bio?: string;
  notice_period?: string;
  preferred_shift?: string;
  preferredShift?: string;
  requiresBus?: boolean;
  requires_bus?: boolean;
  is_two_factor_enabled?: boolean;
  isTwoFactorEnabled?: boolean;
  two_factor_enabled?: boolean;
  requiresAccommodation?: boolean;
  requires_accommodation?: boolean;
  resume?: any;
  resumeUrl?: string;
  resume_url?: string;
  resumeName?: string;
  isResumePublic?: boolean;
  skills?: string[];
  created_at?: string;
}

export type JobStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'CLOSED' | 'active' | 'closed' | 'pending';

export interface Job {
  id: string;
  employer_id: string;
  company: string;
  company_logo?: string;
  companyLogo?: string;
  company_color?: string;
  title: string;
  industry: string;
  location: string;
  job_type: 'Full-time' | 'Part-time' | 'Contract' | 'Apprenticeship';
  jobType?: string;
  work_mode: 'On-site' | 'Remote' | 'Hybrid';
  workMode?: string;
  min_experience: number;
  minExperience?: number;
  max_experience: number;
  maxExperience?: number;
  salary_min: number;
  salaryMin?: number;
  salary_max: number;
  salaryMax?: number;
  openings: number;
  filledOpenings?: number;
  filled_openings?: number;
  min_age?: number;
  max_age?: number;
  gender?: 'Any' | 'Male' | 'Female';
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  perks?: string[];
  featured?: boolean;
  status: JobStatus;
  reject_reason?: string;
  views?: number;
  posted_at: string;
  midc_zone?: string;
  shift_details?: string;
  overtime?: boolean;
  accommodation?: boolean;
  bus_facility?: boolean;
  busFacility?: boolean;
  canteen?: boolean;
  joining_bonus?: boolean;
  joiningBonus?: boolean;
  attendance_bonus?: boolean;
  attendanceBonus?: boolean;
  contract_duration?: string;
  walk_in_date?: string;
  interview_address?: string;
  google_maps_url?: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  trade?: string;
  applicants_count?: number;
  created_at?: string;
}

export type ApplicationStatus = 'applied' | 'reviewed' | 'under_review' | 'shortlisted' | 'interview' | 'interview_scheduled' | 'interviewed' | 'hired' | 'selected' | 'rejected' | string;

export interface JobApplication {
  id: string;
  job_id: string;
  user_id: string;
  status: ApplicationStatus;
  applied_at: string;
  user?: User;
  job?: Job;
  resume_url?: string;
  interview_details?: {
    date?: string;
    time?: string;
    mode?: string;
    location?: string;
    notes?: string;
  };
}

export interface Session {
  id: string;
  user_id: string;
  ip_address?: string;
  user_agent?: string;
  device_name?: string;
  created_at: string;
  last_used_at: string;
  is_current?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any;
}

export type AdvertisementType =
  | 'FEATURED_JOB'
  | 'URGENT_HIRING'
  | 'COMPANY_PROMOTION'
  | 'WALK_IN_DRIVE'
  | 'GOVERNMENT_JOB'
  | 'APPRENTICESHIP'
  | 'INTERNSHIP'
  | 'HIRING_EVENT'
  | 'ADMIN_ANNOUNCEMENT'
  | 'PLATFORM_UPDATE'
  | 'PROMOTIONAL_BANNER';

export type AdvertisementPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AdvertisementStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'RESUBMITTED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'UNPUBLISHED'
  | 'EXPIRED';

export interface Advertisement {
  id: string;
  title: string;
  description?: string | null;
  banner_image: string;
  advertisement_type: AdvertisementType;
  owner_type: 'EMPLOYER' | 'ADMIN';
  owner_id?: string | null;
  linked_job_id?: string | null;
  redirect_url?: string | null;
  button_text: string;
  priority: AdvertisementPriority;
  status: AdvertisementStatus;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejection_reason?: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  target_audience?: string | null;
  created_at: string;
  updated_at: string;
  company_name?: string;
  job_title?: string;
  views_count?: number;
  clicks_count?: number;
  ctr?: number;
}

export interface AdvertisementAnalytics {
  total_advertisements: number;
  active_advertisements: number;
  pending_approval: number;
  rejected_advertisements: number;
  total_views: number;
  total_clicks: number;
  avg_ctr: number;
}
