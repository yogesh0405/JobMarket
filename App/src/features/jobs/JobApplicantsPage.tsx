import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Search, Filter, CheckCircle2, XCircle, Clock, 
  UserCheck, Mail, Phone, MapPin, FileText, Sparkles, Calendar, 
  Briefcase, Building, ExternalLink, ShieldCheck, ChevronRight, UserX, MessageSquare, RefreshCw, Eye
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useJobs } from '../../hooks/useJobs';
import { useToast } from '../../hooks/useToast';
import { apiFetch } from '../../utils/api';
import { getInitials, timeAgo, capitalize } from '../../utils/helpers';
import { ResumePreviewModal } from '../../components/profile/ResumePreviewModal';
import { CandidateDetailsModal } from '../../components/candidate/CandidateDetailsModal';

export const JobApplicantsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { updateApplicantStatus, scheduleInterview, sendCustomEmail } = useJobs();
  const { showToast } = useToast();

  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewResume, setPreviewResume] = useState<any>(null);
  const [viewWorker, setViewWorker] = useState<any>(null);

  // Filters and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'applied' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const [searchParams] = useSearchParams();
  const targetApplicantId = searchParams.get('applicantId');
  const hasAutoOpened = useRef(false);

  // Load job and applicants data safely without full page blinking
  const loadData = useCallback(async (isSilentRefresh = false) => {
    if (!id) return;
    if (!isSilentRefresh && !job) {
      setIsInitialLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      // 1. Fetch job details
      const jobRes = await apiFetch(`/api/v1/jobs/${id}`);
      const jobJson = await jobRes.json();
      if (!jobRes.ok) throw new Error(jobJson.message || 'Failed to fetch job details');
      
      const jobData = jobJson.data;
      if (currentUser && jobData.employerId !== currentUser.id) {
        showToast('Unauthorized access to this job listing', 'error');
        navigate('/dashboard');
        return;
      }
      setJob(jobData);

      // 2. Fetch applicants list
      const appsRes = await apiFetch(`/api/v1/jobs/${id}/applicants`);
      const appsJson = await appsRes.json();
      if (appsRes.ok && appsJson.success) {
        const fetchedApplicants = appsJson.data || [];
        setApplicants(fetchedApplicants);

        // Auto-open worker details drawer if targetApplicantId URL parameter exists (once)
        if (targetApplicantId && !hasAutoOpened.current) {
          const matchedApplicant = fetchedApplicants.find((a: any) => (a.userId === targetApplicantId || a.id === targetApplicantId));
          if (matchedApplicant) {
            hasAutoOpened.current = true;
            setViewWorker({ ...matchedApplicant, jobId: jobData.id, jobTitle: jobData.title, job: jobData });
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      if (!isSilentRefresh) {
        showToast(err.message || 'Failed to load applicants', 'error');
      }
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  }, [id, currentUser?.id]);

  useEffect(() => {
    if (!currentUser) {
      showToast('Please log in to view this page', 'warning');
      navigate('/login');
      return;
    }
    if (currentUser.role !== 'employer') {
      showToast('Access denied: Employers only', 'error');
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [currentUser?.id, id]);

  const handleStatusChange = async (userId: string, newStatus: string, applicantName: string) => {
    if (!id) return;
    
    // Optimistic local state update for zero latency
    setApplicants(prev => 
      prev.map(a => (a.userId === userId || a.id === userId) ? { ...a, status: newStatus } : a)
    );

    try {
      await updateApplicantStatus(id, userId, newStatus);
      showToast(`Updated ${applicantName || 'candidate'} status to ${capitalize(newStatus)}`, 'success');
    } catch (err: any) {
      // Rollback on error
      loadData(true);
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleOpenDetails = (applicant: any) => {
    setViewWorker({ ...applicant, jobId: job?.id, jobTitle: job?.title, job });
  };

  // Pipeline Metric Counts
  const counts = useMemo(() => {
    return {
      total: applicants.length,
      applied: applicants.filter(a => (a.status || 'applied') === 'applied').length,
      reviewed: applicants.filter(a => a.status === 'reviewed').length,
      shortlisted: applicants.filter(a => a.status === 'shortlisted').length,
      accepted: applicants.filter(a => a.status === 'accepted').length,
      rejected: applicants.filter(a => a.status === 'rejected').length,
    };
  }, [applicants]);

  // Filtered & sorted applicants
  const filteredApplicants = useMemo(() => {
    return applicants
      .filter(a => {
        // Status filter
        if (statusFilter !== 'all') {
          const currentStatus = a.status || 'applied';
          if (currentStatus !== statusFilter) return false;
        }
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const name = (a.name || '').toLowerCase();
          const email = (a.email || '').toLowerCase();
          const phone = (a.phone || '').toLowerCase();
          const trade = (a.tradeSpecialization || a.headline || '').toLowerCase();
          const skills = Array.isArray(a.skills) ? a.skills.join(' ').toLowerCase() : (a.skills || '').toLowerCase();
          return name.includes(q) || email.includes(q) || phone.includes(q) || trade.includes(q) || skills.includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.appliedAt || 0).getTime();
        const timeB = new Date(b.appliedAt || 0).getTime();
        return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [applicants, statusFilter, searchQuery, sortBy]);

  if (isInitialLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '75vh', gap: '14px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '50%', border: '3.5px solid #e2e8f0', borderTopColor: '#344BFD', animation: 'spin 0.8s linear infinite' }}></div>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#475569' }}>Loading Candidate Pipeline...</p>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 64px)', padding: '24px 16px 100px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Top Navigation & Breadcrumbs */}
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <Link 
            to="/dashboard?tab=manage" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: '#475569', 
              textDecoration: 'none', 
              fontWeight: '700', 
              fontSize: '13px',
              background: '#ffffff',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1.5px solid #cbd5e1',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>

          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1.5px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} style={{ color: '#344BFD' }} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Pipeline'}</span>
          </button>
        </div>

        {/* Job Header Summary Card */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1.5px solid #cbd5e1', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: '1.2' }}>
                  {job.title}
                </h1>
                <span className={`status-badge status-${job.status?.toLowerCase()}`} style={{ fontSize: '12px', padding: '4px 10px', fontWeight: '700' }}>
                  {capitalize(job.status)}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', color: '#64748b', fontSize: '13.5px', fontWeight: '600', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Building size={15} style={{ color: '#344BFD' }} />
                  <span>{job.company}</span>
                </span>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={15} style={{ color: '#dc2626' }} />
                  <span>{job.location}</span>
                </span>
                {job.workMode && (
                  <>
                    <span>•</span>
                    <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>
                      {job.workMode}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>VACANCY FILL STATUS</div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                <span style={{ color: '#344BFD' }}>{job.filledOpenings || 0}</span> / {job.openings || 1} Positions Allotted
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline Analytics Metrics Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          
          <div 
            onClick={() => setStatusFilter('all')}
            style={{ 
              background: statusFilter === 'all' ? '#1e293b' : '#ffffff', 
              color: statusFilter === 'all' ? '#ffffff' : '#0f172a', 
              padding: '14px 16px', 
              borderRadius: '10px', 
              border: statusFilter === 'all' ? '2px solid #1e293b' : '1.5px solid #cbd5e1', 
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', opacity: 0.8 }}>TOTAL APPLICANTS</div>
            <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px' }}>{counts.total}</div>
          </div>

          <div 
            onClick={() => setStatusFilter('applied')}
            style={{ 
              background: statusFilter === 'applied' ? '#eff6ff' : '#ffffff', 
              padding: '14px 16px', 
              borderRadius: '10px', 
              border: statusFilter === 'applied' ? '2px solid #344BFD' : '1.5px solid #cbd5e1', 
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#2563eb' }}>APPLIED / NEW</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e40af', marginTop: '4px' }}>{counts.applied}</div>
          </div>

          <div 
            onClick={() => setStatusFilter('shortlisted')}
            style={{ 
              background: statusFilter === 'shortlisted' ? '#faf5ff' : '#ffffff', 
              padding: '14px 16px', 
              borderRadius: '10px', 
              border: statusFilter === 'shortlisted' ? '2px solid #9333ea' : '1.5px solid #cbd5e1', 
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#9333ea' }}>SHORTLISTED</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#6b21a8', marginTop: '4px' }}>{counts.shortlisted}</div>
          </div>

          <div 
            onClick={() => setStatusFilter('accepted')}
            style={{ 
              background: statusFilter === 'accepted' ? '#f0fdf4' : '#ffffff', 
              padding: '14px 16px', 
              borderRadius: '10px', 
              border: statusFilter === 'accepted' ? '2px solid #16a34a' : '1.5px solid #cbd5e1', 
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#16a34a' }}>ACCEPTED / HIRED</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#15803d', marginTop: '4px' }}>{counts.accepted}</div>
          </div>

          <div 
            onClick={() => setStatusFilter('rejected')}
            style={{ 
              background: statusFilter === 'rejected' ? '#fef2f2' : '#ffffff', 
              padding: '14px 16px', 
              borderRadius: '10px', 
              border: statusFilter === 'rejected' ? '2px solid #dc2626' : '1.5px solid #cbd5e1', 
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#dc2626' }}>REJECTED</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#991b1b', marginTop: '4px' }}>{counts.rejected}</div>
          </div>

        </div>

        {/* Search & Filter Control Bar */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1.5px solid #cbd5e1', padding: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 260px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search candidates by name, phone, trade, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '13.5px',
                  outline: 'none',
                  background: '#f8fafc',
                  fontWeight: '600',
                  color: '#0f172a'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', fontSize: '14px', fontWeight: '700' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Order Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '13px',
                  background: '#ffffff',
                  fontWeight: '700',
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

          </div>

          {/* Pipeline Status Filter Pill Bar */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
            {[
              { id: 'all', label: `All (${counts.total})` },
              { id: 'applied', label: `Applied (${counts.applied})` },
              { id: 'reviewed', label: `Reviewed (${counts.reviewed})` },
              { id: 'shortlisted', label: `Shortlisted (${counts.shortlisted})` },
              { id: 'accepted', label: `Accepted (${counts.accepted})` },
              { id: 'rejected', label: `Rejected (${counts.rejected})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  background: statusFilter === tab.id ? '#344BFD' : '#f1f5f9',
                  color: statusFilter === tab.id ? '#ffffff' : '#475569',
                  fontWeight: statusFilter === tab.id ? '700' : '600',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

        {/* Candidate List Container */}
        {filteredApplicants.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredApplicants.map((a, i) => {
              const currentStatus = a.status || 'applied';
              const targetUserId = a.userId || a.id;
              const phoneClean = a.phone ? a.phone.replace(/[^0-9]/g, '') : '';
              const whatsappLink = phoneClean ? `https://wa.me/${phoneClean.length === 10 ? '91' + phoneClean : phoneClean}?text=${encodeURIComponent(`Hi ${a.name},\n\nWe reviewed your application for the ${job.title} role at ${job.company}. We would like to discuss the opportunity with you.`)}` : '';

              return (
                <div 
                  key={targetUserId || i} 
                  style={{ 
                    background: '#ffffff', 
                    borderRadius: '12px', 
                    border: '1.5px solid #cbd5e1', 
                    padding: '18px', 
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
                    
                    {/* Left Candidate Info Block */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: '1 1 300px' }}>
                      <div 
                        style={{ 
                          width: '52px', 
                          height: '52px', 
                          borderRadius: '10px', 
                          background: 'linear-gradient(135deg, #1e3a8a 0%, #344BFD 100%)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          fontWeight: '800',
                          overflow: 'hidden',
                          flexShrink: 0,
                          border: '1.5px solid #cbd5e1'
                        }}
                      >
                        {a.profilePictureUrl && typeof a.profilePictureUrl === 'string' ? (
                          <img 
                            src={a.profilePictureUrl} 
                            alt={typeof a.name === 'string' ? a.name : 'Applicant'} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          getInitials(a.name || 'C')
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                            {a.name}
                          </h3>
                          {a.aadhaarVerified && (
                            <span style={{ fontSize: '11px', padding: '2px 8px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '4px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <ShieldCheck size={12} />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>

                        <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                          {a.tradeSpecialization || a.headline || 'Industrial Specialist'} • {a.location || 'Location Not Specified'}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', fontSize: '12px', color: '#64748b' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} style={{ color: '#94a3b8' }} />
                            <span>Applied {timeAgo(a.appliedAt)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Pipeline Status Pill */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className={`status-badge status-${currentStatus}`} style={{ fontSize: '12px', padding: '6px 14px', fontWeight: '800', textTransform: 'uppercase' }}>
                        {capitalize(currentStatus)}
                      </span>
                    </div>

                  </div>

                  {/* Multi-Channel Contact & Document Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                    
                    {/* WhatsApp Action */}
                    {whatsappLink && (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: '#f0fdf4',
                          color: '#16a34a',
                          border: '1px solid #bbf7d0',
                          fontSize: '12.5px',
                          fontWeight: '700',
                          textDecoration: 'none'
                        }}
                      >
                        <MessageSquare size={14} />
                        <span>WhatsApp Chat ({a.phone})</span>
                      </a>
                    )}

                    {/* Phone Call */}
                    {a.phone && (
                      <a
                        href={`tel:${a.phone}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: '#f8fafc',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          fontSize: '12.5px',
                          fontWeight: '700',
                          textDecoration: 'none'
                        }}
                      >
                        <Phone size={13} style={{ color: '#2563eb' }} />
                        <span>Call</span>
                      </a>
                    )}

                    {/* Resume Action */}
                    {job?.acceptResume !== false && a.resume && (a.resume.url || a.resume.name) ? (
                      <button
                        onClick={() => setPreviewResume({ ...a.resume, userId: targetUserId })}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: '#eff6ff',
                          color: '#2563eb',
                          border: '1px solid #bfdbfe',
                          fontSize: '12.5px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        <FileText size={14} />
                        <span>View Resume PDF</span>
                      </button>
                    ) : null}

                    {/* Full Profile Trigger */}
                    <button
                      onClick={() => handleOpenDetails(a)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#f8fafc',
                        color: '#344BFD',
                        border: '1px solid #cbd5e1',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        marginLeft: 'auto'
                      }}
                    >
                      <Eye size={14} />
                      <span>Full Profile & Actions</span>
                    </button>

                  </div>

                  {/* Status Pipeline Action Controls Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0', flexWrap: 'wrap' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Quick Status Change:</span>
                      
                      {/* Status Dropdown */}
                      <select
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(targetUserId, e.target.value, a.name)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '12px',
                          fontWeight: '700',
                          background: '#ffffff',
                          color: '#0f172a',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="applied">Applied (New)</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="accepted">Accepted / Hired</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    {/* One-Click Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {currentStatus !== 'shortlisted' && (
                        <button
                          onClick={() => handleStatusChange(targetUserId, 'shortlisted', a.name)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #d8b4fe',
                            background: '#faf5ff',
                            color: '#9333ea',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          + Shortlist
                        </button>
                      )}

                      {currentStatus !== 'accepted' && (
                        <button
                          onClick={() => handleStatusChange(targetUserId, 'accepted', a.name)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #bbf7d0',
                            background: '#f0fdf4',
                            color: '#16a34a',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          ✓ Accept / Hire
                        </button>
                      )}

                      {currentStatus !== 'rejected' && (
                        <button
                          onClick={() => handleStatusChange(targetUserId, 'rejected', a.name)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #fca5a5',
                            background: '#fef2f2',
                            color: '#dc2626',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          ✕ Reject
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1.5px solid #cbd5e1', padding: '48px 24px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#eff6ff', color: '#344BFD', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid #bfdbfe' }}>
              <UserX size={26} />
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              {searchQuery || statusFilter !== 'all' ? 'No matching applicants found' : 'No applicants have applied yet'}
            </h3>
            <p style={{ margin: '0 0 18px', fontSize: '13.5px', color: '#64748b', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
              {searchQuery || statusFilter !== 'all'
                ? 'Try clearing your search query or switching your pipeline status filter to view other candidates.'
                : 'Candidates who apply for this job listing will appear here in real-time.'}
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#344BFD', color: '#ffffff', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

      </div>

      {/* Preview Resume Modal */}
      {previewResume && (
        <ResumePreviewModal 
          resume={previewResume} 
          onClose={() => setPreviewResume(null)} 
          userId={previewResume?.userId} 
        />
      )}

      {/* Candidate Details Modal */}
      {viewWorker && (
        <CandidateDetailsModal
          viewWorker={viewWorker}
          onClose={() => setViewWorker(null)}
          updateApplicantStatus={updateApplicantStatus}
          scheduleInterview={scheduleInterview}
          sendCustomEmail={sendCustomEmail}
          showToast={showToast}
          myJobs={job ? [job] : []}
        />
      )}
    </div>
  );
};
