import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Job } from '../../types';
import { formatSalary, timeAgo, shareContent } from '../../utils/helpers';
import { useJobs } from '../../hooks/useJobs';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';
import { CompanyDefaultLogo } from '../company/CompanyDefaultLogo';

interface JobCardProps {
  job: Job;
  onSaveToggle?: (jobId: string, isSaved: boolean) => void;
  variant?: 'default' | 'carousel';
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSaveToggle, variant = 'default' }) => {
  const navigate = useNavigate();
  const { toggleSaveJob, isJobSaved } = useJobs();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { state } = useStore();
  const t = useTranslation(state.language);

  const [localSavedOverride, setLocalSavedOverride] = React.useState<boolean | null>(null);
  const storeSaved = isJobSaved(job.id);
  const saved = localSavedOverride !== null ? localSavedOverride : storeSaved;

  React.useEffect(() => {
    setLocalSavedOverride(null);
  }, [storeSaved]);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      showToast('Please login to save jobs', 'warning');
      navigate('/login');
      return;
    }
    const nextState = !saved;
    setLocalSavedOverride(nextState);
    const isNowSaved = toggleSaveJob(job.id);
    if (onSaveToggle) {
      onSaveToggle(job.id, isNowSaved);
    }
    showToast(isNowSaved ? 'Job saved to your bookmarks! 🔖' : 'Job removed from saved', isNowSaved ? 'success' : 'info');
  };

  const renderSalary = () => {
    if (job.discloseSalary === false) return 'Not disclosed';
    if (!job.salaryMin && !job.salaryMax) return 'Not disclosed';
    if (job.salaryMin >= 100000) {
      const minLacs = (job.salaryMin / 100000).toFixed(0);
      const maxLacs = (job.salaryMax / 100000).toFixed(0);
      return `${minLacs}–${maxLacs} Lacs`;
    }
    return formatSalary(job.salaryMin, job.salaryMax);
  };

  const workModeColor = () => {
    const mode = (job.workMode || '').toLowerCase();
    if (mode.includes('remote')) return { bg: '#DCFCE7', color: '#15803D', border: '#BBF7D0' };
    if (mode.includes('hybrid')) return { bg: '#FEF9C3', color: '#92400E', border: '#FDE68A' };
    return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' };
  };

  const { bg: wmBg, color: wmColor, border: wmBorder } = workModeColor();

  const applicantRecord = job.applicants?.find(a => a.userId === currentUser?.id || a.id === currentUser?.id);
  const hasApplied = Boolean(
    currentUser && (
      currentUser.appliedJobs?.includes(job.id) ||
      currentUser.appliedJobsWithStatus?.some((app: any) => app.jobId === job.id) ||
      applicantRecord
    )
  );

  const appDetails = currentUser?.appliedJobsWithStatus?.find((a: any) => a.jobId === job.id) || (applicantRecord ? {
    jobId: job.id,
    status: applicantRecord.status || 'applied',
  } : null);

  return (
    <div
      className="job-card-naukri-style"
      onClick={() => navigate(`/job/${job.id}`)}
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #cbd5e1',
        borderRadius: '6px',
        padding: '0',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)',
        boxSizing: 'border-box',
        width: '100%',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#344BFD';
        e.currentTarget.style.boxShadow = '0 10px 24px rgba(52, 75, 253, 0.16), 0 4px 8px rgba(15, 23, 42, 0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.zIndex = '10';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#cbd5e1';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)';
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.zIndex = '1';
      }}
    >
      {/* ── TOP HIGHLIGHT BOX ── */}
      <div style={{
        background: '#FFFFFF',
        padding: '12px 14px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        borderBottom: '1px solid #F1F5F9'
      }}>
        {/* Title row + bookmark */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
          <h3 style={{
            fontSize: '15.5px',
            fontWeight: '800',
            color: '#0F172A',
            margin: 0,
            lineHeight: '1.25',
            letterSpacing: '-0.25px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1
          }}>
            {job.title}
          </h3>
          <button
            onClick={handleSave}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0 0 0 4px',
              cursor: 'pointer',
              color: saved ? '#2563eb' : '#CBD5E1',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              marginTop: '1px'
            }}
            title={saved ? 'Unsave job' : 'Save job'}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        {/* Address (Location) + Experience + Salary in ONE ROW */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          color: '#475569',
          fontSize: '12px',
          fontWeight: '500',
          marginTop: '2px'
        }}>
          {/* Location / Address */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2" style={{ flexShrink: 0 }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{job.location}</span>
          </div>

          <span style={{ color: '#CBD5E1', flexShrink: 0 }}>|</span>

          {/* Experience */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2" style={{ flexShrink: 0 }}>
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <span>{job.experienceRequired === false ? 'Fresher' : `${job.minExperience}–${job.maxExperience} Yrs`}</span>
          </div>

          <span style={{ color: '#CBD5E1', flexShrink: 0 }}>|</span>

          {/* Salary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
            <span style={{ fontWeight: '600', color: '#64748B' }}>₹</span>
            <span>{renderSalary()}</span>
          </div>
        </div>
      </div>

      {/* ── MIDDLE TAGS ROW: Work Mode + Shift + Job Type ── */}
      <div style={{
        padding: '8px 14px 6px',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        flexWrap: 'wrap',
        rowGap: '5px',
        borderBottom: '1px solid #F1F5F9',
        flex: variant === 'carousel' ? '1' : undefined,
        alignContent: variant === 'carousel' ? 'flex-start' : undefined,
        overflow: variant === 'carousel' ? 'hidden' : undefined
      }}>
        {/* Work Mode badge */}
        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          padding: '2px 8px',
          borderRadius: '4px',
          background: wmBg,
          color: wmColor,
          border: `1px solid ${wmBorder}`,
          whiteSpace: 'nowrap',
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {(job.workMode || '').toLowerCase().includes('remote') ? (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          ) : (job.workMode || '').toLowerCase().includes('hybrid') ? (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
              <path d="M6 12h12"/><path d="M6 7h12"/><path d="M6 17h12"/>
            </svg>
          )}
          <span>{job.workMode || 'On-site'}</span>
        </span>

        {/* Job Type badge */}
        <span style={{
          fontSize: '11px',
          fontWeight: '600',
          padding: '2px 8px',
          borderRadius: '4px',
          background: '#F1F5F9',
          color: '#475569',
          border: '1px solid #E2E8F0',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
          <span>{job.jobType || 'Full-time'}</span>
        </span>

        {/* Education badge */}
        {(job.educationRequirement || (job as any).education_requirement) && (
          <span style={{
            fontSize: '11px',
            fontWeight: '600',
            padding: '2px 8px',
            borderRadius: '4px',
            background: '#F0FDF4',
            color: '#166534',
            border: '1px solid #BBF7D0',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
            </svg>
            <span>{job.educationRequirement || (job as any).education_requirement}</span>
          </span>
        )}

        {/* Shift Details */}
        {(job as any).shiftDetails && (
          <span style={{
            fontSize: '11px',
            fontWeight: '600',
            padding: '3px 8px',
            borderRadius: '4px',
            background: '#F8F4FF',
            color: '#6D28D9',
            border: '1px solid #DDD6FE',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {(job as any).shiftDetails}
          </span>
        )}

        {/* Real-time Application Status Badge */}
        {hasApplied && variant !== 'carousel' && (
          <span style={{
            fontSize: '11px',
            fontWeight: '800',
            padding: '2px 8px',
            borderRadius: '4px',
            background: appDetails?.status === 'accepted' ? '#DCFCE7' : appDetails?.status === 'shortlisted' ? '#FAF5FF' : '#EFF6FF',
            color: appDetails?.status === 'accepted' ? '#15803D' : appDetails?.status === 'shortlisted' ? '#9333EA' : '#2563EB',
            border: appDetails?.status === 'accepted' ? '1px solid #BBF7D0' : appDetails?.status === 'shortlisted' ? '1px solid #E9D5FF' : '1px solid #BFDBFE',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            marginLeft: 'auto'
          }}>
            <span>✓</span>
            <span>{appDetails?.status ? (appDetails.status.charAt(0).toUpperCase() + appDetails.status.slice(1)) : 'Applied'}</span>
          </span>
        )}
      </div>

      {/* ── BOTTOM: Company + Rating + Time ── */}
      <div style={{
        padding: '8px 14px 10px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '8px',
        marginTop: variant === 'carousel' ? 'auto' : undefined
      }}>
        {/* Logo + Company info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <CompanyDefaultLogo
            logoUrl={job.companyLogo || (job as any).company_logo}
            companyName={job.company}
            size={38}
            borderRadius="4px"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
            <div style={{
              fontSize: '12.5px',
              fontWeight: '700',
              color: '#1E293B',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {job.company}
            </div>
            <div style={{ fontSize: '11px', color: '#0284C7', fontWeight: '600' }}>
              Posted by {job.company}
            </div>
          </div>
        </div>

        {/* Time */}
        <div style={{
          fontSize: '11px',
          color: '#94A3B8',
          fontWeight: '500',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          paddingTop: '2px'
        }}>
          {timeAgo(job.postedAt)}
        </div>
      </div>
    </div>
  );
};
export default JobCard;
