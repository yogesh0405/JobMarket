import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Job } from '../../types';
import { formatSalary, timeAgo } from '../../utils/helpers';
import { useJobs } from '../../hooks/useJobs';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';

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
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job: ${job.title} at ${job.company}`,
        url: `${window.location.origin}/#/job/${job.id}`,
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/#/job/${job.id}`);
      showToast('Job link copied to clipboard!', 'success');
    }
  };

  return (
    <div 
      className="job-card-new" 
      onClick={() => navigate(`/job/${job.id}`)}
      style={{
        background: '#ffffff',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 16px 32px -4px rgba(52, 75, 253, 0.16), 0 6px 12px -2px rgba(15, 23, 42, 0.06)';
        e.currentTarget.style.borderColor = '#344BFD';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)';
        e.currentTarget.style.borderColor = '#E2E8F0';
      }}
    >
      {/* Top section: Logo, Title, Save/Share */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', position: 'relative' }} className="job-card-header">
        {/* Architectural design logo */}
        <div style={{ width: '52px', height: '52px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', background: '#344BFD', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.06)' }} className="job-card-logo-container">
          {job.companyLogo && job.companyLogo.startsWith('http') ? (
            <img src={job.companyLogo} alt={job.company} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', display: 'block' }} className="job-card-logo">
              <rect width="100" height="100" fill="#344BFD" />
              <path d="M20 90 L20 40 L45 40 L45 90 Z" fill="#ffffff" opacity="0.15" />
              <path d="M40 90 L40 25 L70 25 L70 90 Z" fill="#ffffff" opacity="0.25" />
              <path d="M65 90 L65 50 L85 50 L85 90 Z" fill="#ffffff" opacity="0.1" />
              <rect x="47" y="32" width="6" height="8" fill="#ffffff" opacity="0.7" />
              <rect x="57" y="32" width="6" height="8" fill="#ffffff" opacity="0.7" />
              <rect x="47" y="45" width="6" height="8" fill="#ffffff" opacity="0.7" />
              <rect x="57" y="45" width="6" height="8" fill="#ffffff" opacity="0.7" />
              <rect x="47" y="58" width="6" height="8" fill="#ffffff" opacity="0.7" />
              <rect x="57" y="58" width="6" height="8" fill="#ffffff" opacity="0.7" />
            </svg>
          )}
        </div>

        {/* Title & Company */}
        <div style={{ flex: 1 }} className="job-card-title-container">
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#0F172A',
            margin: '0 0 4px 0',
            lineHeight: '1.3'
          }} className="job-card-title">
            {job.title}
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#64748B',
            margin: 0,
            fontWeight: '500'
          }} className="job-card-company">
            {job.company}
          </p>
        </div>

        {/* Save & Share buttons */}
        <div style={{ display: 'flex', gap: '8px', zIndex: 10 }} className="job-card-actions">
          <button
            onClick={handleSave}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: saved ? '#344BFD' : '#94A3B8',
              borderRadius: '0.3rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            className="job-card-save-btn"
            title={saved ? 'Unsave job' : 'Save job'}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#EEF1FF';
              e.currentTarget.style.color = '#344BFD';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = saved ? '#344BFD' : '#94A3B8';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          <button
            onClick={handleShare}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: '#94A3B8',
              borderRadius: '0.3rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            className="job-card-share-btn"
            title="Share job"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#EEF1FF';
              e.currentTarget.style.color = '#344BFD';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#94A3B8';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Tags Row: Job Type, Remote, Time Posted */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '16px 0 12px 0' }} className="job-card-tags">
        {/* Full Time / Part Time */}
        <span style={{
          background: '#EEF1FF',
          color: '#344BFD',
          fontSize: '12px',
          fontWeight: '600',
          padding: '6px 12px',
          borderRadius: '9999px'
        }} className="job-card-tag-type">
          {job.jobType}
        </span>

        {/* Remote / On-site */}
        <span style={{
          background: '#ffffff',
          color: '#344BFD',
          border: '1px solid #94A3B8',
          fontSize: '12px',
          fontWeight: '600',
          padding: '4px 10px',
          borderRadius: '9999px'
        }} className="job-card-tag-mode">
          {job.workMode || 'Remote'}
        </span>

        {/* Time Ago */}
        <span style={{
          background: '#EEF1FF',
          color: '#1E293B',
          fontSize: '12px',
          fontWeight: '600',
          padding: '6px 12px',
          borderRadius: '9999px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px'
        }} className="job-card-tag-time">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {timeAgo(job.postedAt)}
        </span>
      </div>

      {/* Grid details (Location, Experience, Salary, Applicants) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        margin: '8px 0 16px 0',
        paddingTop: '8px',
        borderTop: '1px solid #F1F5F9'
      }} className="job-card-specs">
        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '13px' }} className="job-card-spec">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.location}</span>
        </div>

        {/* Experience */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '13px' }} className="job-card-spec">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          <span>{job.minExperience}-{job.maxExperience} Years</span>
        </div>

        {/* Salary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '13px' }} className="job-card-spec">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="9" y1="15" x2="15" y2="15" />
            <line x1="9" y1="11" x2="15" y2="11" />
          </svg>
          <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
        </div>

        {/* Applicants */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '13px' }} className="job-card-spec">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>{job.views || 24} Applicants</span>
        </div>
      </div>

      {/* Description Snippet */}
      <p style={{
        fontSize: '13.5px',
        color: '#64748B',
        lineHeight: '1.5',
        margin: '0 0 16px 0',
        display: '-webkit-box',
        WebkitLineClamp: '2',
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }} className="job-card-description">
        {job.description || "We're looking for a skilled professional to join our team..."}
      </p>

      {/* Skills Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '0' }} className="job-card-skills">
        {(job.skills || []).slice(0, 4).map(s => (
          <span 
            key={s} 
            style={{
              background: '#EEF1FF',
              color: '#344BFD',
              fontSize: '12px',
              fontWeight: '550',
              padding: '6px 14px',
              borderRadius: '9999px'
            }}
            className="job-card-skill"
          >
            {s}
          </span>
        ))}
      </div>


    </div>
  );
};
export default JobCard;
