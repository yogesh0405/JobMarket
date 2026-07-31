import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronUp, Briefcase, ExternalLink, IndianRupee } from 'lucide-react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const navigate = useNavigate();

  const handleJobCardClick = (job: any) => {
    onSelectJob(job);
    navigate(`/job/${job.id}`);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  // Touch Drag Handlers for Native-like Dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = e.touches[0].clientY;
    setIsDragging(true);
    setDragY(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const clientY = e.touches[0].clientY;
    currentYRef.current = clientY;
    const deltaY = clientY - startYRef.current;

    // Constrain drag direction based on expanded state
    if (!expanded) {
      if (deltaY < 0) {
        setDragY(deltaY);
      }
    } else {
      if (deltaY > 0) {
        setDragY(deltaY);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const deltaY = currentYRef.current - startYRef.current;

    // Drag threshold for snap action (40px)
    if (!expanded && deltaY < -40) {
      setExpanded(true);
    } else if (expanded && deltaY > 40) {
      setExpanded(false);
    }
    setDragY(0);
  };

  // Calculate dynamic transform based on state and active drag
  const getTransform = () => {
    if (isDragging) {
      if (expanded) {
        return `translateY(${Math.max(0, dragY)}px)`;
      } else {
        return `translateY(calc(100% - 56px + ${Math.min(0, dragY)}px))`;
      }
    }
    return expanded ? 'translateY(0)' : 'translateY(calc(100% - 56px))';
  };

  return (
    <>
      {/* Backdrop overlay when drawer is open */}
      <div
        className={`map-bottom-sheet-backdrop ${expanded ? 'visible' : ''}`}
        onClick={() => setExpanded(false)}
      />

      <div
        className={`map-bottom-sheet ${expanded ? 'expanded' : ''} ${isDragging ? 'dragging' : ''}`}
        style={{
          transform: getTransform(),
          transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle Zone */}
        <div className="map-bottom-sheet-handle-zone" onClick={handleToggle}>
          <div className="map-bottom-sheet-handle" />
        </div>

        {/* Header */}
        <div className="map-bottom-sheet-header" onClick={handleToggle}>
          <div className="map-bottom-sheet-title-row">
            <div className="map-bottom-sheet-icon-wrapper">
              <Briefcase size={15} color="#344BFD" />
            </div>
            <span className="map-bottom-sheet-title">
              Jobs Nearby
            </span>
            <span className="map-bottom-sheet-count-badge">
              {jobs.length}
            </span>
          </div>
          <div className="map-bottom-sheet-chevron-wrapper">
            <ChevronUp
              size={20}
              color="#64748b"
              className={`map-bottom-sheet-chevron ${expanded ? 'expanded' : ''}`}
            />
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
    </>
  );
};

