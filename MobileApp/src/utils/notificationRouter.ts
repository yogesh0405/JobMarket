/**
 * Centralized Notification Router for Mobile Application
 * Resolves structured notification items to React Navigation screens & params.
 */

export interface MobileNotificationPayload {
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

export interface MobileNavigationTarget {
  screen: string;
  params?: any;
}

export const resolveMobileNotificationRoute = (
  item: MobileNotificationPayload,
  userRole: string = 'candidate'
): MobileNavigationTarget => {
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
    item.metadata?.jobId ||
    item.metadata?.job_id;

  if (!extractedJobId && linkStr) {
    const match =
      linkStr.match(/job[s]?\/([^\/]+)/i) ||
      linkStr.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i) ||
      linkStr.match(/(j\d+)/i);
    if (match && match[1]) {
      extractedJobId = match[1];
    }
  }

  // 2. Candidate Job Details & Interview Pass
  if (
    type === 'JOB_INTERVIEW' ||
    type === 'INTERVIEW_SCHEDULED' ||
    type === 'JOB_STATUS' ||
    type === 'APPLICATION_STATUS_UPDATED' ||
    type === 'APPLICATION_CONFIRMATION' ||
    combined.includes('INTERVIEW') ||
    combined.includes('SHORTLIST')
  ) {
    if (role === 'employer') {
      return {
        screen: 'JobApplicants',
        params: { jobId: extractedJobId || 'j1', jobTitle: item.title },
      };
    }
    return {
      screen: 'CandidateJobDetail',
      params: { jobId: extractedJobId || 'j1', id: extractedJobId || 'j1' },
    };
  }

  // 3. Recruiter Applicants & Candidate Applied Section
  if (type === 'JOB_APPLICATION' || type === 'NEW_APPLICATION' || combined.includes('APPLIED') || combined.includes('APPLICATION')) {
    if (role === 'employer') {
      return {
        screen: 'JobApplicants',
        params: { jobId: extractedJobId, jobTitle: item.title },
      };
    }
    return {
      screen: 'CandidateMain',
      params: { screen: 'CandidateAppliedJobsTab' },
    };
  }

  // 4. Job Management & Approvals
  if (type === 'JOB_POSTED' || type === 'JOB_APPROVED' || type === 'JOB_REJECTED') {
    if (role === 'employer') {
      return {
        screen: 'EmployerMain',
        params: { screen: 'ManageJobsTab' },
      };
    }
    return {
      screen: 'CandidateJobDetail',
      params: { jobId: extractedJobId || 'j1', id: extractedJobId || 'j1' },
    };
  }

  // 5. Banner Ads & Marketing
  if (type === 'AD_APPROVED' || type === 'AD_REJECTED' || combined.includes('BANNER') || combined.includes('PROMOT')) {
    if (role === 'employer') {
      return { screen: 'EmployerBanners' };
    }
    return {
      screen: 'CandidateMain',
      params: { screen: 'CandidateJobsTab' },
    };
  }

  // 6. Security & Credentials
  if (type === 'SECURITY' || type === 'SECURITY_ALERT' || combined.includes('SECURITY') || combined.includes('PASSWORD')) {
    return { screen: 'SecuritySettings' };
  }

  // 7. Support & Helpdesk
  if (type.includes('SUPPORT') || combined.includes('TICKET') || combined.includes('HELP')) {
    return { screen: 'HelpSupport' };
  }

  // 8. Default fallback based on role
  if (role === 'employer') {
    return { screen: 'EmployerDashboard' };
  }
  return {
    screen: 'CandidateMain',
    params: { screen: 'CandidateJobsTab' },
  };
};
