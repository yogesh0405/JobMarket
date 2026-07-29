import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronUp, ChevronDown, Briefcase, ExternalLink, IndianRupee } from 'lucide-react';
import { formatSalary } from '../../utils/helpers';
import { CompanyDefaultLogo } from '../company/CompanyDefaultLogo';

interface JobMapBottomSheetProps {
  jobs: any[];
  activeJobId: string | null;
  onSelectJob: (job: any) => void;
}

export const JobMapBottomSheet: React.FC<JobMapBottomSheetProps> = ({
  jobs,
  activeJobId,
  onSelectJob
}) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleJobCardClick = (job: any) => {
    onSelectJob(job);
    // Navigate to job detail page
    navigate(`/job/${job.id}`);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div
      className={`map-bottom-sheet ${expanded ? 'expanded' : ''}`}
      style={{
        transform: expanded ? 'translateY(0)' : 'translateY(calc(100% - 64px))'
      }}
    >
      {/* Drag Handle */}
      <div className="map-bottom-sheet-handle" onClick={handleToggle} />

      {/* Header */}
      <div className="map-bottom-sheet-header" onClick={handleToggle}>
        <div className="map-bottom-sheet-title-row">
          <Briefcase size={16} color="#344BFD" />
          <span className="map-bottom-sheet-title">
            {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'} Nearby
          </span>
        </div>
        <div className="map-bottom-sheet-chevron">
          {expanded ? <ChevronDown size={20} color="#64748b" /> : <ChevronUp size={20} color="#64748b" />}
        </div>
      </div>

      {/* Scrollable Job List */}
      <div className="map-bottom-sheet-list">
        {jobs.length === 0 && (
          <div className="map-bottom-sheet-empty">
            <MapPin size={28} color="#cbd5e1" />
            <span>No jobs found in this area</span>
          </div>
        )}
        {jobs.map((job) => (
          <div
            key={job.id}
            className={`map-job-card ${job.id === activeJobId ? 'active' : ''}`}
            onClick={() => handleJobCardClick(job)}
          >
            <div className="map-job-card-header">
              <CompanyDefaultLogo
                logoUrl={job.companyLogo || (job as any).company_logo}
                companyName={job.company}
                size={36}
                borderRadius="8px"
              />
              <div className="map-job-card-info">
                <h4 className="map-job-card-title">{job.title}</h4>
                <div className="map-job-card-company">{job.company}</div>
                <div className="map-job-card-location">
                  <MapPin size={11} color="#64748b" />
                  <span>{job.location}</span>
                </div>
              </div>
              <ExternalLink size={14} color="#94a3b8" className="map-job-card-arrow" />
            </div>
            <div className="map-job-card-footer">
              <div className="map-job-salary">
                <IndianRupee size={12} />
                {formatSalary(job.salaryMin, job.salaryMax)}
              </div>
              <div className="map-job-badges">
                <span className="map-job-badge">{job.workMode || 'On-site'}</span>
                {job.jobType && <span className="map-job-badge">{job.jobType}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
