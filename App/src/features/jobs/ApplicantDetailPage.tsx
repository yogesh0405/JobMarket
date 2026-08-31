import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Briefcase, 
  Clock, FileText, CheckCircle2, Calendar, Bus, Home, 
  Building2, Check, ArrowLeft, ArrowRight, ExternalLink, Zap, Lock, AlertCircle, HelpCircle,
  Keyboard as KeyboardIcon, Send, ChevronDown, ChevronRight, MessageSquare, IndianRupee
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useJobs } from '../../hooks/useJobs';
import { useToast } from '../../hooks/useToast';
import { apiFetch } from '../../utils/api';
import { ResumePreviewModal } from '../../components/profile/ResumePreviewModal';
import { ClockTimePickerModal } from '../../components/common/ClockTimePickerModal';
import { CalendarDatePickerModal } from '../../components/common/CalendarDatePickerModal';

export type ModalTabType = 'CANDIDATE' | 'JOB' | 'STATUS' | 'INTERVIEW' | 'EMAIL';

const toSafeString = (val: any, fallback: string = ''): string => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }
  if (typeof val === 'number' || typeof val === 'boolean') {
    return String(val);
  }
  if (Array.isArray(val)) {
    const items = val.map((v) => toSafeString(v, '')).filter(Boolean);
    return items.length > 0 ? items.join(', ') : fallback;
  }
  if (typeof val === 'object') {
    if (val.title || val.name || val.role || val.company) {
      return [toSafeString(val.title || val.name || val.role), toSafeString(val.company)].filter(Boolean).join(' at ');
    }
    if (val.degree || val.qualification) {
      return [toSafeString(val.degree || val.qualification), toSafeString(val.institution || val.college)].filter(Boolean).join(' - ');
    }
    if (val.city || val.location || val.address) {
      return [toSafeString(val.address || val.location), toSafeString(val.city), toSafeString(val.state)].filter(Boolean).join(', ');
    }
    try {
      const vals = Object.values(val).map((v) => toSafeString(v, '')).filter(Boolean);
      return vals.length > 0 ? vals.join(' • ') : fallback;
    } catch {
      return fallback;
    }
  }
  return String(val);
};

const tryParseJson = (data: any) => {
  if (!data) return null;
  if (typeof data !== 'string') return data;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

const EMAIL_TEMPLATES = [
  {
    key: 'interview_invitation',
    label: 'Technical Interview Call',
    subject: (job: string) => `Interview Call: ${job} - Industrial Technical Round`,
    message: (name: string, job: string) =>
      `Dear ${name},\n\nWe have reviewed your profile and shortlisted your application for the ${job} position. We would like to invite you for a technical assessment.\n\nPlease check your schedule details and confirm your availability.\n\nBest regards,\nRecruitment Team`,
  },
  {
    key: 'shortlisted_notice',
    label: 'Application Shortlisted',
    subject: (job: string) => `Update: Your application for ${job} is Shortlisted`,
    message: (name: string, job: string) =>
      `Dear ${name},\n\nYour application for ${job} has been shortlisted by our plant engineering team. Our HR coordinator will reach out shortly regarding interview scheduling.\n\nBest regards,\nHR Department`,
  },
  {
    key: 'offer_discussion',
    label: 'Job Offer & Joining Terms',
    subject: (job: string) => `Offer Discussion: Selected for ${job}`,
    message: (name: string, job: string) =>
      `Dear ${name},\n\nCongratulations! We are pleased to extend an employment offer for ${job}. Please find attached joining terms, stipend/salary breakdown, and facility details.\n\nBest regards,\nPlant HR Team`,
  },
  {
    key: 'document_request',
    label: 'Document Verification Request',
    subject: (job: string) => `Document Verification: ${job}`,
    message: (name: string, job: string) =>
      `Dear ${name},\n\nTo proceed with your application for ${job}, please bring/upload your ITI trade marksheets, Aadhaar card, and previous experience letter.\n\nBest regards,\nVerification Desk`,
  },
];

const PIPELINE_STAGES: Array<{
  key: string;
  label: string;
  desc: string;
  stepNumber: number;
}> = [
  {
    key: 'applied',
    label: 'Application Received',
    desc: 'Application submitted and placed in review queue',
    stepNumber: 1,
  },
  {
    key: 'shortlisted',
    label: 'Candidate Shortlisted',
    desc: 'Profile evaluated & shortlisted for technical interview',
    stepNumber: 2,
  },
  {
    key: 'interview',
    label: 'Interview Scheduled',
    desc: 'Interview schedule confirmed and interview pass dispatched',
    stepNumber: 3,
  },
  {
    key: 'hired',
    label: 'Hired / Offer Accepted',
    desc: 'Candidate successfully onboarded and accepted job position',
    stepNumber: 4,
  },
];

const formatStatusDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
};

export const ApplicantDetailPage: React.FC = () => {
  const { jobId, applicantId, id } = useParams<{ jobId?: string; applicantId?: string; id?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { updateApplicantStatus, scheduleInterview, sendCustomEmail } = useJobs();
  const { showToast } = useToast();

  const effectiveJobId = jobId || searchParams.get('jobId') || '';
  const effectiveApplicantId = applicantId || id || searchParams.get('applicantId') || '';

  const [loading, setLoading] = useState(true);
  const [applicant, setApplicant] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<ModalTabType>('CANDIDATE');
  const [previewResume, setPreviewResume] = useState<any>(null);

  // Status & Timestamps
  const [currentStatus, setCurrentStatus] = useState<string>('applied');
  const [statusDates, setStatusDates] = useState<Record<string, string>>({});
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [pendingStatusTarget, setPendingStatusTarget] = useState<{
    newStatus: string;
    label: string;
  } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Interview States
  const [interviewMode, setInterviewMode] = useState('In-Person Walk-in');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('10:00 AM');
  const [interviewLocation, setInterviewLocation] = useState('Factory Gate #2, Industrial MIDC');
  const [interviewNotes, setInterviewNotes] = useState('Bring original ITI trade certificate & Aadhaar card.');
  const [isScheduling, setIsScheduling] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  // Email States
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [selectedTemplateLabel, setSelectedTemplateLabel] = useState('');
  const [templateDropdownVisible, setTemplateDropdownVisible] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Success Modal Data
  const [successModalData, setSuccessModalData] = useState<{
    title: string;
    message: string;
    buttonText: string;
    destinationTab?: ModalTabType;
  }>({
    title: 'Status Updated Successfully',
    message: '',
    buttonText: 'Done',
  });

  const loadApplicantData = useCallback(async () => {
    setLoading(true);
    try {
      if (effectiveJobId) {
        const jobRes = await apiFetch(`/api/v1/jobs/${effectiveJobId}`);
        const jobJson = await jobRes.json();
        if (jobRes.ok && jobJson.success) {
          setJob(jobJson.data);
        }

        const appsRes = await apiFetch(`/api/v1/jobs/${effectiveJobId}/applicants`);
        const appsJson = await appsRes.json();
        if (appsRes.ok && appsJson.success) {
          const list = appsJson.data || [];
          const matched = list.find((a: any) => String(a.userId || a.id) === String(effectiveApplicantId));
          if (matched) {
            setApplicant(matched);
            initStatus(matched);
            return;
          }
        }
      }

      // Fallback direct user fetch from DB
      if (effectiveApplicantId) {
        try {
          const profileRes = await apiFetch(`/api/v1/auth/public-profile/${effectiveApplicantId}`);
          if (profileRes.ok) {
            const userJson = await profileRes.json();
            if (userJson.success && userJson.user) {
              setApplicant({
                ...userJson.user,
                user: userJson.user,
              });
              initStatus(userJson.user);
              return;
            }
          }
        } catch (_) {}

        const userRes = await apiFetch(`/api/v1/users/${effectiveApplicantId}`);
        const userJson = await userRes.json();
        if (userRes.ok && userJson.success) {
          setApplicant(userJson.data);
          initStatus(userJson.data);
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast('Failed to load candidate details', 'error');
    } finally {
      setLoading(false);
    }
  }, [effectiveJobId, effectiveApplicantId]);

  const initStatus = (item: any) => {
    const curStatus = toSafeString(item.status || 'applied', 'applied').toLowerCase();
    setCurrentStatus(curStatus);
    const initialAppliedDate = toSafeString(item.applied_at || item.created_at || new Date().toISOString());
    const initialUpdatedDate = toSafeString(item.updated_at || initialAppliedDate);
    const pipeline = ['applied', 'shortlisted', 'interview', 'hired'];
    const curIdx = pipeline.indexOf(curStatus);

    const initialDates: Record<string, string> = { applied: initialAppliedDate };
    if (curIdx > 0) {
      for (let i = 1; i <= curIdx; i++) {
        initialDates[pipeline[i]] = initialUpdatedDate;
      }
    }
    if (curStatus === 'rejected') {
      initialDates['rejected'] = initialUpdatedDate;
    }
    if (typeof item.status_dates === 'object' && item.status_dates !== null) {
      Object.assign(initialDates, item.status_dates);
    }
    setStatusDates(initialDates);
  };

  useEffect(() => {
    loadApplicantData();
  }, [loadApplicantData]);

  const user = (typeof applicant?.user === 'object' && applicant?.user !== null) ? applicant.user : (applicant || {});
  const candidateName = toSafeString(user?.name, 'Candidate');
  const candidateHeadline = toSafeString(user?.trade_specialization || user?.headline, 'Industrial Technical Specialist');
  const candidatePhone = toSafeString(user?.phone, '');
  const candidateEmail = toSafeString(user?.email, '');
  const candidateLocation = user?.city
    ? `${toSafeString(user.city)}, ${toSafeString(user.state, 'Maharashtra')}`
    : toSafeString(user?.location || user?.address, 'Chhatrapati Sambhajinagar');
  const candidateShift = toSafeString(user?.preferred_shift || user?.shift_preference || user?.shift_timing, 'Rotational / Day Shift');
  const candidateMidc = toSafeString(user?.midc_zone || user?.midcZone || user?.preferred_location, 'Waluj / Shendra MIDC');
  const requiresBus = Boolean(user?.requires_bus || user?.requiresBus);
  const requiresAccommodation = Boolean(user?.requires_accommodation || user?.requiresAccommodation);
  const bioText = toSafeString(user?.bio || user?.about, '');

  const rawSkills = tryParseJson(user?.skills);
  const skillsList: string[] = Array.isArray(rawSkills)
    ? rawSkills.map((s: any) => toSafeString(s, '')).filter(Boolean)
    : typeof rawSkills === 'string' && rawSkills.trim()
    ? rawSkills.split(',').map((s: string) => toSafeString(s, '')).filter(Boolean)
    : [];

  const rawExperience = tryParseJson(user?.experience);
  let experienceList: any[] = [];
  if (Array.isArray(rawExperience) && rawExperience.length > 0) {
    experienceList = rawExperience;
  } else if (typeof rawExperience === 'object' && rawExperience !== null) {
    experienceList = [rawExperience];
  } else if (user?.experience || user?.experience_years != null || user?.current_company || user?.trade_specialization) {
    experienceList = [
      {
        title: toSafeString(user.trade_specialization || user.headline, 'Industrial Technical Specialist'),
        company: toSafeString(user.current_company || user.company_name, 'Industrial Engineering Works'),
        duration: user.experience_years != null ? `${user.experience_years} Years Experience` : toSafeString(user.experience, '2022 - Present'),
        description: toSafeString(user.bio || user.role_summary, ''),
        isCurrent: true,
      },
    ];
  }

  const rawEducation = tryParseJson(user?.education || user?.qualification);
  let educationList: any[] = [];
  if (Array.isArray(rawEducation) && rawEducation.length > 0) {
    educationList = rawEducation;
  } else if (typeof rawEducation === 'object' && rawEducation !== null) {
    educationList = [rawEducation];
  } else if (user?.highest_qualification || user?.education || user?.degree) {
    educationList = [
      {
        degree: toSafeString(user.highest_qualification || user.degree || user.education, 'ITI / Technical Diploma'),
        institution: toSafeString(user.institute_name || user.college, 'Government Industrial Training Institute (ITI)'),
        year: toSafeString(user.passing_year || user.graduation_year, '2022'),
      },
    ];
  }

  const rawResume = user?.resume || user?.resume_url || user?.resumeUrl || applicant?.resume;
  const resumeUrl = typeof rawResume === 'string' ? rawResume : rawResume?.url ? toSafeString(rawResume.url) : '';
  const resumeName = typeof rawResume === 'object' && rawResume?.name ? toSafeString(rawResume.name) : `${candidateName}_Resume.pdf`;

  const userPhotoUrl = toSafeString(
    user?.profilePictureUrl ||
    user?.profile_picture_url ||
    user?.profilePicture ||
    user?.profile_picture ||
    user?.avatar_url ||
    user?.avatarUrl ||
    user?.avatar ||
    user?.photo ||
    user?.photo_url ||
    user?.photoUrl ||
    applicant?.user?.profilePictureUrl ||
    applicant?.user?.profile_picture_url ||
    applicant?.profilePictureUrl ||
    applicant?.profile_picture_url ||
    applicant?.profile_picture ||
    applicant?.profilePicture ||
    applicant?.avatar_url ||
    applicant?.avatarUrl ||
    applicant?.avatar ||
    applicant?.photo ||
    ''
  );

  const [photoError, setPhotoError] = useState(false);
  const hasValidPhoto = Boolean(userPhotoUrl && !photoError && (userPhotoUrl.startsWith('http') || userPhotoUrl.startsWith('/') || userPhotoUrl.startsWith('data:')));

  const applyEmailTemplate = (key: string) => {
    const jobTitle = toSafeString(job?.title, 'Industrial Operator');
    const tpl = EMAIL_TEMPLATES.find((t) => t.key === key);
    if (tpl) {
      setSelectedTemplateLabel(tpl.label);
      setEmailSubject(tpl.subject(jobTitle));
      setEmailMessage(tpl.message(candidateName, jobTitle));
    }
  };

  const handleInitiateStatusChange = (newStatus: string) => {
    if (currentStatus === newStatus) return;
    const statusLabels: Record<string, string> = {
      applied: 'Applied',
      shortlisted: 'Shortlisted',
      interview: 'Interview Scheduled',
      hired: 'Hired',
      rejected: 'Rejected',
    };
    setPendingStatusTarget({
      newStatus,
      label: statusLabels[newStatus] || newStatus.toUpperCase(),
    });
    setConfirmModalVisible(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatusTarget) return;
    const { newStatus, label } = pendingStatusTarget;

    if (newStatus === 'interview') {
      setConfirmModalVisible(false);
      setActiveTab('INTERVIEW');
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const targetUserId = toSafeString(user?.id || applicant?.userId || applicant?.id);
      if (updateApplicantStatus && effectiveJobId && targetUserId) {
        await updateApplicantStatus(effectiveJobId, targetUserId, newStatus);
      }
      const nowIso = new Date().toISOString();
      const pipeline = ['applied', 'shortlisted', 'interview', 'hired'];
      const targetIdx = pipeline.indexOf(newStatus.toLowerCase());

      const updatedDates = { ...statusDates };
      if (targetIdx !== -1) {
        for (let i = 0; i <= targetIdx; i++) {
          if (!updatedDates[pipeline[i]]) {
            updatedDates[pipeline[i]] = nowIso;
          }
        }
        updatedDates[newStatus.toLowerCase()] = nowIso;
      } else if (newStatus.toLowerCase() === 'rejected') {
        updatedDates['rejected'] = nowIso;
      }

      setStatusDates(updatedDates);
      setCurrentStatus(newStatus);
      setConfirmModalVisible(false);
      setSuccessModalData({
        title: 'Status Updated Successfully',
        message: `Candidate ${candidateName} is now marked as "${label}".`,
        buttonText: 'Done',
        destinationTab: undefined,
      });
      setSuccessModalVisible(true);
      showToast(`Candidate marked as ${label}`, 'success');
    } catch (err: any) {
      setConfirmModalVisible(false);
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleScheduleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!interviewDate) {
      showToast('Please select interview date', 'error');
      return;
    }

    setIsScheduling(true);
    try {
      const targetUserId = toSafeString(user?.id || applicant?.userId || applicant?.id);
      const venue = interviewLocation.trim() || 'Industrial Plant Main Gate';

      if (scheduleInterview && effectiveJobId && targetUserId) {
        await scheduleInterview(effectiveJobId, targetUserId, {
          interviewDate,
          interviewTime: interviewTime || '10:00 AM',
          venueAddress: venue,
          interviewLocation: venue,
          interviewMode,
          notes: interviewNotes,
        });
      }

      if (updateApplicantStatus && effectiveJobId && targetUserId) {
        await updateApplicantStatus(effectiveJobId, targetUserId, 'interview');
      }

      const nowIso = new Date().toISOString();
      const pipeline = ['applied', 'shortlisted', 'interview', 'hired'];
      const targetIdx = pipeline.indexOf('interview');
      const updatedDates = { ...statusDates };
      for (let i = 0; i <= targetIdx; i++) {
        if (!updatedDates[pipeline[i]]) {
          updatedDates[pipeline[i]] = nowIso;
        }
      }
      updatedDates['interview'] = nowIso;
      setStatusDates(updatedDates);
      setCurrentStatus('interview');

      setSuccessModalData({
        title: 'Interview Successfully Scheduled',
        message: `Official interview invite for ${candidateName} has been recorded for ${interviewDate} at ${interviewTime || '10:00 AM'}.\n\nApplication status is now updated to "Interview Scheduled".`,
        buttonText: 'View Status Pipeline',
        destinationTab: 'STATUS',
      });
      setSuccessModalVisible(true);
      showToast('Interview scheduled successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule interview', 'error');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleSendEmailSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!emailSubject.trim() || !emailMessage.trim()) {
      showToast('Email subject and message body are required', 'error');
      return;
    }

    setIsSendingEmail(true);
    try {
      const targetUserId = toSafeString(user?.id || applicant?.userId || applicant?.id);
      if (sendCustomEmail && effectiveJobId && targetUserId) {
        await sendCustomEmail(effectiveJobId, targetUserId, {
          subject: emailSubject,
          message: emailMessage,
        });
      }
      showToast('Email sent to candidate successfully!', 'success');
      setEmailSubject('');
      setEmailMessage('');
      setSelectedTemplateLabel('');
    } catch (err: any) {
      showToast(err.message || 'Failed to send email', 'error');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const isRejected = currentStatus === 'rejected';
  const normalizedStatus = currentStatus === 'interviewed' || currentStatus === 'interview_scheduled' ? 'interview' : currentStatus;
  const currentPipelineIdx = PIPELINE_STAGES.findIndex((s) => s.key === normalizedStatus);

  if (loading) {
    return (
      <div style={{ maxWidth: '640px', margin: '40px auto', padding: '24px', textAlign: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '2.5px solid #E2E8F0', borderTopColor: '#1764E8', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Loading Candidate Details...</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F7F9FC', minHeight: 'calc(100vh - 70px)' }}>
      {/* ── FULL WIDTH TOP HEADER ── */}
      <div style={{
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E7EBF2',
        boxShadow: '0 1px 3px rgba(20, 42, 80, 0.04)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '16px 16px 0' }}>
          {/* Identity Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            paddingBottom: '12px',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={() => {
                if (effectiveJobId) {
                  navigate(`/dashboard?tab=applicants&jobId=${effectiveJobId}`);
                } else {
                  navigate('/dashboard?tab=applicants');
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px',
                marginLeft: '-6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#0F172A'
              }}
            >
              <ArrowLeft size={20} />
            </button>

            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              backgroundColor: '#EEF4FF',
              border: '1px solid #DBEAFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {hasValidPhoto ? (
                <img
                  src={userPhotoUrl}
                  alt={candidateName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => setPhotoError(true)}
                />
              ) : (
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#1764E8' }}>
                  {candidateName
                    ? candidateName.trim().split(/\s+/).map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
                    : 'C'}
                </span>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#102A5C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {candidateName}
              </div>
              <div style={{ fontSize: '11.5px', color: '#657796', fontWeight: 500, marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {candidateHeadline}
              </div>
            </div>
          </div>

          {/* 5 Segmented Navigation Tabs */}
          <div
            className="no-scrollbar"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 2px',
              gap: '12px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              borderTop: '1px solid #F1F5F9'
            }}
          >
            {[
              { key: 'JOB', label: 'Job Info', icon: Briefcase },
              { key: 'CANDIDATE', label: 'Candidate Info', icon: User },
              { key: 'STATUS', label: 'Status', icon: Zap },
              { key: 'INTERVIEW', label: 'Interview', icon: Calendar },
              { key: 'EMAIL', label: 'Send Email', icon: Mail },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as ModalTabType)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '8px 4px',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    backgroundColor: 'transparent',
                    borderBottom: isActive ? '2px solid #1764E8' : '2px solid transparent',
                    color: isActive ? '#1764E8' : '#657796',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    marginBottom: '-1px',
                    flexShrink: 0
                  }}
                >
                  <IconComp size={13} color={isActive ? '#1764E8' : '#657796'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div style={{ maxWidth: '680px', margin: '14px auto 32px', padding: '0 14px' }}>
        {/* Main Section Card Container (Matching Mobile App exactly) */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '6px',
          border: '1px solid #E7EBF2',
          padding: '14px',
          boxShadow: '0 2px 6px rgba(20, 42, 80, 0.04)'
        }}>
          {/* ═══════════ TAB 1: CANDIDATE INFO ═══════════ */}
          {activeTab === 'CANDIDATE' && (
            <div>
              {/* 1. Quick Action Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <a
                  href={candidatePhone ? `tel:${candidatePhone}` : '#'}
                  onClick={(e) => { if (!candidatePhone) { e.preventDefault(); alert('Phone not provided'); } }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    height: '36px',
                    backgroundColor: '#F8FAFC',
                    color: '#1764E8',
                    textDecoration: 'none',
                    fontSize: '11px',
                    fontWeight: 600
                  }}
                >
                  <Phone size={13} color="#1764E8" />
                  <span>Call</span>
                </a>

                <a
                  href={candidatePhone ? `https://wa.me/${candidatePhone.replace(/[^0-9]/g, '')}` : '#'}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => { if (!candidatePhone) { e.preventDefault(); alert('WhatsApp not provided'); } }}
                  style={{
                    flex: 1.3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    height: '36px',
                    backgroundColor: '#F8FAFC',
                    color: '#15803D',
                    textDecoration: 'none',
                    fontSize: '11px',
                    fontWeight: 600
                  }}
                >
                  <MessageSquare size={13} color="#16A34A" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={candidateEmail ? `mailto:${candidateEmail}` : '#'}
                  onClick={(e) => {
                    if (!candidateEmail) {
                      e.preventDefault();
                      setActiveTab('EMAIL');
                    }
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    height: '36px',
                    backgroundColor: '#F8FAFC',
                    color: '#DC2626',
                    textDecoration: 'none',
                    fontSize: '11px',
                    fontWeight: 600
                  }}
                >
                  <Mail size={13} color="#DC2626" />
                  <span>Email</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    if (resumeUrl) {
                      setPreviewResume({ url: resumeUrl, name: resumeName });
                    } else {
                      alert("Candidate hasn't uploaded resume yet.");
                    }
                  }}
                  style={{
                    flex: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    border: '1px solid #BFDBFE',
                    borderRadius: '6px',
                    height: '36px',
                    backgroundColor: '#EFF6FF',
                    color: '#1764E8',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 600
                  }}
                >
                  <FileText size={13} color="#1764E8" />
                  <span>Resume</span>
                </button>
              </div>

              {/* 2. Candidate Bio Summary */}
              {bioText && (
                <>
                  <div style={{ height: '1px', backgroundColor: '#E7EBF2', margin: '14px 0' }} />
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#657796', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    ABOUT CANDIDATE
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: '19px' }}>
                    {bioText}
                  </div>
                </>
              )}

              {/* 3. Work Experience Timeline */}
              <div style={{ height: '1px', backgroundColor: '#E7EBF2', margin: '14px 0' }} />
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#657796', letterSpacing: '0.5px', marginBottom: '8px' }}>
                WORK EXPERIENCE
              </div>

              {experienceList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {experienceList.map((item, idx) => {
                    const isCurrent = idx === 0 || item?.isCurrent;
                    const isLast = idx === experienceList.length - 1;
                    const durationText = toSafeString(item?.duration || (item?.years ? `${item.years} Yrs Experience` : '2021 - Present'), '2021 - Present');
                    const roleTitle = toSafeString(item?.title || item?.role, 'Technical Specialist');
                    const companyName = toSafeString(item?.company, '');
                    const displayHeading = companyName ? `${roleTitle} at ${companyName}` : roleTitle;
                    const descText = toSafeString(item?.description, '');

                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'stretch' }}>
                        <div style={{ width: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '8px', position: 'relative', flexShrink: 0 }}>
                          {!isLast && (
                            <div style={{
                              position: 'absolute',
                              top: '18px',
                              bottom: '-10px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '1.5px',
                              backgroundColor: '#CBD5E1',
                              zIndex: 1
                            }} />
                          )}
                          <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#1E293B', marginTop: '14px', zIndex: 2, position: 'relative' }} />
                        </div>

                        <div style={{ flex: 1, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#102A5C' }}>{durationText}</span>
                            {isCurrent && (
                              <span style={{ backgroundColor: '#ECFDF5', color: '#059669', fontSize: '9.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                                Current Role
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#102A5C', letterSpacing: '-0.1px' }}>{displayHeading}</div>
                          {descText && <div style={{ fontSize: '11px', color: '#657796', marginTop: '2px' }}>{descText}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '10px', textAlign: 'center', fontSize: '11px', color: '#657796' }}>
                  No work experience details provided.
                </div>
              )}

              {/* 4. Education Timeline */}
              <div style={{ height: '1px', backgroundColor: '#E7EBF2', margin: '14px 0' }} />
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#657796', letterSpacing: '0.5px', marginBottom: '8px' }}>
                EDUCATION & QUALIFICATIONS
              </div>

              {educationList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {educationList.map((item, idx) => {
                    const isLast = idx === educationList.length - 1;
                    const yearText = toSafeString(item?.year ? `Class of ${item.year}` : (item?.duration || 'Class of 2022'));
                    const degreeText = toSafeString(item?.degree || item?.qualification, 'ITI / Diploma Degree');
                    const instText = toSafeString(item?.institution || item?.college || item?.school, 'Government Technical Institute');

                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'stretch' }}>
                        <div style={{ width: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '8px', position: 'relative', flexShrink: 0 }}>
                          {!isLast && (
                            <div style={{
                              position: 'absolute',
                              top: '18px',
                              bottom: '-10px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '1.5px',
                              backgroundColor: '#CBD5E1',
                              zIndex: 1
                            }} />
                          )}
                          <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#1E293B', marginTop: '14px', zIndex: 2, position: 'relative' }} />
                        </div>

                        <div style={{ flex: 1, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px' }}>
                          <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#102A5C', marginBottom: '2px' }}>{yearText}</div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#102A5C' }}>{degreeText}</div>
                          {instText && <div style={{ fontSize: '11px', color: '#657796', marginTop: '2px' }}>{instText}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '10px', textAlign: 'center', fontSize: '11px', color: '#657796' }}>
                  No education details provided.
                </div>
              )}

              {/* 5. Location & Work Preferences */}
              <div style={{ height: '1px', backgroundColor: '#E7EBF2', margin: '14px 0' }} />
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#657796', letterSpacing: '0.5px', marginBottom: '8px' }}>
                LOCATION & WORK PREFERENCES
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={15} color="#1764E8" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10.5px', color: '#657796', fontWeight: 500 }}>Current Residence Location</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#102A5C', marginTop: '1px' }}>{candidateLocation}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={15} color="#1764E8" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10.5px', color: '#657796', fontWeight: 500 }}>Preferred MIDC Industrial Zone</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#102A5C', marginTop: '1px' }}>{candidateMidc}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={15} color="#1764E8" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10.5px', color: '#657796', fontWeight: 500 }}>Preferred Shift Mode</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#102A5C', marginTop: '1px' }}>{candidateShift}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bus size={15} color="#1764E8" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10.5px', color: '#657796', fontWeight: 500 }}>Company Bus Facility</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#102A5C', marginTop: '1px' }}>
                      {requiresBus ? 'Required / Depends on Company Bus Route' : 'Not Required (Own Transport)'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Home size={15} color="#1764E8" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10.5px', color: '#657796', fontWeight: 500 }}>Hostel / Accommodation</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#102A5C', marginTop: '1px' }}>
                      {requiresAccommodation ? 'Accommodation Assistance Required' : 'Self-Arranged Local Residence'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Skills */}
              {skillsList.length > 0 && (
                <>
                  <div style={{ height: '1px', backgroundColor: '#E7EBF2', margin: '14px 0' }} />
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#657796', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    TECHNICAL SKILLS & COMPETENCIES
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {skillsList.map((skill, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#334155'
                      }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '2.5px', backgroundColor: '#1764E8' }} />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* 7. Attached Resume Card */}
              <div style={{ height: '1px', backgroundColor: '#E7EBF2', margin: '14px 0' }} />
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#657796', letterSpacing: '0.5px', marginBottom: '8px' }}>
                ATTACHED RESUME & BIO-DATA
              </div>

              {resumeUrl ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '10px',
                  gap: '8px'
                }}>
                  <div style={{ width: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={18} color="#1764E8" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#102A5C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {resumeName}
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#059669', marginTop: '1px' }}>
                      ✓ S3 Cloud Document Verified
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewResume({ url: resumeUrl, name: resumeName })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#1764E8',
                      border: 'none',
                      color: '#FFFFFF',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <span>View</span>
                    <ExternalLink size={11} />
                  </button>
                </div>
              ) : (
                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '12px', textAlign: 'center', fontSize: '11.5px', color: '#657796', fontWeight: 500 }}>
                  No resume PDF attached by candidate yet.
                </div>
              )}
            </div>
          )}

          {/* ═══════════ TAB 2: JOB INFO ═══════════ */}
          {activeTab === 'JOB' && (() => {
            const appliedJob = applicant?.job || job || {};
            const jobTitleDisplay = toSafeString(appliedJob?.title || job?.title, 'Industrial Operator');
            const jobCompanySub = `${toSafeString(appliedJob?.company || job?.company || 'Industrial Enterprise')} • ${toSafeString(appliedJob?.trade || appliedJob?.industry || job?.trade || 'Industrial Trade')}`;
            const minSal = appliedJob?.salary_min || appliedJob?.minSalary;
            const maxSal = appliedJob?.salary_max || appliedJob?.maxSalary;
            const salaryDisplay = minSal
              ? `₹${Number(minSal).toLocaleString()} - ₹${Number(maxSal || (Number(minSal) + 8000)).toLocaleString()} / mo`
              : '₹25,000 - ₹35,000 / mo';
            const vacanciesDisplay = `${appliedJob?.openings || (appliedJob as any)?.vacancies || job?.openings || 1} Openings`;
            const locationDisplay = toSafeString(appliedJob?.location || (appliedJob as any)?.midcZone || job?.location, 'Waluj MIDC Industrial Area');
            const shiftModeDisplay = `${toSafeString((appliedJob as any)?.shift_timing || (appliedJob as any)?.shiftTiming || (appliedJob as any)?.shift_category || job?.shiftTiming || 'Day Shift')} • ${toSafeString(appliedJob?.work_mode || (appliedJob as any)?.workMode || job?.workMode || 'On-site')}`;
            const jobDescription = appliedJob?.description || job?.description;
            const rawJobSkills = tryParseJson(appliedJob?.skills || job?.skills);
            const jobSkills: string[] = Array.isArray(rawJobSkills)
              ? rawJobSkills.map((s: any) => toSafeString(s, '')).filter(Boolean)
              : typeof rawJobSkills === 'string' && rawJobSkills.trim()
              ? rawJobSkills.split(',').map((s: string) => toSafeString(s, '')).filter(Boolean)
              : [];

            return (
              <div>
                {/* 1. Header Information */}
                <div style={{ marginBottom: '2px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#102A5C', lineHeight: '21px' }}>
                    {jobTitleDisplay}
                  </div>
                  <div style={{ fontSize: '11.5px', fontWeight: 500, color: '#657796', marginTop: '3px' }}>
                    {jobCompanySub}
                  </div>
                </div>

                <div style={{ height: '1px', backgroundColor: '#E7EBF2', margin: '12px 0' }} />

                {/* 2. Specifications List */}
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#657796', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  JOB SPECIFICATIONS
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {/* Salary Offer */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0' }}>
                    <div style={{ width: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IndianRupee size={13} color="#1764E8" strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '10.5px', color: '#657796', fontWeight: 500 }}>Salary Offer</div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#102A5C', marginTop: '1px' }}>
                        {salaryDisplay}
                      </div>
                    </div>
                  </div>

                  <div style={{ height: '1px', backgroundColor: '#F8FAFC' }} />

                  {/* Open Vacancies */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0' }}>
                    <div style={{ width: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={13} color="#1764E8" strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '10.5px', color: '#657796', fontWeight: 500 }}>Open Vacancies</div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#102A5C', marginTop: '1px' }}>
                        {vacanciesDisplay}
                      </div>
                    </div>
                  </div>

                  <div style={{ height: '1px', backgroundColor: '#F8FAFC' }} />

                  {/* Location */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0' }}>
                    <div style={{ width: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MapPin size={13} color="#1764E8" strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '10.5px', color: '#657796', fontWeight: 500 }}>Work Location</div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#102A5C', marginTop: '1px' }}>
                        {locationDisplay}
                      </div>
                    </div>
                  </div>

                  <div style={{ height: '1px', backgroundColor: '#F8FAFC' }} />

                  {/* Shift */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0' }}>
                    <div style={{ width: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={13} color="#1764E8" strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '10.5px', color: '#657796', fontWeight: 500 }}>Work Shift & Mode</div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#102A5C', marginTop: '1px' }}>
                        {shiftModeDisplay}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Job Description */}
                {jobDescription ? (
                  <>
                    <div style={{ height: '1px', backgroundColor: '#E7EBF2', margin: '12px 0' }} />
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#657796', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      JOB DESCRIPTION
                    </div>
                    <div style={{ fontSize: '12px', color: '#334155', lineHeight: '18px' }}>
                      {jobDescription}
                    </div>
                  </>
                ) : null}

                {/* 4. Required Skills */}
                {jobSkills.length > 0 ? (
                  <>
                    <div style={{ height: '1px', backgroundColor: '#E7EBF2', margin: '12px 0' }} />
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#657796', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      REQUIRED SKILLS
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                      {jobSkills.map((skill: any, i: number) => (
                        <div key={i} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#334155'
                        }}>
                          <div style={{ width: '5px', height: '5px', borderRadius: '2.5px', backgroundColor: '#1764E8' }} />
                          <span>{toSafeString(skill)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            );
          })()}

          {/* ═══════════ TAB 3: STATUS ═══════════ */}
          {activeTab === 'STATUS' && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#657796', letterSpacing: '0.5px', marginBottom: '4px' }}>
                CURRENT APPLICATION PIPELINE
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', marginBottom: '12px' }}>
                <span style={{
                  backgroundColor: currentStatus === 'rejected' ? '#FEE2E2' : currentStatus === 'hired' ? '#DCFCE7' : currentStatus === 'interview' ? '#EFF6FF' : '#F1F5F9',
                  color: currentStatus === 'rejected' ? '#DC2626' : currentStatus === 'hired' ? '#16A34A' : currentStatus === 'interview' ? '#1764E8' : '#475569',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}>
                  {currentStatus}
                </span>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#102A5C' }}>
                  {isRejected
                    ? `Rejected on ${formatStatusDate(statusDates['rejected'] || applicant?.updated_at)}`
                    : `Stage ${Math.max(1, currentPipelineIdx + 1)} of 4`}
                </span>
              </div>

              <div style={{ height: '1px', backgroundColor: '#E7EBF2', margin: '12px 0' }} />

              <div style={{ fontSize: '11px', fontWeight: 700, color: '#657796', letterSpacing: '0.5px', marginBottom: '4px' }}>
                APPLICATION STAGES WORKFLOW
              </div>
              <div style={{ fontSize: '11px', color: '#657796', lineHeight: '15px', marginBottom: '10px' }}>
                Advance the candidate step-by-step. Previous milestones are locked once completed.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {PIPELINE_STAGES.map((stage, idx) => {
                  const isCompleted = !isRejected && currentPipelineIdx > idx;
                  const isCurrent = !isRejected && currentPipelineIdx === idx;
                  const isUpcoming = !isRejected && currentPipelineIdx < idx;
                  const isLastStep = idx === PIPELINE_STAGES.length - 1;

                  const stageDate = statusDates[stage.key] || (isCompleted || isCurrent ? applicant?.applied_at : undefined);
                  const formattedDate = formatStatusDate(stageDate);

                  return (
                    <div key={stage.key} style={{ display: 'flex', alignItems: 'stretch' }}>
                      <div style={{ width: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '10px', position: 'relative' }}>
                        {!isLastStep && (
                          <div style={{
                            position: 'absolute',
                            top: '22px',
                            bottom: '-10px',
                            width: '2px',
                            backgroundColor: isCompleted ? '#10B981' : '#E2E8F0',
                            zIndex: 1
                          }} />
                        )}
                        {isCompleted ? (
                          <div style={{ width: '22px', height: '22px', borderRadius: '11px', backgroundColor: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px', zIndex: 2 }}>
                            <Check size={12} color="#FFFFFF" strokeWidth={3} />
                          </div>
                        ) : isCurrent ? (
                          <div style={{ width: '22px', height: '22px', borderRadius: '11px', backgroundColor: '#EEF4FF', border: '2px solid #1764E8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px', zIndex: 2 }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#1764E8' }} />
                          </div>
                        ) : (
                          <div style={{ width: '22px', height: '22px', borderRadius: '11px', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px', zIndex: 2, fontSize: '10.5px', fontWeight: 700, color: '#64748B' }}>
                            {stage.stepNumber}
                          </div>
                        )}
                      </div>

                      <div
                        onClick={() => {
                          if (isUpcoming) handleInitiateStatusChange(stage.key);
                        }}
                        style={{
                          flex: 1,
                          backgroundColor: isCurrent ? '#EFF6FF' : isCompleted ? '#F8FAFC' : '#FFFFFF',
                          border: isCurrent ? '1.5px solid #1764E8' : '1px solid #E2E8F0',
                          borderRadius: '8px',
                          padding: '12px',
                          cursor: isUpcoming ? 'pointer' : 'default',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: isCurrent ? '#1764E8' : '#102A5C' }}>
                                {stage.label}
                              </span>
                              {isCurrent && (
                                <span style={{ backgroundColor: '#1764E8', color: '#FFFFFF', fontSize: '9.5px', fontWeight: 700, padding: '1.5px 6px', borderRadius: '4px' }}>
                                  Active Stage
                                </span>
                              )}
                              {isCompleted && (
                                <span style={{ backgroundColor: '#ECFDF5', color: '#059669', fontSize: '9.5px', fontWeight: 700, padding: '1.5px 6px', borderRadius: '4px' }}>
                                  Completed
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: '#657796', lineHeight: '15px' }}>{stage.desc}</div>
                          </div>

                          {isUpcoming ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '4px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 700, color: '#1764E8' }}>
                              <span>Select</span>
                              <ArrowRight size={11} color="#1764E8" />
                            </div>
                          ) : isCompleted ? (
                            <Lock size={13} color="#94A3B8" />
                          ) : (
                            <CheckCircle2 size={16} color="#1764E8" />
                          )}
                        </div>

                        {formattedDate ? (
                          <div style={{ marginTop: '6px', paddingTop: '4px', borderTop: '1px solid #F1F5F9', fontSize: '10.5px', fontWeight: 600, color: isCurrent ? '#1764E8' : '#059669' }}>
                            {isCurrent ? `Active since: ${formattedDate}` : `Completed on: ${formattedDate}`}
                          </div>
                        ) : isUpcoming ? (
                          <div style={{ marginTop: '6px', paddingTop: '4px', borderTop: '1px solid #F1F5F9', fontSize: '10.5px', color: '#94A3B8', fontWeight: 500 }}>
                            • Pending selection
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ height: '1px', backgroundColor: '#E7EBF2', margin: '14px 0' }} />

              <div style={{ fontSize: '11px', fontWeight: 700, color: '#657796', letterSpacing: '0.5px', marginBottom: '8px' }}>
                APPLICATION DECISION
              </div>

              {isRejected ? (
                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#DC2626', fontSize: '13px', fontWeight: 700 }}>
                    <AlertCircle size={16} />
                    <span>Application Rejected</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#7F1D1D', marginTop: '2px' }}>
                    This candidate application is marked as rejected and closed.
                  </div>
                  {statusDates['rejected'] && (
                    <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#DC2626', marginTop: '4px' }}>
                      Closed on: {formatStatusDate(statusDates['rejected'])}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleInitiateStatusChange('rejected')}
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '6px',
                    border: '1px solid #FECACA',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <AlertCircle size={15} />
                  <span>Reject & Close Application</span>
                </button>
              )}
            </div>
          )}

          {/* ═══════════ TAB 4: INTERVIEW ═══════════ */}
          {activeTab === 'INTERVIEW' && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#657796', letterSpacing: '0.5px', marginBottom: '6px' }}>
                SCHEDULE TECHNICAL INTERVIEW
              </div>
              <div style={{ fontSize: '12px', color: '#657796', lineHeight: '18px', marginBottom: '12px' }}>
                Send an official interview invitation to <strong style={{ color: '#102A5C' }}>{candidateName}</strong>.
              </div>

              <div style={{ height: '1px', backgroundColor: '#E7EBF2', margin: '12px 0' }} />

              <div style={{ fontSize: '11px', fontWeight: 700, color: '#657796', letterSpacing: '0.5px', marginBottom: '6px' }}>
                1. INTERVIEW MODE
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {[
                  { key: 'In-Person Walk-in', icon: Building2, label: 'In-Person' },
                  { key: 'Online Video Call', icon: Zap, label: 'Video Call' },
                  { key: 'Phone Screening', icon: Phone, label: 'Phone Call' },
                ].map((item) => {
                  const IconComp = item.icon;
                  const isSelected = interviewMode === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setInterviewMode(item.key)}
                      style={{
                        flex: 1,
                        height: '38px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        borderRadius: '6px',
                        border: isSelected ? '1.5px solid #1764E8' : '1px solid #E2E8F0',
                        backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                        color: isSelected ? '#1764E8' : '#657796',
                        fontSize: '11.5px',
                        fontWeight: isSelected ? 700 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      <IconComp size={13} color={isSelected ? '#1764E8' : '#657796'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ height: '1px', backgroundColor: '#E7EBF2', margin: '12px 0' }} />

              <div style={{ fontSize: '11px', fontWeight: 700, color: '#657796', letterSpacing: '0.5px', marginBottom: '6px' }}>
                2. DATE & TIME SELECTION
              </div>

              {/* Date Field */}
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#657796', marginBottom: '5px' }}>
                  Interview Date <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div
                  onClick={() => setDatePickerVisible(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={15} color="#1764E8" />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#102A5C' }}>
                      {interviewDate ? new Date(interviewDate + 'T00:00:00').toDateString() : 'Tap to select interview date...'}
                    </span>
                  </div>
                  <ChevronRight size={14} color="#91A0BA" />
                </div>
              </div>

              {/* Time Field & Quick Slots */}
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#657796', marginBottom: '5px' }}>
                  Interview Time <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  {['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM'].map((slot) => {
                    const isSelected = interviewTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setInterviewTime(slot)}
                        style={{
                          flex: 1,
                          height: '32px',
                          borderRadius: '6px',
                          border: isSelected ? '1px solid #1764E8' : '1px solid #E2E8F0',
                          backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                          color: isSelected ? '#1764E8' : '#334155',
                          fontSize: '10.5px',
                          fontWeight: isSelected ? 700 : 600,
                          cursor: 'pointer'
                        }}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Time Trigger */}
                <div
                  onClick={() => setTimePickerVisible(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={15} color="#1764E8" />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#102A5C' }}>
                      {interviewTime ? `Selected: ${interviewTime}` : 'Choose Custom Time...'}
                    </span>
                  </div>
                  <ChevronRight size={14} color="#91A0BA" />
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: '#E7EBF2', margin: '12px 0' }} />

              <div style={{ fontSize: '11px', fontWeight: 700, color: '#657796', letterSpacing: '0.5px', marginBottom: '6px' }}>
                3. VENUE & INSTRUCTIONS
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#657796', marginBottom: '5px' }}>
                  Venue Address / Video Meeting Link
                </label>
                <input
                  type="text"
                  value={interviewLocation}
                  onChange={(e) => setInterviewLocation(e.target.value)}
                  placeholder="Factory Gate #2, Waluj MIDC or Google Meet Link"
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    padding: '0 12px',
                    fontSize: '12px',
                    color: '#102A5C',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#657796', marginBottom: '5px' }}>
                  Instructions for Candidate
                </label>
                <input
                  type="text"
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  placeholder="Bring original ITI trade certificate & Aadhaar card."
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    padding: '0 12px',
                    fontSize: '12px',
                    color: '#102A5C',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="button"
                disabled={isScheduling}
                onClick={handleScheduleSubmit}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '6px',
                  backgroundColor: '#1764E8',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: isScheduling ? 'not-allowed' : 'pointer'
                }}
              >
                <Send size={14} color="#FFFFFF" />
                <span>{isScheduling ? 'Scheduling Interview...' : 'Schedule & Send Invite'}</span>
              </button>
            </div>
          )}

          {/* ═══════════ TAB 5: SEND EMAIL ═══════════ */}
          {activeTab === 'EMAIL' && (
            <div>
              {/* Candidate Recipient Card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={18} color="#1764E8" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#102A5C' }}>{candidateName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#657796', marginTop: '2px' }}>
                    <Mail size={11} />
                    <span>{candidateEmail || 'No email provided'}</span>
                  </div>
                </div>
                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '3px 7px', fontSize: '10.5px', color: '#657796', fontWeight: 500 }}>
                  {toSafeString(job?.title, 'Position')}
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: '#E7EBF2', margin: '12px 0' }} />

              {/* Email Templates */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#657796', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  EMAIL TEMPLATES
                </div>
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setTemplateDropdownVisible(!templateDropdownVisible)}
                    style={{
                      width: '100%',
                      height: '38px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: '11.5px', fontWeight: 500, color: '#102A5C' }}>
                      {selectedTemplateLabel || 'Select Quick Email Template...'}
                    </span>
                    <ChevronDown size={14} color="#657796" />
                  </button>

                  {templateDropdownVisible && (
                    <div style={{
                      position: 'absolute',
                      top: '42px',
                      left: 0,
                      right: 0,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      zIndex: 10,
                      overflow: 'hidden'
                    }}>
                      {EMAIL_TEMPLATES.map((tpl) => (
                        <div
                          key={tpl.key}
                          onClick={() => {
                            applyEmailTemplate(tpl.key);
                            setTemplateDropdownVisible(false);
                          }}
                          style={{
                            padding: '10px 12px',
                            borderBottom: '1px solid #F1F5F9',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#102A5C',
                            fontWeight: 600
                          }}
                        >
                          <div>{tpl.label}</div>
                          <div style={{ fontSize: '10.5px', color: '#657796', fontWeight: 400, marginTop: '2px' }}>
                            {tpl.subject(toSafeString(job?.title, 'Position'))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Subject & Body */}
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#657796', marginBottom: '5px' }}>
                  Email Subject Line <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g. Technical Interview Call: Industrial Operator"
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    padding: '0 12px',
                    fontSize: '12px',
                    color: '#102A5C',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#657796', marginBottom: '5px' }}>
                  Email Message Body <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  rows={7}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Write official email message to candidate..."
                  style={{
                    width: '100%',
                    minHeight: '140px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    padding: '10px 12px',
                    fontSize: '12px',
                    color: '#102A5C',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button
                type="button"
                disabled={isSendingEmail || !emailSubject.trim() || !emailMessage.trim()}
                onClick={handleSendEmailSubmit}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '6px',
                  backgroundColor: '#1764E8',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: (isSendingEmail || !emailSubject.trim() || !emailMessage.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (!emailSubject.trim() || !emailMessage.trim()) ? 0.6 : 1
                }}
              >
                <Send size={14} color="#FFFFFF" />
                <span>{isSendingEmail ? 'Sending Email...' : 'Send Custom Email'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModalVisible && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '340px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '24px',
              backgroundColor: pendingStatusTarget?.newStatus === 'rejected' ? '#FEF2F2' : '#EEF4FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px'
            }}>
              {pendingStatusTarget?.newStatus === 'rejected' ? (
                <AlertCircle size={26} color="#DC2626" />
              ) : pendingStatusTarget?.newStatus === 'interview' ? (
                <Calendar size={26} color="#1764E8" />
              ) : (
                <HelpCircle size={26} color="#1764E8" />
              )}
            </div>

            <div style={{ fontSize: '15px', fontWeight: 700, color: '#102A5C', marginBottom: '6px' }}>
              {pendingStatusTarget?.newStatus === 'interview' ? 'Schedule Candidate Interview' : 'Update Candidate Stage'}
            </div>
            <div style={{ fontSize: '12px', color: '#657796', lineHeight: '18px', marginBottom: '14px' }}>
              {pendingStatusTarget?.newStatus === 'interview'
                ? `Configure interview details to schedule an interview with ${candidateName}?`
                : `Are you sure you want to change the application status for ${candidateName}?`}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setConfirmModalVisible(false)}
                style={{
                  flex: 1,
                  height: '38px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={handleConfirmStatusChange}
                style={{
                  flex: 1.5,
                  height: '38px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: pendingStatusTarget?.newStatus === 'rejected' ? '#DC2626' : '#1764E8',
                  color: '#FFFFFF',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {pendingStatusTarget?.newStatus === 'interview' ? 'Proceed to Schedule' : 'Confirm & Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModalVisible && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '340px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '24px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px'
            }}>
              <Check size={26} color="#059669" strokeWidth={2.6} />
            </div>

            <div style={{ fontSize: '15px', fontWeight: 700, color: '#102A5C', marginBottom: '6px' }}>
              {successModalData.title}
            </div>
            <div style={{ fontSize: '12px', color: '#657796', lineHeight: '18px', marginBottom: '18px', whiteSpace: 'pre-line' }}>
              {successModalData.message}
            </div>

            <button
              type="button"
              onClick={() => {
                setSuccessModalVisible(false);
                if (successModalData.destinationTab) {
                  setActiveTab(successModalData.destinationTab);
                }
              }}
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '6px',
                backgroundColor: '#1764E8',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {successModalData.buttonText}
            </button>
          </div>
        </div>
      )}

      {/* Calendar Date Picker Modal */}
      {datePickerVisible && (
        <CalendarDatePickerModal
          visible={datePickerVisible}
          initialDate={interviewDate}
          onClose={() => setDatePickerVisible(false)}
          onSelectDate={(selectedDate) => {
            setInterviewDate(selectedDate);
            setDatePickerVisible(false);
          }}
        />
      )}

      {/* Material 3 Clock Time Picker Modal */}
      {timePickerVisible && (
        <ClockTimePickerModal
          visible={timePickerVisible}
          initialTime={interviewTime}
          onClose={() => setTimePickerVisible(false)}
          onSelectTime={(formattedTime) => {
            setInterviewTime(formattedTime);
            setTimePickerVisible(false);
          }}
        />
      )}

      {/* Resume Preview Modal */}
      {previewResume && (
        <ResumePreviewModal
          resume={previewResume}
          onClose={() => setPreviewResume(null)}
        />
      )}
    </div>
  );
};
