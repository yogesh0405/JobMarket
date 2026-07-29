import React, { useState } from 'react';
import { MapPin, ChevronUp, ChevronDown } from 'lucide-react';
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

  return (
    <div
      className="map-bottom-sheet"
      style={{
        transform: expanded ? 'translateY(0)' : 'translateY(calc(100% - 70px))'
      }}
    >
      <div
        className="map-bottom-sheet-handle"
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: 'pointer' }}
      />
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '0 16px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          borderBottom: '1px solid #f1f5f9'
        }}
      >
        <span style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>
          {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'} Nearby
        </span>
        {expanded ? <ChevronDown size={18} color="#64748b" /> : <ChevronUp size={18} color="#64748b" />}
      </div>

      <div
        style={{
          overflowY: 'auto',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        {jobs.map((job) => (
          <div
            key={job.id}
            className={`map-job-card ${job.id === activeJobId ? 'active' : ''}`}
            onClick={() => {
              onSelectJob(job);
              setExpanded(false);
            }}
          >
            <div className="map-job-card-header">
              <CompanyDefaultLogo
                logoUrl={job.companyLogo || (job as any).company_logo}
                companyName={job.company}
                size={32}
                borderRadius="6px"
              />
              <div className="map-job-card-info">
                <h4 className="map-job-card-title">{job.title}</h4>
                <div className="map-job-card-company">{job.company}</div>
                <div className="map-job-card-location">
                  <MapPin size={12} color="#64748b" />
                  <span>{job.location}</span>
                </div>
              </div>
            </div>
            <div className="map-job-card-footer">
              <div className="map-job-salary">{formatSalary(job.salaryMin, job.salaryMax)}</div>
              <div className="map-job-badges">
                <span className="map-job-badge">{job.workMode || 'On-site'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
