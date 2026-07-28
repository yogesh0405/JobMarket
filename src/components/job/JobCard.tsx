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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetUrl = `${window.location.protocol}//${window.location.host}/#/job/${job.id}`;
    shareContent(
      job.title,
      `Check out this job: ${job.title} at ${job.company}`,
      targetUrl,
      () => showToast('Job link copied to clipboard!', 'success')
    );
  };

  return (
    <div 
      className="job-card-new" 
      onClick={() => navigate(`/job/${job.id}`)}
      style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFC 100%)',
        border: '1px solid #CBD5E1',
        borderBottom: '3px solid #CBD5E1',
        borderRadius: '18px',
        padding: '20px 20px',
        cursor: 'pointer',
        transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flex: '1 1 auto',
        boxShadow: '0 12px 28px -6px rgba(15, 23, 42, 0.08), 0 4px 10px -2px rgba(15, 23, 42, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 22px 45px -8px rgba(37, 99, 235, 0.22), 0 8px 18px -4px rgba(15, 23, 42, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)';
        e.currentTarget.style.borderColor = '#3b82f6';
        e.currentTarget.style.borderBottomColor = '#2563eb';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 12px 28px -6px rgba(15, 23, 42, 0.08), 0 4px 10px -2px rgba(15, 23, 42, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)';
        e.currentTarget.style.borderColor = '#CBD5E1';
        e.currentTarget.style.borderBottomColor = '#CBD5E1';
      }}
    >
      {/* 1. Header: Company Brand + Time Ago & Save/Share Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }} className="job-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{
            boxShadow: '0 3px 8px rgba(15, 23, 42, 0.1)',
            borderRadius: '10px',
            flexShrink: 0
          }}>
            <CompanyDefaultLogo 
              logoUrl={job.companyLogo || (job as any).company_logo} 
              companyName={job.company} 
              size={38} 
              borderRadius="10px"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#0F172A',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {job.company}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#2563eb" stroke="#ffffff" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </span>
            <span style={{ fontSize: '11.5px', color: '#94A3B8', fontWeight: '500' }}>
              {timeAgo(job.postedAt)}
            </span>
          </div>
        </div>

        {/* Save & Share 3D action buttons */}
        <div style={{ display: 'flex', gap: '5px', zIndex: 10, flexShrink: 0 }} className="job-card-actions">
          <button
            onClick={handleSave}
            style={{
              background: saved ? '#EFF6FF' : '#F8FAFC',
              border: saved ? '1px solid #93C5FD' : '1px solid #E2E8F0',
              boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
              padding: '6px 8px',
              cursor: 'pointer',
              color: saved ? '#2563eb' : '#64748B',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            className="job-card-save-btn"
            title={saved ? 'Unsave job' : 'Save job'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>

          <button
            onClick={handleShare}
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
              padding: '6px 8px',
              cursor: 'pointer',
              color: '#64748B',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            className="job-card-share-btn"
            title="Share job"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 2. Job Title */}
      <h3 style={{
        fontSize: '17px',
        fontWeight: '800',
        color: '#0F172A',
        margin: '0 0 12px 0',
        lineHeight: '1.35',
        display: '-webkit-box',
        WebkitLineClamp: '2',
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        letterSpacing: '-0.2px'
      }} className="job-card-title">
        {job.title}
      </h3>

      {/* 3. Specs Pill Badges (Perfect 1-Row Responsive Grid) */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        alignItems: 'center',
        margin: '0 0 12px 0'
      }} className="job-card-specs">
        {/* Location Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 9px',
          background: '#F1F5F9',
          border: '1px solid #E2E8F0',
          borderRadius: '7px',
          color: '#334155',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" style={{ flexShrink: 0 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{job.location}</span>
        </div>

        {/* Experience Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 9px',
          background: '#F1F5F9',
          border: '1px solid #E2E8F0',
          borderRadius: '7px',
          color: '#334155',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" style={{ flexShrink: 0 }}>
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          <span>{job.minExperience}-{job.maxExperience} Yrs</span>
        </div>

        {/* Salary 3D Highlight Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 9px',
          background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
          border: '1px solid #A7F3D0',
          boxShadow: '0 2px 4px rgba(5, 150, 105, 0.08)',
          borderRadius: '7px',
          color: '#047857',
          fontSize: '12px',
          fontWeight: '700'
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" style={{ flexShrink: 0 }}>
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
        </div>
      </div>

      {/* 4. Description snippet (Strict 2-line clamp with exact height lock to prevent line bleeding) */}
      <p style={{
        fontSize: '12.5px',
        color: '#64748B',
        lineHeight: '16.5px',
        margin: '0 0 10px 0',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        height: '33px',
        maxHeight: '33px',
        flexShrink: 0,
        wordBreak: 'break-word'
      }} className="job-card-description">
        {job.description || 'No additional description provided for this job opportunity.'}
      </p>

      {/* 5. Footer Tags & 3D Interactive Apply Button (STRICT 1-ROW UNIFORM ALIGNMENT) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        gap: '6px',
        marginTop: 'auto',
        paddingTop: '10px',
        borderTop: '1px solid #F1F5F9',
        overflow: 'hidden',
        minHeight: '34px'
      }} className="job-card-footer">
        {/* Left Side: Clean Badges & Tags (Max 3 badges to guarantee 100% fit on mobile screens) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flex: '1 1 auto',
          minWidth: 0,
          overflow: 'hidden'
        }}>
          <span style={{
            background: '#EFF6FF',
            color: '#1D4ED8',
            border: '1px solid #DBEAFE',
            fontSize: '11px',
            fontWeight: '700',
            padding: '3px 7px',
            borderRadius: '6px',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            {job.jobType}
          </span>

          <span style={{
            background: '#F8FAFC',
            color: '#475569',
            border: '1px solid #E2E8F0',
            fontSize: '11px',
            fontWeight: '600',
            padding: '3px 7px',
            borderRadius: '6px',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            {job.workMode || 'Onsite'}
          </span>

          {/* Skill Tag / Skill Count Badge */}
          {job.skills && job.skills.length > 0 && (
            job.skills.length === 1 ? (
              <span 
                style={{
                  background: '#F8FAFC',
                  color: '#475569',
                  border: '1px solid #E2E8F0',
                  fontSize: '11px',
                  fontWeight: '500',
                  padding: '3px 7px',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '85px',
                  flexShrink: 1
                }}
              >
                {job.skills[0]}
              </span>
            ) : (
              <span style={{
                background: '#EFF6FF',
                color: '#2563eb',
                border: '1px solid #BFDBFE',
                fontSize: '11px',
                fontWeight: '700',
                padding: '3px 7px',
                borderRadius: '6px',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}>
                +{job.skills.length} skills
              </span>
            )
          )}
        </div>

        {/* Right Side: 3D Gradient Apply Button (Strictly anchored 1-row CTA) */}
        <span style={{
          fontSize: '12px',
          fontWeight: '800',
          color: '#ffffff',
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          padding: '6px 14px',
          borderRadius: '8px',
          boxShadow: '0 3px 10px rgba(37, 99, 235, 0.35)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          flexShrink: 0,
          whiteSpace: 'nowrap'
        }}>
          Apply Now
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </span>
      </div>

    </div>
  );
};
export default JobCard;
