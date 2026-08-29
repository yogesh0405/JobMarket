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
} from 'lucide-react';
import { apiFetch } from '../../utils/api';

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

  const currentList = activeTab === 'upcoming' ? upcomingList : pastList;
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return currentList;
    const q = searchQuery.toLowerCase().trim();
    return currentList.filter(item => {
      return (
        item.job_title?.toLowerCase().includes(q) ||
        item.company?.toLowerCase().includes(q) ||
        item.employer_name?.toLowerCase().includes(q) ||
        item.venue_address?.toLowerCase().includes(q)
      );
    });
  }, [currentList, searchQuery]);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 8px 40px 8px' }}>
      {/* Top Metrics Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>
            {upcomingList.length + pastList.length}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginTop: '2px' }}>
            Total Interviews
          </div>
        </div>
        <div style={{ textAlign: 'center', borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#1764E8' }}>
            {upcomingList.length}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginTop: '2px' }}>
            Upcoming
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#16A34A' }}>
            {pastList.length}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginTop: '2px' }}>
            Past / Completed
          </div>
        </div>
      </div>

      {/* Tab Switcher & Search Row */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flex: '1 1 auto' }}>
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'upcoming' ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
              backgroundColor: activeTab === 'upcoming' ? '#EFF6FF' : '#FFFFFF',
              color: activeTab === 'upcoming' ? '#1764E8' : '#64748B',
              transition: 'all 0.15s ease'
            }}
          >
            <CalendarClock size={16} />
            <span>Upcoming Interviews</span>
            {upcomingList.length > 0 && (
              <span style={{
                backgroundColor: activeTab === 'upcoming' ? '#1764E8' : '#CBD5E1',
                color: activeTab === 'upcoming' ? '#FFFFFF' : '#334155',
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '10px',
                fontWeight: 700
              }}>
                {upcomingList.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('past')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'past' ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
              backgroundColor: activeTab === 'past' ? '#EFF6FF' : '#FFFFFF',
              color: activeTab === 'past' ? '#1764E8' : '#64748B',
              transition: 'all 0.15s ease'
            }}
          >
            <CalendarCheck2 size={16} />
            <span>Past & Completed</span>
            {pastList.length > 0 && (
              <span style={{
                backgroundColor: activeTab === 'past' ? '#1764E8' : '#CBD5E1',
                color: activeTab === 'past' ? '#FFFFFF' : '#334155',
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '10px',
                fontWeight: 700
              }}>
                {pastList.length}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '6px 12px',
          minWidth: '260px'
        }}>
          <Search size={16} color="#64748B" style={{ marginRight: '8px' }} />
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
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
          <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
          <div style={{ fontSize: '14px', fontWeight: 600 }}>Loading interview schedule...</div>
        </div>
      ) : filteredList.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '48px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '28px',
            backgroundColor: '#F1F5F9',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px'
          }}>
            <Calendar size={28} color="#94A3B8" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
            {activeTab === 'upcoming' ? 'No Upcoming Interviews' : 'No Past Interviews'}
          </h3>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            {activeTab === 'upcoming'
              ? 'When employers schedule an in-person or virtual interview with you, it will appear here.'
              : 'Past and completed interviews will appear here with feedback.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          {filteredList.map((item) => {
            const days = getDaysFromToday(item.interview_date);
            const isCompleted = item.interview_status === 'interviewed' || item.status === 'interviewed';
            const isPostponed = item.interview_status === 'postponed';

            return (
              <div
                key={item.application_id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'border-color 0.15s ease'
                }}
              >
                {/* Header Row: Date & Countdown Tag */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    <Calendar size={14} color="#1764E8" />
                    <span>{formatDate(item.interview_date)} • {item.interview_time || '10:00 AM'}</span>
                  </div>

                  {isCompleted ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#DCFCE7',
                      color: '#16A34A',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}>
                      <CheckCircle2 size={12} />
                      Interview Completed
                    </span>
                  ) : isPostponed ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#FEF3C7',
                      color: '#D97706',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}>
                      <Clock3 size={12} />
                      Rescheduled
                    </span>
                  ) : days === 0 ? (
                    <span style={{
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}>
                      TODAY
                    </span>
                  ) : days === 1 ? (
                    <span style={{
                      backgroundColor: '#EFF6FF',
                      color: '#1764E8',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}>
                      TOMORROW
                    </span>
                  ) : (
                    <span style={{
                      backgroundColor: '#F1F5F9',
                      color: '#475569',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}>
                      {days > 0 ? `${days}d left` : 'Upcoming'}
                    </span>
                  )}
                </div>

                <div style={{ height: '1px', backgroundColor: '#94A3B8', margin: '8px 0' }} />

                {/* Job & Company Info Block */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    color: '#1764E8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 800,
                    flexShrink: 0
                  }}>
                    <Building2 size={22} color="#1764E8" />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                      {item.job_title}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1764E8', marginTop: '2px' }}>
                      {item.company || item.company_name || 'Industrial Recruiter'}
                    </div>
                    {item.job_location && (
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                        {item.job_location}
                      </div>
                    )}
                  </div>
                </div>

                {/* Venue / Location Row */}
                {item.venue_address && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '6px',
                    backgroundColor: '#F8FAFC',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#475569'
                  }}>
                    <MapPin size={14} color="#64748B" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>Venue: <strong>{item.venue_address}</strong></span>
                  </div>
                )}

                {/* Rating & Feedback */}
                {isCompleted && item.interview_rating !== undefined && item.interview_rating !== null && (
                  <div style={{
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FEF3C7',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    marginTop: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          color={star <= Number(item.interview_rating) ? '#F59E0B' : '#CBD5E1'}
                          fill={star <= Number(item.interview_rating) ? '#F59E0B' : 'transparent'}
                        />
                      ))}
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#B45309', marginLeft: '4px' }}>
                        Rating: {item.interview_rating}/5
                      </span>
                    </div>
                    {item.interview_feedback && (
                      <div style={{ fontSize: '12px', color: '#78350F', marginTop: '3px', fontStyle: 'italic' }}>
                        "{item.interview_feedback}"
                      </div>
                    )}
                  </div>
                )}

                {/* Reschedule Reason */}
                {isPostponed && item.postponed_reason && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#FFFBEB',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#B45309',
                    fontWeight: 600
                  }}>
                    <AlertCircle size={14} color="#D97706" />
                    <span>Reschedule Note: {item.postponed_reason}</span>
                  </div>
                )}

                <div style={{ height: '1px', backgroundColor: '#94A3B8', margin: '8px 0' }} />

                {/* Action Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.employer_phone && (
                      <a
                        href={`tel:${item.employer_phone}`}
                        style={{
                          width: '32px',
                          height: '32px',
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
                        style={{
                          width: '32px',
                          height: '32px',
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
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/>
                        </svg>
                      </a>
                    )}
                  </div>

                  {item.venue_address && (
                    <button
                      type="button"
                      onClick={() => handleOpenMap(item.venue_address, item.maps_link)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: '#1764E8',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '7px 14px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <Navigation2 size={13} />
                      <span>View Venue on Google Maps</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
