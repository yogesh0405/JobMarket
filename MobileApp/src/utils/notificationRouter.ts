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
  const linkStr = (item.link || '').trim();

  // 1. Extract target Job ID or Entity ID cleanly
  let extractedJobId: string | undefined =
    item.entityId ||
    item.entity_id ||
    item.metadata?.jobId ||
    item.metadata?.job_id ||
    item.metadata?.id;

  if (!isValidId(extractedJobId)) {
    extractedJobId = undefined;
  }

  if (!extractedJobId && linkStr) {
    const jobMatch =
      linkStr.match(/job[s]?\/([a-f0-9\-]+)/i) ||
      linkStr.match(/jobId=([a-f0-9\-]+)/i) ||
      linkStr.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
    if (jobMatch && jobMatch[1] && isValidId(jobMatch[1])) {
      extractedJobId = jobMatch[1];
    }
  }

  // 2. Direct Web Link / Deep-Link Router
  if (linkStr) {
    const lowerLink = linkStr.toLowerCase();

    // Employer Manage Jobs Link
    if (lowerLink.includes('tab=manage') || lowerLink.includes('/employer/jobs') || lowerLink.includes('/manage-jobs')) {
      return {
        screen: 'EmployerMain',
        params: { screen: 'ManageJobsTab' },
      };
    }

    // Employer Applicants Link
    if (lowerLink.includes('tab=applicants') || lowerLink.includes('/applicants')) {
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

    // Candidate Applied Jobs Link
    if (lowerLink.includes('tab=applied') || lowerLink.includes('/applied')) {
      return {
        screen: 'CandidateMain',
        params: { screen: 'CandidateAppliedTab' },
      };
    }

    // Interviews Link
    if (lowerLink.includes('/interviews') || lowerLink.includes('tab=interviews')) {
      return role === 'employer'
        ? { screen: 'EmployerMain', params: { screen: 'ApplicantsTab' } }
        : { screen: 'MyInterviews' };
    }

    // Saved Jobs Link
    if (lowerLink.includes('/saved') || lowerLink.includes('tab=saved')) {
      return {
        screen: 'CandidateMain',
        params: { screen: 'CandidateSavedTab' },
      };
    }

    // Advertisements / Banners Link
    if (lowerLink.includes('/banners') || lowerLink.includes('/advertisements') || lowerLink.includes('tab=banners')) {
      return role === 'employer'
        ? { screen: 'EmployerBanners' }
        : { screen: 'CandidateMain', params: { screen: 'CandidateJobsTab' } };
    }

    // Specific Job Detail Link (/job/123)
    if (lowerLink.startsWith('/job/') || lowerLink.includes('/jobs/')) {
      if (role === 'employer' && extractedJobId) {
        return {
          screen: 'JobApplicants',
          params: { jobId: extractedJobId, jobTitle: item.title || 'Applicants' },
        };
      }
      if (extractedJobId) {
        return {
          screen: 'CandidateJobDetail',
          params: { jobId: extractedJobId, id: extractedJobId },
        };
      }
    }

    // Support / Help Link
    if (lowerLink.includes('/support') || lowerLink.includes('/help')) {
      return { screen: 'HelpSupport' };
    }

    // Profile Link
    if (lowerLink.includes('/profile') || lowerLink.includes('/company')) {
      return role === 'employer' ? { screen: 'CompanyProfile' } : { screen: 'CandidateProfile' };
    }

    // Security Link
    if (lowerLink.includes('/security') || lowerLink.includes('/settings')) {
      return { screen: 'SecuritySettings' };
    }
  }

  // 3. Candidate & Recruiter Interviews / Scheduled Meetings / Passes
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

  // 4. Candidate Applications & Recruiter Applicant Queue
  if (
    type === 'JOB_APPLICATION' ||
    type === 'NEW_APPLICATION' ||
    type === 'APPLICATION_RECEIVED' ||
    type === 'APPLICATION_SUBMITTED' ||
    type === 'APPLICATION_CONFIRMATION' ||
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

  // 5. Job Management & Approvals / Rejections / Postings
  if (
    type === 'JOB_POSTED' ||
    type === 'JOB_APPROVAL' ||
    type === 'JOB_APPROVED' ||
    type === 'JOB_REJECTED' ||
    type === 'JOB_STATUS' ||
    type === 'JOB_UNPUBLISHED' ||
    type === 'JOB_EXPIRED' ||
    combined.includes('APPROVAL') ||
    combined.includes('APPROVED') ||
    combined.includes('REJECTED') ||
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

  // 6. Banner Ads & Marketing Promotions
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

  // 7. Saved / Bookmarked Jobs & Job Alerts
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

  // 8. Profile, Resume & Verification
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

  // 9. Candidates / Talent Search (for Employer)
  if (combined.includes('CANDIDATE') || combined.includes('WORKER') || combined.includes('TALENT')) {
    if (role === 'employer') {
      return {
        screen: 'EmployerMain',
        params: { screen: 'CandidatesTab' },
      };
    }
  }

  // 10. Security & Credentials Settings
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

  // 11. Support & Helpdesk Tickets
  if (type.includes('SUPPORT') || combined.includes('TICKET') || combined.includes('HELP')) {
    return { screen: 'HelpSupport' };
  }

  // 12. Default fallback based on role
  if (role === 'employer') {
    return { screen: 'EmployerMain', params: { screen: 'ManageJobsTab' } };
  }
  return {
    screen: 'CandidateMain',
    params: { screen: 'CandidateJobsTab' },
  };
};
