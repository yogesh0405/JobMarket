import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useJobs } from '../../hooks/useJobs';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { timeAgo, formatNumber, formatDate, shareContent } from '../../utils/helpers';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';
import { apiFetch } from '../../utils/api';
import { CompanyDefaultLogo } from '../../components/company/CompanyDefaultLogo';
import { JobLocationMapPreview } from '../../components/map/JobLocationMapPreview';
import { JobApplyModal } from '../../components/jobs/JobApplyModal';
import {
  Zap,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  Phone,
  ArrowLeft,
  Share2,
  Bookmark,
  Building2,
  Globe,
  MapPin,
  Award,
  Send,
  ExternalLink,
  Ticket,
  Flag,
  ShieldAlert,
  ShieldCheck,
  Check,
  AlertCircle,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { MetaVerifiedBadge } from '../../components/common/MetaVerifiedBadge';
import { WalkInDrivePassModal } from '../interviews/components/WalkInDrivePassModal';
import { ReportJobModal } from '../../components/jobs/ReportJobModal';
import { reportedJobsStore, ReportedJobMetadata } from '../../utils/reportedJobsStore';
import { JobCard } from '../../components/job/JobCard';
import '../../styles/jobDetail.css';

const ensureArray = (val: any): string[] => {
  if (Array.isArray(val)) return val.filter(Boolean).map(String);
  if (typeof val === 'string' && val.trim()) {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
      return [val.trim()];
    } catch (e) {
      return [val.trim()];
    }
  }
  return [];
};

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getJobById, fetchJobById, fetchSimilarJobs, applyToJob, toggleSaveJob, isJobSaved, fetchCandidateAppliedJobs } = useJobs();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { state } = useStore();
  const t = useTranslation(state.language);

  // Unconditional Hooks Declaration at Top
  const [directJob, setDirectJob] = useState<any>(null);
  const storeJob = id ? getJobById(id) : undefined;
  const job = storeJob || directJob || undefined;

  const [isApplying, setIsApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showWalkInPassModal, setShowWalkInPassModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isFetchingJob, setIsFetchingJob] = useState(!job);
  const [localSavedOverride, setLocalSavedOverride] = useState<boolean | null>(null);
  const [companyDetails, setCompanyDetails] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isReported, setIsReported] = useState<boolean>(() => {
    return id ? reportedJobsStore.isReported(id) : false;
  });
  const [reportMeta, setReportMeta] = useState<ReportedJobMetadata | undefined>(() => {
    return id ? reportedJobsStore.getReportMetadata(id) : undefined;
  });
  const [similarJobs, setSimilarJobs] = useState<any[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState<boolean>(false);

  const jobIdStr = job?.id;
  const storeSaved = jobIdStr ? isJobSaved(jobIdStr) : false;
  const saved = localSavedOverride !== null ? localSavedOverride : storeSaved;

  useEffect(() => {
    let isMounted = true;
    if (id && fetchJobById) {
      if (!job) setIsFetchingJob(true);
      fetchJobById(id)
        .then((data: any) => {
          if (isMounted && data) setDirectJob(data);
        })
        .finally(() => {
          if (isMounted) setIsFetchingJob(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    if (id && fetchSimilarJobs) {
      setLoadingSimilar(true);
      fetchSimilarJobs(id, 4)
        .then((data: any) => {
          if (isMounted) {
            const list = Array.isArray(data) ? data : [];
            setSimilarJobs(list.filter((j: any) => j.id !== id));
          }
        })
        .catch(() => {
          if (isMounted) setSimilarJobs([]);
        })
        .finally(() => {
          if (isMounted) setLoadingSimilar(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [id, fetchSimilarJobs]);

  const companyTargetId = (job as any)?.companyId || (job as any)?.employer_id || (job as any)?.employerId || job?.company;

  useEffect(() => {
    if (!companyTargetId) return;
    let isMounted = true;
    apiFetch(`/api/v1/companies/${encodeURIComponent(companyTargetId)}`)
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (isMounted && json && (json.data || json.success)) {
          setCompanyDetails(json.data || json);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [companyTargetId]);

  useEffect(() => {
    if (currentUser && currentUser.role === 'candidate' && fetchCandidateAppliedJobs) {
      fetchCandidateAppliedJobs();
    }
  }, [currentUser?.id]);

  useEffect(() => {
    setLocalSavedOverride(null);
  }, [storeSaved]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [id]);

  useEffect(() => {
    const checkReportedStatus = () => {
      const targetId = job?.id || id;
      if (targetId && reportedJobsStore.isReported(targetId)) {
        setIsReported(true);
        setReportMeta(reportedJobsStore.getReportMetadata(targetId));
      }
    };
    checkReportedStatus();
    const unsubscribe = reportedJobsStore.subscribe(checkReportedStatus);
    return () => unsubscribe();
  }, [id, job?.id]);

  const handleToggleSave = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!jobIdStr) return;
    const nextSavedState = !saved;
    setLocalSavedOverride(nextSavedState);
    try {
      await toggleSaveJob(jobIdStr);
      showToast(
        nextSavedState ? 'Job added to saved bookmarks' : 'Job removed from saved bookmarks',
        nextSavedState ? 'success' : 'info'
      );
    } catch (err: any) {
      setLocalSavedOverride(!nextSavedState);
      showToast(err.message || 'Failed to update saved job status', 'error');
    }
  };

  const handleApply = () => {
    if (!currentUser) {
      showToast('Please sign in to submit your application for this factory job opening.', 'info');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (currentUser.role === 'employer' || currentUser.role === 'admin') {
      showToast('Employer and Admin accounts cannot apply for job openings.', 'warning');
      return;
    }

    if (!job) return;

    // Navigate to dedicated full-page application confirmation page
    navigate(`/job/${job.id}/apply`);
  };

  const confirmSubmitApplication = async () => {
    if (!job) return;

    setIsApplying(true);
    try {
      const res = await applyToJob(job.id);
      if (res && res.error) {
        showToast(res.error, 'error');
      } else {
        showToast('Application submitted successfully!', 'success');
        setShowApplyModal(false);
        if (job.isWalkIn) {
          setShowWalkInPassModal(true);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit application', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  const handleBackToJobs = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/jobs');
    }
  };

  const handleOpenReport = () => {
    const isMobile = typeof window !== 'undefined' && (
      window.innerWidth <= 768 ||
      window.matchMedia('(max-width: 768px)').matches ||
      /Mobi|Android|iPhone/i.test(navigator.userAgent)
    );

    if (isMobile) {
      navigate(`/job/${job?.id || id}/report`);
    } else {
      setShowReportModal(true);
    }
  };

  const handleShare = () => {
    if (!job) return;
    const shareUrl = `${window.location.origin}/job/${encodeURIComponent(job.id)}`;
    shareContent(
      `${job.title} - ${job.company}`,
      `Check out this job opening for ${job.title} at ${job.company} on JobMarket: ${shareUrl}`,
      shareUrl,
      () => showToast('Job link copied to clipboard', 'success')
    );
  };

  if (isFetchingJob) {
    return (
      <div className="jd-page-wrapper">
        <div className="jd-container" style={{ padding: '60px 16px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#64748B', fontWeight: 600 }}>
            <span style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid #CBD5E1', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Loading job opening details...
          </div>
        </div>
      </div>
    );
  }

  if (isReported) {
    const meta = reportMeta || reportedJobsStore.getReportMetadata(job?.id || id);
    const repTitle = meta?.title || job?.title || 'Job Opening';
    const repCompany = meta?.company || job?.company || 'Employer';
    const repReason = meta?.reasonCategory || 'Inappropriate / Fraudulent Listing';
    const reportedDateStr = meta?.reportedAt
      ? new Date(meta.reportedAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Recently Reported';
    const refCode = `REP-${String(meta?.jobId || job?.id || id || '000000').slice(-6).toUpperCase()}`;

    return (
      <div className="jd-page-wrapper">
        <div className="jd-container" style={{ maxWidth: '720px' }}>
          <div className="jd-top-bar">
            <button onClick={handleBackToJobs} className="jd-back-btn">
              <ArrowLeft size={16} />
              <span>Back to Jobs Directory</span>
            </button>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Moderation Review</span>
          </div>

          <div className="jd-card" style={{ textAlign: 'center', padding: '36px 24px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', marginBottom: '16px' }}>
              <ShieldCheck size={32} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
              Report Submitted Successfully
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748B', maxWidth: '520px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
              Thank you for reporting this job opening. The details have been hidden from your view while our Trust & Safety team investigates the employer and listing.
            </p>

            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '16px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Investigation Status</span>
                <span style={{ color: '#B45309', fontWeight: 800, backgroundColor: '#FEF3C7', padding: '2px 8px', borderRadius: '4px' }}>Pending Review</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Job Title</span>
                <strong style={{ color: '#0F172A' }}>{repTitle}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Company</span>
                <span style={{ color: '#334155', fontWeight: 700 }}>{repCompany}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Report Category</span>
                <span style={{ color: '#DC2626', fontWeight: 700 }}>{repReason}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Reference ID</span>
                <code style={{ color: '#0F172A', fontWeight: 800 }}>#{refCode}</code>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button onClick={handleBackToJobs} className="jd-cta-btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>
                Return to Jobs
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="jd-page-wrapper">
        <div className="jd-container" style={{ maxWidth: '640px', padding: '60px 16px', textAlign: 'center' }}>
          <div className="jd-card" style={{ padding: '40px 24px' }}>
            <AlertCircle size={48} color="#EF4444" style={{ margin: '0 auto 16px auto' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>Job Opening Not Found</h2>
            <p style={{ fontSize: '13.5px', color: '#64748B', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              The requested job opening may have expired, reached hiring capacity, or been removed by the employer.
            </p>
            <button onClick={handleBackToJobs} className="jd-cta-btn-primary" style={{ width: 'auto', margin: '0 auto', padding: '10px 24px' }}>
              <ArrowLeft size={16} />
              <span>Browse Active Jobs</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isEmployer = currentUser?.role?.toLowerCase() === 'employer';
  const isOwner = isEmployer && (currentUser?.id === job.employerId || currentUser?.id === job.employer_id);

  const applicantRecord = job.applicants?.find((a: any) => a.userId === currentUser?.id || a.id === currentUser?.id);
  const userAppWithStatus = currentUser?.appliedJobsWithStatus?.find((a: any) => a.jobId === job.id);
  const hasApplied = Boolean(
    currentUser && (
      currentUser.appliedJobs?.includes(job.id) ||
      userAppWithStatus ||
      applicantRecord ||
      (job as any).applicationStatus ||
      (job as any).appliedAt
    )
  );

  const appliedAtDate = userAppWithStatus?.appliedAt || applicantRecord?.appliedAt || (job as any).appliedAt || null;
  const applicationStatus = userAppWithStatus?.status || applicantRecord?.status || (job as any).applicationStatus || 'applied';

  const isWalkIn = Boolean(
    (job.hiringMethod || (job as any).hiring_method || '').toUpperCase() === 'WALK_IN' ||
    job.isWalkIn ||
    (job as any).is_walk_in ||
    job.walkInDate ||
    (job as any).walk_in_date
  );

  const perksList: string[] = ensureArray(job.perks);
  if (job.bus_facility || (job as any).busFacility) perksList.push('Bus / Transport Facility');
  if (job.accommodation) perksList.push('Hostel / Accommodation');
  if (job.canteen) perksList.push('Subsidized Canteen');
  if (job.overtime) perksList.push('Overtime Pay (OT)');
  if (job.joining_bonus || (job as any).joiningBonus) perksList.push('Joining Bonus');
  if (job.attendance_bonus || (job as any).attendanceBonus) perksList.push('Attendance Bonus');

  const uniquePerks = Array.from(new Set(perksList));
  const isExpNotRequired = job.experience_required === false || (job as any).experienceRequired === false;
  const minExp = job.min_experience ?? (job as any).minExperience ?? 0;
  const maxExp = job.max_experience ?? (job as any).maxExperience ?? 0;
  const isFresher = isExpNotRequired || (minExp === 0 && (maxExp === 0 || maxExp === undefined || maxExp === null));
  const expDisplay = isFresher ? 'Freshers (No Exp)' : (minExp === maxExp ? `${minExp} Years` : `${minExp} - ${maxExp} Years`);
  
  const skillsList = ensureArray(job.skills);
  const respList = ensureArray(job.responsibilities);
  const reqList = ensureArray(job.requirements);

  const companyUrl = `/company/${encodeURIComponent(companyTargetId)}`;
  // 1. Real registered Company profile logo (strictly from registered company entity or employer user profile)
  const realCompanyLogo =
    companyDetails?.logo ||
    companyDetails?.profile_picture_url ||
    (job as any)?.realCompanyLogo ||
    (job as any)?.companyProfileLogo ||
    (job as any)?.real_company_logo ||
    (job as any)?.company_profile_logo ||
    null;

  // 2. Job-specific logo uploaded by employer for THIS specific job opening
  const uploadedJobLogo =
    (job as any)?.uploadedJobLogo ||
    (job as any)?.jobLogo ||
    (job as any)?.job_uploaded_logo ||
    (job as any)?.job_logo ||
    job?.companyLogo ||
    (job as any)?.company_logo ||
    (job as any)?.logoUrl ||
    (job as any)?.logo_url ||
    (job as any)?.logo ||
    null;

  // Rule:
  // - Job logo strictly what employer uploaded for this job, and if not uploaded then use company logo
  // - Company logo strictly the real company logo ONLY, NO job logo
  // - In job details show real company logo not job logo if it is different from company logo
  const jobDisplayLogo = uploadedJobLogo || realCompanyLogo || null;
  const companyDisplayLogo = realCompanyLogo || null;

  const companyState = {
    companyData: {
      id: companyTargetId,
      employer_id: (job as any).employer_id || (job as any).employerId,
      name: companyDetails?.name || job.company,
      logo: companyDisplayLogo,
      industry: companyDetails?.industry || (job as any).companyIndustry || job.industry || 'Industrial Manufacturing',
      address: companyDetails?.address || companyDetails?.city || (job as any).companyAddress || job.location || '',
      city: companyDetails?.city || (job as any).companyCity || job.location || '',
      midc_zone: companyDetails?.midc_zone || (job as any).companyMidcZone || job.midc_zone || (job as any).midcZone || '',
      description: companyDetails?.description || job.description || `${job.company} profile`,
      verified: companyDetails?.verified ?? true
    }
  };

  const minSalary = Number(job.salary_min || (job as any).salaryMin || 0);
  const maxSalary = Number(job.salary_max || (job as any).salaryMax || 0);
  const isSalaryDisclosed =
    (job as any).disclose_salary !== false &&
    (job as any).discloseSalary !== false &&
    (minSalary > 0 || maxSalary > 0);

  let salaryDisplay = 'Salary Not Disclosed';
  if (isSalaryDisclosed) {
    if (minSalary > 0 && maxSalary > 0) {
      salaryDisplay = `₹${formatNumber(minSalary)} - ₹${formatNumber(maxSalary)}`;
    } else if (minSalary > 0) {
      salaryDisplay = `₹${formatNumber(minSalary)}+`;
    } else if (maxSalary > 0) {
      salaryDisplay = `Up to ₹${formatNumber(maxSalary)}`;
    }
  }

  const postedTimeAgo = timeAgo(job.posted_at || (job as any).postedAt || (job as any).created_at || new Date());

  const industryTrade = job.industry || job.trade || (job as any).trade_category;
  const rawWorkMode = job.work_mode || (job as any).workMode || job.job_type || (job as any).jobType;
  const workMode = (() => {
    if (!rawWorkMode) return 'On-site';
    const str = String(rawWorkMode).trim();
    const lower = str.toLowerCase();
    if (lower === 'remote') return 'Remote';
    if (lower === 'hybrid') return 'Hybrid';
    if (lower === 'onsite' || lower === 'on_site' || lower === 'on-site') return 'On-site';
    return str;
  })();
  const shiftDetails = (job as any).shift_details || (job as any).shiftDetails;
  const vacancies = job.openings || (job as any).vacancies;

  return (
    <div className="jd-page-wrapper">
      <div className="jd-container">
        
        {/* 1. Hero Header Card */}
        <div className="jd-hero-card">
          {/* Desktop Hero View (> 768px) */}
          <div className="jd-desktop-hero">
            <div className="jd-hero-content">
              {/* Job / Company Logo */}
              <Link to={companyUrl} state={companyState} className="jd-company-logo-box" title={`View ${job.company} Profile`}>
                <CompanyDefaultLogo
                  logoUrl={jobDisplayLogo}
                  companyName={job.company}
                  size={56}
                  borderRadius="8px"
                />
              </Link>

              {/* Info Stack */}
              <div className="jd-hero-info">
                <div className="jd-company-badge-row">
                  <Link to={companyUrl} state={companyState} className="jd-company-link">
                    <span>{job.company || 'Industrial Partner'}</span>
                    <ExternalLink size={12} />
                  </Link>
                  <MetaVerifiedBadge size={16} color="#0095F6" title="Verified Employer" />
                </div>

                <h1 className="jd-hero-title">{job.title}</h1>

                {/* Badges Strip */}
                <div className="jd-meta-pills-row">
                  {industryTrade && (
                    <span className="jd-pill">
                      {industryTrade}
                    </span>
                  )}

                  {workMode && (
                    <span className="jd-pill">
                      {workMode}
                    </span>
                  )}

                  {shiftDetails && (
                    <span className="jd-pill">
                      {shiftDetails}
                    </span>
                  )}

                  {Boolean(vacancies) && (
                    <span className="jd-pill">
                      {vacancies} Openings
                    </span>
                  )}

                  {isWalkIn && (
                    <span className="jd-pill jd-pill-walkin">
                      Walk-in Drive
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons inside Card */}
              <div className="jd-card-actions">
                <button
                  type="button"
                  onClick={handleShare}
                  className="jd-btn-action-icon"
                  title="Share job opening"
                >
                  <Share2 size={14} />
                  <span>Share</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleSave}
                  className={`jd-btn-action-icon ${saved ? 'saved' : ''}`}
                  title={saved ? 'Remove from bookmarks' : 'Save this job'}
                >
                  <Bookmark size={14} fill={saved ? '#1D4ED8' : 'none'} />
                  <span>{saved ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenReport}
                  className="jd-btn-action-icon report"
                  title="Report fake or suspicious listing"
                >
                  <Flag size={14} />
                  <span>Report</span>
                </button>
              </div>
            </div>

            {/* Desktop Hero Bottom Bar */}
            <div className="jd-hero-bottom-bar">
              <div className="jd-salary-box">
                {isSalaryDisclosed ? (
                  <>
                    <span className="jd-salary-amount">{salaryDisplay}</span>
                    <span className="jd-salary-sub">/ month (take-home salary)</span>
                  </>
                ) : (
                  <span className="jd-salary-amount jd-salary-undisclosed">Salary Not Disclosed</span>
                )}
              </div>

              <div className="jd-posted-meta">
                <Clock size={13} />
                <span>Posted {postedTimeAgo}</span>
                <span>•</span>
                <span style={{ color: '#047857', fontWeight: 700 }}>Direct Industrial Hiring</span>
              </div>
            </div>
          </div>

          {/* Mobile Hero View (<= 768px) - Exact match to Mobile App CandidateJobDetailHeader */}
          <div className="jd-mobile-hero">
            {/* Top Nav Row: Back Arrow + Role Name on Left, Three-Dot Menu on Right */}
            <div className="jd-mobile-top-nav-row">
              <div className="jd-mobile-role-group">
                <button
                  type="button"
                  onClick={handleBackToJobs}
                  className="jd-mobile-back-btn"
                  aria-label="Go back to jobs"
                >
                  <ArrowLeft size={22} color="#0F172A" strokeWidth={2.2} />
                </button>
                <h1 className="jd-mobile-role-name">
                  {job.title}
                </h1>
              </div>

              {/* Three-Dot Menu Trigger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="jd-mobile-more-btn"
                aria-label="More options"
                aria-expanded={mobileMenuOpen}
              >
                <MoreVertical size={20} color="#334155" strokeWidth={2.2} />
              </button>

              {/* Three-Dot Dropdown Menu Card */}
              {mobileMenuOpen && (
                <>
                  <div
                    className="jd-mobile-menu-backdrop"
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  <div className="jd-mobile-menu-card">
                    {/* Option 1: Share */}
                    <button
                      type="button"
                      className="jd-mobile-menu-item"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleShare();
                      }}
                    >
                      <Share2 size={16} color="#475569" strokeWidth={2} />
                      <span>Share</span>
                    </button>

                    <div className="jd-mobile-menu-divider" />

                    {/* Option 2: Save / Saved */}
                    <button
                      type="button"
                      className={`jd-mobile-menu-item ${saved ? 'saved' : ''}`}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleToggleSave();
                      }}
                    >
                      <Bookmark
                        size={16}
                        color={saved ? '#1D4ED8' : '#475569'}
                        fill={saved ? '#1D4ED8' : 'none'}
                        strokeWidth={2}
                      />
                      <span>{saved ? 'Saved' : 'Save'}</span>
                    </button>

                    <div className="jd-mobile-menu-divider" />

                    {/* Option 3: Report */}
                    <button
                      type="button"
                      className="jd-mobile-menu-item danger"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleOpenReport();
                      }}
                    >
                      <Flag size={16} color="#DC2626" strokeWidth={2} />
                      <span>Report</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Company Info Row: Logo on Left, Company Name & Work Mode on Right */}
            <div className="jd-mobile-company-row">
              <Link to={companyUrl} state={companyState} className="jd-mobile-logo-box" title={`View ${job.company} Profile`}>
                <CompanyDefaultLogo
                  logoUrl={jobDisplayLogo}
                  companyName={job.company}
                  size={52}
                  borderRadius="8px"
                />
              </Link>

              <div className="jd-mobile-company-info">
                <div className="jd-mobile-company-badge-group">
                  <Link to={companyUrl} state={companyState} className="jd-mobile-company-link">
                    <span>{job.company || 'Industrial Partner'}</span>
                    <ExternalLink size={12} color="#2563EB" strokeWidth={2.4} />
                  </Link>
                  <MetaVerifiedBadge size={15} color="#0095F6" />
                </div>

                {workMode && (
                  <div className="jd-mobile-work-mode">
                    {workMode}
                  </div>
                )}
              </div>
            </div>

            {/* Badges Strip matching Mobile App .metaPillsRow */}
            <div className="jd-meta-pills-row">
              {industryTrade && (
                <span className="jd-pill">
                  {industryTrade}
                </span>
              )}

              {shiftDetails && (
                <span className="jd-pill">
                  {shiftDetails}
                </span>
              )}

              {Boolean(vacancies) && (
                <span className="jd-pill">
                  {vacancies} Openings
                </span>
              )}

              {isWalkIn && (
                <span className="jd-pill jd-pill-walkin">
                  Walk-in Drive
                </span>
              )}
            </div>

            {/* Mobile Hero Bottom Bar */}
            <div className="jd-hero-bottom-bar">
              <div className="jd-salary-box">
                {isSalaryDisclosed ? (
                  <>
                    <span className="jd-salary-amount">{salaryDisplay}</span>
                    <span className="jd-salary-sub">/ month (take-home salary)</span>
                  </>
                ) : (
                  <span className="jd-salary-amount jd-salary-undisclosed">Salary Not Disclosed</span>
                )}
              </div>

              <div className="jd-posted-meta">
                <Clock size={12} color="#64748B" />
                <span>Posted {postedTimeAgo}</span>
                <span>•</span>
                <span style={{ color: '#047857', fontWeight: 700 }}>Direct Industrial Hiring</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Main Dual-Column Grid Layout */}
        <div className="jd-grid-layout">
          
          {/* Left Main Column */}
          <div className="jd-main-col">


            {/* Mega Walk-in Interview Card (if walk-in) */}
            {isWalkIn && (
              <div className="jd-walkin-card">
                <div className="jd-walkin-header">
                  <div className="jd-walkin-title">
                    <Ticket size={18} color="#0284C7" strokeWidth={2.4} />
                    <span>Mega Walk-in Interview Drive</span>
                  </div>
                  <span style={{ backgroundColor: '#E0F2FE', border: '1px solid #7DD3FC', color: '#0284C7', padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 800 }}>
                    DIRECT INTERVIEW
                  </span>
                </div>

                <div className="jd-walkin-grid">
                  <div className="jd-walkin-box">
                    <div className="jd-walkin-label">DRIVE DATE & TIMING</div>
                    <div className="jd-walkin-value">
                      <Calendar size={13} color="#0284C7" />
                      <span>{job.walkInDate || (job as any).walk_in_date || 'Drive Date Announced'}</span>
                    </div>
                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748B', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={12} />
                      <span>{job.walkInStartTime || (job as any).walk_in_start_time || '10:00 AM'} - {job.walkInEndTime || (job as any).walk_in_end_time || '04:00 PM'}</span>
                    </div>
                  </div>

                  {(job.walkInContactPerson || (job as any).walk_in_contact_person || job.walkInContactNumber || (job as any).walk_in_contact_number) && (
                    <div className="jd-walkin-box">
                      <div className="jd-walkin-label">DRIVE COORDINATOR</div>
                      <div className="jd-walkin-value">
                        {job.walkInContactPerson || (job as any).walk_in_contact_person || 'HR Department'}
                      </div>
                      {(job.walkInContactNumber || (job as any).walk_in_contact_number) && (
                        <a
                          href={`tel:${String(job.walkInContactNumber || (job as any).walk_in_contact_number).replace(/[^0-9+]/g, '')}`}
                          style={{ fontSize: '11.5px', fontWeight: 700, color: '#0284C7', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}
                        >
                          <Phone size={11} color="#0284C7" />
                          <span>{job.walkInContactNumber || (job as any).walk_in_contact_number}</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {(job.interviewAddress || (job as any).interview_address || job.location) && (
                  <div className="jd-walkin-box" style={{ marginBottom: '10px' }}>
                    <div className="jd-walkin-label">INTERVIEW VENUE ADDRESS</div>
                    <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', fontWeight: 600, color: '#334155', lineHeight: 1.45 }}>
                      {job.interviewAddress || (job as any).interview_address || job.location}
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.interviewAddress || (job as any).interview_address || job.location)}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0284C7', fontSize: '11.5px', fontWeight: 700, textDecoration: 'none', marginTop: '6px' }}
                    >
                      <MapPin size={12} color="#0284C7" />
                      <span>Open Directions in Google Maps</span>
                      <ExternalLink size={11} color="#0284C7" />
                    </a>
                  </div>
                )}

                <div style={{ backgroundColor: '#FFFFFF', border: '1px dashed #BAE6FD', borderRadius: '6px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#0369A1', letterSpacing: '0.5px', marginBottom: '2px' }}>
                    MANDATORY DOCUMENTS TO CARRY
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', fontWeight: 600, lineHeight: 1.45 }}>
                    {job.walkInDocuments || (job as any).walk_in_documents || 'Updated Resume (2 Copies), Aadhar Card, Educational Marksheets, Passport Size Photographs, Bank Passbook'}
                  </div>
                </div>
              </div>
            )}

            {/* Key Specifications Grid Card */}
            <div className="jd-card">
              <div className="jd-card-header">
                <h2 className="jd-card-title">
                  <Award size={18} color="#2563EB" />
                  <span>Key Specifications</span>
                </h2>
              </div>

              <div className="jd-specs-grid">
                <div className="jd-spec-tile">
                  <span className="jd-spec-label">Trade / Designation</span>
                  <span className="jd-spec-value">{job.trade || job.title}</span>
                </div>

                <div className="jd-spec-tile">
                  <span className="jd-spec-label">Experience Required</span>
                  <span className="jd-spec-value">{expDisplay}</span>
                </div>

                <div className="jd-spec-tile">
                  <span className="jd-spec-label">Monthly Compensation</span>
                  <span
                    className="jd-spec-value"
                    style={{ color: isSalaryDisclosed ? '#16A34A' : '#64748B' }}
                  >
                    {isSalaryDisclosed ? `${salaryDisplay} / month` : 'Salary Not Disclosed'}
                  </span>
                </div>

                <div className="jd-spec-tile">
                  <span className="jd-spec-label">Work Mode & Type</span>
                  <span className="jd-spec-value">{job.work_mode || job.workMode || job.job_type || job.jobType || 'Full Time'}</span>
                </div>

                <div className="jd-spec-tile">
                  <span className="jd-spec-label">Openings Available</span>
                  <span className="jd-spec-value">{job.openings || (job as any).vacancies || '1'} Vacancies</span>
                </div>

                <div className="jd-spec-tile">
                  <span className="jd-spec-label">Location / MIDC Zone</span>
                  <span className="jd-spec-value">{job.midc_zone || job.location || 'Chhatrapati Sambhajinagar'}</span>
                </div>
              </div>
            </div>

            {/* Role Description Card */}
            <div className="jd-card">
              <div className="jd-card-header">
                <h2 className="jd-card-title">
                  <FileText size={18} color="#2563EB" />
                  <span>About the Role & Job Description</span>
                </h2>
              </div>
              <div style={{ fontSize: '13.5px', lineHeight: 1.65, color: '#334155' }}>
                <p style={{ margin: 0, whiteSpace: 'pre-line' }}>
                  {job.description || 'No detailed description provided for this industrial opening.'}
                </p>
              </div>
            </div>

            {/* Key Responsibilities Card */}
            {respList.length > 0 && (
              <div className="jd-card">
                <div className="jd-card-header">
                  <h2 className="jd-card-title">
                    <CheckCircle2 size={18} color="#2563EB" />
                    <span>Key Responsibilities</span>
                  </h2>
                </div>
                <div className="jd-bullet-list">
                  {respList.map((resp, idx) => (
                    <div key={idx} className="jd-bullet-item">
                      <Check size={16} className="jd-bullet-icon" strokeWidth={2.5} />
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements & Eligibility Card */}
            {reqList.length > 0 && (
              <div className="jd-card">
                <div className="jd-card-header">
                  <h2 className="jd-card-title">
                    <Award size={18} color="#2563EB" />
                    <span>Requirements & Candidate Eligibility</span>
                  </h2>
                </div>
                <div className="jd-bullet-list">
                  {reqList.map((req, idx) => (
                    <div key={idx} className="jd-bullet-item">
                      <Check size={16} className="jd-bullet-icon" strokeWidth={2.5} />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Skills Card */}
            {skillsList.length > 0 && (
              <div className="jd-card">
                <div className="jd-card-header">
                  <h2 className="jd-card-title">
                    <Zap size={18} color="#2563EB" />
                    <span>Required Technical Skills</span>
                  </h2>
                </div>
                <div className="jd-skills-wrap">
                  {skillsList.map((skill, idx) => (
                    <span key={idx} className="jd-skill-chip">
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Perks & Facilities Card */}
            {uniquePerks.length > 0 && (
              <div className="jd-card">
                <div className="jd-card-header">
                  <h2 className="jd-card-title">
                    <Building2 size={18} color="#2563EB" />
                    <span>Perks & Plant Facilities Offered</span>
                  </h2>
                </div>
                <div className="jd-perks-grid">
                  {uniquePerks.map((perk, idx) => (
                    <div key={idx} className="jd-perk-item">
                      <div className="jd-perk-icon-box">
                        <Check size={15} strokeWidth={2.5} />
                      </div>
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Plant Location & Map Preview Card */}
            <div className="jd-card">
              <div className="jd-card-header">
                <h2 className="jd-card-title">
                  <MapPin size={18} color="#2563EB" />
                  <span>Workplace & Plant Location</span>
                </h2>
              </div>
              <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                {job.location} {job.midc_zone ? `• ${job.midc_zone}` : ''}
              </p>
              <JobLocationMapPreview
                locationName={job.location}
                latitude={(job as any).latitude ? Number((job as any).latitude) : undefined}
                longitude={(job as any).longitude ? Number((job as any).longitude) : undefined}
                readOnly={true}
              />
            </div>

            {/* Candidate Safety Advisory Card */}
            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#64748B' }}>
                <ShieldAlert size={18} color="#DC2626" style={{ flexShrink: 0 }} />
                <span>JobMarket Safety Guarantee: Employers are strictly forbidden from demanding fees for interviews.</span>
              </div>
              <button
                type="button"
                onClick={handleOpenReport}
                style={{ background: 'transparent', border: 'none', color: '#DC2626', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              >
                Report this opening
              </button>
            </div>

          </div>

          {/* Right Sidebar Column (Sticky) */}
          <div className="jd-sidebar-col">
            
            {/* Primary Action Card */}
            <div className="jd-cta-card">
              {hasApplied ? (
                <div>
                  <div className="jd-applied-badge-card">
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckCircle2 size={16} color="#16A34A" strokeWidth={2.5} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#15803D' }}>
                        Application Submitted
                      </div>
                      <div style={{ fontSize: '11px', color: '#166534', marginTop: '1px' }}>
                        {appliedAtDate ? `Applied on ${formatDate(appliedAtDate)}` : 'Applied'} • Status: <span style={{ textTransform: 'capitalize', fontWeight: 700 }}>{applicationStatus}</span>
                      </div>
                    </div>
                  </div>

                  {isWalkIn ? (
                    <button
                      onClick={() => setShowWalkInPassModal(true)}
                      className="jd-cta-btn-primary"
                      style={{ backgroundColor: '#0284C7' }}
                    >
                      <Ticket size={16} />
                      <span>View Walk-in Admit Pass</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/dashboard?tab=applied')}
                      className="jd-cta-btn-secondary"
                    >
                      Track Application Status
                    </button>
                  )}
                </div>
              ) : isEmployer ? (
                <div>
                  <button
                    onClick={() => navigate(isOwner ? '/dashboard?tab=manage' : '/dashboard')}
                    className="jd-cta-btn-primary"
                  >
                    {isOwner ? 'Manage in Employer Workspace' : 'Go to Employer Dashboard'}
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={handleApply}
                    disabled={isApplying}
                    className="jd-cta-btn-primary"
                  >
                    {isWalkIn ? (
                      <>
                        <Ticket size={16} />
                        <span>Register for Walk-in Drive</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Apply for this Job</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleToggleSave}
                    className="jd-cta-btn-secondary"
                  >
                    <Bookmark size={15} fill={saved ? '#1D4ED8' : 'none'} />
                    <span>{saved ? 'Saved in Bookmarks' : 'Save for Later'}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="jd-cta-btn-secondary"
                  >
                    <Share2 size={15} />
                    <span>Share with Friends</span>
                  </button>

                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: '#64748B' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={13} color="#16A34A" strokeWidth={2.5} />
                      <span>100% Free Application — Zero charges</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={13} color="#16A34A" strokeWidth={2.5} />
                      <span>Direct application delivered to employer</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Company Snapshot Card */}
            <div className="jd-company-card">
              <div className="jd-company-card-top">
                <Link to={companyUrl} state={companyState}>
                  <CompanyDefaultLogo
                    logoUrl={companyDisplayLogo}
                    companyName={companyDetails?.name || job.company}
                    size={46}
                    borderRadius="6px"
                  />
                </Link>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 className="jd-company-card-name">{companyDetails?.name || job.company}</h3>
                    <MetaVerifiedBadge size={14} color="#0095F6" />
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    {companyDetails?.industry || (job as any).companyIndustry || job.industry || 'Industrial Manufacturing'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#475569', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={13} color="#64748B" />
                  <span>{companyDetails?.address || companyDetails?.city || (job as any).companyAddress || job.location || 'Chhatrapati Sambhajinagar'}</span>
                </div>
                {(companyDetails?.website || (job as any).companyWebsite || (job as any).website) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={13} color="#2563EB" />
                    <a
                      href={((companyDetails?.website || (job as any).companyWebsite || (job as any).website) as string).startsWith('http')
                        ? (companyDetails?.website || (job as any).companyWebsite || (job as any).website)
                        : `https://${(companyDetails?.website || (job as any).companyWebsite || (job as any).website)}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}
                    >
                      Company Website
                    </a>
                  </div>
                )}
              </div>

              <Link to={companyUrl} state={companyState} className="jd-company-card-btn">
                <span>View Full Company Profile</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Direct Recruiter Contact Card (if available) */}
            {(job.walkInContactNumber || (job as any).walk_in_contact_number) && (
              <div className="jd-card" style={{ padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>
                  Hiring Contact
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                  {job.walkInContactPerson || (job as any).walk_in_contact_person || 'HR Department'}
                </div>
                <a
                  href={`tel:${String(job.walkInContactNumber || (job as any).walk_in_contact_number).replace(/[^0-9+]/g, '')}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563EB', fontSize: '13px', fontWeight: 700, textDecoration: 'none', marginTop: '4px' }}
                >
                  <Phone size={13} />
                  <span>{job.walkInContactNumber || (job as any).walk_in_contact_number}</span>
                </a>
              </div>
            )}

            {/* Authenticity Guarantee Card */}
            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldCheck size={18} color="#15803D" strokeWidth={2.4} />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>JobMarket Authenticity</span>
              </div>
              <p style={{ margin: 0, fontSize: '11.5px', color: '#64748B', lineHeight: 1.45 }}>
                Every job listed on JobMarket undergoes automated business and employer verification to protect factory and industrial job seekers.
              </p>
            </div>

          </div>

        </div>

        {/* Similar Jobs Section */}
        {loadingSimilar ? (
          <section className="jd-similar-section">
            <div className="jd-similar-header">
              <div className="jd-similar-title-wrap">
                <h3 className="jd-similar-title">Similar Job Openings</h3>
              </div>
              <p className="jd-similar-subtitle">Finding matching industrial opportunities...</p>
            </div>
            <div className="jd-similar-grid">
              {[1, 2].map((n) => (
                <div key={n} style={{ height: '180px', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '4px', opacity: 0.6 }} />
              ))}
            </div>
          </section>
        ) : similarJobs && similarJobs.length > 0 ? (
          <section className="jd-similar-section">
            <div className="jd-similar-header">
              <div className="jd-similar-title-wrap">
                <h3 className="jd-similar-title">Similar Job Openings</h3>
                <span className="jd-similar-badge">{similarJobs.length} Recommended</span>
              </div>
              <p className="jd-similar-subtitle">Industrial opportunities matching trade, category & zone</p>
            </div>

            <div className="jd-similar-grid">
              {similarJobs.map((simJob) => (
                <JobCard key={simJob.id} job={simJob} />
              ))}
            </div>
          </section>
        ) : null}

      </div>

      {/* Mobile Fixed Action Dock */}
      {createPortal(
        <div className="jd-mobile-dock">
          {hasApplied ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="#16A34A" strokeWidth={2.5} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#15803D' }}>Applied</span>
              </div>
              <button
                onClick={() => navigate('/dashboard?tab=applied')}
                style={{ backgroundColor: '#FFFFFF', color: '#15803D', border: '1px solid #86EFAC', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                Track Status
              </button>
            </div>
          ) : isEmployer ? (
            <button
              onClick={() => navigate(isOwner ? '/dashboard?tab=manage' : '/dashboard')}
              className="jd-cta-btn-primary"
              style={{ flex: 1 }}
            >
              Manage in Workspace
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
              <button
                onClick={handleToggleSave}
                style={{ width: '44px', height: '44px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
                title="Save job"
              >
                <Bookmark size={18} fill={saved ? '#1D4ED8' : 'none'} color={saved ? '#1D4ED8' : '#475569'} />
              </button>

              <button
                onClick={handleApply}
                disabled={isApplying}
                className="jd-cta-btn-primary"
                style={{ flex: 1, height: '44px' }}
              >
                {isWalkIn ? 'Register for Walk-in' : 'Apply Now'}
              </button>
            </div>
          )}
        </div>,
        document.body
      )}

      {/* Application Review & Confirmation Modal */}
      {showApplyModal && currentUser && (
        <JobApplyModal
          job={job}
          user={currentUser}
          onClose={() => setShowApplyModal(false)}
          onConfirm={confirmSubmitApplication}
          isApplying={isApplying}
        />
      )}

      {/* Official Walk-In Drive Admit Pass Modal */}
      <WalkInDrivePassModal
        isOpen={showWalkInPassModal}
        onClose={() => setShowWalkInPassModal(false)}
        data={{
          jobId: job.id,
          applicationId: userAppWithStatus?.id || applicantRecord?.id,
          ticketNumber: userAppWithStatus?.ticketNumber || applicantRecord?.ticketNumber,
          jobTitle: job.title,
          company: job.company,
          companyLogo: job.companyLogo || (job as any).logo,
          location: job.location,
          walkInDate: job.walkInDate || (job as any).walk_in_date,
          walkInStartTime: job.walkInStartTime || (job as any).walk_in_start_time,
          walkInEndTime: job.walkInEndTime || (job as any).walk_in_end_time,
          interviewAddress: job.interviewAddress || (job as any).interview_address || job.location,
          walkInContactPerson: job.walkInContactPerson || (job as any).walk_in_contact_person,
          walkInContactNumber: job.walkInContactNumber || (job as any).walk_in_contact_number,
          walkInDocuments: job.walkInDocuments || (job as any).walk_in_documents,
          candidateName: currentUser?.name || currentUser?.fullName,
          candidatePhone: currentUser?.phone,
          candidateEmail: currentUser?.email,
          appliedAt: appliedAtDate || undefined
        }}
      />

      {/* Trust & Safety Scam Reporting Modal */}
      <ReportJobModal
        isOpen={showReportModal}
        jobId={job.id}
        jobTitle={job.title}
        companyName={job.company}
        onClose={() => setShowReportModal(false)}
        onReportSuccess={() => {
          setIsReported(true);
          setReportMeta(reportedJobsStore.getReportMetadata(job.id));
          showToast('Job listing reported. Our Trust & Safety team has been alerted.', 'success');
        }}
      />
    </div>
  );
};

export default JobDetailPage;
