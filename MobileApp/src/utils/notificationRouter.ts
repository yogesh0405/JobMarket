import { isValidId } from '../api/client';

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

  // 1. Extract target Job ID or Entity ID cleanly
  let extractedJobId: string | undefined =
    item.entityId ||
    item.entity_id ||
    item.metadata?.jobId ||
    item.metadata?.job_id;

  if (!isValidId(extractedJobId)) {
    extractedJobId = undefined;
  }

  if (!extractedJobId && linkStr) {
    const match =
      linkStr.match(/job[s]?\/([^\/]+)/i) ||
      linkStr.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i) ||
      linkStr.match(/(j\d+)/i);
    if (match && match[1] && isValidId(match[1])) {
      extractedJobId = match[1];
    }
  }

  // 2. Candidate & Recruiter Interviews / Scheduled Meetings / Passes
  if (
    type === 'JOB_INTERVIEW' ||
    type === 'INTERVIEW_SCHEDULED' ||
    type === 'INTERVIEW_RESCHEDULED' ||
    type === 'INTERVIEW_CANCELLED' ||
    type === 'INTERVIEW_PASSED' ||
    combined.includes('INTERVIEW') ||
    combined.includes('WALK-IN') ||
    combined.includes('SHORTLIST')
  ) {
    if (role === 'employer') {
      if (extractedJobId) {
        return {
          screen: 'JobApplicants',
          params: { jobId: extractedJobId, jobTitle: item.title || 'Applicants' },
        };
      }
      return {
        screen: 'EmployerMain',
        params: { screen: 'ApplicantsTab' },
      };
    }
    // Candidate -> Navigate directly to MyInterviews pass screen
    return { screen: 'MyInterviews' };
  }

  // 3. Candidate Applications & Recruiter Applicant Queue
  if (
    type === 'JOB_APPLICATION' ||
    type === 'NEW_APPLICATION' ||
    type === 'APPLICATION_RECEIVED' ||
    type === 'APPLICATION_SUBMITTED' ||
    type === 'APPLICATION_STATUS_UPDATED' ||
    combined.includes('APPLIED') ||
    combined.includes('APPLICATION')
  ) {
    if (role === 'employer') {
      if (extractedJobId) {
        return {
          screen: 'JobApplicants',
          params: { jobId: extractedJobId, jobTitle: item.title || 'Applicants' },
        };
      }
      return {
        screen: 'EmployerMain',
        params: { screen: 'ApplicantsTab' },
      };
    }
    // Candidate -> Navigate directly to CandidateAppliedTab in CandidateMain
    return {
      screen: 'CandidateMain',
      params: { screen: 'CandidateAppliedTab' },
    };
  }

  // 4. Job Management & Approvals / Rejections / Postings
  if (
    type === 'JOB_POSTED' ||
    type === 'JOB_APPROVED' ||
    type === 'JOB_REJECTED' ||
    type === 'JOB_STATUS' ||
    type === 'JOB_UNPUBLISHED' ||
    type === 'JOB_EXPIRED' ||
    combined.includes('VACANCY') ||
    combined.includes('POSTED')
  ) {
    if (role === 'employer') {
      return {
        screen: 'EmployerMain',
        params: { screen: 'ManageJobsTab' },
      };
    }
    if (extractedJobId) {
      return {
        screen: 'CandidateJobDetail',
        params: { jobId: extractedJobId, id: extractedJobId },
      };
    }
    return {
      screen: 'CandidateMain',
      params: { screen: 'CandidateJobsTab' },
    };
  }

  // 5. Banner Ads & Marketing Promotions
  if (
    type === 'AD_APPROVED' ||
    type === 'AD_REJECTED' ||
    type === 'ADVERTISEMENT' ||
    combined.includes('BANNER') ||
    combined.includes('PROMOT') ||
    combined.includes('SPONSORED')
  ) {
    if (role === 'employer') {
      return { screen: 'EmployerBanners' };
    }
    return {
      screen: 'CandidateMain',
      params: { screen: 'CandidateJobsTab' },
    };
  }

  // 6. Saved / Bookmarked Jobs & Job Alerts
  if (
    type === 'SAVED_JOB' ||
    type === 'BOOKMARK' ||
    type === 'JOB_ALERT' ||
    type === 'NEW_MATCH' ||
    combined.includes('SAVED') ||
    combined.includes('BOOKMARK')
  ) {
    if (role === 'candidate') {
      return {
        screen: 'CandidateMain',
        params: { screen: 'CandidateSavedTab' },
      };
    }
  }

  // 7. Profile, Resume & Verification
  if (
    type.includes('PROFILE') ||
    type.includes('RESUME') ||
    combined.includes('RESUME') ||
    combined.includes('BIO-DATA') ||
    combined.includes('VERIFICATION') ||
    combined.includes('AADHAAR') ||
    combined.includes('GST')
  ) {
    if (role === 'employer') {
      return { screen: 'CompanyProfile' };
    }
    if (type.includes('RESUME') || combined.includes('RESUME')) {
      return { screen: 'CandidateResume' };
    }
    return { screen: 'CandidateProfile' };
  }

  // 8. Candidates / Talent Search (for Employer)
  if (combined.includes('CANDIDATE') || combined.includes('WORKER') || combined.includes('TALENT')) {
    if (role === 'employer') {
      return {
        screen: 'EmployerMain',
        params: { screen: 'CandidatesTab' },
      };
    }
  }

  // 9. Security & Credentials Settings
  if (
    type === 'SECURITY' ||
    type === 'SECURITY_ALERT' ||
    combined.includes('SECURITY') ||
    combined.includes('PASSWORD') ||
    combined.includes('LOGIN') ||
    combined.includes('2FA')
  ) {
    return { screen: 'SecuritySettings' };
  }

  // 10. Support & Helpdesk Tickets
  if (type.includes('SUPPORT') || combined.includes('TICKET') || combined.includes('HELP')) {
    return { screen: 'HelpSupport' };
  }

  // 11. Default fallback based on role
  if (role === 'employer') {
    return { screen: 'EmployerMain', params: { screen: 'ManageJobsTab' } };
  }
  return {
    screen: 'CandidateMain',
    params: { screen: 'CandidateJobsTab' },
  };
};
