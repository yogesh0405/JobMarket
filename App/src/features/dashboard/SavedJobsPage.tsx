import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useJobs } from '../../hooks/useJobs';
import { useToast } from '../../hooks/useToast';
import { JobCard } from '../../components/job/JobCard';

export const SavedJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const { getSavedJobs, fetchCandidateSavedJobs } = useJobs();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  useEffect(() => {
    if (fetchCandidateSavedJobs) {
      fetchCandidateSavedJobs();
    }
  }, []);

  const handleSaveToggle = (jobId: string, isSaved: boolean) => {
    if (!isSaved) {
      // Instantly hide card from DOM
      setRemovedIds(prev => [...prev, jobId]);
    }
  };

  const savedJobs = getSavedJobs().filter(job => !removedIds.includes(job.id));

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
    <div className="saved-jobs-page-wrapper" style={{ background: '#F8FAFC', minHeight: '100vh', padding: '16px 0 100px 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        
        {/* Modern Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: '#ffffff',
            border: '1.5px solid #E2E8F0',
            color: '#344BFD',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '16px',
            padding: '6px 14px',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Dashboard
        </button>

        {/* Hero Header Section */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: '12px',
          padding: '24px 28px',
          marginBottom: '20px',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '-0.3px' }}>
                Saved Jobs
              </h1>
              <span
                style={{
                  background: '#2563EB',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '12px',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.4)'
                }}
              >
                {savedJobs.length} {savedJobs.length === 1 ? 'Job' : 'Jobs'}
              </span>
            </div>
            <p style={{ fontSize: '13.5px', color: '#94A3B8', margin: '6px 0 0 0', fontWeight: '500' }}>
              Your bookmarked factory & technical jobs for quick access and application
            </p>
          </div>

          <Link
            to="/jobs"
            style={{
              background: '#ffffff',
              color: '#1E293B',
              fontWeight: '700',
              fontSize: '13px',
              padding: '9px 18px',
              borderRadius: '8px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Browse More Vacancies
          </Link>
        </div>

        {savedJobs.length > 0 ? (
          <>
            {/* Search & Filter Bar */}
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #E2E8F0',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
              }}
            >
              <div style={{ flex: '1', minWidth: '220px', position: 'relative' }}>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="2.2"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search saved jobs by title, company, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '6px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '13.5px',
                    outline: 'none',
                    background: '#F8FAFC',
                    color: '#0F172A',
                    fontWeight: '500'
                  }}
                />
              </div>

              {savedIndustries.length > 1 && (
                <div style={{ minWidth: '170px' }}>
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '13px',
                      background: '#F8FAFC',
                      color: '#0F172A',
                      fontWeight: '600',
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

            {/* Jobs Grid / List */}
            {filteredJobs.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onSaveToggle={handleSaveToggle}
                  />
                ))}
              </div>
            ) : (
              <div
                style={{
                  background: '#ffffff',
                  border: '1.5px dashed #CBD5E1',
                  borderRadius: '12px',
                  padding: '40px 24px',
                  textAlign: 'center',
                  color: '#64748B'
                }}
              >
                <p style={{ margin: 0, fontSize: '14.5px', fontWeight: '600', color: '#1E293B' }}>
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
                    color: '#2563EB',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                >
                  Clear search filters
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State when no jobs are saved */
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #E2E8F0',
              borderRadius: '12px',
              padding: '56px 24px',
              textAlign: 'center',
              maxWidth: '520px',
              margin: '24px auto',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)'
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#EFF6FF',
                color: '#2563EB',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)'
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0' }}>
              No Saved Jobs Yet
            </h3>
            <p style={{ fontSize: '13.5px', color: '#64748B', margin: '0 0 24px 0', lineHeight: '1.6', fontWeight: '500' }}>
              Bookmark vacancies while browsing to compare requirements, shift details, and apply whenever you are ready.
            </p>
            <Link
              to="/jobs"
              style={{
                display: 'inline-block',
                background: '#2563EB',
                color: '#ffffff',
                padding: '11px 26px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '14px',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
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
