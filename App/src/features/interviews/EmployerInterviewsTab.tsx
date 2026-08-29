import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Briefcase,
  User as UserIcon,
  Phone,
  Mail,
  Star,
  ExternalLink,
  ChevronRight,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Navigation2,
  CalendarCheck2,
  CalendarClock,
  Clock3,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { CalendarDatePickerModal } from '../../components/common/CalendarDatePickerModal';
import { ClockTimePickerModal } from '../../components/common/ClockTimePickerModal';

export interface EmployerInterviewItem {
  application_id: string;
  job_id: string;
  candidate_id: string;
  application_status: string;
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
  candidate_name: string;
  candidate_email?: string;
  candidate_phone?: string;
  candidate_avatar?: string;
  trade_specialization?: string;
  candidate_location?: string;
  candidate_experience?: any[];
  candidate_skills?: string[];
  candidate_resume?: any;
  candidate_headline?: string;
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

export const EmployerInterviewsTab: React.FC<Props> = ({ currentUser, showToast, navigate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [upcomingList, setUpcomingList] = useState<EmployerInterviewItem[]>([]);
  const [pastList, setPastList] = useState<EmployerInterviewItem[]>([]);

  // Selected Interview for Detail / Evaluation Modal
  const [selectedInterview, setSelectedInterview] = useState<EmployerInterviewItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Evaluation Form State
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('');
  const [submittingRating, setSubmittingRating] = useState(false);

  // Reschedule Form State
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('');
  const [rescheduleVenue, setRescheduleVenue] = useState<string>('');
  const [rescheduleReason, setRescheduleReason] = useState<string>('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  // Resume Preview State
  const [resumeViewerUrl, setResumeViewerUrl] = useState<string | null>(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/jobs/employer/interviews');
      if (res.ok) {
        const json = await res.json();
        const data = json?.data || json;
        if (data) {
          setUpcomingList(Array.isArray(data.upcoming) ? data.upcoming : []);
          setPastList(Array.isArray(data.past) ? data.past : []);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch employer interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleOpenDetailModal = (item: EmployerInterviewItem) => {
    setSelectedInterview(item);
    setRating(item.interview_rating || 5);
    setFeedback(item.interview_feedback || '');
    setIsRescheduling(false);
    setRescheduleDate(item.interview_date || '');
    setRescheduleTime(item.interview_time || '');
    setRescheduleVenue(item.venue_address || '');
    setRescheduleReason('');
    setIsDetailModalOpen(true);
  };

  const handleMarkInterviewed = async () => {
    if (!selectedInterview) return;
    setSubmittingRating(true);
    try {
      const payload = {
        status: 'interviewed',
        interviewRating: rating,
        interviewFeedback: feedback.trim() || 'Candidate evaluated successfully.',
      };

      const res = await apiFetch(
        `/api/v1/jobs/employer/interviews/${selectedInterview.application_id}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        if (showToast) showToast('Candidate evaluation saved and marked as interviewed.', 'success');
        setIsDetailModalOpen(false);
        fetchInterviews();
      } else {
        const json = await res.json().catch(() => ({}));
        if (showToast) showToast(json.message || 'Failed to update interview status', 'error');
      }
    } catch (err: any) {
      if (showToast) showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!selectedInterview) return;
    if (!rescheduleDate || !rescheduleTime) {
      if (showToast) showToast('Please select both a new Date and Time for the interview.', 'error');
      return;
    }

    setSubmittingReschedule(true);
    try {
      const payload = {
        status: 'postponed',
        interviewDate: rescheduleDate,
        interviewTime: rescheduleTime,
        venueAddress: rescheduleVenue.trim() || selectedInterview.venue_address || 'Industrial Plant Main Gate',
        postponedReason: rescheduleReason.trim() || 'Schedule adjustment by recruiter.',
      };

      const res = await apiFetch(
        `/api/v1/jobs/employer/interviews/${selectedInterview.application_id}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        if (showToast) showToast(`Interview rescheduled to ${rescheduleDate} at ${rescheduleTime}. Candidate notified via email.`, 'success');
        setIsDetailModalOpen(false);
        fetchInterviews();
      } else {
        const json = await res.json().catch(() => ({}));
        if (showToast) showToast(json.message || 'Failed to reschedule interview', 'error');
      }
    } catch (err: any) {
      if (showToast) showToast(err.message || 'Failed to reschedule', 'error');
    } finally {
      setSubmittingReschedule(false);
    }
  };

  const handleOpenMap = (venue?: string, mapsLink?: string) => {
    const url = mapsLink || (venue ? `https://maps.google.com/?q=${encodeURIComponent(venue)}` : null);
    if (url) window.open(url, '_blank');
  };

  const handleViewResume = (resumeData: any) => {
    const url = resumeData?.url || (typeof resumeData === 'string' ? resumeData : null);
    if (url) {
      setResumeViewerUrl(url);
      setIsResumeModalOpen(true);
    } else {
      if (showToast) showToast('Candidate has not attached a resume file.', 'info');
    }
  };

  const currentList = activeTab === 'upcoming' ? upcomingList : pastList;
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return currentList;
    const q = searchQuery.toLowerCase().trim();
    return currentList.filter(item => {
      return (
        item.candidate_name?.toLowerCase().includes(q) ||
        item.job_title?.toLowerCase().includes(q) ||
        item.trade_specialization?.toLowerCase().includes(q) ||
        item.candidate_phone?.toLowerCase().includes(q)
      );
    });
  }, [currentList, searchQuery]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 8px 40px 8px' }}>
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
            Total Scheduled
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
            {pastList.filter(p => p.interview_status === 'interviewed' || p.application_status === 'interviewed').length}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginTop: '2px' }}>
            Evaluated
          </div>
        </div>
      </div>

      {/* Tab Switcher & Search Bar Row */}
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
            <span>Past & Evaluated</span>
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
            placeholder="Search candidate, trade, job..."
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
              ? 'Interviews scheduled with candidates from applications will appear here.'
              : 'Completed interviews with candidate ratings and evaluation notes will appear here.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          {filteredList.map((item) => {
            const days = getDaysFromToday(item.interview_date);
            const isCompleted = item.interview_status === 'interviewed' || item.application_status === 'interviewed';
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
                      Interviewed
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
                      Postponed
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

                {/* Candidate Info Block */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '22px',
                    backgroundColor: '#1764E8',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 800,
                    flexShrink: 0
                  }}>
                    {(item.candidate_name || 'C').charAt(0).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                        {item.candidate_name}
                      </span>
                      {item.trade_specialization && (
                        <span style={{
                          backgroundColor: '#EFF6FF',
                          color: '#1764E8',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {item.trade_specialization}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                      Applied for: <strong style={{ color: '#1E293B' }}>{item.job_title}</strong>
                    </div>

                    {item.candidate_phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
                        <Phone size={12} />
                        <span>{item.candidate_phone}</span>
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
                    <span>{item.venue_address}</span>
                  </div>
                )}

                {/* Rating display if interviewed */}
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
                        ({item.interview_rating}/5)
                      </span>
                    </div>
                    {item.interview_feedback && (
                      <div style={{ fontSize: '12px', color: '#78350F', marginTop: '3px', fontStyle: 'italic' }}>
                        "{item.interview_feedback}"
                      </div>
                    )}
                  </div>
                )}

                {/* Postponed notice */}
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
                    <span>Rescheduled: {item.postponed_reason}</span>
                  </div>
                )}

                <div style={{ height: '1px', backgroundColor: '#94A3B8', margin: '8px 0' }} />

                {/* Action Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.candidate_phone && (
                      <a
                        href={`tel:${item.candidate_phone}`}
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
                        title="Call Candidate"
                      >
                        <Phone size={14} />
                      </a>
                    )}
                    {item.candidate_phone && (
                      <a
                        href={`https://wa.me/${item.candidate_phone.replace(/[^0-9]/g, '')}`}
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
                        title="WhatsApp Candidate"
                      >
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/>
                        </svg>
                      </a>
                    )}
                    {item.venue_address && (
                      <button
                        type="button"
                        onClick={() => handleOpenMap(item.venue_address, item.maps_link)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: '#F1F5F9',
                          color: '#334155',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Google Maps Venue"
                      >
                        <Navigation2 size={14} />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenDetailModal(item)}
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
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <span>{isCompleted ? 'View Evaluation' : 'Evaluate & Update'}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Evaluation & Detail Modal */}
      {isDetailModalOpen && selectedInterview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            maxWidth: '560px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0'
            }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Interview Evaluation
                </h3>
                <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                  {selectedInterview.job_title}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px' }}>
              {/* Candidate Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '26px',
                  backgroundColor: '#1764E8',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 800
                }}>
                  {(selectedInterview.candidate_name || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                    {selectedInterview.candidate_name}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1764E8', marginTop: '2px' }}>
                    {selectedInterview.trade_specialization || 'Skilled Industrial Technician'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    {selectedInterview.candidate_phone} • {selectedInterview.candidate_email}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
                {selectedInterview.candidate_resume && (
                  <button
                    type="button"
                    onClick={() => handleViewResume(selectedInterview.candidate_resume)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '8px',
                      borderRadius: '6px',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      color: '#1764E8',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <FileText size={14} />
                    Resume
                  </button>
                )}
                <a
                  href={`tel:${selectedInterview.candidate_phone}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    color: '#16A34A',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <Phone size={14} />
                  Call
                </a>
                <a
                  href={`https://wa.me/${selectedInterview.candidate_phone?.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    color: '#059669',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => handleOpenMap(selectedInterview.venue_address, selectedInterview.maps_link)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Navigation2 size={14} />
                  Venue
                </button>
              </div>

              <div style={{ height: '1px', backgroundColor: '#94A3B8', margin: '14px 0' }} />

              {/* Schedule Box */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '13px',
                color: '#334155',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  SCHEDULED INTERVIEW TIME & VENUE
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Calendar size={14} color="#1764E8" />
                  <span>Date: <strong>{formatDate(selectedInterview.interview_date)}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Clock size={14} color="#1764E8" />
                  <span>Time: <strong>{selectedInterview.interview_time || '10:00 AM'}</strong></span>
                </div>
                {selectedInterview.venue_address && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <MapPin size={14} color="#64748B" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{selectedInterview.venue_address}</span>
                  </div>
                )}
              </div>

              {/* Reschedule View vs Evaluation View */}
              {isRescheduling ? (
                <div style={{
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FCD34D',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#92400E' }}>
                      Reschedule / Postpone Interview
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsRescheduling(false)}
                      style={{ background: 'none', border: 'none', color: '#1764E8', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Back to Evaluation
                    </button>
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Select New Date *
                    </label>
                    <div
                      onClick={() => setIsDatePickerOpen(true)}
                      style={{
                        padding: '9px 12px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        color: rescheduleDate ? '#0F172A' : '#94A3B8'
                      }}
                    >
                      {rescheduleDate ? formatDate(rescheduleDate) : 'Choose New Date'}
                    </div>
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Select New Time *
                    </label>
                    <div
                      onClick={() => setIsTimePickerOpen(true)}
                      style={{
                        padding: '9px 12px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        color: rescheduleTime ? '#0F172A' : '#94A3B8'
                      }}
                    >
                      {rescheduleTime || 'Select Time (e.g. 11:30 AM)'}
                    </div>
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Updated Venue / Address
                    </label>
                    <input
                      type="text"
                      placeholder="Industrial Plant Main Gate or Office Address"
                      value={rescheduleVenue}
                      onChange={(e) => setRescheduleVenue(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        fontSize: '13px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Reason for Rescheduling (Included in Candidate Email)
                    </label>
                    <textarea
                      placeholder="e.g. Technical round postponed by interviewer"
                      value={rescheduleReason}
                      onChange={(e) => setRescheduleReason(e.target.value)}
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmReschedule}
                    disabled={submittingReschedule}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      backgroundColor: '#D97706',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '11px',
                      borderRadius: '8px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <RotateCcw size={16} />
                    <span>{submittingReschedule ? 'Rescheduling...' : 'Confirm Reschedule & Send Email'}</span>
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    CANDIDATE INTERVIEW RATING
                  </div>

                  {/* 5 Star interactive rating */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px'
                  }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                      >
                        <Star
                          size={32}
                          color={star <= rating ? '#F59E0B' : '#CBD5E1'}
                          fill={star <= rating ? '#F59E0B' : 'transparent'}
                        />
                      </button>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#D97706', marginTop: '6px' }}>
                    {rating === 5 && 'Outstanding candidate performance'}
                    {rating === 4 && 'Good technical fit & skills'}
                    {rating === 3 && 'Average fit, potential training needed'}
                    {rating === 2 && 'Below requirements'}
                    {rating === 1 && 'Not suitable for role'}
                  </div>

                  {/* Remarks Input */}
                  <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Interview Notes & Evaluation Remarks
                    </label>
                    <textarea
                      placeholder="Enter observations regarding technical skills, trade knowledge, and salary alignment..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={handleMarkInterviewed}
                      disabled={submittingRating}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        backgroundColor: '#16A34A',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>{submittingRating ? 'Saving...' : 'Mark as Interviewed'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsRescheduling(true)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        backgroundColor: '#FFFBEB',
                        border: '1px solid #FCD34D',
                        color: '#D97706',
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <RotateCcw size={15} />
                      <span>Postpone / Reschedule</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Date Picker Modal */}
      <CalendarDatePickerModal
        visible={isDatePickerOpen}
        initialDate={rescheduleDate}
        onSelectDate={(d) => {
          setRescheduleDate(d);
          setIsDatePickerOpen(false);
        }}
        onClose={() => setIsDatePickerOpen(false)}
      />

      {/* Time Picker Modal */}
      <ClockTimePickerModal
        visible={isTimePickerOpen}
        initialTime={rescheduleTime || '10:30 AM'}
        onSelectTime={(t) => {
          setRescheduleTime(t);
          setIsTimePickerOpen(false);
        }}
        onClose={() => setIsTimePickerOpen(false)}
      />

      {/* Resume Viewer Modal */}
      {isResumeModalOpen && resumeViewerUrl && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            maxWidth: '800px',
            width: '100%',
            height: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid #E2E8F0'
            }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                Candidate Resume Document
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={resumeViewerUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#EFF6FF',
                    color: '#1764E8',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <ExternalLink size={13} />
                  Open in New Tab
                </a>
                <button
                  type="button"
                  onClick={() => setIsResumeModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <iframe
              src={resumeViewerUrl}
              style={{ flex: 1, width: '100%', border: 'none' }}
              title="Resume Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};
