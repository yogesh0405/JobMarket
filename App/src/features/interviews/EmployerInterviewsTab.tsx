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
import { MobileHeader } from '../../components/common/MobileHeader';
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
        if (showToast) showToast(`Interview rescheduled to ${rescheduleDate} at ${rescheduleTime}. Candidate notified via email & in-app.`, 'success');
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
    <div className="interviews-page-root">
      <style>{`
        .interviews-page-root {
          width: 100%;
          min-height: 100vh;
          background: #FFFFFF;
          box-sizing: border-box;
        }

        .interviews-mobile-header-wrap {
          display: none;
        }

        .interviews-inner-content {
          width: 100%;
          margin: 0 auto;
          padding: 0 0 40px 0;
          box-sizing: border-box;
        }

        .interviews-metrics-bar {
          display: flex;
          align-items: center;
          background-color: #FFFFFF;
          padding: 14px 20px;
          border: 1px solid #E2E8F0;
          border-radius: 0px;
          margin-bottom: 14px;
          width: 100%;
          box-sizing: border-box;
        }

        .interviews-metric-box {
          flex: 1;
          text-align: center;
        }

        .interviews-metric-num {
          font-size: 18px;
          font-weight: 800;
          color: #0F172A;
          line-height: 1.2;
        }

        .interviews-metric-tag {
          font-size: 11px;
          font-weight: 600;
          color: #64748B;
          margin-top: 2px;
        }

        .interviews-metric-sep {
          width: 1px;
          height: 24px;
          background-color: #E2E8F0;
        }

        .interviews-toolbar-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 14px;
          width: 100%;
        }

        .interviews-tab-strip {
          display: flex;
          gap: 6px;
          background-color: #FFFFFF;
          padding: 4px;
          border: 1px solid #E2E8F0;
          border-radius: 0px;
        }

        .interviews-tab-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 0px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid transparent;
          background-color: #F8FAFC;
          color: #64748B;
          transition: all 0.15s ease;
        }

        .interviews-tab-btn.active {
          background-color: #EFF6FF;
          border: 1px solid #BFDBFE;
          color: #1764E8;
          font-weight: 700;
        }

        .interviews-tab-counter {
          background-color: #CBD5E1;
          color: #334155;
          font-size: 10px;
          padding: 1px 6px;
          border-radius: 2px;
          font-weight: 700;
        }

        .interviews-tab-btn.active .interviews-tab-counter {
          background-color: #1764E8;
          color: #FFFFFF;
        }

        .interviews-search-input-wrap {
          display: flex;
          align-items: center;
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 0px;
          padding: 8px 12px;
          min-width: 280px;
          flex: 0 1 auto;
        }

        .interview-standard-card {
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 0px;
          padding: 14px 16px;
          margin-bottom: 12px;
          width: 100%;
          box-sizing: border-box;
        }

        .interview-rule-divider {
          height: 1px;
          background-color: #94A3B8;
          margin: 6px 0;
        }

        /* Mobile View Rules: Clean, Solid White, Square Corners */
        @media (max-width: 767px) {
          .interviews-mobile-header-wrap {
            display: block;
          }
          .interviews-inner-content {
            padding: 12px 14px 40px 14px;
            max-width: 580px;
          }
          .interviews-metrics-bar {
            padding: 10px 12px;
            margin-bottom: 10px;
          }
          .interviews-toolbar-row {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
            margin-bottom: 10px;
          }
          .interviews-tab-strip {
            width: 100%;
            padding: 4px;
          }
          .interviews-tab-btn {
            flex: 1;
            padding: 8px 6px;
            font-size: 12px;
          }
          .interviews-search-input-wrap {
            width: 100%;
            min-width: 100%;
            box-sizing: border-box;
            padding: 6px 10px;
          }
          .interview-standard-card {
            padding: 12px 14px;
            margin-bottom: 10px;
          }
        }
      `}</style>

      {/* Mobile Top Header */}
      <div className="interviews-mobile-header-wrap">
        <MobileHeader
          title="Scheduled Interviews"
          showBack={true}
          onBack={() => {
            if (navigate) navigate('/dashboard');
            else window.history.back();
          }}
        />
      </div>

      <div className="interviews-inner-content">
        {/* Metrics Summary Strip */}
        <div className="interviews-metrics-bar">
          <div className="interviews-metric-box">
            <div className="interviews-metric-num">
              {upcomingList.length + pastList.length}
            </div>
            <div className="interviews-metric-tag">Total Scheduled</div>
          </div>
          <div className="interviews-metric-sep" />
          <div className="interviews-metric-box">
            <div className="interviews-metric-num" style={{ color: '#1764E8' }}>
              {upcomingList.length}
            </div>
            <div className="interviews-metric-tag">Upcoming</div>
          </div>
          <div className="interviews-metric-sep" />
          <div className="interviews-metric-box">
            <div className="interviews-metric-num" style={{ color: '#16A34A' }}>
              {pastList.filter(p => p.interview_status === 'interviewed' || p.application_status === 'interviewed').length}
            </div>
            <div className="interviews-metric-tag">Evaluated</div>
          </div>
        </div>

        {/* Tab Strip & Search Bar Row */}
        <div className="interviews-toolbar-row">
          <div className="interviews-tab-strip">
            <button
              type="button"
              className={`interviews-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              <CalendarClock size={15} color={activeTab === 'upcoming' ? '#1764E8' : '#64748B'} />
              <span>Upcoming</span>
              {upcomingList.length > 0 && (
                <span className="interviews-tab-counter">{upcomingList.length}</span>
              )}
            </button>

            <button
              type="button"
              className={`interviews-tab-btn ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => setActiveTab('past')}
            >
              <CalendarCheck2 size={15} color={activeTab === 'past' ? '#1764E8' : '#64748B'} />
              <span>Past & Evaluated</span>
              {pastList.length > 0 && (
                <span className="interviews-tab-counter">{pastList.length}</span>
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="interviews-search-input-wrap">
            <Search size={15} color="#64748B" style={{ marginRight: '6px', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search candidate, trade, job..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '12.5px',
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
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Main List Body */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#64748B' }}>
            <div className="spinner" style={{ margin: '0 auto 10px auto' }} />
            <div style={{ fontSize: '12.5px', fontWeight: 500 }}>Loading interview schedule...</div>
          </div>
        ) : filteredList.length === 0 ? (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '0px',
            border: '1px solid #E2E8F0',
            padding: '32px 16px',
            textAlign: 'center',
            marginTop: '8px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '0px',
              backgroundColor: '#F1F5F9',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <Calendar size={28} color="#94A3B8" />
            </div>
            <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
              {activeTab === 'upcoming' ? 'No Upcoming Interviews' : 'No Past Interviews'}
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: '17px' }}>
              {activeTab === 'upcoming'
                ? 'When you schedule interviews from candidate applications, they will appear here.'
                : 'Completed and historic interviews with candidate ratings will be listed here.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            {filteredList.map((item) => {
              const days = getDaysFromToday(item.interview_date);
              const isCompleted = item.interview_status === 'interviewed' || item.application_status === 'interviewed';
              const isPostponed = item.interview_status === 'postponed';

              return (
                <div
                  key={item.application_id}
                  className="interview-standard-card"
                >
                  {/* Header Row: Date & Countdown Tag */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                      <Calendar size={13} color="#1764E8" />
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
                        padding: '2px 7px',
                        borderRadius: '0px'
                      }}>
                        <CheckCircle2 size={12} color="#16A34A" />
                        <span>Interviewed</span>
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
                        padding: '2px 7px',
                        borderRadius: '0px'
                      }}>
                        <Clock3 size={12} color="#D97706" />
                        <span>Postponed</span>
                      </span>
                    ) : days === 0 ? (
                      <span style={{
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '0px'
                      }}>
                        TODAY
                      </span>
                    ) : days === 1 ? (
                      <span style={{
                        backgroundColor: '#EFF6FF',
                        color: '#1764E8',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '0px'
                      }}>
                        TOMORROW
                      </span>
                    ) : (
                      <span style={{
                        backgroundColor: '#F1F5F9',
                        color: '#475569',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '0px'
                      }}>
                        {days > 0 ? `${days}d left` : 'Upcoming'}
                      </span>
                    )}
                  </div>

                  {/* Mandated Clean Divider: height: 1, backgroundColor: #94A3B8, margin: 6px 0 */}
                  <div className="interview-rule-divider" />

                  {/* Candidate Info Block */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '0px',
                      backgroundColor: '#1764E8',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 800,
                      flexShrink: 0
                    }}>
                      {(item.candidate_name || 'C').charAt(0).toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#0F172A' }}>
                          {item.candidate_name}
                        </span>
                        {item.trade_specialization && (
                          <span style={{
                            backgroundColor: '#EFF6FF',
                            color: '#1764E8',
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '0px'
                          }}>
                            {item.trade_specialization}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                        Applied for: <strong style={{ fontWeight: 700, color: '#1E293B' }}>{item.job_title}</strong>
                      </div>

                      {item.candidate_phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                          <Phone size={11} color="#64748B" />
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
                      border: '1px solid #E2E8F0',
                      padding: '6px 8px',
                      borderRadius: '0px',
                      marginTop: '6px',
                      fontSize: '11.5px',
                      color: '#475569',
                      lineHeight: '15px'
                    }}>
                      <MapPin size={12} color="#64748B" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{item.venue_address}</span>
                    </div>
                  )}

                  {/* Star Rating Display if Interviewed */}
                  {isCompleted && item.interview_rating !== undefined && item.interview_rating !== null && (
                    <div style={{
                      backgroundColor: '#FFFBEB',
                      border: '1px solid #FEF3C7',
                      padding: '6px 8px',
                      borderRadius: '0px',
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
                          ({item.interview_rating}/5)
                        </span>
                      </div>
                      {item.interview_feedback && (
                        <div style={{ fontSize: '11.5px', color: '#78350F', marginTop: '2px', fontStyle: 'italic' }}>
                          "{item.interview_feedback}"
                        </div>
                      )}
                    </div>
                  )}

                  {/* Postponed Reason Display */}
                  {isPostponed && item.postponed_reason && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: '#FFFBEB',
                      border: '1px solid #FCD34D',
                      padding: '6px 8px',
                      borderRadius: '0px',
                      marginTop: '6px',
                      fontSize: '11.5px',
                      color: '#B45309',
                      fontWeight: 600
                    }}>
                      <AlertCircle size={12} color="#D97706" />
                      <span>Rescheduled: {item.postponed_reason}</span>
                    </div>
                  )}

                  {/* Mandated Clean Divider: height: 1, backgroundColor: #94A3B8, margin: 6px 0 */}
                  <div className="interview-rule-divider" />

                  {/* Card Action Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {item.candidate_phone && (
                        <a
                          href={`tel:${item.candidate_phone}`}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '0px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            color: '#1764E8',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none'
                          }}
                          title="Call Candidate"
                        >
                          <Phone size={13} />
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
                            borderRadius: '0px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            color: '#16A34A',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none'
                          }}
                          title="WhatsApp Candidate"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
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
                            borderRadius: '0px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            color: '#334155',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Google Maps Venue"
                        >
                          <Navigation2 size={13} />
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
                        borderRadius: '0px',
                        padding: '7px 14px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <span>{isCompleted ? 'View Evaluation' : 'Evaluate & Update'}</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail & Evaluation Action Modal */}
      {isDetailModalOpen && selectedInterview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '12px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '0px',
            maxWidth: '520px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: '1px solid #CBD5E1'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: '1px solid #E2E8F0'
            }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Interview Evaluation
                </h3>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '1px' }}>
                  {selectedInterview.job_title}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '16px' }}>
              {/* Candidate Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '0px',
                  backgroundColor: '#1764E8',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 800
                }}>
                  {(selectedInterview.candidate_name || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                    {selectedInterview.candidate_name}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1764E8', marginTop: '1px' }}>
                    {selectedInterview.trade_specialization || 'Skilled Industrial Technician'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>
                    {selectedInterview.candidate_phone} • {selectedInterview.candidate_email}
                  </div>
                </div>
              </div>

              {/* Quick Contact Actions: Resume, Call, WhatsApp, Venue */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '12px' }}>
                {selectedInterview.candidate_resume && (
                  <button
                    type="button"
                    onClick={() => handleViewResume(selectedInterview.candidate_resume)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '3px',
                      padding: '7px 4px',
                      borderRadius: '0px',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      color: '#1764E8',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <FileText size={13} />
                    Resume
                  </button>
                )}
                <a
                  href={`tel:${selectedInterview.candidate_phone}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    padding: '7px 4px',
                    borderRadius: '0px',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    color: '#16A34A',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <Phone size={13} />
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
                    gap: '3px',
                    padding: '7px 4px',
                    borderRadius: '0px',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    color: '#059669',
                    fontSize: '11.5px',
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
                    gap: '3px',
                    padding: '7px 4px',
                    borderRadius: '0px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Navigation2 size={13} />
                  Venue
                </button>
              </div>

              {/* Section Separator */}
              <div style={{ height: '1px', backgroundColor: '#94A3B8', margin: '10px 0' }} />

              {/* Scheduled Interview Summary Box */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '0px',
                padding: '10px 12px',
                fontSize: '12px',
                color: '#334155',
                marginBottom: '14px'
              }}>
                <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  SCHEDULED INTERVIEW TIME & VENUE
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <Calendar size={13} color="#1764E8" />
                  <span>Date: <strong>{formatDate(selectedInterview.interview_date)}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <Clock size={13} color="#1764E8" />
                  <span>Time: <strong>{selectedInterview.interview_time || '10:00 AM'}</strong></span>
                </div>
                {selectedInterview.venue_address && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <MapPin size={13} color="#64748B" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{selectedInterview.venue_address}</span>
                  </div>
                )}
              </div>

              {/* Reschedule Section vs Evaluation Section */}
              {isRescheduling ? (
                <div style={{
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FCD34D',
                  borderRadius: '0px',
                  padding: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#92400E' }}>
                      Reschedule / Postpone Interview
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsRescheduling(false)}
                      style={{ background: 'none', border: 'none', color: '#1764E8', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Back to Evaluation
                    </button>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                      Select New Date *
                    </label>
                    <div
                      onClick={() => setIsDatePickerOpen(true)}
                      style={{
                        padding: '8px 10px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '0px',
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        color: rescheduleDate ? '#0F172A' : '#94A3B8'
                      }}
                    >
                      {rescheduleDate ? formatDate(rescheduleDate) : 'Choose New Date'}
                    </div>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                      Select New Time *
                    </label>
                    <div
                      onClick={() => setIsTimePickerOpen(true)}
                      style={{
                        padding: '8px 10px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '0px',
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        color: rescheduleTime ? '#0F172A' : '#94A3B8'
                      }}
                    >
                      {rescheduleTime || 'Select Time (e.g. 11:30 AM)'}
                    </div>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                      Updated Venue / Address
                    </label>
                    <input
                      type="text"
                      placeholder="Industrial Plant Main Gate or Office Address"
                      value={rescheduleVenue}
                      onChange={(e) => setRescheduleVenue(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '0px',
                        fontSize: '12.5px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                      Reason for Rescheduling (Included in Candidate Email)
                    </label>
                    <textarea
                      placeholder="e.g. Technical panel unavailable today"
                      value={rescheduleReason}
                      onChange={(e) => setRescheduleReason(e.target.value)}
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '0px',
                        fontSize: '12.5px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
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
                      padding: '10px',
                      borderRadius: '0px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <RotateCcw size={15} />
                    <span>{submittingReschedule ? 'Rescheduling...' : 'Confirm Reschedule & Send Email'}</span>
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    CANDIDATE INTERVIEW RATING
                  </div>

                  {/* 5 Star Interactive Rating */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '10px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '0px'
                  }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                      >
                        <Star
                          size={28}
                          color={star <= rating ? '#F59E0B' : '#CBD5E1'}
                          fill={star <= rating ? '#F59E0B' : 'transparent'}
                        />
                      </button>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '11.5px', fontWeight: 600, color: '#D97706', marginTop: '4px' }}>
                    {rating === 5 && 'Outstanding candidate performance'}
                    {rating === 4 && 'Good technical fit & skills'}
                    {rating === 3 && 'Average fit, potential training needed'}
                    {rating === 2 && 'Below requirements'}
                    {rating === 1 && 'Not suitable for role'}
                  </div>

                  {/* Evaluation Remarks */}
                  <div style={{ marginTop: '14px', marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                      Interview Notes & Evaluation Remarks
                    </label>
                    <textarea
                      placeholder="Enter observations regarding technical skills and candidate evaluation..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '0px',
                        fontSize: '12.5px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                        padding: '11px',
                        borderRadius: '0px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <CheckCircle2 size={15} />
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
                        padding: '9px',
                        borderRadius: '0px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <RotateCcw size={14} />
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
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '0px',
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
              padding: '10px 14px',
              borderBottom: '1px solid #E2E8F0'
            }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
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
                    padding: '4px 8px',
                    borderRadius: '0px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <ExternalLink size={12} />
                  Open in New Tab
                </a>
                <button
                  type="button"
                  onClick={() => setIsResumeModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                >
                  <X size={18} />
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
