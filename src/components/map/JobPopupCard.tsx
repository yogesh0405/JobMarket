import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, IndianRupee, Navigation, Bookmark, CheckCircle2 } from 'lucide-react';
import { formatSalary } from '../../utils/helpers';
import { CompanyDefaultLogo } from '../company/CompanyDefaultLogo';

interface JobPopupCardProps {
  job: any;
  onSaveJob?: (jobId: string) => void;
  isSaved?: boolean;
}

export const JobPopupCard: React.FC<JobPopupCardProps> = ({ job, onSaveJob, isSaved }) => {
  const getDirectionsUrl = () => {
    if (!job.latitude || !job.longitude) return '#';
    const isApple = typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);
    if (isApple) {
      return `https://maps.apple.com/?daddr=${job.latitude},${job.longitude}&q=${encodeURIComponent(job.company)}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${job.latitude},${job.longitude}&destination_place_id=${encodeURIComponent(job.company)}`;
  };

  return (
    <div className="map-popup-card">
      <div className="map-popup-header">
        <CompanyDefaultLogo
          logoUrl={job.companyLogo || (job as any).company_logo}
          companyName={job.company}
          size={36}
          borderRadius="8px"
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 className="map-popup-title" title={job.title}>{job.title}</h4>
          <div className="map-popup-company">{job.company}</div>
        </div>
      </div>

      <div className="map-popup-details">
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={13} color="#64748b" />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.location}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <IndianRupee size={13} color="#059669" />
          <span style={{ fontWeight: '700', color: '#059669' }}>
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Briefcase size={13} color="#64748b" />
          <span>{job.minExperience} - {job.maxExperience} Yrs Exp • {job.workMode || 'On-site'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
        <span className="map-job-badge">{job.jobType}</span>
        {job.featured && <span className="map-job-badge urgent">Featured</span>}
        {job.overtime && <span className="map-job-badge verified">OT Available</span>}
      </div>

      <div className="map-popup-actions">
        <a
          href={getDirectionsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="map-popup-btn map-popup-btn-secondary"
          title="Open Directions in Google/Apple Maps"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
        >
          <Navigation size={13} />
          Directions
        </a>

        {onSaveJob && (
          <button
            onClick={() => onSaveJob(job.id)}
            className="map-popup-btn map-popup-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
          >
            <Bookmark size={13} fill={isSaved ? '#344BFD' : 'none'} color={isSaved ? '#344BFD' : '#475569'} />
            {isSaved ? 'Saved' : 'Save'}
          </button>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = `/job/${job.id}`;
          }}
          className="map-popup-btn map-popup-btn-primary"
          style={{
            background: 'linear-gradient(135deg, #344BFD 0%, #6366f1 100%)',
            color: '#ffffff',
            fontWeight: '700',
            fontSize: '12px',
            border: 'none',
            borderRadius: '6px',
            padding: '7px 12px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 6px rgba(52, 75, 253, 0.3)'
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};
