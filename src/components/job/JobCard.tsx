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
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const navigate = useNavigate();
  const { toggleSaveJob, isJobSaved } = useJobs();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { state } = useStore();
  const t = useTranslation(state.language);

  const saved = isJobSaved(job.id);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      showToast('Please login to save jobs', 'warning');
      navigate('/login');
      return;
    }
    const currentlySaved = await toggleSaveJob(job.id);
    showToast(currentlySaved ? 'Job saved!' : 'Job removed from saved', currentlySaved ? 'success' : 'info');
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

  return (
    <div
      className="job-card-naukri-style"
      onClick={() => navigate(`/job/${job.id}`)}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        padding: '0',
        cursor: 'pointer',
        transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        boxSizing: 'border-box',
        width: '100%',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#93C5FD';
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.10)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E2E8F0';
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
      }}
    >
      {/* ── TOP HIGHLIGHT BOX ── */}
      <div style={{
        background: '#F8FAFC',
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

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B', fontSize: '12px', fontWeight: '500' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2" style={{ flexShrink: 0 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.location}</span>
        </div>

        {/* Experience + Salary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'nowrap', color: '#475569', fontSize: '12px', fontWeight: '500' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2" style={{ flexShrink: 0 }}>
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <span>{job.experienceRequired === false ? 'Fresher' : `${job.minExperience}–${job.maxExperience} Yrs`}</span>
          </div>
          <span style={{ color: '#CBD5E1' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
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
        borderBottom: '1px solid #F1F5F9'
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
          flexShrink: 0
        }}>
          {job.workMode || 'On-site'}
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
          flexShrink: 0
        }}>
          {job.jobType || 'Full-time'}
        </span>

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
      </div>

      {/* ── BOTTOM: Company + Rating + Time ── */}
      <div style={{
        padding: '8px 14px 10px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '8px'
      }}>
        {/* Logo + Company info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <CompanyDefaultLogo
            logoUrl={job.companyLogo || (job as any).company_logo}
            companyName={job.company}
            size={38}
            borderRadius="8px"
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748B' }}>
              <span style={{ color: '#EAB308', fontWeight: '700' }}>★ 4.2</span>
              <span style={{ color: '#CBD5E1' }}>•</span>
              <span>Reviews</span>
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
