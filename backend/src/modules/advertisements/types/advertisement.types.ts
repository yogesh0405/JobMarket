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

export type OwnerType = 'EMPLOYER' | 'ADMIN';

export type AdvertisementPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AdvertisementStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'EXPIRED';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Advertisement {
  id: string;
  title: string;
  description?: string | null;
  banner_image: string;
  advertisement_type: AdvertisementType;
  owner_type: OwnerType;
  owner_id?: string | null;
  linked_job_id?: string | null;
  redirect_url?: string | null;
  button_text: string;
  priority: AdvertisementPriority;
  status: AdvertisementStatus;
  approval_status: ApprovalStatus;
  rejection_reason?: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  target_audience?: string | null;
  created_at: string;
  updated_at: string;
  // Joined details
  employer_name?: string;
  company_name?: string;
  job_title?: string;
  job_location?: string;
  job_company?: string;
  views_count?: number;
  clicks_count?: number;
  ctr?: number;
}

export interface CreateAdvertisementInput {
  title: string;
  description?: string;
  banner_image: string;
  advertisement_type: AdvertisementType;
  linked_job_id?: string;
  redirect_url?: string;
  button_text?: string;
  priority?: AdvertisementPriority;
  start_date: string;
  end_date: string;
  target_audience?: string;
  status?: AdvertisementStatus; // Admin can specify directly
}

export interface UpdateAdvertisementInput {
  title?: string;
  description?: string;
  banner_image?: string;
  advertisement_type?: AdvertisementType;
  linked_job_id?: string;
  redirect_url?: string;
  button_text?: string;
  priority?: AdvertisementPriority;
  start_date?: string;
  end_date?: string;
  target_audience?: string;
  status?: AdvertisementStatus;
  is_active?: boolean;
}

export interface AdvertisementAnalytics {
  total_advertisements: number;
  active_advertisements: number;
  pending_approval: number;
  rejected_advertisements: number;
  total_views: number;
  total_clicks: number;
  avg_ctr: number;
  top_clicked: Array<{
    id: string;
    title: string;
    banner_image: string;
    advertisement_type: string;
    clicks_count: number;
    views_count: number;
    ctr: number;
  }>;
}

export interface SystemNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string | null;
  created_at: string;
}
