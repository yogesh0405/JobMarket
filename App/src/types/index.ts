export type UserRole = 'candidate' | 'employer' | 'admin' | 'recruiter';
export type JobType = 'Full-Time' | 'Part-Time' | 'Contract' | 'Freelance';
export type WorkMode = 'Remote' | 'Onsite' | 'Hybrid';
export type ApplicationStatus = 'applied' | 'reviewed' | 'shortlisted' | 'rejected';
export type JobStatus = 'active' | 'closed' | 'pending' | 'rejected';

export type HiringMethod = 'STANDARD' | 'WALK_IN' | 'SCHEDULED_INTERVIEW';

export interface Experience {
  title: string;
  company: string;
  duration: string;
  description?: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface Resume {
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  url?: string;
}

export interface Applicant {
  id?: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  appliedAt: string;
  status: ApplicationStatus;
  resume?: Resume | null;
  profilePictureUrl?: string;
  headline?: string;
  skills?: string[];
  preferredShift?: string;
  requiresBus?: boolean;
  requiresAccommodation?: boolean;
  experience?: any[];
  education?: any[];
  location?: string;
  tradeSpecialization?: string;
  aadhaarVerified?: boolean;
  createdAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
  role: UserRole;
  phone: string;
  companyName?: string;
  createdAt: string;
  profileComplete: boolean;
  headline?: string;
  location?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  resume?: Resume | null;
  savedJobs?: string[];
  appliedJobs?: string[];
  appliedJobsWithStatus?: {
    jobId: string;
    status: string;
    interviewDate?: string;
    interviewTime?: string;
    venueAddress?: string;
    mapsLink?: string;
  }[];
  // Industrial & Localized Fields
  aadhaarVerified?: boolean;
  gstNumber?: string;
  tradeSpecialization?: string;
  preferredShift?: string;
  requiresBus?: boolean;
  requiresAccommodation?: boolean;
  isResumePublic?: boolean;
  // Employer / Company Fields
  companyDescription?: string;
  bio?: string;
  companyType?: string;
  companySize?: string;
  foundedYear?: number;
  midcZone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  logo?: string;
}

export interface Job {
  id: string;
  employerId: string;
  company: string;
  companyLogo?: string;
  companyColor?: string;
  title: string;
  industry: string;
  location: string;
  jobType: JobType;
  workMode: WorkMode;
  minExperience: number;
  maxExperience: number;
  salaryMin: number;
  salaryMax: number;
  openings: number;
  filledOpenings?: number;
  minAge?: number;
  maxAge?: number;
  gender?: string;
  description: string;
  responsibilities?: string[];
  requirements?: string[];
  skills?: string[];
  perks?: string[];
  featured?: boolean;
  status: JobStatus;
  dbStatus?: string;
  rejectReason?: string;
  reject_reason?: string;
  applicants?: Applicant[];
  views?: number;
  postedAt: string;
  // Industrial Specific Fields
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
  trade?: string;
  latitude?: number;
  longitude?: number;
  // Refined Workflow & Governance Fields
  acceptResume?: boolean;
  targetIti?: boolean;
  itiTrade?: string;
  experienceRequired?: boolean;
  discloseSalary?: boolean;
  genderPreference?: string;
  educationRequirement?: string;
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
  hiringMethod?: HiringMethod;
  walkInStartTime?: string;
  walkInEndTime?: string;
  walkInContactPerson?: string;
  walkInContactNumber?: string;
  walkInDocuments?: string;
}

export interface Company {
  name: string;
  industry: string;
  size: string;
  location: string;
  color: string;
  logoUrl?: string;
}

export interface Category {
  name: string;
  icon: string;
  count: number;
}
