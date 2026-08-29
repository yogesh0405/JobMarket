/**
 * Centralized Notification Router for Web Application
 * Resolves structured notification items to target web routes seamlessly.
 */

export interface AppNotificationPayload {
  id: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
  entityType?: string;
  entity_type?: string;
  entityId?: string;
  entity_id?: string;
  metadata?: any;
}

export const resolveWebNotificationRoute = (
  item: AppNotificationPayload,
  userRole: string = 'candidate'
): string => {
  const role = userRole.toLowerCase();
  const type = (item.type || '').toUpperCase();
  const title = (item.title || '').toUpperCase();
  const message = (item.message || '').toUpperCase();
  const combined = `${type} ${title} ${message}`;
  const linkStr = item.link || '';

  // 1. Extract target Job ID
  let extractedJobId: string | undefined =
    item.entityId ||
    item.entity_id ||
    (item as any).jobId ||
    (item as any).job_id ||
    item.metadata?.jobId ||
    item.metadata?.job_id;

  if (!extractedJobId && linkStr) {
    const match =
      linkStr.match(/job[s]?\/([a-zA-Z0-9_\-]+)/i) ||
      linkStr.match(/jobId=([a-zA-Z0-9_\-]+)/i) ||
      linkStr.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
    if (match && match[1] && match[1].toLowerCase() !== 'applied' && match[1].toLowerCase() !== 'my-jobs') {
      extractedJobId = match[1];
    }
  }

  // 2. Interview Notifications (Scheduled, Rescheduled, Completed, Postponed)
  if (
    type === 'JOB_INTERVIEW' ||
    type === 'INTERVIEW_SCHEDULED' ||
    type === 'INTERVIEW_RESCHEDULED' ||
    type === 'INTERVIEW_POSTPONED' ||
    type === 'INTERVIEW_COMPLETED' ||
    combined.includes('INTERVIEW') ||
    linkStr.includes('tab=interviews')
  ) {
    return `/dashboard?tab=interviews`;
  }

  // 2b. Candidate Application Status Updates
  if (
    type === 'JOB_STATUS' ||
    type === 'APPLICATION_STATUS_UPDATED' ||
    type === 'APPLICATION_CONFIRMATION'
  ) {
    if (role === 'employer') {
      return extractedJobId ? `/dashboard?tab=applicants&jobId=${extractedJobId}` : `/dashboard?tab=applicants`;
    }
    return extractedJobId ? `/job/${extractedJobId}` : `/dashboard?tab=applied`;
  }

  // 3. Employer Recruiter Applicant Notifications
  if (
    type === 'JOB_APPLICATION' ||
    type === 'NEW_APPLICATION' ||
    combined.includes('APPLIED') ||
    combined.includes('APPLICATION')
  ) {
    if (role === 'employer') {
      return extractedJobId ? `/dashboard?tab=applicants&jobId=${extractedJobId}` : `/dashboard?tab=applicants`;
    }
    return extractedJobId ? `/job/${extractedJobId}` : `/dashboard?tab=applied`;
  }

  // 4. Job Management (Post/Approval/Rejection)
  if (type === 'JOB_POSTED' || type === 'JOB_APPROVED' || type === 'JOB_REJECTED') {
    if (role === 'employer' || role === 'admin') {
      return extractedJobId ? `/job/${extractedJobId}` : `/dashboard?tab=myjobs`;
    }
    return extractedJobId ? `/job/${extractedJobId}` : `/jobs`;
  }

  // 5. Advertisements & Banner Promotions
  if (
    type === 'AD_APPROVED' ||
    type === 'AD_REJECTED' ||
    type === 'AD_UNPUBLISHED' ||
    combined.includes('BANNER') ||
    combined.includes('PROMOT')
  ) {
    return role === 'employer' ? `/employer/advertisements` : `/jobs`;
  }

  // 6. Security & Account Protection
  if (
    type === 'SECURITY' ||
    type === 'SECURITY_ALERT' ||
    combined.includes('SECURITY') ||
    combined.includes('PASSWORD')
  ) {
    return `/profile`;
  }

  // 7. Support & Helpdesk
  if (type.includes('SUPPORT') || combined.includes('TICKET') || combined.includes('HELP')) {
    return `/contact`;
  }

  // 8. Explicit link or default dashboard fallback
  if (linkStr && linkStr.startsWith('/')) {
    return linkStr;
  }

  return role === 'employer' ? `/dashboard` : `/dashboard`;
};
