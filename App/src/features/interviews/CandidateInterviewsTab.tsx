import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Ticket,
} from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { MobileHeader } from '../../components/common/MobileHeader';
import { WalkInDrivePassCard } from './components/WalkInDrivePassCard';
import { WalkInDrivePassModal, WalkInPassData } from './components/WalkInDrivePassModal';

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
  // Walk-in Drive Properties
  is_walk_in?: boolean;
  hiring_method?: string;
  walk_in_date?: string;
  walk_in_start_time?: string;
  walk_in_end_time?: string;
  walk_in_contact_person?: string;
  walk_in_contact_number?: string;
  walk_in_documents?: string;
  ticket_number?: string;
  candidate_name?: string;
  candidate_phone?: string;
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

const isValidMapLink = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('geo:') ||
    trimmed.includes('maps.google.') ||
    trimmed.includes('goo.gl/maps') ||
    trimmed.includes('maps.app.goo.gl')
  );
};

interface Props {
  currentUser: any;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  navigate?: (path: string) => void;
}

export const CandidateInterviewsTab: React.FC<Props> = ({ currentUser, showToast, navigate }) => {
  const routerNavigate = useNavigate();
  const handleNavigate = navigate || routerNavigate;
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [filterType, setFilterType] = useState<'ALL' | 'WALK_IN' | 'SCHEDULED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [upcomingList, setUpcomingList] = useState<CandidateInterviewItem[]>([]);
  const [pastList, setPastList] = useState<CandidateInterviewItem[]>([]);

  // Official Walk-in Admit Pass Modal State
  const [selectedPassData, setSelectedPassData] = useState<WalkInPassData | null>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const [intRes, appRes] = await Promise.all([
        apiFetch('/api/v1/jobs/interviews/my-interviews').catch(() => null),
        apiFetch('/api/v1/jobs/applied/my-applications').catch(() => null)
      ]);

      let rawUpcoming: CandidateInterviewItem[] = [];
      let rawPast: CandidateInterviewItem[] = [];

      if (intRes && intRes.ok) {
        const intJson = await intRes.json();
        const intData = intJson?.data || intJson;
        if (intData) {
          rawUpcoming = Array.isArray(intData.upcoming) ? intData.upcoming : [];
          rawPast = Array.isArray(intData.past) ? intData.past : [];
        }
      }

      // Map walk-in drive applications into interview items
      const walkInItems: CandidateInterviewItem[] = [];
      if (appRes && appRes.ok) {
        const appJson = await appRes.json();
        const appList = Array.isArray(appJson?.data) ? appJson.data : [];

        appList.forEach((job: any) => {
          const hm = (job.hiringMethod || job.hiring_method || '').toUpperCase();
          const isWalkIn =
            hm === 'WALK_IN' ||
            Boolean(job.isWalkIn) ||
            Boolean(job.is_walk_in) ||
            Boolean(job.walkInDate) ||
            Boolean(job.walk_in_date);

          if (!isWalkIn) return;

          const dateStr = job.walkInDate || job.walk_in_date || job.interviewDate || job.interview_date || '';
          const timeStr =
            job.interviewTime ||
            job.interview_time ||
            (job.walkInStartTime
              ? `${job.walkInStartTime}${job.walkInEndTime ? ' - ' + job.walkInEndTime : ''}`
              : '10:00 AM - 04:00 PM');
          const venue =
            job.interviewAddress ||
            job.interview_address ||
            job.venueAddress ||
            job.venue_address ||
            job.location ||
            'Company Campus / Factory Premises';

          const passNum = `PASS-WID-${String(job.id || 'WID').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '7842'}-${String(job.application_id || job.applicationId || 'APL').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '9120'}`;

          walkInItems.push({
            application_id: String(job.application_id || job.id),
            job_id: String(job.id),
            status: job.applicationStatus || job.status || 'applied',
            applied_at: job.appliedAt || job.applied_at || new Date().toISOString(),
            interview_date: dateStr,
            interview_time: timeStr,
            venue_address: venue,
            maps_link: job.googleMapsUrl || job.google_maps_url || job.mapsLink || job.maps_link || '',
            job_title: job.title || 'Technical Specialist',
            company: job.company || 'Industrial Company',
            company_name: job.company || 'Industrial Company',
            company_logo: job.companyLogo || job.company_logo || '',
            job_location: job.location || '',
            industry: job.industry,
            job_type: job.jobType || job.job_type,
            work_mode: job.workMode || job.work_mode,
            salary_min: job.salaryMin || job.salary_min,
            salary_max: job.salaryMax || job.salary_max,
            is_walk_in: true,
            hiring_method: 'WALK_IN',
            walk_in_date: dateStr,
            walk_in_start_time: job.walkInStartTime || '10:00 AM',
            walk_in_end_time: job.walkInEndTime || '04:00 PM',
            walk_in_contact_person: job.walkInContactPerson || '',
            walk_in_contact_number: job.walkInContactNumber || '',
            walk_in_documents: job.walkInDocuments || '',
            ticket_number: passNum,
            candidate_name: currentUser?.name,
            candidate_phone: currentUser?.phone,
          });
        });
      }

      // Merge and partition
      const finalUpcoming: CandidateInterviewItem[] = [...rawUpcoming];
      const finalPast: CandidateInterviewItem[] = [...rawPast];

      walkInItems.forEach(wItem => {
        const d = getDaysFromToday(wItem.walk_in_date || wItem.interview_date);
        if (d >= 0) {
          finalUpcoming.push(wItem);
        } else {
          finalPast.push(wItem);
        }
      });

      setUpcomingList(finalUpcoming);
      setPastList(finalPast);
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
    let list = currentList;

    if (filterType === 'WALK_IN') {
      list = list.filter(item => item.is_walk_in);
    } else if (filterType === 'SCHEDULED') {
      list = list.filter(item => !item.is_walk_in);
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(item => {
      return (
        item.job_title?.toLowerCase().includes(q) ||
        item.company?.toLowerCase().includes(q) ||
        item.company_name?.toLowerCase().includes(q) ||
        item.employer_name?.toLowerCase().includes(q) ||
        item.venue_address?.toLowerCase().includes(q) ||
        item.ticket_number?.toLowerCase().includes(q)
      );
    });
  }, [currentList, filterType, searchQuery]);

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

        /* ── DESKTOP VIEW STYLES ── */
        @media (min-width: 768px) {
          .cand-interviews-page-root {
            background-color: transparent !important;
            min-height: auto;
          }
          .cand-inner-content {
            background-color: transparent !important;
            padding: 0 0 40px 0;
          }
          .cand-desktop-wrap {
            max-width: 900px;
            margin: 0 auto;
            padding: 0;
            box-sizing: border-box;
          }
          .cand-metrics-bar {
            background-color: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            margin-bottom: 16px;
            padding: 16px 24px;
          }
          .cand-metric-num {
            font-size: 20px;
          }
          .cand-metric-tag {
            font-size: 12px;
          }
          .cand-toolbar-top-row {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 10px;
          }
          .cand-toolbar-filter-row {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
          }
          .cand-toolbar-row {
            flex-direction: column;
            gap: 0;
            margin-bottom: 0;
          }
          .cand-tab-strip {
            background-color: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            padding: 6px;
            width: auto;
            border-bottom: 1px solid #E2E8F0;
          }
          .cand-tab-btn {
            font-size: 13px;
            padding: 8px 16px;
          }
          .cand-search-input-wrap {
            background-color: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            margin: 0;
            min-width: 260px;
            padding: 8px 14px;
          }
          .cand-list-wrap {
            padding: 0;
            background-color: transparent !important;
          }
          .cand-standard-card {
            padding: 18px 20px !important;
            margin-bottom: 14px !important;
            border-radius: 8px !important;
          }
          .cand-card-company-name {
            font-size: 14px !important;
          }
          .cand-filter-chips-mobile {
            display: none;
          }
        }

        @media (max-width: 767px) {
          .cand-mobile-header-wrap {
            display: block;
          }
          .cand-inner-content {
            padding: 0 0 32px 0;
            background-color: #F8FAFC !important;
          }
          /* Hide desktop-only rows on mobile */
          .cand-toolbar-top-row {
            display: none !important;
          }
          .cand-toolbar-filter-row {
            display: none !important;
          }
          /* Show mobile toolbar */
          .cand-filter-chips-mobile {
            display: flex !important;
          }
          .cand-desktop-wrap {
            max-width: 100%;
            padding: 0;
          }
          .cand-list-wrap {
            padding: 8px 12px;
            background-color: #F8FAFC !important;
          }
          .cand-metrics-bar {
            padding: 8px 12px;
            margin-bottom: 8px;
          }
          .cand-metric-num {
            font-size: 15px !important;
          }
          .cand-metric-tag {
            font-size: 10px !important;
          }
          .cand-toolbar-row {
            gap: 6px;
            margin-bottom: 6px;
          }
          .cand-tab-strip {
            padding: 6px 12px;
            gap: 6px;
          }
          .cand-tab-btn {
            padding: 6px 8px !important;
            font-size: 11px !important;
          }
          .cand-tab-counter {
            font-size: 9px !important;
            padding: 0 5px !important;
          }
          .cand-search-input-wrap {
            margin: 0 12px;
            padding: 4px 10px;
          }
          .cand-search-input-wrap input {
            font-size: 11.5px !important;
          }
          .cand-standard-card {
            padding: 10px 12px !important;
            margin-bottom: 8px !important;
            border-radius: 6px !important;
          }
          .cand-card-company-name {
            font-size: 12px !important;
          }
          .cand-card-job-title {
            font-size: 10.5px !important;
          }
          .cand-countdown-pill {
            font-size: 9px !important;
            padding: 2px 6px !important;
          }
          .cand-info-label {
            font-size: 10.5px !important;
          }
          .cand-venue-text {
            font-size: 10.5px !important;
            padding: 6px 8px !important;
            line-height: 14px !important;
          }
          .cand-quick-btn {
            width: 26px !important;
            height: 26px !important;
          }
          .cand-direction-btn {
            font-size: 10.5px !important;
            padding: 4px 8px !important;
          }
        }
      `}</style>

      {/* Mobile Header */}
      <div className="cand-mobile-header-wrap">
        <MobileHeader
          title="Scheduled Interviews"
          showBack={true}
          hideRightActions={true}
          onBack={() => {
            if (navigate) navigate('/dashboard');
            else window.history.back();
          }}
        />
      </div>

      <div className="cand-inner-content">
        <div className="cand-desktop-wrap">
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

        {/* Desktop: Top row — Tabs + Search */}
        <div className="cand-toolbar-top-row">
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
              <span>Past &amp; Completed</span>
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

        {/* Desktop: Filter chips row */}
        <div className="cand-toolbar-filter-row">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: filterType === 'ALL' ? 800 : 600,
              backgroundColor: filterType === 'ALL' ? '#1D4ED8' : '#FFFFFF',
              color: filterType === 'ALL' ? '#FFFFFF' : '#64748B',
              border: `1px solid ${filterType === 'ALL' ? '#1D4ED8' : '#CBD5E1'}`,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            All Schedules ({currentList.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('WALK_IN')}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: filterType === 'WALK_IN' ? 800 : 600,
              backgroundColor: filterType === 'WALK_IN' ? '#1D4ED8' : '#FFFFFF',
              color: filterType === 'WALK_IN' ? '#FFFFFF' : '#64748B',
              border: `1px solid ${filterType === 'WALK_IN' ? '#1D4ED8' : '#CBD5E1'}`,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s ease'
            }}
          >
            <Ticket size={12} />
            <span>Walk-in Passes ({currentList.filter(i => i.is_walk_in).length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('SCHEDULED')}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: filterType === 'SCHEDULED' ? 800 : 600,
              backgroundColor: filterType === 'SCHEDULED' ? '#1D4ED8' : '#FFFFFF',
              color: filterType === 'SCHEDULED' ? '#FFFFFF' : '#64748B',
              border: `1px solid ${filterType === 'SCHEDULED' ? '#1D4ED8' : '#CBD5E1'}`,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            1-on-1 Interviews ({currentList.filter(i => !i.is_walk_in).length})
          </button>
        </div>

        {/* Mobile: Toolbar (hidden on desktop via CSS) */}
        <div className="cand-toolbar-row cand-filter-chips-mobile">
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
              <span>Past &amp; Completed</span>
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
          {/* Sub-filters */}
          <div
            className="no-scrollbar"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 16px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <button
              type="button"
              onClick={() => setFilterType('ALL')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: filterType === 'ALL' ? 800 : 600,
                backgroundColor: filterType === 'ALL' ? '#1D4ED8' : '#FFFFFF',
                color: filterType === 'ALL' ? '#FFFFFF' : '#64748B',
                border: `1px solid ${filterType === 'ALL' ? '#1D4ED8' : '#CBD5E1'}`,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              All Schedules ({currentList.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('WALK_IN')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: filterType === 'WALK_IN' ? 800 : 600,
                backgroundColor: filterType === 'WALK_IN' ? '#1D4ED8' : '#FFFFFF',
                color: filterType === 'WALK_IN' ? '#FFFFFF' : '#64748B',
                border: `1px solid ${filterType === 'WALK_IN' ? '#1D4ED8' : '#CBD5E1'}`,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
            >
              <Ticket size={12} />
              <span>Walk-in Passes ({currentList.filter(i => i.is_walk_in).length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType('SCHEDULED')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: filterType === 'SCHEDULED' ? 800 : 600,
                backgroundColor: filterType === 'SCHEDULED' ? '#1D4ED8' : '#FFFFFF',
                color: filterType === 'SCHEDULED' ? '#FFFFFF' : '#64748B',
                border: `1px solid ${filterType === 'SCHEDULED' ? '#1D4ED8' : '#CBD5E1'}`,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              1-on-1 Interviews ({currentList.filter(i => !i.is_walk_in).length})
            </button>
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
                {activeTab === 'upcoming' ? 'No Upcoming Interviews or Drives' : 'No Past Interviews'}
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0, lineHeight: '18px' }}>
                {activeTab === 'upcoming'
                  ? 'When employers schedule interviews or when you register for Walk-in Drives, they will appear here.'
                  : 'Past and completed interviews will appear here with feedback.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              {filteredList.map((item) => {
                if (item.is_walk_in) {
                  return (
                    <WalkInDrivePassCard
                      key={item.application_id || item.job_id}
                      item={item}
                      isPast={activeTab === 'past'}
                      candidateName={currentUser?.name}
                      candidatePhone={currentUser?.phone}
                      onPressPass={(p) => {
                        setSelectedPassData(p);
                        setIsPassModalOpen(true);
                      }}
                      onNavigateJob={handleOpenJobDetails}
                    />
                  );
                }

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
                        <div className="cand-card-company-name" style={{ fontSize: '13px', fontWeight: 800, color: isPast ? '#94A3B8' : '#0F172A' }}>
                          {item.company_name || item.company}
                        </div>
                        <div
                          className="cand-card-job-title"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.job_id) {
                              handleNavigate(`/job/${item.job_id}`);
                            }
                          }}
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: item.job_id ? (isPast ? '#64748B' : '#1764E8') : (isPast ? '#CBD5E1' : '#475569'),
                            marginTop: '1px',
                            cursor: item.job_id ? 'pointer' : 'default',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                          onMouseEnter={(e) => {
                            if (item.job_id) e.currentTarget.style.textDecoration = 'underline';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.textDecoration = 'none';
                          }}
                          title={item.job_id ? "View Job Posting" : undefined}
                        >
                          <span>{item.job_title}</span>
                          {item.job_id && <ExternalLink size={10} style={{ flexShrink: 0, opacity: 0.85 }} />}
                        </div>
                      </div>

                      {/* Countdown Badge */}
                      {isCompleted ? (
                        <span className="cand-countdown-pill" style={{
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
                        <span className="cand-countdown-pill" style={{
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
                        <span className="cand-countdown-pill" style={{
                          backgroundColor: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          color: '#1764E8',
                          fontSize: '10px',
                          fontWeight: 900,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          letterSpacing: '0.5px'
                        }}>
                          TODAY
                        </span>
                      ) : days === 1 ? (
                        <span className="cand-countdown-pill" style={{
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
                        <span className="cand-countdown-pill" style={{
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
                        <span className="cand-countdown-pill" style={{
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
                      <div className="cand-info-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: isPast ? '#94A3B8' : '#334155' }}>
                        <Calendar size={13} color={isPast ? '#94A3B8' : '#1764E8'} />
                        <span>{formatDate(item.interview_date)}</span>
                      </div>

                      {item.interview_time && (
                        <div className="cand-info-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: isPast ? '#94A3B8' : '#64748B' }}>
                          <Clock size={13} color={isPast ? '#94A3B8' : '#64748B'} />
                          <span>{item.interview_time}</span>
                        </div>
                      )}

                      {(item.job_type || item.job_location) && (
                        <div className="cand-info-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#94A3B8' }}>
                          <Briefcase size={13} color="#94A3B8" />
                          <span>{item.job_type || item.job_location}</span>
                        </div>
                      )}
                    </div>

                    {/* Venue Row */}
                    {item.venue_address && (
                      isValidMapLink(item.maps_link) ? (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(item.maps_link?.trim(), '_blank');
                          }}
                          className="cand-venue-text"
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
                          <MapPin size={13} color={isPast ? '#94A3B8' : '#1764E8'} style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span style={{ flex: 1 }}>{item.venue_address}</span>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: isPast ? '#94A3B8' : '#1764E8', fontSize: '11px', fontWeight: 700 }}>
                            <Navigation2 size={13} style={{ flexShrink: 0 }} />
                            <span>Map</span>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="cand-venue-text"
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
                            lineHeight: '17px'
                          }}
                        >
                          <MapPin size={13} color={isPast ? '#94A3B8' : '#1764E8'} style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span style={{ flex: 1 }}>{item.venue_address}</span>
                        </div>
                      )
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
                            className="cand-quick-btn"
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
                            className="cand-quick-btn"
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
                          className="cand-direction-btn"
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
        </div>{/* end cand-desktop-wrap */}
      </div>

      {/* Official Walk-in Drive Admit Card Pass Modal */}
      <WalkInDrivePassModal
        isOpen={isPassModalOpen}
        onClose={() => {
          setIsPassModalOpen(false);
          setSelectedPassData(null);
        }}
        data={selectedPassData}
      />
    </div>
  );
};
