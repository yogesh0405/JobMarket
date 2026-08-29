import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Phone,
  Mail,
  Star,
  ExternalLink,
  ChevronRight,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Navigation2,
  CalendarCheck2,
  CalendarClock,
  Clock3,
  Briefcase,
} from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { MobileHeader } from '../../components/common/MobileHeader';

export interface CandidateInterviewItem {
  application_id: string;
  job_id: string;
  status: string;
  applied_at: string;
  interview_date: string;
  interview_time: string;
  venue_address?: string;
  maps_link?: string;
  interview_rating?: number;
  interview_feedback?: string;
  postponed_reason?: string;
  interview_status?: string;
  job_title: string;
  company: string;
  company_logo?: string;
  job_location?: string;
  industry?: string;
  job_type?: string;
  work_mode?: string;
  salary_min?: number;
  salary_max?: number;
  employer_name?: string;
  company_name?: string;
  employer_phone?: string;
  employer_email?: string;
}

type TabType = 'upcoming' | 'past';

const getDaysFromToday = (dateStr: string): number => {
  if (!dateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return 'TBD';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

interface Props {
  currentUser: any;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  navigate?: (path: string) => void;
}

export const CandidateInterviewsTab: React.FC<Props> = ({ currentUser, showToast, navigate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [upcomingList, setUpcomingList] = useState<CandidateInterviewItem[]>([]);
  const [pastList, setPastList] = useState<CandidateInterviewItem[]>([]);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/jobs/interviews/my-interviews');
      if (res.ok) {
        const json = await res.json();
        const data = json?.data || json;
        if (data) {
          setUpcomingList(Array.isArray(data.upcoming) ? data.upcoming : []);
          setPastList(Array.isArray(data.past) ? data.past : []);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch candidate interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleOpenMap = (venue?: string, mapsLink?: string) => {
    const url = mapsLink || (venue ? `https://maps.google.com/?q=${encodeURIComponent(venue)}` : null);
    if (url) window.open(url, '_blank');
  };

  const handleOpenJobDetails = (jobId: string) => {
    if (navigate) navigate(`/job/${jobId}`);
    else window.location.href = `/job/${jobId}`;
  };

  const currentList = activeTab === 'upcoming' ? upcomingList : pastList;
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return currentList;
    const q = searchQuery.toLowerCase().trim();
    return currentList.filter(item => {
      return (
        item.job_title?.toLowerCase().includes(q) ||
        item.company?.toLowerCase().includes(q) ||
        item.company_name?.toLowerCase().includes(q) ||
        item.employer_name?.toLowerCase().includes(q) ||
        item.venue_address?.toLowerCase().includes(q)
      );
    });
  }, [currentList, searchQuery]);

  return (
    <div className="cand-interviews-page-root">
      <style>{`
        .cand-interviews-page-root {
          width: 100%;
          min-height: 100vh;
          background-color: #F8FAFC !important;
          box-sizing: border-box;
        }

        .cand-mobile-header-wrap {
          display: none;
        }

        .cand-inner-content {
          width: 100%;
          margin: 0 auto;
          padding: 0 0 40px 0;
          box-sizing: border-box;
          background-color: #F8FAFC !important;
        }

        /* ── METRICS STRIP (Matches Mobile App 100%) ── */
        .cand-metrics-bar {
          display: flex;
          align-items: center;
          background-color: #FFFFFF;
          padding: 12px 16px;
          border-bottom: 1px solid #E2E8F0;
          margin-bottom: 10px;
          width: 100%;
          box-sizing: border-box;
        }

        .cand-metric-box {
          flex: 1;
          text-align: center;
        }

        .cand-metric-num {
          font-size: 18px;
          font-weight: 800;
          color: #0F172A;
          line-height: 1.2;
        }

        .cand-metric-tag {
          font-size: 11px;
          font-weight: 600;
          color: #64748B;
          margin-top: 2px;
        }

        .cand-metric-sep {
          width: 1px;
          height: 24px;
          background-color: #E2E8F0;
        }

        /* ── TABS & SEARCH BAR (Matches Mobile App 100%) ── */
        .cand-toolbar-row {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 10px;
          width: 100%;
        }

        .cand-tab-strip {
          display: flex;
          gap: 10px;
          background-color: #FFFFFF;
          padding: 8px 16px;
          border-bottom: 1px solid #E2E8F0;
          box-sizing: border-box;
        }

        .cand-tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid transparent;
          background-color: #F1F5F9;
          color: #64748B;
          transition: all 0.15s ease;
        }

        .cand-tab-btn.active {
          background-color: #EFF6FF;
          border: 1px solid #BFDBFE;
          color: #1764E8;
          font-weight: 700;
        }

        .cand-tab-counter {
          background-color: #CBD5E1;
          color: #334155;
          font-size: 10px;
          padding: 1px 6px;
          border-radius: 10px;
          font-weight: 700;
        }

        .cand-tab-btn.active .cand-tab-counter {
          background-color: #1764E8;
          color: #FFFFFF;
        }

        .cand-search-input-wrap {
          display: flex;
          align-items: center;
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 6px 12px;
          margin: 0 16px 4px 16px;
          box-sizing: border-box;
        }

        .cand-list-wrap {
          padding: 12px 16px;
          background-color: #F8FAFC !important;
        }

        /* ── INTERVIEW CARD (Exact Candidate Mobile App Match: borderRadius: 8, padding: 14) ── */
        .cand-standard-card {
          background-color: #FFFFFF !important;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 14px;
          margin-bottom: 12px;
          width: 100%;
          box-sizing: border-box;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          cursor: pointer;
          transition: border-color 0.15s ease;
        }

        .cand-standard-card:hover {
          border-color: #BFDBFE;
        }

        .cand-rule-divider {
          height: 1px;
          background-color: #F1F5F9;
          margin: 8px 0;
        }

        /* Responsive Breakpoints */
        @media (min-width: 768px) {
          .cand-interviews-page-root {
            background-color: #F8FAFC !important;
          }
          .cand-inner-content {
            background-color: #F8FAFC !important;
            padding: 16px 20px 40px 20px;
          }
          .cand-metrics-bar {
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            margin-bottom: 14px;
          }
          .cand-toolbar-row {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
          .cand-tab-strip {
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            padding: 6px;
          }
          .cand-search-input-wrap {
            margin: 0;
            min-width: 320px;
          }
          .cand-list-wrap {
            padding: 0;
            background-color: #F8FAFC !important;
          }
        }

        @media (max-width: 767px) {
          .cand-mobile-header-wrap {
            display: block;
          }
          .cand-inner-content {
            padding: 0 0 40px 0;
            background-color: #F8FAFC !important;
          }
          .cand-list-wrap {
            padding: 12px 16px;
            background-color: #F8FAFC !important;
          }
          .cand-search-input-wrap {
            margin: 0 16px;
          }
        }
      `}</style>

      {/* Mobile Header */}
      <div className="cand-mobile-header-wrap">
        <MobileHeader
          title="Scheduled Interviews"
          showBack={true}
          onBack={() => {
            if (navigate) navigate('/dashboard');
            else window.history.back();
          }}
        />
      </div>

      <div className="cand-inner-content">
        {/* Top Metrics Strip */}
        <div className="cand-metrics-bar">
          <div className="cand-metric-box">
            <div className="cand-metric-num">
              {upcomingList.length + pastList.length}
            </div>
            <div className="cand-metric-tag">Total Interviews</div>
          </div>
          <div className="cand-metric-sep" />
          <div className="cand-metric-box">
            <div className="cand-metric-num" style={{ color: '#1764E8' }}>
              {upcomingList.length}
            </div>
            <div className="cand-metric-tag">Upcoming</div>
          </div>
          <div className="cand-metric-sep" />
          <div className="cand-metric-box">
            <div className="cand-metric-num" style={{ color: '#16A34A' }}>
              {pastList.length}
            </div>
            <div className="cand-metric-tag">Past / Completed</div>
          </div>
        </div>

        {/* Tab Strip & Search Bar Row */}
        <div className="cand-toolbar-row">
          <div className="cand-tab-strip">
            <button
              type="button"
              className={`cand-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              <CalendarClock size={16} color={activeTab === 'upcoming' ? '#1764E8' : '#64748B'} />
              <span>Upcoming Interviews</span>
              {upcomingList.length > 0 && (
                <span className="cand-tab-counter">{upcomingList.length}</span>
              )}
            </button>

            <button
              type="button"
              className={`cand-tab-btn ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => setActiveTab('past')}
            >
              <CalendarCheck2 size={16} color={activeTab === 'past' ? '#1764E8' : '#64748B'} />
              <span>Past & Completed</span>
              {pastList.length > 0 && (
                <span className="cand-tab-counter">{pastList.length}</span>
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="cand-search-input-wrap">
            <Search size={16} color="#64748B" style={{ marginRight: '8px', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search company, job..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '13px',
                color: '#0F172A',
                width: '100%',
                backgroundColor: 'transparent'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#64748B' }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Main List */}
        <div className="cand-list-wrap">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#64748B' }}>
              <div className="spinner" style={{ margin: '0 auto 10px auto' }} />
              <div style={{ fontSize: '13px', fontWeight: 500 }}>Loading interview schedule...</div>
            </div>
          ) : filteredList.length === 0 ? (
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '32px 16px',
              textAlign: 'center',
              marginTop: '10px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '32px',
                backgroundColor: '#F1F5F9',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}>
                <Calendar size={32} color="#94A3B8" />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                {activeTab === 'upcoming' ? 'No Upcoming Interviews' : 'No Past Interviews'}
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0, lineHeight: '18px' }}>
                {activeTab === 'upcoming'
                  ? 'When employers schedule you for an interview, it will appear here.'
                  : 'Past and completed interviews will appear here with feedback.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              {filteredList.map((item) => {
                const days = getDaysFromToday(item.interview_date);
                const isCompleted = item.interview_status === 'interviewed' || item.status === 'interviewed';
                const isPostponed = item.interview_status === 'postponed';
                const isPast = activeTab === 'past';

                return (
                  <div
                    key={item.application_id}
                    className="cand-standard-card"
                    onClick={() => handleOpenJobDetails(item.job_id)}
                  >
                    {/* Top Row: Company & Days Remaining (Exact Candidate Mobile App Match) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Building2 size={16} color={isPast ? '#94A3B8' : '#1764E8'} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: isPast ? '#94A3B8' : '#0F172A' }}>
                          {item.company_name || item.company}
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: isPast ? '#CBD5E1' : '#475569', marginTop: '1px' }}>
                          {item.job_title}
                        </div>
                      </div>

                      {/* Countdown Badge */}
                      {isCompleted ? (
                        <span style={{
                          backgroundColor: '#DCFCE7',
                          border: '1px solid #BBF7D0',
                          color: '#16A34A',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '4px'
                        }}>
                          Completed
                        </span>
                      ) : isPostponed ? (
                        <span style={{
                          backgroundColor: '#FEF3C7',
                          border: '1px solid #FDE68A',
                          color: '#D97706',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '4px'
                        }}>
                          Rescheduled
                        </span>
                      ) : days === 0 ? (
                        <span style={{
                          backgroundColor: '#FEF2F2',
                          border: '1px solid #FECACA',
                          color: '#DC2626',
                          fontSize: '10px',
                          fontWeight: 900,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          letterSpacing: '0.5px'
                        }}>
                          TODAY
                        </span>
                      ) : days === 1 ? (
                        <span style={{
                          backgroundColor: '#FFF7ED',
                          border: '1px solid #FED7AA',
                          color: '#EA580C',
                          fontSize: '10px',
                          fontWeight: 900,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          letterSpacing: '0.5px'
                        }}>
                          TOMORROW
                        </span>
                      ) : isPast || days < 0 ? (
                        <span style={{
                          backgroundColor: '#F1F5F9',
                          border: '1px solid #CBD5E1',
                          color: '#64748B',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '4px'
                        }}>
                          {Math.abs(days)} {Math.abs(days) === 1 ? 'day' : 'days'} ago
                        </span>
                      ) : (
                        <span style={{
                          backgroundColor: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          color: '#1764E8',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '4px'
                        }}>
                          {days} days remaining
                        </span>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="cand-rule-divider" />

                    {/* Date / Time / Location Info Grid (Exact Mobile App Match) */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: isPast ? '#94A3B8' : '#334155' }}>
                        <Calendar size={13} color={isPast ? '#94A3B8' : '#1764E8'} />
                        <span>{formatDate(item.interview_date)}</span>
                      </div>

                      {item.interview_time && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: isPast ? '#94A3B8' : '#64748B' }}>
                          <Clock size={13} color={isPast ? '#94A3B8' : '#64748B'} />
                          <span>{item.interview_time}</span>
                        </div>
                      )}

                      {(item.job_type || item.job_location) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#94A3B8' }}>
                          <Briefcase size={13} color="#94A3B8" />
                          <span>{item.job_type || item.job_location}</span>
                        </div>
                      )}
                    </div>

                    {/* Venue Row */}
                    {item.venue_address && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenMap(item.venue_address, item.maps_link);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '6px',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          padding: '8px',
                          borderRadius: '6px',
                          marginTop: '6px',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: isPast ? '#94A3B8' : '#475569',
                          lineHeight: '17px',
                          cursor: 'pointer'
                        }}
                      >
                        <MapPin size={13} color={isPast ? '#94A3B8' : '#EF4444'} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{item.venue_address}</span>
                        <Navigation2 size={13} color={isPast ? '#CBD5E1' : '#1764E8'} style={{ marginTop: '2px', flexShrink: 0 }} />
                      </div>
                    )}

                    {/* Star Rating & Feedback (if completed) */}
                    {isCompleted && item.interview_rating !== undefined && item.interview_rating !== null && (
                      <div style={{
                        backgroundColor: '#FFFBEB',
                        border: '1px solid #FEF3C7',
                        padding: '8px',
                        borderRadius: '6px',
                        marginTop: '6px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={13}
                              color={star <= Number(item.interview_rating) ? '#F59E0B' : '#CBD5E1'}
                              fill={star <= Number(item.interview_rating) ? '#F59E0B' : 'transparent'}
                            />
                          ))}
                          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#B45309', marginLeft: '4px' }}>
                            Rating: {item.interview_rating}/5
                          </span>
                        </div>
                        {item.interview_feedback && (
                          <div style={{ fontSize: '11px', color: '#78350F', marginTop: '3px', fontStyle: 'italic' }}>
                            "{item.interview_feedback}"
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reschedule Note */}
                    {isPostponed && item.postponed_reason && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#FFFBEB',
                        border: '1px solid #FCD34D',
                        padding: '8px',
                        borderRadius: '6px',
                        marginTop: '6px',
                        fontSize: '11px',
                        color: '#B45309',
                        fontWeight: 600
                      }}>
                        <AlertCircle size={12} color="#D97706" />
                        <span>Reschedule Note: {item.postponed_reason}</span>
                      </div>
                    )}

                    {/* Card Action Footer */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '8px',
                        paddingTop: '6px',
                        borderTop: '1px solid #F1F5F9'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.employer_phone && (
                          <a
                            href={`tel:${item.employer_phone}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              backgroundColor: '#EFF6FF',
                              color: '#1764E8',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textDecoration: 'none'
                            }}
                            title="Call Recruiter"
                          >
                            <Phone size={14} />
                          </a>
                        )}
                        {item.employer_phone && (
                          <a
                            href={`https://wa.me/${item.employer_phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              backgroundColor: '#E9F9EF',
                              color: '#16A34A',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textDecoration: 'none'
                            }}
                            title="WhatsApp Recruiter"
                          >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/>
                            </svg>
                          </a>
                        )}
                      </div>

                      {item.venue_address && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenMap(item.venue_address, item.maps_link);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            color: '#1764E8',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          <Navigation2 size={12} />
                          <span>Get Directions</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
