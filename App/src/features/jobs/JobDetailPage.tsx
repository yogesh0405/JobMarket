import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useJobs } from '../../hooks/useJobs';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatSalary, timeAgo, formatNumber, capitalize, shareContent } from '../../utils/helpers';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';
import { CompanyDefaultLogo } from '../../components/company/CompanyDefaultLogo';
import { JobLocationMapPreview } from '../../components/map/JobLocationMapPreview';
import { JobApplyModal } from '../../components/jobs/JobApplyModal';
import {
  Zap,
  Calendar,
  FileText,
  CheckCircle2,
  Phone,
  Smartphone,
  ArrowLeft,
  Share2,
  Bookmark,
  Building2,
  Globe,
  MapPin,
  Briefcase,
  Award,
  Send,
  ExternalLink
} from 'lucide-react';

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
  const { getJobById, fetchJobById, applyToJob, toggleSaveJob, isJobSaved } = useJobs();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { state } = useStore();
  const t = useTranslation(state.language);

  // Unconditional Hooks Declaration at Top
  const [directJob, setDirectJob] = useState<any>(null);
  const storeJob = id ? getJobById(id) : undefined;
  const job = storeJob || directJob || undefined;

  const [activeTab, setActiveTab] = useState<'job_overview' | 'company_info'>('job_overview');
  const [isApplying, setIsApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showWalkInPassModal, setShowWalkInPassModal] = useState(false);
  const [isFetchingJob, setIsFetchingJob] = useState(!job);
  const [localSavedOverride, setLocalSavedOverride] = useState<boolean | null>(null);

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
    setLocalSavedOverride(null);
  }, [storeSaved]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [id]);

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

  if (isFetchingJob) {
    return (
      <div className="container" style={{ padding: '40px 16px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '600' }}>Loading job details...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container" style={{ padding: '40px 16px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '32px 24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0' }}>Job Opening Not Found</h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0' }}>The requested job post may have expired or been removed by the employer.</p>
          <button
            onClick={handleBackToJobs}
            style={{ backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
          >
            Browse Other Jobs
          </button>
        </div>
      </div>
    );
  }

  const isOwner = currentUser && (currentUser.id === job.employerId || currentUser.role === 'employer');
  const userApplications = Array.isArray(state.applications) ? state.applications : [];
  const existingApp = userApplications.find(a => a.jobId === job.id || (a as any).job_id === job.id);
  const hasApplied = Boolean(existingApp);
  const appDetails = existingApp;

  const perksList: string[] = ensureArray(job.perks);
  if (job.bus_facility || (job as any).busFacility) perksList.push('Bus / Transport Facility');
  if (job.accommodation) perksList.push('Hostel / Accommodation');
  if (job.canteen) perksList.push('Subsidized Canteen');
  if (job.overtime) perksList.push('Overtime Pay (OT)');
  if (job.joining_bonus || (job as any).joiningBonus) perksList.push('Joining Bonus');
  if (job.attendance_bonus || (job as any).attendanceBonus) perksList.push('Attendance Bonus');

  const uniquePerks = Array.from(new Set(perksList));
  const minExp = job.min_experience ?? (job as any).minExperience ?? 0;
  const maxExp = job.max_experience ?? (job as any).maxExperience ?? 3;
  const skillsList = ensureArray(job.skills);
  const respList = ensureArray(job.responsibilities);
  const reqList = ensureArray(job.requirements);

  return (
    <div className="job-detail-page-wrapper" style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '90px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px 14px', boxSizing: 'border-box' }}>
        
        {/* Master Header Card with Solid Blue Banner (#2563EB) */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #CBD5E1',
          overflow: 'hidden',
          marginBottom: '14px',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.06)'
        }}>
          {/* Primary Blue Top Banner */}
          <div style={{
            backgroundColor: '#2563EB',
            padding: '16px 18px 14px 18px',
            color: '#FFFFFF',
            position: 'relative'
          }}>
            {/* Top Navigation Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px'
            }}>
              <button
                onClick={handleBackToJobs}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  padding: 0,
                  opacity: 0.95,
                  transition: 'opacity 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.95')}
              >
                <ArrowLeft size={18} />
                <span>Back to Jobs</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => shareContent(job.title, `View job position for ${job.title} at ${job.company}`, window.location.href)}
                  title="Share Job Opening"
                  style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                >
                  <Share2 size={18} />
                </button>

                <button
                  onClick={handleToggleSave}
                  title={saved ? 'Remove Bookmark' : 'Bookmark Job'}
                  style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                >
                  <Bookmark size={18} fill={saved ? '#FFFFFF' : 'transparent'} />
                </button>
              </div>
            </div>

            {/* Avatar & Title Stack (Clickable Company Profile Link) */}
            {(() => {
              const companyTargetId = (job as any).companyId || (job as any).employer_id || (job as any).employerId || job.company;
              const companyUrl = `/company/${encodeURIComponent(companyTargetId)}`;

              return (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <Link
                    to={companyUrl}
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      border: '2.5px solid #FFFFFF',
                      boxShadow: '0 3px 8px rgba(0,0,0,0.18)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      textDecoration: 'none'
                    }}
                    title={`View ${job.company} Profile`}
                  >
                    <CompanyDefaultLogo logoUrl={job.companyLogo || (job as any).logo} companyName={job.company} size={46} borderRadius="50%" />
                  </Link>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <Link
                        to={companyUrl}
                        style={{
                          fontSize: '13px',
                          fontWeight: '700',
                          color: '#DBEAFE',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title={`View ${job.company} Profile`}
                      >
                        <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>{job.company || 'Industrial Partner'}</span>
                        <ExternalLink size={12} color="#93C5FD" />
                      </Link>
                    </div>

                    <h1 style={{ fontSize: '17px', fontWeight: '800', color: '#FFFFFF', margin: 0, lineHeight: '1.25' }}>{job.title}</h1>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* White Secondary Body Metadata */}
          <div style={{ padding: '12px 16px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {job.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
                <MapPin size={14} color="#64748B" style={{ flexShrink: 0 }} />
                <span>{job.location}</span>
              </div>
            )}

            {(job as any).website && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#2563EB', fontWeight: '600' }}>
                <Globe size={14} color="#2563EB" style={{ flexShrink: 0 }} />
                <a href={(job as any).website.startsWith('http') ? (job as any).website : `https://${(job as any).website}`} target="_blank" rel="noreferrer" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: '700' }}>
                  {(job as any).website}
                </a>
              </div>
            )}

            {(job.industry || job.trade) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
                <Building2 size={14} color="#64748B" style={{ flexShrink: 0 }} />
                <span>Industry : {job.industry || job.trade}</span>
              </div>
            )}
          </div>

          {/* Segmented Tab Navigation Control (Proportional Flex & Single Line Fit) */}
          <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '4px', gap: '4px', borderTop: '1px solid #CBD5E1' }}>
            <button
              onClick={() => setActiveTab('job_overview')}
              style={{
                flex: '0 0 38%',
                padding: '8px 6px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: activeTab === 'job_overview' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'job_overview' ? '#2563EB' : '#64748B',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
                boxShadow: activeTab === 'job_overview' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Briefcase size={14} color={activeTab === 'job_overview' ? '#2563EB' : '#64748B'} style={{ flexShrink: 0 }} />
              <span>Job Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('company_info')}
              style={{
                flex: 1,
                padding: '8px 6px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: activeTab === 'company_info' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'company_info' ? '#2563EB' : '#64748B',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
                boxShadow: activeTab === 'company_info' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Award size={14} color={activeTab === 'company_info' ? '#2563EB' : '#64748B'} style={{ flexShrink: 0 }} />
              <span>Requirements & Perks</span>
            </button>
          </div>
        </div>

        {/* Card Block Container */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #CBD5E1',
          padding: '16px 18px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
        }}>
          {activeTab === 'job_overview' ? (
            <>
              <h3 style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A', margin: '0 0 10px 0' }}>
                Key Specifications
              </h3>

              {/* 2-Column Specifications Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '10px',
                marginBottom: '12px'
              }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
                  <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Trade / Role</div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>{job.trade || job.title}</div>
                </div>

                {(job.openings || (job as any).vacancies) ? (
                  <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Total Openings</div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                      {job.openings || (job as any).vacancies} Vacancies
                    </div>
                  </div>
                ) : null}

                {Boolean((job.salary_min || job.salaryMin) && (job.salary_max || job.salaryMax)) ? (
                  <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Salary Package</div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#2563EB', marginTop: '2px' }}>
                      ₹{job.salary_min || job.salaryMin} - ₹{job.salary_max || job.salaryMax} / mo
                    </div>
                  </div>
                ) : null}

                <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
                  <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Experience Required</div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>{minExp} - {maxExp} Years</div>
                </div>

                {(job.work_mode || job.workMode || job.job_type || job.jobType) && (
                  <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Work Mode</div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>{job.work_mode || job.workMode || job.job_type || job.jobType}</div>
                  </div>
                )}
              </div>

              {/* Technical Skills Section */}
              {skillsList.length > 0 && (
                <>
                  <div style={{ height: '1px', backgroundColor: '#94A3B8', margin: '12px 0' }} />
                  <h3 style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0' }}>
                    Required Technical Skills
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {skillsList.map((skill, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', color: '#334155' }}>
                        <span style={{ color: '#2563EB', fontWeight: '800', fontSize: '14px', lineHeight: '1' }}>•</span>
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Role Description Section */}
              <div style={{ height: '1px', backgroundColor: '#94A3B8', margin: '12px 0' }} />
              <h3 style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0' }}>
                Role Description
              </h3>
              <p style={{ fontSize: '12.5px', lineHeight: '1.5', color: '#334155', margin: 0 }}>
                {job.description || 'No detailed description provided for this industrial opening.'}
              </p>

              {/* Responsibilities Section */}
              {respList.length > 0 && (
                <>
                  <div style={{ height: '1px', backgroundColor: '#94A3B8', margin: '12px 0' }} />
                  <h3 style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0' }}>
                    Key Responsibilities
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {respList.map((resp, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', color: '#334155' }}>
                        <span style={{ color: '#2563EB', fontWeight: '800', fontSize: '14px', lineHeight: '1' }}>•</span>
                        <span>{resp}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* Requirements & Eligibility */}
              {reqList.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0' }}>
                    Requirements & Eligibility
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {reqList.map((req, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', color: '#334155' }}>
                        <span style={{ color: '#2563EB', fontWeight: '800', fontSize: '14px', lineHeight: '1' }}>•</span>
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Perks & Facilities */}
              {uniquePerks.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  {reqList.length > 0 && <div style={{ height: '1px', backgroundColor: '#94A3B8', margin: '12px 0' }} />}
                  <h3 style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0' }}>
                    Perks & Facilities Offered
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {uniquePerks.map((perk, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', color: '#334155' }}>
                        <span style={{ color: '#2563EB', fontWeight: '800', fontSize: '14px', lineHeight: '1' }}>•</span>
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location & Map Preview */}
              <div style={{ height: '1px', backgroundColor: '#94A3B8', margin: '12px 0' }} />
              <h3 style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0' }}>
                Location
              </h3>
              <JobLocationMapPreview
                locationName={job.location}
                latitude={(job as any).latitude ? Number((job as any).latitude) : undefined}
                longitude={(job as any).longitude ? Number((job as any).longitude) : undefined}
              />
            </>
          )}
        </div>

      </div>

      {/* Permanently Anchored Bottom Action Dock (No Bottom Gap) */}
      {createPortal(
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #CBD5E1',
          padding: '10px 16px max(10px, env(safe-area-inset-bottom, 10px)) 16px',
          zIndex: 20000,
          display: 'flex',
          justifyContent: 'center',
          boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'center' }}>
            {hasApplied ? (
              <div style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#DCFCE7',
                border: '1px solid #BBF7D0',
                padding: '10px 14px',
                borderRadius: '8px'
              }}>
                <CheckCircle2 size={18} color="#16A34A" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#15803D' }}>Application Submitted</div>
                  <div style={{ fontSize: '11px', color: '#166534', marginTop: '1px' }}>
                    Status: {capitalize((appDetails as any)?.status || 'APPLIED')}
                  </div>
                </div>
              </div>
            ) : isOwner ? (
              <button
                onClick={() => navigate('/dashboard?tab=manage')}
                style={{
                  width: '100%',
                  height: '46px',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                Manage Job
              </button>
            ) : (
              <button
                onClick={handleApply}
                disabled={isApplying}
                style={{
                  width: '100%',
                  height: '46px',
                  backgroundColor: isApplying ? '#6366F1' : '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: isApplying ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background 0.2s ease'
                }}
              >
                <Send size={16} strokeWidth={2.5} color="#FFFFFF" />
                <span>{isApplying ? 'Applying...' : 'Apply Now'}</span>
              </button>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Industry-Grade Application Review & Confirmation Modal */}
      {showApplyModal && currentUser && (
        <JobApplyModal
          job={job}
          user={currentUser}
          onClose={() => setShowApplyModal(false)}
          onConfirm={confirmSubmitApplication}
          isApplying={isApplying}
        />
      )}
    </div>
  );
};

export default JobDetailPage;
