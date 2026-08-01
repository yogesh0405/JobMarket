import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useJobs } from '../../hooks/useJobs';
import { useToast } from '../../hooks/useToast';
import { JobCard } from '../../components/job/JobCard';

export const SavedJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const { getSavedJobs, fetchCandidateSavedJobs, toggleSaveJob } = useJobs();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [removedJobIds, setRemovedJobIds] = useState<string[]>([]);

  useEffect(() => {
    if (fetchCandidateSavedJobs) {
      fetchCandidateSavedJobs();
    }
  }, []);

  const savedJobs = getSavedJobs().filter(j => !removedJobIds.includes(j.id));

  const handleUnsave = (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // 0ms instant DOM removal
    setRemovedJobIds(prev => [...prev, jobId]);
    toggleSaveJob(jobId);
    showToast('Job removed from saved', 'info');
  };

  // Filter saved jobs based on search query and selected industry
  const filteredJobs = savedJobs.filter((job) => {
    const matchesSearch =
      !searchQuery.trim() ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesIndustry =
      !selectedIndustry || job.industry === selectedIndustry;

    return matchesSearch && matchesIndustry;
  });

  // Extract unique industries from saved jobs for filter dropdown
  const savedIndustries = Array.from(
    new Set(savedJobs.map((j) => j.industry).filter(Boolean))
  );

  return (
    <div className="saved-jobs-page-wrapper" style={{ background: 'var(--bg)', minHeight: '100vh', padding: '16px 0 100px 0' }}>
      <div className="container">
        {/* Header Section */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#344BFD',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '16px',
              padding: 0
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Dashboard
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Saved Jobs
                </h1>
                <span
                  style={{
                    background: '#eff6ff',
                    color: '#2563eb',
                    fontWeight: '700',
                    fontSize: '13px',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    border: '1px solid #bfdbfe'
                  }}
                >
                  {savedJobs.length} {savedJobs.length === 1 ? 'Job' : 'Jobs'}
                </span>
              </div>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
                Your bookmarked factory & technical jobs for quick access and application
              </p>
            </div>

            <Link
              to="/jobs"
              className="btn btn-outline-primary btn-sm"
              style={{ borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Browse More Vacancies
            </Link>
          </div>
        </div>

        {savedJobs.length > 0 ? (
          <>
            {/* Filter & Search Bar for Saved Jobs */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '14px 18px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
              }}
            >
              <div style={{ flex: '1', minWidth: '240px', position: 'relative' }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Filter saved jobs by title, company, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#f8fafc',
                    color: '#0f172a'
                  }}
                />
              </div>

              {savedIndustries.length > 1 && (
                <div style={{ minWidth: '180px' }}>
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      background: '#f8fafc',
                      color: '#0f172a',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">All Industries ({savedJobs.length})</option>
                    {savedIndustries.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Jobs List */}
            {filteredJobs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredJobs.map((job) => (
                  <div key={job.id} style={{ position: 'relative' }}>
                    <JobCard job={job} />
                    <button
                      type="button"
                      onClick={(e) => handleUnsave(job.id, e)}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '40px',
                        background: '#FEF2F2',
                        border: '1px solid #FCA5A5',
                        color: '#DC2626',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        zIndex: 10,
                        transition: 'all 0.15s ease'
                      }}
                      title="Remove from saved jobs"
                    >
                      <Trash2 size={13} />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '16px',
                  padding: '40px 24px',
                  textAlign: 'center',
                  color: '#64748b'
                }}
              >
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>
                  No saved jobs match &quot;{searchQuery}&quot;
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedIndustry('');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#2563eb',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State when no jobs are saved */
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '20px',
              padding: '60px 24px',
              textAlign: 'center',
              maxWidth: '540px',
              margin: '20px auto',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>
              No Saved Jobs Yet
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0', lineHeight: '1.6' }}>
              Bookmark vacancies while browsing to compare requirements, shift details, and apply whenever you are ready.
            </p>
            <Link
              to="/jobs"
              className="btn btn-primary"
              style={{
                padding: '12px 28px',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '15px'
              }}
            >
              Explore Vacancies →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
export default SavedJobsPage;
