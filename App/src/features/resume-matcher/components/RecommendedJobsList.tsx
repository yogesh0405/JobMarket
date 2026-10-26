import React from 'react';
import { Link } from 'react-router-dom';
import { MatchingJobRecommendation } from '../types';
import { Briefcase, MapPin, Building2, ChevronRight, Zap, CheckCircle2 } from 'lucide-react';
import { CompanyDefaultLogo } from '../../../components/company/CompanyDefaultLogo';

interface RecommendedJobsListProps {
  jobs: MatchingJobRecommendation[];
  categoryFilter?: string;
}

export const RecommendedJobsList: React.FC<RecommendedJobsListProps> = ({ jobs, categoryFilter }) => {
  if (!jobs || jobs.length === 0) return null;

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '6px',
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
      padding: '24px',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Recommended JobMarket Opportunities
          </h3>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '3px', marginBottom: 0 }}>
            Live platform job openings ranked by verified fit and skill overlap with your resume.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {categoryFilter && categoryFilter !== 'all' && (
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#0F172A',
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>
              Industry: {categoryFilter}
            </span>
          )}
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#1B4FDF',
            background: '#EFF6FF',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            {jobs.length} Matches Found
          </span>
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: '#94A3B8', margin: '6px 0 16px 0' }} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px'
      }}>
        {jobs.map((job) => (
          <div
            key={job.id}
            style={{
              padding: '18px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease'
            }}
          >
            <div>
              {/* Header: Company & Match Score Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CompanyDefaultLogo
                    logoUrl={job.companyLogo}
                    companyName={job.company}
                    size={36}
                    borderRadius="6px"
                  />
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', display: 'block' }}>
                      {job.company}
                    </span>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      {job.title}
                    </h4>
                  </div>
                </div>

                {/* Match Score Badge */}
                <div style={{
                  background: job.matchScore >= 80 ? '#F0FDF4' : '#EFF6FF',
                  border: `1px solid ${job.matchScore >= 80 ? '#BBF7D0' : '#BFDBFE'}`,
                  padding: '4px 8px',
                  borderRadius: '4px',
                  textAlign: 'right'
                }}>
                  <span style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: job.matchScore >= 80 ? '#15803D' : '#1B4FDF',
                    display: 'block',
                    lineHeight: 1
                  }}>
                    {job.matchScore}%
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                    Match Fit
                  </span>
                </div>
              </div>

              {/* Location & Salary Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', margin: '8px 0 12px 0', fontSize: '12px', color: '#475569' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} color="#94A3B8" /> {job.location}
                </span>
                {job.salaryFormatted && (
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>
                    💰 {job.salaryFormatted}
                  </span>
                )}
                {job.jobType && (
                  <span style={{ background: '#E2E8F0', padding: '1px 5px', fontSize: '10.5px', borderRadius: '4px' }}>
                    {job.jobType}
                  </span>
                )}
              </div>

              {/* Matching Skills */}
              {job.matchingSkills.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803D', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <CheckCircle2 size={12} /> Matching Competencies:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {job.matchingSkills.map((s, idx) => (
                      <span key={idx} style={{
                        fontSize: '11px',
                        backgroundColor: '#F0FDF4',
                        color: '#15803D',
                        border: '1px solid #DCFCE7',
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skill Gaps if any */}
              {job.missingSkills.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#B45309', display: 'block', marginBottom: '4px' }}>
                    Recommended to Learn / Verify:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {job.missingSkills.map((s, idx) => (
                      <span key={idx} style={{
                        fontSize: '11px',
                        backgroundColor: '#FFFBEB',
                        color: '#B45309',
                        border: '1px solid #FEF3C7',
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '8px',
              borderTop: '1px solid #E2E8F0',
              paddingTop: '12px',
              marginTop: '6px'
            }}>
              <Link
                to={`/job/${job.id}`}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  backgroundColor: '#FFFFFF',
                  color: '#1B4FDF',
                  border: '1px solid #1B4FDF',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  minHeight: '40px'
                }}
              >
                View Job <ChevronRight size={14} />
              </Link>
              <Link
                to={`/job/${job.id}/apply`}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  backgroundColor: '#1B4FDF',
                  color: '#FFFFFF',
                  border: '1px solid #1B4FDF',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  minHeight: '40px'
                }}
              >
                <Zap size={13} /> Quick Apply
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
