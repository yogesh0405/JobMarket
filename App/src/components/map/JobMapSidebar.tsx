import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, IndianRupee, Briefcase, ChevronRight } from 'lucide-react';
import { formatSalary } from '../../utils/helpers';
import { CompanyDefaultLogo } from '../company/CompanyDefaultLogo';

interface JobMapSidebarProps {
  jobs: any[];
  activeJobId: string | null;
  onSelectJob: (job: any) => void;
  savedJobIds?: string[];
}

export const JobMapSidebar: React.FC<JobMapSidebarProps> = ({
  jobs,
  activeJobId,
  onSelectJob
}) => {
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Auto-scroll to selected job card in sidebar when marker is clicked on map
  useEffect(() => {
    if (activeJobId && cardRefs.current[activeJobId]) {
      cardRefs.current[activeJobId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeJobId]);

  return (
    <aside className="map-sidebar-desktop">
      <div className="map-sidebar-header">
        <div className="map-sidebar-title">
          <span>Jobs in Viewport</span>
          <span className="map-sidebar-count-badge">{jobs.length}</span>
        </div>
      </div>

      <div className="map-sidebar-list">
        {jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <MapPin size={36} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: '600', fontSize: '15px', margin: '0 0 4px 0', color: '#334155' }}>No Jobs in Visible Map View</p>
            <p style={{ fontSize: '13px', margin: 0 }}>Pan or zoom out on the map, or clear search filters.</p>
          </div>
        ) : (
          jobs.map((job) => {
            const isActive = job.id === activeJobId;
            return (
              <div
                key={job.id}
                ref={(el) => {
                  cardRefs.current[job.id] = el;
                }}
                className={`map-job-card ${isActive ? 'active' : ''}`}
                onClick={() => onSelectJob(job)}
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
                      <MapPin size={13} color="#64748b" />
                      <span>{job.location}</span>
                    </div>
                  </div>
                </div>

                <div className="map-job-card-footer">
                  <div className="map-job-salary">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </div>
                  <div className="map-job-badges">
                    <span className="map-job-badge">{job.workMode || 'On-site'}</span>
                    <span className="map-job-badge">{job.jobType}</span>
                    {job.featured && <span className="map-job-badge urgent">Featured</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
