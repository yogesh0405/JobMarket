import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  Platform,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
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
  ChevronDown,
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
  FileSpreadsheet,
  Download,
} from 'lucide-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Header } from '../../components/common/Header';
import { FocusAwareStatusBar } from '../../components/common/FocusAwareStatusBar';
import { DatePickerField } from '../../components/common/DatePickerField';
import { ClockTimePickerModal } from '../../components/common/ClockTimePickerModal';
import { ResumePdfViewerModal } from '../../components/common/ResumePdfViewerModal';
import { SuccessModal } from '../../components/common/SuccessModal';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch } from '../../api/client';
import { jobsApi } from '../../api/jobsApi';
import { Job } from '../../types';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

interface Props {
  navigation: any;
  route?: any;
}

export interface EmployerInterviewItem {
  application_id: string;
  job_id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email?: string;
  candidate_phone?: string;
  candidate_avatar?: string;
  trade_specialization?: string;
  candidate_location?: string;
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
  company_name?: string;
  candidate_education?: any[];
  candidate_experience?: any[];
  candidate_skills?: string[];
  candidate_resume?: any;
  candidate_headline?: string;
}

type TabType = 'upcoming' | 'past';

// Calculate days relative to today
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

export const EmployerInterviewsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
  const [rescheduleMapsLink, setRescheduleMapsLink] = useState<string>('');
  const [rescheduleReason, setRescheduleReason] = useState<string>('');
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  // Job Filter Dropdown State
  const [selectedJobId, setSelectedJobId] = useState<string>('ALL');
  const [jobDropdownOpen, setJobDropdownOpen] = useState<boolean>(false);
  const [employerJobs, setEmployerJobs] = useState<Job[]>([]);

  // Resume Viewer Modal State
  const [resumeViewerUrl, setResumeViewerUrl] = useState<string | null>(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  // Branded Success Modal State
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successModalData, setSuccessModalData] = useState<{ title: string; message: string }>({
    title: '',
    message: '',
  });

  const fetchInterviews = async (isPullToRefresh = false) => {
    if (!isPullToRefresh) setLoading(true);
    try {
      const [interviewRes, jobsRes] = await Promise.all([
        apiFetch('/api/v1/jobs/employer/interviews'),
        jobsApi.getMyJobs().catch(() => ({ success: false, data: [] })),
      ]);
      const data = interviewRes?.data || interviewRes;
      if (data) {
        setUpcomingList(Array.isArray(data.upcoming) ? data.upcoming : []);
        setPastList(Array.isArray(data.past) ? data.past : []);
      }
      if (jobsRes?.success && Array.isArray(jobsRes.data)) {
        setEmployerJobs(jobsRes.data);
      }
    } catch (err) {
      console.warn('Failed to fetch employer interviews:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInterviews();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchInterviews(true);
  };

  // Open Modal and prefill data
  const handleOpenDetailModal = (item: EmployerInterviewItem) => {
    setSelectedInterview(item);
    setRating(item.interview_rating || 5);
    setFeedback(item.interview_feedback || '');
    setIsRescheduling(false);
    setRescheduleDate(item.interview_date || '');
    setRescheduleTime(item.interview_time || '');
    setRescheduleVenue(item.venue_address || '');
    setRescheduleMapsLink(item.maps_link || '');
    setRescheduleReason('');
    setIsDetailModalOpen(true);
  };

  // Submit Completed Interview Evaluation
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
          body: JSON.stringify(payload),
        }
      );

      if (res && res.success !== false) {
        setIsDetailModalOpen(false);
        setSuccessModalData({
          title: 'Evaluation Submitted Successfully',
          message: `Candidate ${selectedInterview.candidate_name || 'Applicant'} has been evaluated with a rating of ${rating}/5. The candidate and application record have been updated.`,
        });
        setSuccessModalVisible(true);
        fetchInterviews(true);
      } else {
        Alert.alert('Error', res?.message || 'Failed to update interview status.');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update status.');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Submit Rescheduled Interview
  const handleConfirmReschedule = async () => {
    if (!selectedInterview) return;
    if (!rescheduleDate || !rescheduleTime) {
      Alert.alert('Required Fields', 'Please select both a new Date and Time for the interview.');
      return;
    }

    setSubmittingReschedule(true);
    try {
      const payload = {
        status: 'postponed',
        interviewDate: rescheduleDate,
        interviewTime: rescheduleTime,
        venueAddress: rescheduleVenue.trim() || selectedInterview.venue_address || 'Industrial Plant Main Gate',
        mapsLink: rescheduleMapsLink.trim() || selectedInterview.maps_link || '',
        postponedReason: rescheduleReason.trim() || 'Schedule adjustment by recruiter.',
      };

      const res = await apiFetch(
        `/api/v1/jobs/employer/interviews/${selectedInterview.application_id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        }
      );

      if (res && res.success !== false) {
        setIsDetailModalOpen(false);
        setSuccessModalData({
          title: 'Interview Rescheduled Successfully',
          message: `The interview for ${selectedInterview.candidate_name || 'Candidate'} has been rescheduled to ${rescheduleDate} at ${rescheduleTime}. An updated alert and notification have been dispatched.`,
        });
        setSuccessModalVisible(true);
        fetchInterviews(true);
      } else {
        Alert.alert('Error', res?.message || 'Failed to reschedule interview.');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to reschedule.');
    } finally {
      setSubmittingReschedule(false);
    }
  };

  // Direct Communication Handlers
  const handleCallCandidate = (phone?: string) => {
    if (!phone) {
      Alert.alert('Notice', 'Phone number not provided.');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsAppCandidate = (phone?: string, candidateName?: string) => {
    if (!phone) {
      Alert.alert('Notice', 'Phone number not provided.');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Hello ${candidateName || 'Candidate'}, regarding your scheduled interview on CSN-JobMarket:`
    );
    Linking.openURL(`whatsapp://send?phone=${finalPhone}&text=${msg}`).catch(() => {
      Linking.openURL(`https://wa.me/${finalPhone}?text=${msg}`);
    });
  };

  const handleEmailCandidate = (email?: string, jobTitle?: string) => {
    if (!email) {
      Alert.alert('Notice', 'Email address not provided.');
      return;
    }
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(`Interview regarding ${jobTitle || 'Job Opening'}`)}`);
  };

  const handleOpenMap = (venue?: string, mapsLink?: string) => {
    const url = mapsLink || (venue ? `https://maps.google.com/?q=${encodeURIComponent(venue)}` : null);
    if (url) Linking.openURL(url);
  };

  const handleViewResume = (resumeData: any) => {
    const url = resumeData?.url || (typeof resumeData === 'string' ? resumeData : null);
    if (url) {
      setResumeViewerUrl(url);
      setIsResumeModalOpen(true);
    } else {
      Alert.alert('No Resume Found', 'The candidate has not attached a resume document.');
    }
  };

  const handleOpenCandidateProfile = (item: EmployerInterviewItem) => {
    if (!item.candidate_id) return;
    const photo = item.candidate_avatar || (item as any).avatar_url || (item as any).profile_picture_url || (item as any).avatar;
    navigation.navigate('EmployerCandidateDetail', {
      candidateId: item.candidate_id,
      applicantId: item.application_id,
      candidate: {
        id: item.candidate_id,
        name: item.candidate_name,
        email: item.candidate_email,
        phone: item.candidate_phone,
        avatar: photo,
        avatarUrl: photo,
        avatar_url: photo,
        profile_picture_url: photo,
        profilePictureUrl: photo,
        candidate_avatar: photo,
        trade: item.trade_specialization,
        trade_specialization: item.trade_specialization,
        location: item.candidate_location,
        skills: item.candidate_skills,
        experience: item.candidate_experience,
        resume: item.candidate_resume,
        headline: item.candidate_headline,
        jobTitle: item.job_title,
        status: item.application_status,
      },
    });
  };

  // Distinct jobs computed from employer's job postings and interviews
  const availableJobs = useMemo(() => {
    const jobMap = new Map<string, { id: string; title: string; count: number }>();

    // 1. Add all jobs from employer jobs
    employerJobs.forEach((j) => {
      jobMap.set(String(j.id), { id: String(j.id), title: j.title || 'Untitled Job', count: 0 });
    });

    // 2. Count scheduled interviews for each job
    const allInterviews = [...upcomingList, ...pastList];
    allInterviews.forEach((item) => {
      const jId = String(item.job_id || '');
      if (jId) {
        if (!jobMap.has(jId)) {
          jobMap.set(jId, { id: jId, title: item.job_title || 'Industrial Position', count: 0 });
        }
        const existing = jobMap.get(jId)!;
        existing.count += 1;
      }
    });

    return Array.from(jobMap.values());
  }, [employerJobs, upcomingList, pastList]);

  const selectedJobTitle = useMemo(() => {
    if (selectedJobId === 'ALL') return 'All Job Postings';
    const found = availableJobs.find((j) => String(j.id) === String(selectedJobId));
    return found ? found.title : 'Selected Job';
  }, [selectedJobId, availableJobs]);

  // Filtered Upcoming and Past lists based on Job Dropdown Selection
  const filteredUpcoming = useMemo(() => {
    if (selectedJobId === 'ALL') return upcomingList;
    return upcomingList.filter((item) => String(item.job_id) === String(selectedJobId));
  }, [upcomingList, selectedJobId]);

  const filteredPast = useMemo(() => {
    if (selectedJobId === 'ALL') return pastList;
    return pastList.filter((item) => String(item.job_id) === String(selectedJobId));
  }, [pastList, selectedJobId]);

  const currentList = activeTab === 'upcoming' ? filteredUpcoming : filteredPast;

  // Search Filter
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return currentList;
    const q = searchQuery.toLowerCase().trim();
    return currentList.filter((item) => {
      return (
        item.candidate_name?.toLowerCase().includes(q) ||
        item.job_title?.toLowerCase().includes(q) ||
        item.trade_specialization?.toLowerCase().includes(q) ||
        item.candidate_phone?.toLowerCase().includes(q)
      );
    });
  }, [currentList, searchQuery]);

  const [exportingCsv, setExportingCsv] = useState(false);

  // Export Scheduled/Evaluated Interviews to Excel/CSV
  const handleExportCsv = async (exportType: 'upcoming' | 'past' = activeTab) => {
    const isUpcoming = exportType === 'upcoming';
    const targetList = isUpcoming ? filteredUpcoming : filteredPast;

    if (targetList.length === 0) {
      Alert.alert(
        'No Records',
        `There are no ${isUpcoming ? 'upcoming scheduled' : 'evaluated'} candidate records to export for this selection.`
      );
      return;
    }

    setExportingCsv(true);
    try {
      // 1. Prepare CSV Header
      const headers = [
        'Candidate Name',
        'Trade / Specialization',
        'Job Vacancy',
        'Interview Date',
        'Interview Time',
        'Status',
        'Rating (Out of 5)',
        'Evaluation Remarks',
        'Candidate Phone',
        'Candidate Email',
        'Location',
        'Interview Venue',
      ];

      // Helper to escape CSV field values (RFC 4180)
      const escapeCsv = (str?: any) => {
        if (str === null || str === undefined) return '""';
        const formatted = String(str).replace(/"/g, '""');
        return `"${formatted}"`;
      };

      // 2. Generate Rows (Evaluation fields are blank for upcoming interviews)
      const rows = targetList.map((item) => {
        const isEval = item.interview_status === 'interviewed' || item.application_status === 'interviewed';
        return [
          escapeCsv(item.candidate_name || 'Candidate'),
          escapeCsv(item.trade_specialization || 'Not Specified'),
          escapeCsv(item.job_title || 'Industrial Role'),
          escapeCsv(item.interview_date || 'TBD'),
          escapeCsv(item.interview_time || 'TBD'),
          escapeCsv(isUpcoming ? 'Scheduled (Upcoming)' : (isEval ? 'Evaluated' : item.application_status || 'Interviewed')),
          escapeCsv(isUpcoming ? '' : (item.interview_rating ? `${item.interview_rating}/5` : '')),
          escapeCsv(isUpcoming ? '' : (item.interview_feedback || '')),
          escapeCsv(item.candidate_phone || 'N/A'),
          escapeCsv(item.candidate_email || 'N/A'),
          escapeCsv(item.candidate_location || 'N/A'),
          escapeCsv(item.venue_address || 'N/A'),
        ];
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

      // 3. Create File Name based on selected Job, Type, and Date
      const sanitizedJobName = (selectedJobId === 'ALL' ? 'All_Jobs' : selectedJobTitle)
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 30);
      const dateTag = new Date().toISOString().split('T')[0];
      const prefix = isUpcoming ? 'Upcoming_Interviews' : 'Evaluated_Candidates';
      const fileName = `${prefix}_${sanitizedJobName}_${dateTag}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // 4. Write CSV to cache/document storage
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // 5. Share / Open Download Dialog
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: `Download ${isUpcoming ? 'Upcoming Interviews' : 'Evaluated Candidates'} (${selectedJobTitle})`,
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        Alert.alert('Download Ready', `File saved to device storage: ${fileName}`);
      }
    } catch (err: any) {
      console.warn('Failed to export CSV:', err);
      Alert.alert('Export Error', err?.message || 'Failed to generate excel file.');
    } finally {
      setExportingCsv(false);
    }
  };

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Screen Header with Back Button */}
      <Header
        title="Scheduled Interviews"
        subtitle="Manage & Evaluate Candidates"
        showBack={true}
        onBack={() => navigation.goBack()}
        hideBell={true}
        hideMenu={true}
        hideRightActions={true}
      />

      {/* Metrics Summary Strip */}
      <View style={styles.metricsStrip}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{filteredUpcoming.length + filteredPast.length}</Text>
          <Text style={styles.metricLabel}>Total Scheduled</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricValue, { color: '#1764E8' }]}>{filteredUpcoming.length}</Text>
          <Text style={styles.metricLabel}>Upcoming</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricValue, { color: '#16A34A' }]}>
            {filteredPast.filter((p) => p.interview_status === 'interviewed' || p.application_status === 'interviewed').length}
          </Text>
          <Text style={styles.metricLabel}>Evaluated</Text>
        </View>
      </View>

      {/* Job Posting Type Filter Dropdown Trigger */}
      <View style={styles.jobFilterWrapper}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.jobDropdownTriggerBtn}
          onPress={() => setJobDropdownOpen(true)}
        >
          <View style={styles.jobDropdownTriggerLeft}>
            <View style={styles.jobFilterIconBox}>
              <Briefcase size={15} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.jobDropdownLabel}>JOB POSTING VACANCY</Text>
              <Text style={styles.jobDropdownSelectedText} numberOfLines={1}>
                {selectedJobTitle}
              </Text>
            </View>
          </View>
          <View style={styles.jobDropdownChevronBox}>
            <ChevronDown size={16} color="#64748B" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Tab Switcher (Upcoming vs Past / Evaluated) */}
      <View style={styles.tabBarContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.tabButton, activeTab === 'upcoming' && styles.tabButtonActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <CalendarClock size={16} color={activeTab === 'upcoming' ? '#1764E8' : '#64748B'} />
          <Text style={[styles.tabButtonText, activeTab === 'upcoming' && styles.tabButtonTextActive]}>
            Upcoming Interviews
          </Text>
          {filteredUpcoming.length > 0 && (
            <View style={[styles.tabBadge, activeTab === 'upcoming' && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, activeTab === 'upcoming' && styles.tabBadgeTextActive]}>
                {filteredUpcoming.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.tabButton, activeTab === 'past' && styles.tabButtonActive]}
          onPress={() => setActiveTab('past')}
        >
          <CalendarCheck2 size={16} color={activeTab === 'past' ? '#1764E8' : '#64748B'} />
          <Text style={[styles.tabButtonText, activeTab === 'past' && styles.tabButtonTextActive]}>
            Past & Evaluated
          </Text>
          {filteredPast.length > 0 && (
            <View style={[styles.tabBadge, activeTab === 'past' && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, activeTab === 'past' && styles.tabBadgeTextActive]}>
                {filteredPast.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <Search size={16} color="#64748B" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by candidate name, trade, job..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={16} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      {/* Export Excel Bar (Available for both Upcoming and Past sections) */}
      <View
        style={[
          styles.exportSectionBar,
          activeTab === 'upcoming' && styles.exportSectionBarUpcoming,
        ]}
      >
        <View style={styles.exportSectionLeft}>
          <Text
            style={[
              styles.exportSectionCountText,
              activeTab === 'upcoming' && styles.exportSectionCountTextUpcoming,
            ]}
          >
            {activeTab === 'upcoming'
              ? `${filteredUpcoming.length} Upcoming Interview${filteredUpcoming.length !== 1 ? 's' : ''}`
              : `${filteredPast.length} Evaluated Record${filteredPast.length !== 1 ? 's' : ''}`}
          </Text>
          <Text
            style={[
              styles.exportSectionJobScopeText,
              activeTab === 'upcoming' && styles.exportSectionJobScopeTextUpcoming,
            ]}
            numberOfLines={1}
          >
            {selectedJobId === 'ALL' ? 'Across all job postings' : `Filtered: ${selectedJobTitle}`}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.exportExcelButton,
            activeTab === 'upcoming' && styles.exportExcelButtonUpcoming,
            (activeTab === 'upcoming' ? filteredUpcoming.length === 0 : filteredPast.length === 0) &&
              styles.exportExcelButtonDisabled,
          ]}
          activeOpacity={0.8}
          onPress={() => handleExportCsv(activeTab)}
          disabled={
            (activeTab === 'upcoming' ? filteredUpcoming.length === 0 : filteredPast.length === 0) ||
            exportingCsv
          }
        >
          {exportingCsv ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <FileSpreadsheet
                size={15}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
                strokeWidth={2.2}
              />
              <Text style={styles.exportExcelButtonText}>Download Excel</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Main List Body */}
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 40, 60) },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1764E8']} />}
        showsVerticalScrollIndicator={false}
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1764E8" />
            <Text style={styles.loadingText}>Loading interview schedule...</Text>
          </View>
        ) : filteredList.length === 0 ? (
          <View style={styles.emptyStateCard}>
            <View style={styles.emptyIconCircle}>
              <Calendar size={32} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'upcoming' ? 'No Upcoming Interviews' : 'No Past Interviews'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'upcoming'
                ? 'When you schedule interviews from candidate applications, they will appear here.'
                : 'Completed and historic interviews with candidate ratings will be listed here.'}
            </Text>
          </View>
        ) : (
          filteredList.map(item => {
            const days = getDaysFromToday(item.interview_date);
            const isCompleted = item.interview_status === 'interviewed' || item.application_status === 'interviewed';
            const isPostponed = item.interview_status === 'postponed';

            return (
              <View key={item.application_id} style={styles.interviewCard}>
                {/* Distinct Date & Status Header Band with soft grey background */}
                <View style={styles.cardTopHeader}>
                  <View style={styles.dateTimeBadge}>
                    <Calendar size={13} color="#1764E8" strokeWidth={2} />
                    <Text style={styles.dateTimeText}>
                      {formatDate(item.interview_date)} • {item.interview_time || '10:00 AM'}
                    </Text>
                  </View>

                  {isCompleted ? (
                    <View style={styles.statusCompletedBadge}>
                      <CheckCircle2 size={12} color="#16A34A" />
                      <Text style={styles.statusCompletedText}>Interviewed</Text>
                    </View>
                  ) : isPostponed ? (
                    <View style={styles.statusPostponedBadge}>
                      <Clock3 size={12} color="#D97706" />
                      <Text style={styles.statusPostponedText}>Postponed</Text>
                    </View>
                  ) : days === 0 ? (
                    <View style={styles.statusTodayBadge}>
                      <Text style={styles.statusTodayText}>TODAY</Text>
                    </View>
                  ) : days === 1 ? (
                    <View style={styles.statusTomorrowBadge}>
                      <Text style={styles.statusTomorrowText}>TOMORROW</Text>
                    </View>
                  ) : (
                    <View style={styles.statusUpcomingBadge}>
                      <Text style={styles.statusUpcomingText}>{days > 0 ? `${days}d left` : 'Upcoming'}</Text>
                    </View>
                  )}
                </View>

                {/* Card Main Body */}
                <View style={styles.cardBody}>
                  {/* Candidate Info Block */}
                  <View style={styles.candidateRow}>
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => handleOpenCandidateProfile(item)}
                      style={[styles.avatarCircle, { overflow: 'hidden' }]}
                    >
                      {item.candidate_avatar && (item.candidate_avatar.startsWith('http') || item.candidate_avatar.startsWith('data:') || item.candidate_avatar.startsWith('/')) ? (
                        <Image source={{ uri: item.candidate_avatar }} style={{ width: '100%', height: '100%' }} />
                      ) : (
                        <Text style={styles.avatarInitials}>
                          {(item.candidate_name || 'C').charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </TouchableOpacity>

                    <View style={styles.candidateDetails}>
                      <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={() => handleOpenCandidateProfile(item)}
                        style={styles.candidateNameRow}
                      >
                        <Text style={[styles.candidateName, { color: COLORS.primary }]} numberOfLines={1}>
                          {item.candidate_name}
                        </Text>
                        <ExternalLink size={11} color={COLORS.primary} style={{ marginLeft: 3 }} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={() => {
                          if (item.job_id) {
                            navigation.navigate('CandidateJobDetail', {
                              jobId: item.job_id,
                              job: {
                                ...item,
                                id: item.job_id,
                                title: item.job_title,
                                job_title: item.job_title,
                                company: (item as any).company_name || user?.companyName || user?.company_name || 'Industrial Partner',
                                location: item.venue_address,
                              },
                            });
                          }
                        }}
                        style={styles.jobAppliedLinkRow}
                      >
                        <Text style={styles.jobAppliedTitle} numberOfLines={1}>
                          Applied for: <Text style={styles.jobAppliedLinkText}>{item.job_title}</Text>
                        </Text>
                        <ExternalLink size={11} color="#1764E8" style={{ marginLeft: 4 }} />
                      </TouchableOpacity>

                      {item.candidate_phone && (
                        <View style={styles.metaRow}>
                          <Phone size={12} color="#64748B" />
                          <Text style={styles.metaText}>{item.candidate_phone}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Venue / Location Row */}
                  {item.venue_address && (
                    <View style={styles.venueRow}>
                      <MapPin size={13} color="#64748B" style={{ marginTop: 2 }} />
                      <Text style={styles.venueText} numberOfLines={2}>
                        {item.venue_address}
                      </Text>
                    </View>
                  )}

                  {/* Star Rating Display if Interviewed */}
                  {isCompleted && item.interview_rating !== undefined && item.interview_rating !== null && (
                    <View style={styles.ratingDisplayBlock}>
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            size={14}
                            color={star <= Number(item.interview_rating) ? '#F59E0B' : '#CBD5E1'}
                            fill={star <= Number(item.interview_rating) ? '#F59E0B' : 'transparent'}
                          />
                        ))}
                        <Text style={styles.ratingScoreText}>({item.interview_rating}/5)</Text>
                      </View>
                      {item.interview_feedback && (
                        <Text style={styles.feedbackSnippet} numberOfLines={1}>
                          "{item.interview_feedback}"
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Postponed Reason Display */}
                  {isPostponed && item.postponed_reason && (
                    <View style={styles.postponedNotice}>
                      <AlertCircle size={12} color="#D97706" />
                      <Text style={styles.postponedReasonText} numberOfLines={1}>
                        Rescheduled: {item.postponed_reason}
                      </Text>
                    </View>
                  )}

                  <View style={styles.sectionSeparator} />

                  {/* Card Action Footer */}
                  <View style={styles.cardFooterRow}>
                    <View style={styles.quickActionIcons}>
                      {item.candidate_phone && (
                        <TouchableOpacity
                          style={styles.quickIconBtn}
                          onPress={() => handleCallCandidate(item.candidate_phone)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          activeOpacity={0.7}
                        >
                          <Phone size={16} color="#1764E8" />
                        </TouchableOpacity>
                      )}
                      {item.candidate_phone && (
                        <TouchableOpacity
                          style={styles.quickIconBtn}
                          onPress={() => handleWhatsAppCandidate(item.candidate_phone, item.candidate_name)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          activeOpacity={0.7}
                        >
                          <WhatsAppIcon size={16} />
                        </TouchableOpacity>
                      )}
                      {item.venue_address && (
                        <TouchableOpacity
                          style={styles.quickIconBtn}
                          onPress={() => handleOpenMap(item.venue_address, item.maps_link)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          activeOpacity={0.7}
                        >
                          <Navigation2 size={16} color="#334155" />
                        </TouchableOpacity>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.actionCtaBtn}
                      activeOpacity={0.8}
                      onPress={() => handleOpenDetailModal(item)}
                    >
                      <Text style={styles.actionCtaText}>
                        {isCompleted ? 'View Evaluation' : 'Evaluate & Update'}
                      </Text>
                      <ChevronRight size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Detail & Evaluation Action Modal */}
      <Modal
        visible={isDetailModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsDetailModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Interview Evaluation</Text>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => {
                    if (selectedInterview?.job_id) {
                      setIsDetailModalOpen(false);
                      navigation.navigate('CandidateJobDetail', {
                        jobId: selectedInterview.job_id,
                        job: {
                          ...selectedInterview,
                          id: selectedInterview.job_id,
                          title: selectedInterview.job_title,
                          job_title: selectedInterview.job_title,
                          company: (selectedInterview as any).company_name || user?.companyName || user?.company_name || 'Industrial Partner',
                          location: selectedInterview.venue_address,
                        },
                      });
                    }
                  }}
                  style={styles.modalJobLinkRow}
                >
                  <Text style={styles.modalJobSubtitleText} numberOfLines={1}>
                    {selectedInterview?.job_title || 'Position'}
                  </Text>
                  <ExternalLink size={11} color="#1764E8" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => setIsDetailModalOpen(false)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Candidate Bio & Details */}
              <View style={styles.modalCandidateBlock}>
                <View style={[styles.avatarLargeCircle, { overflow: 'hidden' }]}>
                  {selectedInterview?.candidate_avatar && (selectedInterview.candidate_avatar.startsWith('http') || selectedInterview.candidate_avatar.startsWith('data:') || selectedInterview.candidate_avatar.startsWith('/')) ? (
                    <Image source={{ uri: selectedInterview.candidate_avatar }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <Text style={styles.avatarLargeInitials}>
                      {(selectedInterview?.candidate_name || 'C').charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.modalCandidateName} numberOfLines={1}>
                    {selectedInterview?.candidate_name}
                  </Text>
                  <Text style={styles.modalCandidateTrade}>
                    {selectedInterview?.trade_specialization || 'Skilled Industrial Technician'}
                  </Text>
                  <Text style={styles.modalCandidateContact}>
                    {selectedInterview?.candidate_phone} • {selectedInterview?.candidate_email}
                  </Text>
                </View>
              </View>

              {/* Action Buttons: Resume, Call, WhatsApp */}
              <View style={styles.contactActionsRow}>
                {selectedInterview?.candidate_resume && (
                  <TouchableOpacity
                    style={styles.contactActionBtn}
                    onPress={() => handleViewResume(selectedInterview.candidate_resume)}
                  >
                    <FileText size={14} color="#1764E8" />
                    <Text style={styles.contactActionText}>Resume</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.contactActionBtn}
                  onPress={() => handleCallCandidate(selectedInterview?.candidate_phone)}
                >
                  <Phone size={14} color="#16A34A" />
                  <Text style={[styles.contactActionText, { color: '#16A34A' }]}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.contactActionBtn}
                  onPress={() => handleWhatsAppCandidate(selectedInterview?.candidate_phone, selectedInterview?.candidate_name)}
                >
                  <WhatsAppIcon size={14} />
                  <Text style={[styles.contactActionText, { color: '#10B981' }]}>WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.contactActionBtn}
                  onPress={() => handleOpenMap(selectedInterview?.venue_address, selectedInterview?.maps_link)}
                >
                  <Navigation2 size={14} color="#334155" />
                  <Text style={[styles.contactActionText, { color: '#334155' }]}>Venue</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sectionSeparator} />

              {/* Current Schedule Summary */}
              <View style={styles.scheduleInfoBox}>
                <Text style={styles.scheduleInfoHeading}>SCHEDULED INTERVIEW TIME & VENUE</Text>
                <View style={styles.scheduleInfoRow}>
                  <Calendar size={14} color="#1764E8" />
                  <Text style={styles.scheduleInfoText}>
                    Date: <Text style={{ fontWeight: '700' }}>{formatDate(selectedInterview?.interview_date || '')}</Text>
                  </Text>
                </View>
                <View style={styles.scheduleInfoRow}>
                  <Clock size={14} color="#1764E8" />
                  <Text style={styles.scheduleInfoText}>
                    Time: <Text style={{ fontWeight: '700' }}>{selectedInterview?.interview_time || '10:00 AM'}</Text>
                  </Text>
                </View>
                {selectedInterview?.venue_address && (
                  <View style={styles.scheduleInfoRow}>
                    <MapPin size={14} color="#64748B" />
                    <Text style={styles.scheduleInfoText} numberOfLines={2}>
                      {selectedInterview.venue_address}
                    </Text>
                  </View>
                )}
              </View>

              {/* Reschedule View vs Evaluation View */}
              {isRescheduling ? (
                <View style={styles.rescheduleSection}>
                  <View style={styles.rescheduleHeaderRow}>
                    <Text style={styles.rescheduleSectionTitle}>Reschedule / Postpone Interview</Text>
                    <TouchableOpacity onPress={() => setIsRescheduling(false)}>
                      <Text style={styles.cancelRescheduleText}>Back to Evaluation</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.fieldLabel}>Select New Date *</Text>
                  <DatePickerField
                    value={rescheduleDate}
                    onChange={(d) => setRescheduleDate(d)}
                    placeholder="Choose New Date"
                    minDate={new Date()}
                  />

                  <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Select New Time *</Text>
                  <TouchableOpacity
                    style={styles.timePickerButton}
                    onPress={() => setIsTimePickerOpen(true)}
                  >
                    <Clock size={16} color="#1764E8" />
                    <Text style={[styles.timePickerText, !rescheduleTime && { color: '#94A3B8' }]}>
                      {rescheduleTime || 'Select Time (e.g. 11:30 AM)'}
                    </Text>
                  </TouchableOpacity>

                  <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Updated Venue / Address</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Industrial Plant Main Gate or Office Address"
                    placeholderTextColor="#94A3B8"
                    value={rescheduleVenue}
                    onChangeText={setRescheduleVenue}
                  />

                  <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Updated Google Maps Link</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. https://maps.app.goo.gl/... or https://maps.google.com/..."
                    placeholderTextColor="#94A3B8"
                    value={rescheduleMapsLink}
                    onChangeText={setRescheduleMapsLink}
                    autoCapitalize="none"
                    keyboardType="url"
                  />

                  <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Reason for Rescheduling (Included in Email)</Text>
                  <TextInput
                    style={[styles.textInput, { height: 60 }]}
                    placeholder="e.g. Plant technical rounds postponed by interviewer"
                    placeholderTextColor="#94A3B8"
                    multiline
                    value={rescheduleReason}
                    onChangeText={setRescheduleReason}
                  />

                  <TouchableOpacity
                    style={styles.submitRescheduleBtn}
                    onPress={handleConfirmReschedule}
                    disabled={submittingReschedule}
                  >
                    {submittingReschedule ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <RotateCcw size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.submitBtnText}>Confirm Reschedule & Send Email</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.evaluationSection}>
                  <Text style={styles.sectionHeaderTitle}>CANDIDATE INTERVIEW RATING</Text>

                  {/* 5-Star Interactive Rating */}
                  <View style={styles.starRatingContainer}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <TouchableOpacity
                        key={star}
                        style={styles.starTouchTarget}
                        onPress={() => setRating(star)}
                        activeOpacity={0.7}
                      >
                        <Star
                          size={32}
                          color={star <= rating ? '#F59E0B' : '#CBD5E1'}
                          fill={star <= rating ? '#F59E0B' : 'transparent'}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.ratingLabel}>
                    {rating === 5 && 'Outstanding candidate performance'}
                    {rating === 4 && 'Good technical fit & skills'}
                    {rating === 3 && 'Average fit, potential training needed'}
                    {rating === 2 && 'Below requirements'}
                    {rating === 1 && 'Not suitable for role'}
                  </Text>

                  {/* Interview Remarks / Feedback */}
                  <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
                    Interview Notes & Evaluation Remarks
                  </Text>
                  <TextInput
                    style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                    placeholder="Enter observations regarding technical skills, trade knowledge, and salary alignment..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    value={feedback}
                    onChangeText={setFeedback}
                  />

                  {/* Action Buttons */}
                  <View style={styles.modalActionButtonsRow}>
                    <TouchableOpacity
                      style={styles.markInterviewedBtn}
                      onPress={handleMarkInterviewed}
                      disabled={submittingRating}
                    >
                      {submittingRating ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <CheckCircle2 size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                          <Text style={styles.submitBtnText}>Mark as Interviewed</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.postponeTriggerBtn}
                      onPress={() => setIsRescheduling(true)}
                    >
                      <RotateCcw size={15} color="#D97706" style={{ marginRight: 6 }} />
                      <Text style={styles.postponeTriggerText}>Postpone / Reschedule</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Clock Time Picker Modal */}
      <ClockTimePickerModal
        visible={isTimePickerOpen}
        initialTime={rescheduleTime || '10:30 AM'}
        onSelectTime={(t: string) => {
          setRescheduleTime(t);
          setIsTimePickerOpen(false);
        }}
        onClose={() => setIsTimePickerOpen(false)}
      />

      {/* Resume PDF Viewer Modal */}
      <ResumePdfViewerModal
        visible={isResumeModalOpen}
        pdfUrl={resumeViewerUrl}
        candidateName={selectedInterview?.candidate_name || 'Candidate'}
        onClose={() => setIsResumeModalOpen(false)}
      />

      {/* Branded Theme Evaluation / Action Success Modal */}
      <SuccessModal
        visible={successModalVisible}
        onClose={() => setSuccessModalVisible(false)}
        title={successModalData.title}
        message={successModalData.message}
        buttonText="Done"
      />

      {/* Job Selection Dropdown Bottom Sheet Modal */}
      <Modal
        visible={jobDropdownOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setJobDropdownOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setJobDropdownOpen(false)}>
          <View style={styles.jobDropdownOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.jobDropdownSheet}>
                <View style={styles.jobDropdownHandle} />

                <View style={styles.jobDropdownHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.jobDropdownHeaderTitle}>Filter by Job Posting</Text>
                    <Text style={styles.jobDropdownHeaderSubtitle}>
                      Show scheduled interviews for a specific vacancy
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.jobDropdownCloseBtn}
                    onPress={() => setJobDropdownOpen(false)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <X size={16} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
                  {/* Option: All Job Postings */}
                  <TouchableOpacity
                    style={[
                      styles.jobDropdownOptionItem,
                      selectedJobId === 'ALL' && styles.jobDropdownOptionItemActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedJobId('ALL');
                      setJobDropdownOpen(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.jobDropdownOptionTitle,
                          selectedJobId === 'ALL' && styles.jobDropdownOptionTitleActive,
                        ]}
                      >
                        All Job Postings
                      </Text>
                      <Text style={styles.jobDropdownOptionMeta}>
                        {upcomingList.length + pastList.length} total scheduled interview{upcomingList.length + pastList.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    {selectedJobId === 'ALL' && (
                      <CheckCircle2 size={18} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>

                  {/* Individual Job Postings */}
                  {availableJobs.map((j) => {
                    const isSelected = String(selectedJobId) === String(j.id);
                    return (
                      <TouchableOpacity
                        key={j.id}
                        style={[
                          styles.jobDropdownOptionItem,
                          isSelected && styles.jobDropdownOptionItemActive,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedJobId(j.id);
                          setJobDropdownOpen(false);
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.jobDropdownOptionTitle,
                              isSelected && styles.jobDropdownOptionTitleActive,
                            ]}
                            numberOfLines={1}
                          >
                            {j.title}
                          </Text>
                          <Text style={styles.jobDropdownOptionMeta}>
                            {j.count} scheduled interview{j.count !== 1 ? 's' : ''}
                          </Text>
                        </View>
                        {isSelected && (
                          <CheckCircle2 size={18} color={COLORS.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  tabButtonText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#1764E8',
    fontWeight: '700',
  },
  tabBadge: {
    backgroundColor: '#CBD5E1',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: '#1764E8',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  tabBadgeTextActive: {
    color: '#FFFFFF',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 4,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyStateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  interviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  cardTopHeader: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusCompletedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusCompletedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  statusPostponedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPostponedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  statusTodayBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusTodayText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  statusTomorrowBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusTomorrowText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1764E8',
  },
  statusUpcomingBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusUpcomingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 8,
  },
  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1764E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  candidateDetails: {
    flex: 1,
    minWidth: 0,
  },
  candidateNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  candidateName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    flexShrink: 1,
  },
  tradeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tradeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1764E8',
  },
  jobAppliedLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  jobAppliedTitle: {
    fontSize: 12,
    color: '#64748B',
  },
  jobAppliedLinkText: {
    fontWeight: '700',
    color: '#1764E8',
    textDecorationLine: 'underline',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  metaText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  venueText: {
    flex: 1,
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
  },
  ratingDisplayBlock: {
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingScoreText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#B45309',
    marginLeft: 4,
  },
  feedbackSnippet: {
    fontSize: 11,
    color: '#78350F',
    marginTop: 3,
    fontStyle: 'italic',
  },
  postponedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  postponedReasonText: {
    flex: 1,
    fontSize: 11,
    color: '#B45309',
    fontWeight: '600',
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickActionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickIconBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  actionCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1764E8',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    gap: 4,
  },
  actionCtaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalJobLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  modalJobSubtitleText: {
    fontSize: 12,
    color: '#1764E8',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalCandidateBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatarLargeCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1764E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLargeInitials: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalCandidateName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCandidateTrade: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1764E8',
    marginTop: 2,
  },
  modalCandidateContact: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  contactActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  contactActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactActionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1764E8',
  },
  scheduleInfoBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    marginBottom: 14,
  },
  scheduleInfoHeading: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  scheduleInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleInfoText: {
    fontSize: 12.5,
    color: '#334155',
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  evaluationSection: {
    marginTop: 4,
  },
  starRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  starTouchTarget: {
    padding: 4,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
    marginTop: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  modalActionButtonsRow: {
    marginTop: 18,
    gap: 10,
  },
  markInterviewedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    borderRadius: 8,
  },
  postponeTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
    paddingVertical: 10,
    borderRadius: 8,
  },
  postponeTriggerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
  submitBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rescheduleSection: {
    backgroundColor: '#FFFBEB',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  rescheduleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rescheduleSectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#92400E',
  },
  cancelRescheduleText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1764E8',
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  timePickerText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  submitRescheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D97706',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },

  /* Job Posting Dropdown Filter Trigger Styles */
  jobFilterWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  jobDropdownTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  jobDropdownTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  jobFilterIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  jobDropdownLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  jobDropdownSelectedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  jobDropdownChevronBox: {
    paddingLeft: 4,
  },

  /* Job Dropdown Bottom Sheet Modal Styles */
  jobDropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  jobDropdownSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 28,
    width: '100%',
  },
  jobDropdownHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 12,
  },
  jobDropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  jobDropdownHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  jobDropdownHeaderSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  jobDropdownCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobDropdownOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 6,
  },
  jobDropdownOptionItemActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  jobDropdownOptionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  jobDropdownOptionTitleActive: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  jobDropdownOptionMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  /* Past & Evaluated Section: Export Excel Bar Styles */
  exportSectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DCFCE7',
  },
  exportSectionLeft: {
    flex: 1,
    paddingRight: 10,
  },
  exportSectionCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  exportSectionJobScopeText: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 1,
  },
  exportExcelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  exportExcelButtonDisabled: {
    backgroundColor: '#94A3B8',
    elevation: 0,
    shadowOpacity: 0,
  },
  exportExcelButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  exportSectionBarUpcoming: {
    backgroundColor: '#EFF6FF',
    borderBottomColor: '#DBEAFE',
  },
  exportSectionCountTextUpcoming: {
    color: '#1E40AF',
  },
  exportSectionJobScopeTextUpcoming: {
    color: '#2563EB',
  },
  exportExcelButtonUpcoming: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
  },
});
