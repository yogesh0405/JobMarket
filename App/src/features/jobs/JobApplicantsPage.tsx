import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Search, Briefcase, MapPin, ChevronRight, ChevronDown, 
  User as UserIcon, FileText, UserCheck, Calendar, CheckCircle2, 
  XCircle, RefreshCw, X, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useJobs } from '../../hooks/useJobs';
import { useToast } from '../../hooks/useToast';
import { apiFetch } from '../../utils/api';

const APPLICANT_SEARCH_SUGGESTIONS = [
  'Search by Skills (e.g. CNC, Vernier, AutoCAD)...',
  'Search by Trade (e.g. Fitter, Welder, Electrician)...',
  'Search by Candidate Name or Location...'
];

export const safeValue = (val?: any): string => {
  if (val === null || val === undefined || val === '') return 'Not Provided';
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return trimmed.length > 0 && trimmed !== '[object Object]' && trimmed !== 'object Object' ? trimmed : 'Not Provided';
  }
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);

  if (Array.isArray(val)) {
    if (val.length === 0) return 'Not Provided';
    const items = val
      .map((item) => safeValue(item))
      .filter((x) => x && x !== 'Not Provided' && x !== '[object Object]' && x !== 'object Object');
    return items.length > 0 ? items.join(' • ') : 'Not Provided';
  }

  if (typeof val === 'object') {
    if (val.title || val.company || val.years || val.duration) {
      const expParts = [val.title, val.company, val.years ? `${val.years} Yrs` : val.duration].filter((x) => typeof x === 'string' || typeof x === 'number');
      if (expParts.length > 0) return expParts.join(' - ');
    }
    if (val.degree || val.trade || val.qualification || val.institution) {
      const eduParts = [val.degree || val.qualification, val.trade, val.institution, val.year].filter((x) => typeof x === 'string' || typeof x === 'number');
      if (eduParts.length > 0) return eduParts.join(' - ');
    }
    if (val.city || val.state || val.midc || val.address || val.locality) {
      const locParts = [val.locality || val.midc || val.address, val.city, val.state].filter((x) => typeof x === 'string' || typeof x === 'number');
      if (locParts.length > 0) return locParts.join(', ');
    }
    const primitives = Object.values(val)
      .map((v) => (typeof v === 'string' || typeof v === 'number' ? String(v).trim() : (typeof v === 'object' && v ? safeValue(v) : '')))
      .filter((v) => v.length > 0 && v !== 'Not Provided' && v !== '[object Object]' && v !== 'object Object');

    return primitives.length > 0 ? primitives.join(' • ') : 'Not Provided';
  }

  return String(val);
};

type TabType = 'ALL' | 'applied' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected';

export const JobApplicantsPage: React.FC = () => {
  const { id: routeJobId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [applicants, setApplicants] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(routeJobId || 'ALL');
  const [jobDropdownOpen, setJobDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Rotating search placeholder timer
  useEffect(() => {
    if (searchQuery) return;
    const interval = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % APPLICANT_SEARCH_SUGGESTIONS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [searchQuery]);

  // Helper to map backend applicant format
  const mapApplicantItem = (item: any, jobId: string, jobTitle?: string) => ({
    id: item.id || `app-${item.userId || item.user_id || item.user?.id}-${jobId}`,
    userId: item.userId || item.user_id || item.user?.id,
    jobId: jobId,
    jobTitle: jobTitle || item.jobTitle || item.job_title || '',
    status: (item.status || 'applied').toLowerCase(),
    appliedAt: item.appliedAt || item.applied_at || item.createdAt || new Date().toISOString(),
    user: {
      id: item.userId || item.user_id || item.user?.id,
      name: item.name || item.user?.name || item.candidate?.name || 'Applicant',
      email: item.email || item.user?.email || item.candidate?.email || '',
      phone: item.phone || item.user?.phone || item.candidate?.phone || '',
      headline: item.headline || item.tradeSpecialization || item.trade_specialization || item.user?.headline || 'Candidate',
      location: item.location || item.user?.location || (item.user as any)?.midc_zone || 'Not Specified',
      experience: item.experience || item.user?.experience || 'Not Provided',
      skills: Array.isArray(item.skills) ? item.skills : (Array.isArray(item.user?.skills) ? item.user.skills : []),
      profilePictureUrl: item.profilePictureUrl || item.profile_picture_url || item.user?.profilePictureUrl || item.user?.profile_picture_url || item.avatar,
      preferredShift: item.preferred_shift || item.preferredShift || item.user?.preferred_shift || (item.user as any)?.preferredShift,
    }
  });

  // Fetch employer's jobs and applicants in ONE fast call
  const fetchMyJobsAndApplicants = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const myJobsRes = await apiFetch('/api/v1/jobs/my-jobs/all');
      const myJobsJson = await myJobsRes.json();

      if (myJobsRes.ok && myJobsJson.success && Array.isArray(myJobsJson.data)) {
        const jobsList = myJobsJson.data;
        setMyJobs(jobsList);

        const allApps: any[] = [];
        jobsList.forEach((j: any) => {
          const rawApps = Array.isArray(j.applicants) ? j.applicants : [];
          rawApps.forEach((item: any) => {
            if (item && typeof item === 'object') {
              allApps.push(mapApplicantItem(item, j.id, j.title));
            }
          });
        });

        if (selectedJobId && selectedJobId !== 'ALL') {
          // If specific job is selected, show that job's applicants
          const specific = allApps.filter((a) => a.jobId === selectedJobId);
          setApplicants(specific);

          // In parallel, also fetch /applicants endpoint for freshest data
          apiFetch(`/api/v1/jobs/${selectedJobId}/applicants`)
            .then(async (res) => {
              const json = await res.json();
              if (res.ok && json.success && Array.isArray(json.data) && json.data.length > 0) {
                const mapped = json.data.map((item: any) => mapApplicantItem(item, selectedJobId));
                setApplicants(mapped);
              }
            })
            .catch(() => {});
        } else {
          setApplicants(allApps);
        }
      }
    } catch (err: any) {
      console.error('Error fetching applicants:', err);
      if (!isSilent) showToast(err.message || 'Failed to load applicants', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedJobId]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchMyJobsAndApplicants();
  }, [currentUser, selectedJobId]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      ALL: applicants.length,
      applied: applicants.filter((a) => (a.status || 'applied') === 'applied').length,
      shortlisted: applicants.filter((a) => a.status === 'shortlisted').length,
      interviewed: applicants.filter((a) => a.status === 'interviewed' || a.status === 'interview').length,
      hired: applicants.filter((a) => a.status === 'hired' || a.status === 'accepted').length,
      rejected: applicants.filter((a) => a.status === 'rejected').length,
    };
  }, [applicants]);

  // Filtered applicants
  const filteredApplicants = useMemo(() => {
    return applicants.filter((item) => {
      // Tab status filter
      if (activeTab !== 'ALL') {
        const s = (item.status || 'applied').toLowerCase();
        if (activeTab === 'hired' && (s === 'hired' || s === 'accepted')) {
          // match
        } else if (activeTab === 'interviewed' && (s === 'interviewed' || s === 'interview')) {
          // match
        } else if (s !== activeTab) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (item.user?.name || '').toLowerCase();
        const headline = (item.user?.headline || '').toLowerCase();
        const location = (item.user?.location || '').toLowerCase();
        const experience = (item.user?.experience || '').toLowerCase();
        const skills = Array.isArray(item.user?.skills) ? item.user.skills.join(' ').toLowerCase() : '';
        return name.includes(q) || headline.includes(q) || location.includes(q) || experience.includes(q) || skills.includes(q);
      }

      return true;
    });
  }, [applicants, activeTab, searchQuery]);

  const handleCardClick = (item: any) => {
    const targetJobId = item.jobId || selectedJobId || 'ALL';
    const targetUserId = item.userId || item.user?.id || item.id;
    if (targetJobId && targetJobId !== 'ALL' && targetUserId) {
      navigate(`/job/${targetJobId}/applicant/${targetUserId}`);
    } else if (targetUserId) {
      navigate(`/applicant/${targetUserId}`);
    }
  };

  const selectedJobTitle = useMemo(() => {
    if (selectedJobId === 'ALL') return 'All Jobs';
    const found = myJobs.find((j) => j.id === selectedJobId);
    return found ? found.title : 'All Jobs';
  }, [selectedJobId, myJobs]);

  const renderStatusBadge = (status: string) => {
    const s = (status || 'applied').toLowerCase();
    switch (s) {
      case 'shortlisted':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0284C7', fontSize: '12px', fontWeight: 700 }}>
            <UserCheck size={13} strokeWidth={2.2} />
            <span>Shortlisted</span>
          </div>
        );
      case 'interviewed':
      case 'interview':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9333EA', fontSize: '12px', fontWeight: 700 }}>
            <Calendar size={13} strokeWidth={2.2} />
            <span>Interview</span>
          </div>
        );
      case 'hired':
      case 'accepted':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16A34A', fontSize: '12px', fontWeight: 700 }}>
            <CheckCircle2 size={13} strokeWidth={2.2} />
            <span>Hired</span>
          </div>
        );
      case 'rejected':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#DC2626', fontSize: '12px', fontWeight: 700 }}>
            <XCircle size={13} strokeWidth={2.2} />
            <span>Rejected</span>
          </div>
        );
      case 'applied':
      default:
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1764E8', fontSize: '12px', fontWeight: 700 }}>
            <FileText size={13} strokeWidth={2.2} />
            <span>Applied</span>
          </div>
        );
    }
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 64px)', padding: '0px 12px 60px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

        {/* Sticky Top Search & Filter Bar Section (0px Gap) */}
        <div style={{
          position: 'sticky',
          top: 'var(--navbar-height)',
          zIndex: 40,
          backgroundColor: '#FFFFFF',
          margin: '0px -12px 12px -12px',
          padding: '10px 12px 8px 12px',
          borderBottom: '1px solid #E7EBF2',
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)'
        }}>
          {/* ── 1. SEARCH BAR ── */}
          <div style={{ position: 'relative', marginBottom: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: searchQuery ? '1px solid #1764E8' : '1px solid #E2E8F0',
              padding: '0 12px',
              height: '38px',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              transition: 'border-color 0.15s ease'
            }}>
              <Search size={14} color={searchQuery ? '#1764E8' : '#91A0BA'} style={{ marginRight: '8px', flexShrink: 0 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={APPLICANT_SEARCH_SUGGESTIONS[suggestionIndex]}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  color: '#102A5C',
                  backgroundColor: 'transparent'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: '4px',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* ── 2. FILTER & STATUS TABS ROW ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '2px',
            scrollbarWidth: 'none'
          }}>
            {/* Job Dropdown Selector Pill */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => setJobDropdownOpen(!jobDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '32px',
                  padding: '0 12px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{selectedJobTitle}</span>
                <ChevronDown size={14} color="#64748B" />
              </button>

              {jobDropdownOpen && (
                <>
                  <div
                    onClick={() => setJobDropdownOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '38px',
                    left: 0,
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    minWidth: '200px',
                    maxWidth: '280px',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    zIndex: 100,
                    padding: '4px'
                  }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedJobId('ALL');
                        setJobDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: selectedJobId === 'ALL' ? '#EFF6FF' : 'transparent',
                        color: selectedJobId === 'ALL' ? '#1764E8' : '#102A5C',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      All Jobs ({applicants.length})
                    </button>
                    {myJobs.map((j) => (
                      <button
                        key={j.id}
                        type="button"
                        onClick={() => {
                          setSelectedJobId(j.id);
                          setJobDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: selectedJobId === j.id ? '#EFF6FF' : 'transparent',
                          color: selectedJobId === j.id ? '#1764E8' : '#102A5C',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {j.title}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Status Tabs with counts */}
            {(
              [
                { key: 'ALL', label: 'All', count: counts.ALL },
                { key: 'applied', label: 'Applied', count: counts.applied },
                { key: 'shortlisted', label: 'Shortlisted', count: counts.shortlisted },
                { key: 'interviewed', label: 'Interviewed', count: counts.interviewed },
                { key: 'hired', label: 'Hired', count: counts.hired },
                { key: 'rejected', label: 'Rejected', count: counts.rejected },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    height: '32px',
                    padding: '0 8px',
                    border: 'none',
                    background: 'transparent',
                    borderBottom: isActive ? '2px solid #1764E8' : '2px solid transparent',
                    color: isActive ? '#1764E8' : '#64748B',
                    fontSize: '12px',
                    fontWeight: isActive ? 700 : 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  <span>{tab.label}</span>
                  <span style={{
                    backgroundColor: isActive ? '#EFF6FF' : '#E2E8F0',
                    color: isActive ? '#1764E8' : '#475569',
                    borderRadius: '10px',
                    padding: '1px 6px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. CANDIDATE APPLICANTS LIST ── */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#1764E8', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748B' }}>Loading applicants...</span>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #E7EBF2',
            padding: '40px 20px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              color: '#1764E8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <UserIcon size={24} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#102A5C', marginBottom: '4px' }}>
              No Applicants Found
            </div>
            <div style={{ fontSize: '12px', color: '#657796' }}>
              {searchQuery ? 'Try adjusting your search criteria.' : 'No candidates in this category yet.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredApplicants.map((item) => {
              const candidateName = safeValue(item.user?.name) || 'Applicant';
              const candidateTrade = safeValue(item.user?.headline || item.user?.tradeSpecialization || item.user?.trade_specialization) || 'Candidate';
              const candidateExp = safeValue(item.user?.experience);
              const candidateLocation = safeValue(item.user?.location || (item.user as any)?.midc_zone);
              const avatarUri = item.user?.profilePictureUrl;
              const shiftVal = item.user?.preferredShift ? safeValue(item.user?.preferredShift) : '';

              return (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    padding: '12px',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04)',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                  }}
                >
                  {/* Header Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Avatar Box */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#EEF4FF',
                      border: '1px solid #DBEAFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {avatarUri ? (
                        <img
                          src={avatarUri}
                          alt={candidateName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <UserIcon size={18} color="#1764E8" strokeWidth={2} />
                      )}
                    </div>

                    {/* Candidate Info Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                        <div style={{
                          fontSize: '13.5px',
                          fontWeight: 700,
                          color: '#102A5C',
                          letterSpacing: '-0.2px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {candidateName}
                        </div>

                        {/* Status Badge */}
                        <div style={{ flexShrink: 0 }}>
                          {renderStatusBadge(item.status)}
                        </div>
                      </div>

                      <div style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        color: '#657796',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: '2px'
                      }}>
                        {candidateTrade}
                      </div>
                    </div>

                    {/* Chevron Right */}
                    <ChevronRight size={14} color="#91A0BA" style={{ flexShrink: 0, marginLeft: '4px' }} />
                  </div>

                  {/* Meta Chips Row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginTop: '10px'
                  }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '4px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      color: '#475569',
                      fontWeight: 500,
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      <Briefcase size={11} color="#657796" style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {candidateExp}
                      </span>
                    </div>

                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '4px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      color: '#475569',
                      fontWeight: 500
                    }}>
                      <MapPin size={11} color="#657796" style={{ flexShrink: 0 }} />
                      <span>{candidateLocation}</span>
                    </div>

                    {shiftVal && shiftVal !== 'Not Provided' && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '4px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        color: '#475569',
                        fontWeight: 500
                      }}>
                        <span>{shiftVal}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
