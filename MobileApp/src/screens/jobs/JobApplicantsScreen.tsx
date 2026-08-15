import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  RefreshControl,
  Alert,
  Linking,
  FlatList,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  User as UserIcon,
  Search,
  Phone,
  Mail,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  Send,
  Clock,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ShieldCheck,
  Building2,
  MapPin,
  Briefcase,
  Zap,
  GraduationCap,
  MessageSquare,
  X,
  Award,
  UserCheck,
  IndianRupee,
  Check,
  Eye,
} from 'lucide-react-native';
import { applicantsApi } from '../../api/applicantsApi';
import { jobsApi } from '../../api/jobsApi';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon';
import { ResumePdfViewerModal } from '../../components/common/ResumePdfViewerModal';
import { ClockTimePickerModal } from '../../components/common/ClockTimePickerModal';
import { JobApplication, ApplicationStatus, Job } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Header } from '../../components/common/Header';
import { JobCardSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

interface Props {
  route: any;
  navigation: any;
}

type TabType = 'ALL' | 'applied' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected';
type ModalTabType = 'CANDIDATE' | 'JOB' | 'STATUS' | 'INTERVIEW' | 'EMAIL';

const safeValue = (val?: any): string => {
  if (val === null || val === undefined || val === '') return 'Not Provided';
  if (typeof val === 'string') return val.trim().length > 0 && val !== '[object Object]' && val !== 'object Object' ? val : 'Not Provided';
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);

  if (Array.isArray(val)) {
    if (val.length === 0) return 'Not Provided';
    const items = val.map((item) => safeValue(item)).filter((x) => x && x !== 'Not Provided' && x !== '[object Object]' && x !== 'object Object');
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

const APPLICANT_SEARCH_SUGGESTIONS = [
  'Search by Trade Type (e.g. VMC Operator, Fitter)...',
  'Search by Role (e.g. Quality Inspector, Turner)...',
  'Search Locality (e.g. Waluj MIDC, Chitegaon)...',
  'Search by Shift (e.g. Day Shift, Rotational)...',
  'Search by Industry (e.g. Automotive, Electronics)...',
  'Search by Skills (e.g. CNC, Vernier, AutoCAD)...',
  'Search Candidates by Name or Phone...',
];

const EMAIL_TEMPLATES = [
  {
    key: 'INTERVIEW',
    label: 'Interview Invitation',
    desc: 'Invite candidate for in-person or video interview',
    subject: (title: string) => `Interview Invitation: ${title}`,
    message: (name: string, title: string) =>
      `Dear ${name},\n\nWe are pleased to invite you for an interview for the ${title} position. Please review the scheduled details and reply to confirm your availability.\n\nBest regards,\nRecruitment Team`,
  },
  {
    key: 'DOCUMENT',
    label: 'Document Verification Request',
    desc: 'Request ITI certificates, marksheets, Aadhaar & bank details',
    subject: (title: string) => `Document Verification Request: ${title}`,
    message: (name: string, title: string) =>
      `Dear ${name},\n\nTo process your application for ${title}, please submit copies of your ITI/Diploma Trade Certificate, Aadhaar Card, PAN Card, and latest bank passbook.\n\nBest regards,\nRecruitment Team`,
  },
  {
    key: 'OFFER',
    label: 'Job Offer Letter',
    desc: 'Extend official job offer with salary & joining details',
    subject: (title: string) => `Job Offer Letter: ${title}`,
    message: (name: string, title: string) =>
      `Dear ${name},\n\nWe are delighted to extend a formal job offer for the position of ${title}. Please find your offer terms enclosed and reply to confirm your acceptance.\n\nBest regards,\nRecruitment Team`,
  },
  {
    key: 'SHORTLIST',
    label: 'Profile Shortlisted Notification',
    desc: 'Inform candidate that their application is shortlisted',
    subject: (title: string) => `Application Update: Shortlisted for ${title}`,
    message: (name: string, title: string) =>
      `Dear ${name},\n\nCongratulations! Your profile has been shortlisted for the ${title} position. Our hiring manager is currently scheduling the interview rounds and we will reach out shortly.\n\nBest regards,\nRecruitment Team`,
  },
  {
    key: 'PRACTICAL',
    label: 'Trade / Practical Test Invite',
    desc: 'Invite for VMC/CNC/Fitter machine practical assessment',
    subject: (title: string) => `Practical Trade Test Invitation: ${title}`,
    message: (name: string, title: string) =>
      `Dear ${name},\n\nYou are invited to complete a practical trade test for the ${title} role at our plant facility. Please bring safety shoes and original trade credentials.\n\nBest regards,\nRecruitment Team`,
  },
  {
    key: 'JOINING',
    label: 'Onboarding & Joining Instructions',
    desc: 'Provide day 1 reporting time, location & safety rules',
    subject: (title: string) => `Joining & Onboarding Instructions: ${title}`,
    message: (name: string, title: string) =>
      `Dear ${name},\n\nWelcome to the team! Your joining date is confirmed. Please report to Main Security Gate at 09:00 AM on your joining date with original ID proofs.\n\nBest regards,\nHuman Resources`,
  },
  {
    key: 'REJECT',
    label: 'Application Regret Letter',
    desc: 'Inform candidate application is not moving forward',
    subject: (title: string) => `Application Status Update: ${title}`,
    message: (name: string, title: string) =>
      `Dear ${name},\n\nThank you for taking the time to apply for the ${title} role. Although your profile is impressive, we have chosen to move forward with candidates whose qualifications more closely match our immediate requirements.\n\nBest regards,\nRecruitment Team`,
  },
];

export const JobApplicantsScreen: React.FC<Props> = ({ route, navigation }) => {
  const jobId = route?.params?.jobId;
  const jobTitle = route?.params?.jobTitle || 'Job Applicants';

  const [applicants, setApplicants] = useState<JobApplication[]>([]);
  const [jobDetails, setJobDetails] = useState<Job | null>(null);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('ALL');
  const [jobDropdownVisible, setJobDropdownVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  // 1 Second (1000ms) Rotating Placeholder Timer
  useEffect(() => {
    if (searchQuery) return;
    const interval = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % APPLICANT_SEARCH_SUGGESTIONS.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [searchQuery]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployerJobs = async () => {
      try {
        const res = await jobsApi.getMyJobs();
        if (res.success && Array.isArray(res.data)) {
          setMyJobs(res.data);
        }
      } catch (e) {
        // fallback
      }
    };
    fetchEmployerJobs();
  }, []);

  // Modal States
  const [selectedApplicant, setSelectedApplicant] = useState<JobApplication | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [modalTab, setModalTab] = useState<ModalTabType>('CANDIDATE');

  // Interview Form States
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('10:00 AM');
  const [interviewMode, setInterviewMode] = useState('In-Person Walk-in');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [currentPickerMonth, setCurrentPickerMonth] = useState(new Date());

  const getDaysInMonthGrid = (dateObj: Date) => {
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: ({ day: number; dateStr: string; isPast: boolean } | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    for (let d = 1; d <= totalDays; d++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;
      const isPast = dateStr < todayStr;
      days.push({ day: d, dateStr, isPast });
    }
    return days;
  };
  const [interviewLocation, setInterviewLocation] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');

  // Email Form States
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [templateDropdownVisible, setTemplateDropdownVisible] = useState(false);
  const [selectedTemplateLabel, setSelectedTemplateLabel] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const fetchApplicants = useCallback(async () => {
    setError(null);
    try {
      if (jobId) {
        try {
          const jobRes = await jobsApi.getJobById(jobId);
          if (jobRes.success && jobRes.data) {
            setJobDetails(jobRes.data);
          }
        } catch (e) {
          // ignore job fetch error
        }

        const res = await applicantsApi.getApplicantsForJob(jobId);
        if (res.success && Array.isArray(res.data)) {
          const mapped = res.data.map((item: any) => ({
            id: item.id || `app-${item.userId || item.user_id}-${jobId}`,
            user_id: item.userId || item.user_id,
            job_id: jobId,
            status: (item.status || 'applied').toLowerCase(),
            applied_at: item.appliedAt || item.applied_at || item.createdAt || new Date().toISOString(),
            user: {
              id: item.userId || item.user_id,
              name: item.name || 'Candidate',
              email: item.email || '',
              phone: item.phone || '',
              role: 'candidate' as const,
              headline: item.headline || item.tradeSpecialization || item.trade_specialization || 'Candidate',
              location: item.location || 'Not Specified',
              experience: item.experience || 'Not Specified',
              skills: Array.isArray(item.skills) ? item.skills : [],
              profilePictureUrl: item.profilePictureUrl || item.profile_picture_url,
              aadhaar_verified: !!item.aadhaarVerified || !!item.aadhaar_verified,
              education: item.education || 'Not Specified',
              resume_url: item.resume_url || item.resumeUrl || item.resume,
            }
          }));
          setApplicants(mapped);
          return;
        }
      } else {
        const myJobsRes = await jobsApi.getMyJobs();
        if (myJobsRes.success && Array.isArray(myJobsRes.data)) {
          setMyJobs(myJobsRes.data);
          const allApps: any[] = [];

          // Fetch real applicants for each posted job in parallel via live Render backend API
          const appPromises = myJobsRes.data.map(async (j: any) => {
            try {
              const res = await applicantsApi.getApplicantsForJob(j.id);
              if (res.success && Array.isArray(res.data)) {
                return res.data.map((item: any) => ({
                  id: item.id || `app-${item.userId || item.user_id}-${j.id}`,
                  user_id: item.userId || item.user_id,
                  job_id: j.id,
                  status: (item.status || 'applied').toLowerCase(),
                  applied_at: item.appliedAt || item.applied_at || item.createdAt || new Date().toISOString(),
                  job: j,
                  user: {
                    id: item.userId || item.user_id,
                    name: item.name || 'Candidate',
                    email: item.email || '',
                    phone: item.phone || '',
                    role: 'candidate' as const,
                    headline: item.headline || item.tradeSpecialization || item.trade_specialization || 'Candidate',
                    location: item.location || 'Not Specified',
                    experience: item.experience || 'Not Specified',
                    skills: Array.isArray(item.skills) ? item.skills : [],
                    profilePictureUrl: item.profilePictureUrl || item.profile_picture_url,
                    aadhaar_verified: !!item.aadhaarVerified || !!item.aadhaar_verified,
                    education: item.education || 'Not Specified',
                    resume_url: item.resume_url || item.resumeUrl || item.resume,
                  }
                }));
              }
            } catch (e) {
              console.log('Error fetching applicants for job:', j.id, e);
            }
            return [];
          });

          const results = await Promise.all(appPromises);
          results.forEach((apps) => allApps.push(...apps));

          setApplicants(allApps);
          return;
        }
      }
      setApplicants([]);
    } catch (err: any) {
      setApplicants([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const onRefresh = () => {
    setRefreshing(true);
    setSearchQuery('');
    setActiveTab('ALL');
    setSelectedJobId('ALL');
    fetchApplicants();
  };

  const handleUpdateStatus = async (userId: string, newStatus: ApplicationStatus, targetJobId?: string) => {
    try {
      const activeJobId = targetJobId || selectedApplicant?.job_id || (selectedApplicant as any)?.jobId || jobId;
      if (!activeJobId) {
        Alert.alert('Error', 'Target job ID is required to update candidate status.');
        return;
      }

      const res = await applicantsApi.updateApplicantStatus(activeJobId, userId, newStatus);
      if (res && res.success) {
        setApplicants((prev) =>
          prev.map((app) => (app.user_id === userId || (app as any).userId === userId ? { ...app, status: newStatus } : app))
        );
        if (selectedApplicant && (selectedApplicant.user_id === userId || (selectedApplicant as any).userId === userId)) {
          setSelectedApplicant((prev) => (prev ? { ...prev, status: newStatus } : prev));
        }

        const isInterviewStatus = newStatus === 'interview' || newStatus === 'interviewed';

        if (isInterviewStatus) {
          // Instantly navigate employer to the INTERVIEW modal tab to fill in interview details
          setModalTab('INTERVIEW');
          Alert.alert(
            'Status Updated',
            'Candidate status changed to INTERVIEW. Fill in the interview date, time, and venue details below.',
            [
              {
                text: 'Set Interview Details',
                onPress: () => setModalTab('INTERVIEW'),
              },
            ]
          );
        } else {
          Alert.alert('Status Updated', `Candidate status changed to "${newStatus.toUpperCase()}".`);
        }
      } else {
        const errorMsg = res?.message || res?.error || 'Failed to update applicant status on live backend.';
        Alert.alert('Backend Update Failed', errorMsg);
      }
    } catch (err: any) {
      console.log('Error updating applicant status on live backend:', err);
      Alert.alert('Error', err.message || 'Failed to update candidate status on live backend.');
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedApplicant) return;
    if (!interviewDate) {
      Alert.alert('Validation Error', 'Please enter the interview date.');
      return;
    }
    const targetJobId = selectedApplicant?.job_id || (selectedApplicant as any)?.jobId || jobId;
    if (!targetJobId) {
      Alert.alert('Error', 'Target job ID is required to schedule interview.');
      return;
    }

    setModalLoading(true);
    try {
      const venue = interviewLocation.trim() || 'Industrial Plant Main Gate';
      const res = await applicantsApi.scheduleInterview(targetJobId, selectedApplicant.user_id, {
        interviewDate,
        interviewTime: interviewTime || '10:00 AM',
        venueAddress: venue,
        interviewLocation: venue,
        interviewMode,
        notes: interviewNotes,
      });

      if (res && res.success) {
        setDetailModalVisible(false);
        setActiveTab('interviewed');
        Alert.alert(
          'Interview Scheduled',
          'Interview invite successfully recorded and sent to candidate.',
          [
            {
              text: 'OK',
              onPress: () => {
                setDetailModalVisible(false);
                setActiveTab('interviewed');
              },
            },
          ]
        );
      } else {
        const errorMsg = res?.message || res?.error || 'Failed to schedule interview on backend.';
        Alert.alert('Scheduling Error', errorMsg);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to schedule interview on live backend.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleSendCustomEmail = async () => {
    if (!selectedApplicant) return;
    if (!emailSubject || !emailMessage) {
      Alert.alert('Validation Error', 'Please enter both Subject and Message body.');
      return;
    }
    setModalLoading(true);
    try {
      if (jobId) {
        await applicantsApi.sendCustomEmail(jobId, selectedApplicant.user_id, {
          subject: emailSubject,
          message: emailMessage,
        });
      }
      setEmailSubject('');
      setEmailMessage('');
      Alert.alert('Custom Email Sent', `Email successfully sent to ${selectedApplicant.user?.email || 'candidate'}.`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send custom email.');
    } finally {
      setModalLoading(false);
    }
  };

  const openApplicantModal = (applicant: JobApplication) => {
    setSelectedApplicant(applicant);
    setModalTab('JOB');
    setEmailSubject(`Update regarding your application for ${jobTitle}`);
    setEmailMessage(
      `Dear ${applicant.user?.name || 'Candidate'},\n\nThank you for applying for the ${jobTitle} position at our company. We have reviewed your profile and would like to proceed with the next steps.\n\nBest regards,\nRecruitment Team`
    );
    setDetailModalVisible(true);
  };

  const applyEmailTemplate = (templateType: 'INTERVIEW' | 'DOCUMENT' | 'OFFER') => {
    if (templateType === 'INTERVIEW') {
      setEmailSubject(`Interview Invitation: ${jobTitle}`);
      setEmailMessage(
        `Dear Candidate,\n\nYou have been shortlisted for an interview for the ${jobTitle} position. Please confirm your availability.\n\nBest regards,\nRecruitment Team`
      );
    } else if (templateType === 'DOCUMENT') {
      setEmailSubject(`Document Verification: ${jobTitle}`);
      setEmailMessage(
        `Dear Candidate,\n\nPlease provide your ITI/Diploma Certificate and Aadhaar Card for verification.\n\nBest regards,\nRecruitment Team`
      );
    } else if (templateType === 'OFFER') {
      setEmailSubject(`Job Offer: ${jobTitle}`);
      setEmailMessage(
        `Dear Candidate,\n\nWe are pleased to extend a job offer for the role of ${jobTitle}. Please reply to confirm your acceptance.\n\nBest regards,\nRecruitment Team`
      );
    }
  };

  const filteredApplicants = applicants.filter((app) => {
    // 1. Job Selection Filter (Dropdown)
    if (selectedJobId !== 'ALL' && app.job_id && app.job_id !== selectedJobId) {
      return false;
    }

    // 2. Status Tab Filter
    let matchesTab = activeTab === 'ALL';
    if (!matchesTab) {
      const appStatus = (app.status || 'applied').toLowerCase();
      if (activeTab === 'applied') {
        matchesTab = appStatus === 'applied' || appStatus === 'pending' || appStatus === 'submitted' || appStatus === 'received' || !app.status;
      } else if (activeTab === 'interviewed') {
        matchesTab = appStatus === 'interviewed' || appStatus === 'interview' || appStatus === 'interview_scheduled' || appStatus === 'scheduled';
      } else {
        matchesTab = appStatus === activeTab;
      }
    }
    if (!matchesTab) return false;

    // 2. Real-Time Search Filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const name = safeValue(app.user?.name).toLowerCase();
    const trade = safeValue(app.user?.headline || app.user?.trade_specialization).toLowerCase();
    const loc = safeValue(app.user?.location).toLowerCase();
    const exp = safeValue(app.user?.experience).toLowerCase();
    const skills = (app.user?.skills || []).join(' ').toLowerCase();
    const phone = (app.user?.phone || '').toLowerCase();
    const email = (app.user?.email || '').toLowerCase();

    return (
      name.includes(q) ||
      trade.includes(q) ||
      loc.includes(q) ||
      exp.includes(q) ||
      skills.includes(q) ||
      phone.includes(q) ||
      email.includes(q)
    );
  });

  const renderApplicantItem = ({ item }: { item: JobApplication }) => {
    const candidateName = safeValue(item.user?.name);
    const candidateTrade = safeValue(item.user?.headline || item.user?.trade_specialization);
    const candidateLocation = safeValue(item.user?.location);
    const candidateExp = safeValue(item.user?.experience);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => openApplicantModal(item)}
        style={styles.candidateCard}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.avatarBox}>
            {item.user?.profilePictureUrl || item.user?.profile_picture_url ? (
              <Image
                source={{ uri: item.user?.profilePictureUrl || item.user?.profile_picture_url }}
                style={styles.avatarImg}
              />
            ) : (
              <UserIcon size={20} color={COLORS.primary} />
            )}
          </View>

          <View style={styles.headerTextCol}>
            <View style={styles.titleBadgeRow}>
              <Text style={styles.candidateName} numberOfLines={1}>
                {candidateName}
              </Text>
              <Badge status={item.status} />
            </View>

            <Text style={styles.candidateTrade} numberOfLines={1}>
              {candidateTrade}
            </Text>

            <View style={styles.metaPillRow}>
              <View style={styles.inlineIconTextItem}>
                <Briefcase size={12} color={COLORS.primary} />
                <Text style={styles.candidateMetaTextInline} numberOfLines={1}>
                  {candidateExp}
                </Text>
              </View>
            </View>
          </View>

          <ChevronRight size={18} color={COLORS.slate400} style={{ marginLeft: 4 }} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="JobMarket" subtitle="Industrial & Factory Jobs" showBack={false} />

      {/* Real-Time Search Bar */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBarContainer}>
          <Search size={16} color={COLORS.slate400} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={APPLICANT_SEARCH_SUGGESTIONS[suggestionIndex]}
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7} style={{ padding: 4 }}>
              <X size={16} color={COLORS.slate400} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filter Tabs Bar - Industry Grade */}
      <View style={styles.tabsBarWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
          {/* Job Selection Dropdown Pill in place of All */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setJobDropdownVisible(true)}
            style={[
              styles.industryTabPill,
              selectedJobId !== 'ALL' && styles.industryTabPillActive,
            ]}
          >
            <Text
              style={[
                styles.industryTabText,
                selectedJobId !== 'ALL' && styles.industryTabTextActive,
              ]}
              numberOfLines={1}
            >
              {selectedJobId === 'ALL'
                ? 'All Jobs'
                : (myJobs.find((j) => j.id === selectedJobId)?.title?.replace(/^job-[\d]+$/i, 'Selected Job') || 'Selected Job')}
            </Text>
            <ChevronDown size={14} color={selectedJobId !== 'ALL' ? COLORS.primary : '#64748B'} />
          </TouchableOpacity>

          {[
            { key: 'ALL', label: 'All' },
            { key: 'applied', label: 'Applied' },
            { key: 'shortlisted', label: 'Shortlisted' },
            { key: 'interviewed', label: 'Interviewed' },
            { key: 'hired', label: 'Hired' },
            { key: 'rejected', label: 'Rejected' },
          ].map((tab) => {
            const isSelected = activeTab === tab.key;
            const count = tab.key === 'ALL'
              ? applicants.length
              : applicants.filter((a) => {
                  const s = (a.status || 'applied').toLowerCase();
                  if (tab.key === 'applied') {
                    return s === 'applied' || s === 'pending' || s === 'submitted' || s === 'received' || !a.status;
                  }
                  if (tab.key === 'interviewed') {
                    return s === 'interviewed' || s === 'interview' || s === 'interview_scheduled' || s === 'scheduled';
                  }
                  return s === tab.key;
                }).length;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab.key as TabType)}
                style={[styles.industryTabPill, isSelected && styles.industryTabPillActive]}
              >
                <Text style={[styles.industryTabText, isSelected && styles.industryTabTextActive]}>
                  {tab.label}
                </Text>
                <View style={[styles.tabCountBadge, isSelected && styles.tabCountBadgeActive]}>
                  <Text style={[styles.tabCountText, isSelected && styles.tabCountTextActive]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Job Selection Dropdown Modal */}
      <Modal visible={jobDropdownVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.dropdownModalOverlay}
          activeOpacity={1}
          onPress={() => setJobDropdownVisible(false)}
        >
          <View style={styles.dropdownModalCard}>
            <View style={styles.dropdownHeaderRow}>
              <Text style={styles.dropdownTitle}>FILTER CANDIDATES BY JOB</Text>
              <TouchableOpacity onPress={() => setJobDropdownVisible(false)} style={{ padding: 4 }}>
                <X size={16} color={COLORS.slate600} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 280 }}>
              {/* Option 1: All Jobs */}
              <TouchableOpacity
                style={[
                  styles.dropdownOptionRow,
                  selectedJobId === 'ALL' && styles.dropdownOptionSelected,
                ]}
                onPress={() => {
                  setSelectedJobId('ALL');
                  setJobDropdownVisible(false);
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dropdownOptionTitle, selectedJobId === 'ALL' && { color: COLORS.primary, fontWeight: '800' }]}>
                    All Jobs (All Posted)
                  </Text>
                  <Text style={styles.dropdownOptionSub}>View candidates across all your posted jobs</Text>
                </View>
                {selectedJobId === 'ALL' ? <CheckCircle2 size={16} color={COLORS.primary} /> : null}
              </TouchableOpacity>

              {/* Option 2..N: Specific Posted Jobs */}
              {myJobs.map((j) => {
                const isCurrent = selectedJobId === j.id;
                return (
                  <TouchableOpacity
                    key={j.id}
                    style={[
                      styles.dropdownOptionRow,
                      isCurrent && styles.dropdownOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedJobId(j.id);
                      setJobDropdownVisible(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.dropdownOptionTitle, isCurrent && { color: COLORS.primary, fontWeight: '800' }]}>
                        {j.title}
                      </Text>
                      <Text style={styles.dropdownOptionSub}>
                        {j.location} • ₹{j.salary_min?.toLocaleString()} - ₹{j.salary_max?.toLocaleString()}
                      </Text>
                    </View>
                    {isCurrent ? <CheckCircle2 size={16} color={COLORS.primary} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {error ? <ErrorBanner message={error} onRetry={fetchApplicants} style={{ marginHorizontal: SPACING.lg }} /> : null}

      {loading ? (
        <View style={{ padding: SPACING.lg }}>
          <JobCardSkeleton />
          <JobCardSkeleton />
        </View>
      ) : filteredApplicants.length === 0 ? (
        <EmptyState
          title="No Applicants Found"
          description={`No candidates in the "${activeTab}" status category yet.`}
        />
      ) : (
        <FlatList
          data={filteredApplicants}
          renderItem={renderApplicantItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={true}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        />
      )}

      {/* Comprehensive Candidate Full Screen View Page with 5-Tab Menu */}
      <Modal visible={detailModalVisible} transparent={false} animationType="slide" onRequestClose={() => setDetailModalVisible(false)}>
        <SafeAreaView style={styles.fullScreenPageContainer} edges={['top', 'bottom']}>
          <View style={{ flex: 1 }}>
            {/* Full Screen Header Bar with Tabular Segmented Menu Inside Below Profile & Name */}
            <View style={styles.fullPageHeader}>
              <View style={styles.fullPageHeaderTopRow}>
                <View style={styles.modalAvatarBox}>
                  {selectedApplicant?.user?.profilePictureUrl || selectedApplicant?.user?.profile_picture_url ? (
                    <Image
                      source={{ uri: selectedApplicant.user.profilePictureUrl || selectedApplicant.user.profile_picture_url }}
                      style={styles.avatarImg}
                    />
                  ) : (
                    <UserIcon size={22} color={COLORS.primary} />
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.modalCandidateName} numberOfLines={1}>
                      {safeValue(selectedApplicant?.user?.name)}
                    </Text>
                    {selectedApplicant?.user?.aadhaar_verified || selectedApplicant?.user?.aadhaarVerified ? (
                      <ShieldCheck size={16} color="#16A34A" />
                    ) : null}
                  </View>

                  <Text style={styles.modalCandidateHeadline} numberOfLines={1}>
                    {safeValue(selectedApplicant?.user?.headline || selectedApplicant?.user?.trade_specialization)}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setDetailModalVisible(false)}
                  style={styles.closeBtn}
                  activeOpacity={0.7}
                >
                  <X size={20} color={COLORS.slate600} />
                </TouchableOpacity>
              </View>

              {/* 5-Tab Industry-Standard Segmented Control Inside Top Header Section Below Profile & Name */}
              <View style={styles.menuTabBarWrapperInline}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.menuTabBarContent}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setModalTab('JOB')}
                    style={[styles.menuTabItem, modalTab === 'JOB' && styles.menuTabItemActive]}
                  >
                    <Briefcase size={14} color={modalTab === 'JOB' ? COLORS.primary : '#64748B'} />
                    <Text style={[styles.menuTabText, modalTab === 'JOB' && styles.menuTabTextActive]}>
                      Job Info
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setModalTab('CANDIDATE')}
                    style={[styles.menuTabItem, modalTab === 'CANDIDATE' && styles.menuTabItemActive]}
                  >
                    <UserIcon size={14} color={modalTab === 'CANDIDATE' ? COLORS.primary : '#64748B'} />
                    <Text style={[styles.menuTabText, modalTab === 'CANDIDATE' && styles.menuTabTextActive]}>
                      Candidate Info
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setModalTab('STATUS')}
                    style={[styles.menuTabItem, modalTab === 'STATUS' && styles.menuTabItemActive]}
                  >
                    <Zap size={14} color={modalTab === 'STATUS' ? COLORS.primary : '#64748B'} />
                    <Text style={[styles.menuTabText, modalTab === 'STATUS' && styles.menuTabTextActive]}>
                      Status
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setModalTab('INTERVIEW')}
                    style={[styles.menuTabItem, modalTab === 'INTERVIEW' && styles.menuTabItemActive]}
                  >
                    <Calendar size={14} color={modalTab === 'INTERVIEW' ? COLORS.primary : '#64748B'} />
                    <Text style={[styles.menuTabText, modalTab === 'INTERVIEW' && styles.menuTabTextActive]}>
                      Interview
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setModalTab('EMAIL')}
                    style={[styles.menuTabItem, modalTab === 'EMAIL' && styles.menuTabItemActive]}
                  >
                    <Mail size={14} color={modalTab === 'EMAIL' ? COLORS.primary : '#64748B'} />
                    <Text style={[styles.menuTabText, modalTab === 'EMAIL' && styles.menuTabTextActive]}>
                      Send Email
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>

            {/* Modal Body Content depending on Active Tab */}
            <ScrollView style={styles.modalBodyScroll} showsVerticalScrollIndicator={false}>
              {/* TAB 1: JOB INFO (Single Unified Card Container with Soft Separators) */}
              {modalTab === 'JOB' ? (() => {
                const appliedJob = selectedApplicant?.job || myJobs.find((j) => j.id === selectedApplicant?.job_id) || jobDetails;
                return (
                  <View>
                    <View style={styles.modalSectionBox}>
                      {/* Section 1: Applied Job Header */}
                      <Text style={styles.sectionHeadingTitle}>APPLIED JOB SPECIFICATIONS</Text>
                      <Text style={styles.jobTitleLarge}>{appliedJob?.title || jobTitle || 'Industrial Operator'}</Text>
                      <Text style={styles.jobCompanySub}>
                        {safeValue(appliedJob?.company || 'Industrial Enterprise')} • {safeValue(appliedJob?.trade || appliedJob?.industry || 'Industrial Trade')}
                      </Text>

                      <View style={[styles.rowDivider, { marginVertical: 12 }]} />

                      {/* Section 2: Details & Salary Specifications */}
                      <Text style={styles.sectionHeadingTitle}>JOB DETAILS & SALARY</Text>

                      <View style={styles.specRowsContainer}>
                        {/* Salary Row */}
                        <View style={styles.specRowItem}>
                          <View style={styles.specIconBadge}>
                            <IndianRupee size={15} color={COLORS.primary} />
                          </View>
                          <View style={styles.specTextCol}>
                            <Text style={styles.specGridLabel}>Salary Offer</Text>
                            <Text style={styles.specGridValue}>
                              {appliedJob?.salary_min
                                ? `₹${appliedJob.salary_min.toLocaleString()} - ₹${appliedJob.salary_max?.toLocaleString()} / mo`
                                : '₹25,000 - ₹35,000 / mo'}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.rowDivider} />

                        {/* Vacancies Row */}
                        <View style={styles.specRowItem}>
                          <View style={styles.specIconBadge}>
                            <Building2 size={15} color="#16A34A" />
                          </View>
                          <View style={styles.specTextCol}>
                            <Text style={styles.specGridLabel}>Vacancies & Openings</Text>
                            <Text style={styles.specGridValue}>
                              {appliedJob?.openings || (appliedJob as any)?.vacancies || 1} Openings
                            </Text>
                          </View>
                        </View>

                        <View style={styles.rowDivider} />

                        {/* MIDC Location Row */}
                        <View style={styles.specRowItem}>
                          <View style={styles.specIconBadge}>
                            <MapPin size={15} color="#0284C7" />
                          </View>
                          <View style={styles.specTextCol}>
                            <Text style={styles.specGridLabel}>MIDC Location Address</Text>
                            <Text style={styles.specGridValue}>
                              {safeValue(appliedJob?.location || (appliedJob as any)?.midcZone || 'Waluj MIDC Industrial Area')}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.rowDivider} />

                        {/* Work Shift & Mode Row */}
                        <View style={styles.specRowItem}>
                          <View style={styles.specIconBadge}>
                            <Clock size={15} color="#D97706" />
                          </View>
                          <View style={styles.specTextCol}>
                            <Text style={styles.specGridLabel}>Work Shift & Mode</Text>
                            <Text style={styles.specGridValue}>
                              {safeValue((appliedJob as any)?.shift_timing || (appliedJob as any)?.shift_category || 'Day Shift')} • {appliedJob?.work_mode || 'On-site'}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Section 3: Job Description & Requirements */}
                      {appliedJob?.description ? (
                        <>
                          <View style={[styles.rowDivider, { marginVertical: 12 }]} />
                          <Text style={styles.sectionHeadingTitle}>JOB DESCRIPTION & REQUIREMENTS</Text>
                          <Text style={styles.infoSectionBody}>{appliedJob.description}</Text>
                        </>
                      ) : null}

                      {/* Section 4: Required Trade Skills */}
                      {appliedJob?.skills && appliedJob.skills.length > 0 ? (
                        <>
                          <View style={[styles.rowDivider, { marginVertical: 12 }]} />
                          <Text style={styles.sectionHeadingTitle}>REQUIRED TRADE SKILLS</Text>
                          <View style={styles.skillsWrapRow}>
                            {(Array.isArray(appliedJob.skills) ? appliedJob.skills : [appliedJob.skills]).map((skill: any, i: number) => (
                              <View key={i} style={styles.borderlessSkillTag}>
                                <View style={styles.skillDot} />
                                <Text style={styles.borderlessSkillText}>{safeValue(skill)}</Text>
                              </View>
                            ))}
                          </View>
                        </>
                      ) : null}
                    </View>
                  </View>
                );
              })() : null}

              {/* TAB 2: CANDIDATE INFO */}
              {modalTab === 'CANDIDATE' ? (
                <View>
                  <View style={styles.modalSectionBox}>
                    {/* Direct Action Contact Row - Professional Outline Icon Pills */}
                    <View style={styles.contactActionBarInlineRow}>
                      {/* 1. Phone Call */}
                      <TouchableOpacity
                        style={[styles.contactPillBtn, { borderColor: '#CBD5E1', flex: 1 }]}
                        activeOpacity={0.8}
                        onPress={() => {
                          const phone = selectedApplicant?.user?.phone;
                          if (phone) Linking.openURL(`tel:${phone}`);
                          else Alert.alert('Notice', 'Phone number not provided.');
                        }}
                      >
                        <Phone size={15} color={COLORS.primary} />
                        <Text style={[styles.contactPillText, { color: COLORS.primary }]}>Call</Text>
                      </TouchableOpacity>

                      {/* 2. WhatsApp */}
                      <TouchableOpacity
                        style={[styles.contactPillBtn, { borderColor: '#CBD5E1', flex: 1.35 }]}
                        activeOpacity={0.8}
                        onPress={() => {
                          const phone = selectedApplicant?.user?.phone?.replace(/[^0-9]/g, '');
                          if (phone) Linking.openURL(`https://wa.me/${phone}`);
                          else Alert.alert('Notice', 'WhatsApp number not provided.');
                        }}
                      >
                        <WhatsAppIcon size={16} color="#16A34A" />
                        <Text style={[styles.contactPillText, { color: '#15803D' }]}>WhatsApp</Text>
                      </TouchableOpacity>

                      {/* 3. Email */}
                      <TouchableOpacity
                        style={[styles.contactPillBtn, { borderColor: '#CBD5E1', flex: 1 }]}
                        activeOpacity={0.8}
                        onPress={() => {
                          const email = selectedApplicant?.user?.email;
                          if (email) Linking.openURL(`mailto:${email}`);
                          else setModalTab('EMAIL');
                        }}
                      >
                        <Mail size={15} color="#DC2626" />
                        <Text style={[styles.contactPillText, { color: '#DC2626' }]}>Email</Text>
                      </TouchableOpacity>

                      {/* 4. Resume */}
                      <TouchableOpacity
                        style={[styles.contactPillBtn, { borderColor: COLORS.primary, flex: 1.3 }]}
                        activeOpacity={0.8}
                        onPress={() => setPdfModalVisible(true)}
                      >
                        <FileText size={15} color={COLORS.primary} />
                        <Text style={[styles.contactPillText, { color: COLORS.primary }]}>Resume</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Summary / Bio */}
                    {selectedApplicant?.user?.bio ? (
                      <View style={{ marginTop: 12, marginBottom: 10 }}>
                        <Text style={styles.sectionHeadingTitle}>ABOUT CANDIDATE</Text>
                        <Text style={styles.infoSectionBody}>
                          {safeValue(selectedApplicant?.user?.bio)}
                        </Text>
                      </View>
                    ) : null}

                    {/* WORK & AVAILABILITY */}
                    <Text style={[styles.sectionHeadingTitle, { marginTop: 12 }]}>WORK & AVAILABILITY</Text>

                    <View style={styles.specRowsContainer}>
                      {/* MIDC Location */}
                      <View style={styles.specRowItem}>
                        <View style={styles.specIconBadge}>
                          <MapPin size={15} color="#0284C7" />
                        </View>
                        <View style={styles.specTextCol}>
                          <Text style={styles.specGridLabel}>MIDC Location Address</Text>
                          <Text style={styles.specGridValue}>{safeValue(selectedApplicant?.user?.location)}</Text>
                        </View>
                      </View>

                      <View style={styles.rowDivider} />

                      {/* Work Experience */}
                      <View style={styles.specRowItem}>
                        <View style={styles.specIconBadge}>
                          <Briefcase size={15} color={COLORS.primary} />
                        </View>
                        <View style={styles.specTextCol}>
                          <Text style={styles.specGridLabel}>Work Experience</Text>
                          <Text style={styles.specGridValue}>{safeValue(selectedApplicant?.user?.experience)}</Text>
                        </View>
                      </View>

                      <View style={styles.rowDivider} />

                      {/* Education / Trade */}
                      <View style={styles.specRowItem}>
                        <View style={styles.specIconBadge}>
                          <Award size={15} color={COLORS.primary} />
                        </View>
                        <View style={styles.specTextCol}>
                          <Text style={styles.specGridLabel}>Education & Trade</Text>
                          <Text style={styles.specGridValue}>{safeValue(selectedApplicant?.user?.education)}</Text>
                        </View>
                      </View>

                      <View style={styles.rowDivider} />

                      {/* Preferred Shift */}
                      <View style={styles.specRowItem}>
                        <View style={styles.specIconBadge}>
                          <UserCheck size={15} color="#D97706" />
                        </View>
                        <View style={styles.specTextCol}>
                          <Text style={styles.specGridLabel}>Preferred Shift</Text>
                          <Text style={styles.specGridValue}>{safeValue(selectedApplicant?.user?.preferred_shift)}</Text>
                        </View>
                      </View>

                      <View style={styles.rowDivider} />

                      {/* Email Address */}
                      <View style={styles.specRowItem}>
                        <View style={styles.specIconBadge}>
                          <Mail size={15} color="#DC2626" />
                        </View>
                        <View style={styles.specTextCol}>
                          <Text style={styles.specGridLabel}>Email Address</Text>
                          <Text style={styles.specGridValue}>{safeValue(selectedApplicant?.user?.email)}</Text>
                        </View>
                      </View>

                      <View style={styles.rowDivider} />

                      {/* Phone Number */}
                      <View style={styles.specRowItem}>
                        <View style={styles.specIconBadge}>
                          <Phone size={15} color={COLORS.primary} />
                        </View>
                        <View style={styles.specTextCol}>
                          <Text style={styles.specGridLabel}>Phone Number</Text>
                          <Text style={styles.specGridValue}>{safeValue(selectedApplicant?.user?.phone)}</Text>
                        </View>
                      </View>

                      <View style={styles.rowDivider} />

                      {/* Aadhaar Verification */}
                      <View style={styles.specRowItem}>
                        <View style={styles.specIconBadge}>
                          <ShieldCheck size={15} color="#16A34A" />
                        </View>
                        <View style={styles.specTextCol}>
                          <Text style={styles.specGridLabel}>Aadhaar Verification</Text>
                          <Text style={styles.specGridValue}>
                            {selectedApplicant?.user?.aadhaar_verified ? 'Verified (Government Aadhaar)' : 'Pending Verification'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.rowDivider} />

                      {/* Bus & Hostel Facility */}
                      <View style={styles.specRowItem}>
                        <View style={styles.specIconBadge}>
                          <Zap size={15} color={COLORS.primary} />
                        </View>
                        <View style={styles.specTextCol}>
                          <Text style={styles.specGridLabel}>Bus & Hostel Facility</Text>
                          <Text style={styles.specGridValue}>
                            {(selectedApplicant?.user as any)?.requiresBus ? 'Bus Required' : 'Self Transport'} • {(selectedApplicant?.user as any)?.requiresAccommodation ? 'Hostel Needed' : 'Local Resident'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.rowDivider} />

                      {/* Applied Date */}
                      <View style={styles.specRowItem}>
                        <View style={styles.specIconBadge}>
                          <Clock size={15} color="#64748B" />
                        </View>
                        <View style={styles.specTextCol}>
                          <Text style={styles.specGridLabel}>Applied On</Text>
                          <Text style={styles.specGridValue}>
                            {new Date(selectedApplicant?.applied_at || Date.now()).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {/* Technical Skills inside the main card */}
                    {selectedApplicant?.user?.skills && selectedApplicant.user.skills.length > 0 ? (
                      <View style={{ marginTop: 12 }}>
                        <Text style={styles.sectionHeadingTitle}>TECHNICAL SKILLS</Text>
                        <View style={styles.skillsWrapRow}>
                          {selectedApplicant.user.skills.map((skill, i) => (
                            <View key={i} style={styles.borderlessSkillTag}>
                              <View style={styles.skillDot} />
                              <Text style={styles.borderlessSkillText}>{safeValue(skill)}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : null}
                  </View>
                </View>
              ) : null}

              {/* TAB 3: STATUS & WORKFLOW - Clean iOS Design */}
              {modalTab === 'STATUS' ? (
                <View>
                  <View style={styles.modalSectionBox}>
                    <Text style={styles.sectionHeadingTitle}>CURRENT APPLICATION STATUS</Text>
                    <View style={styles.minimalStatusRow}>
                      <Badge status={selectedApplicant?.status || 'applied'} />
                      <Text style={styles.minimalStatusSub}>
                        Applied on {new Date(selectedApplicant?.applied_at || Date.now()).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sectionSeparator} />

                  <View style={styles.modalSectionBox}>
                    <Text style={styles.sectionHeadingTitle}>SELECT CANDIDATE WORKFLOW STATUS</Text>
                    <View style={styles.statusButtonList}>
                      {[
                        { key: 'applied', label: 'Applied', desc: 'Candidate application received' },
                        { key: 'shortlisted', label: 'Shortlisted', desc: 'Mark candidate as shortlisted for review' },
                        { key: 'interview', label: 'Interview Scheduled', desc: 'Interview invite & walk-in pass released' },
                        { key: 'hired', label: 'Hired', desc: 'Offer extended & candidate hired' },
                        { key: 'rejected', label: 'Rejected', desc: 'Application not moving forward' },
                      ].map((item) => {
                        const isSelected = selectedApplicant?.status === item.key || (item.key === 'interview' && (selectedApplicant?.status === 'interviewed' || selectedApplicant?.status === 'interview_scheduled'));
                        return (
                          <TouchableOpacity
                            key={item.key}
                            activeOpacity={0.8}
                            style={[
                              styles.cleanStatusOptionRow,
                              isSelected && styles.cleanStatusOptionRowSelected,
                            ]}
                            onPress={() => {
                              if (selectedApplicant) {
                                const activeJId = selectedApplicant.job_id || (selectedApplicant as any).jobId || jobId;
                                handleUpdateStatus(selectedApplicant.user_id, item.key as ApplicationStatus, activeJId);
                              }
                            }}
                          >
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.cleanStatusOptionText,
                                  isSelected && styles.cleanStatusOptionTextSelected,
                                ]}
                              >
                                {item.label}
                              </Text>
                              <Text style={styles.cleanStatusOptionDesc}>{item.desc}</Text>
                            </View>
                            {isSelected ? (
                              <CheckCircle2 size={18} color={COLORS.primary} />
                            ) : (
                              <View style={styles.radioDotOutline} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              ) : null}

              {/* TAB 4: SCHEDULE INTERVIEW - Single Unified Card Container */}
              {modalTab === 'INTERVIEW' ? (
                <View>
                  <View style={styles.modalSectionBox}>
                    {/* Header Intro */}
                    <Text style={styles.sectionHeadingTitle}>SCHEDULE INTERVIEW INVITE</Text>
                    <Text style={styles.infoSectionBody}>
                      Invite <Text style={{ fontWeight: '800', color: '#0F172A' }}>{safeValue(selectedApplicant?.user?.name)}</Text> to an official technical interview.
                    </Text>

                    <View style={[styles.rowDivider, { marginVertical: 14 }]} />

                    {/* Section 1: Interview Mode Selector Pills */}
                    <Text style={styles.sectionHeadingTitle}>1. SELECT INTERVIEW MODE</Text>
                    <View style={styles.modePillRow}>
                      {[
                        { key: 'In-Person Walk-in', icon: Building2, label: 'In-Person' },
                        { key: 'Online Video Call', icon: Zap, label: 'Video Call' },
                        { key: 'Phone Screening', icon: Phone, label: 'Phone Call' },
                      ].map((item) => {
                        const IconComp = item.icon;
                        const isSelected = interviewMode === item.key;
                        return (
                          <TouchableOpacity
                            key={item.key}
                            activeOpacity={0.8}
                            style={[styles.cleanModePillBtn, isSelected && styles.cleanModePillBtnSelected]}
                            onPress={() => setInterviewMode(item.key)}
                          >
                            <IconComp size={14} color={isSelected ? COLORS.primary : '#64748B'} />
                            <Text style={[styles.cleanModePillText, isSelected && styles.cleanModePillTextSelected]}>
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <View style={[styles.rowDivider, { marginVertical: 14 }]} />

                    {/* Section 2: Form Details & Venue */}
                    <Text style={styles.sectionHeadingTitle}>2. INTERVIEW DETAILS & VENUE</Text>

                    <View style={{ marginBottom: 12 }}>
                      <Text style={styles.inputLabelStyle}>
                        INTERVIEW DATE <Text style={{ color: '#EF4444' }}>*</Text>
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setDatePickerVisible(true)}
                        style={styles.cleanDatePickerTriggerBtn}
                      >
                        <Calendar size={16} color={COLORS.primary} />
                        <Text style={styles.cleanDatePickerTriggerText}>
                          {interviewDate
                            ? new Date(interviewDate + 'T00:00:00').toDateString()
                            : 'Tap to Select Date from Calendar...'}
                        </Text>
                        <ChevronRight size={16} color="#64748B" />
                      </TouchableOpacity>
                    </View>

                    <View style={{ marginBottom: 12 }}>
                      <Text style={styles.inputLabelStyle}>
                        INTERVIEW TIME <Text style={{ color: '#EF4444' }}>*</Text>
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setTimePickerVisible(true)}
                        style={styles.cleanDatePickerTriggerBtn}
                      >
                        <Clock size={16} color={COLORS.primary} />
                        <Text style={styles.cleanDatePickerTriggerText}>
                          {interviewTime || 'Tap to Select Interview Time...'}
                        </Text>
                        <ChevronRight size={16} color="#64748B" />
                      </TouchableOpacity>
                    </View>

                    <Input
                      label="Venue Address / Video Link"
                      placeholder="Factory Gate #2, Waluj MIDC or Google Meet Link"
                      value={interviewLocation}
                      onChangeText={setInterviewLocation}
                    />

                    <Input
                      label="Instructions / Special Notes for Candidate"
                      placeholder="Bring original ITI trade certificate & Aadhaar card."
                      value={interviewNotes}
                      onChangeText={setInterviewNotes}
                    />

                    <Button
                      title="Schedule & Send Interview Invite"
                      onPress={handleScheduleInterview}
                      loading={modalLoading}
                      icon={<Calendar size={16} color="#FFFFFF" />}
                      style={{ marginTop: 14, height: 46, borderRadius: 0 }}
                    />
                  </View>
                </View>
              ) : null}

              {/* TAB 5: SEND CUSTOM EMAIL - Single Unified Card Container */}
              {modalTab === 'EMAIL' ? (
                <View>
                  <View style={styles.modalSectionBox}>
                    {/* Recipient Overview */}
                    <Text style={styles.sectionHeadingTitle}>EMAIL RECIPIENT</Text>
                    <View style={styles.specRowItem}>
                      <View style={styles.specIconBadge}>
                        <Mail size={16} color={COLORS.primary} />
                      </View>
                      <View style={styles.specTextCol}>
                        <Text style={styles.specGridLabel}>Target Candidate Email</Text>
                        <Text style={styles.specGridValue}>
                          {safeValue(selectedApplicant?.user?.email)}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.rowDivider, { marginVertical: 14 }]} />

                    {/* Email Templates & Form Box */}
                    <Text style={styles.sectionHeadingTitle}>EMAIL TEMPLATE & MESSAGE</Text>
                    <View style={{ marginBottom: 14 }}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setTemplateDropdownVisible(true)}
                        style={styles.cleanDatePickerTriggerBtn}
                      >
                        <FileText size={16} color={COLORS.primary} />
                        <Text style={styles.cleanDatePickerTriggerText}>
                          {selectedTemplateLabel || 'Tap to Select Email Template...'}
                        </Text>
                        <ChevronRight size={16} color="#64748B" />
                      </TouchableOpacity>
                    </View>

                    <View style={{ marginTop: 4 }}>
                      <Input
                        label="Email Subject Line"
                        required
                        placeholder="Enter email subject line..."
                        value={emailSubject}
                        onChangeText={setEmailSubject}
                      />

                      <Input
                        label="Email Message Body"
                        required
                        placeholder="Write custom email message to candidate..."
                        value={emailMessage}
                        onChangeText={setEmailMessage}
                        multiline
                        numberOfLines={10}
                        style={{ minHeight: 180, textAlignVertical: 'top' }}
                      />
                    </View>
                  </View>
                </View>
              ) : null}
            </ScrollView>

            {/* Fixed Sticky Bottom Call Bar for Email Tab */}
            {modalTab === 'EMAIL' ? (
              <View style={styles.modalStickyCallBar}>
                <Button
                  title="Send Custom Email"
                  onPress={handleSendCustomEmail}
                  loading={modalLoading}
                  icon={<Send size={16} color="#FFFFFF" />}
                  style={{ width: '100%', height: 40, borderRadius: 0 }}
                />
              </View>
            ) : null}
          </View>
        </SafeAreaView>
      </Modal>

      {/* In-App Resume PDF Viewer Modal */}
      {selectedApplicant ? (
        <ResumePdfViewerModal
          visible={pdfModalVisible}
          onClose={() => setPdfModalVisible(false)}
          candidateName={selectedApplicant.user?.name || 'Applicant'}
          candidateRole={jobTitle}
          pdfUrl={selectedApplicant.resume_url || (selectedApplicant as any).resumeUrl || (selectedApplicant.user as any)?.resume_url || (selectedApplicant.user as any)?.resumeUrl}
        />
      ) : null}

      {/* Interactive 3D Calendar Date Picker Modal */}
      <Modal visible={datePickerVisible} transparent animationType="fade" onRequestClose={() => setDatePickerVisible(false)}>
        <TouchableOpacity style={styles.datePickerModalOverlay} activeOpacity={1} onPress={() => setDatePickerVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.datePickerModalCard} onPress={(e) => e.stopPropagation()}>
            {/* Calendar Month Navigation Header */}
            <View style={styles.calendarHeaderRow}>
              <TouchableOpacity
                style={styles.calendarNavBtn}
                activeOpacity={0.7}
                onPress={() =>
                  setCurrentPickerMonth(
                    new Date(currentPickerMonth.getFullYear(), currentPickerMonth.getMonth() - 1, 1)
                  )
                }
              >
                <ChevronLeft size={18} color="#0F172A" />
              </TouchableOpacity>

              <Text style={styles.calendarMonthTitle}>
                {currentPickerMonth.toDateString()}
              </Text>

              <TouchableOpacity
                style={styles.calendarNavBtn}
                activeOpacity={0.7}
                onPress={() =>
                  setCurrentPickerMonth(
                    new Date(currentPickerMonth.getFullYear(), currentPickerMonth.getMonth() + 1, 1)
                  )
                }
              >
                <ChevronRight size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* Days of Week Row */}
            <View style={styles.calendarWeekRow}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <Text key={d} style={styles.calendarWeekLabel}>
                  {d}
                </Text>
              ))}
            </View>

            {/* Date Grid */}
            <View style={styles.calendarGridWrap}>
              {getDaysInMonthGrid(currentPickerMonth).map((item, idx) => {
                if (!item) {
                  return <View key={`empty-${idx}`} style={styles.calendarDayCellEmpty} />;
                }
                const isSelected = interviewDate === item.dateStr;
                return (
                  <TouchableOpacity
                    key={item.dateStr}
                    disabled={item.isPast}
                    activeOpacity={0.8}
                    onPress={() => {
                      setInterviewDate(item.dateStr);
                      setDatePickerVisible(false);
                    }}
                    style={[
                      styles.calendarDayCell,
                      isSelected && styles.calendarDayCellSelected,
                      item.isPast && styles.calendarDayCellPast,
                    ]}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        isSelected && styles.calendarDayTextSelected,
                        item.isPast && styles.calendarDayTextPast,
                      ]}
                    >
                      {item.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Modal Close Action */}
            <TouchableOpacity
              style={styles.calendarCloseBtn}
              activeOpacity={0.8}
              onPress={() => setDatePickerVisible(false)}
            >
              <Text style={styles.calendarCloseBtnText}>Done / Close Calendar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Email Template Selection Modal - Clean Apple iOS Bottom Sheet */}
      <Modal visible={templateDropdownVisible} transparent animationType="slide" onRequestClose={() => setTemplateDropdownVisible(false)}>
        <TouchableOpacity style={styles.sheetOverlayBottom} activeOpacity={1} onPress={() => setTemplateDropdownVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.cleanIosSheetCard} onPress={(e) => e.stopPropagation()}>
            {/* Top Sheet Grab Handle */}
            <View style={styles.sheetGrabHandle} />

            <View style={styles.sheetHeaderRow}>
              <View>
                <Text style={styles.sheetTitle}>SELECT EMAIL TEMPLATE</Text>
                <Text style={styles.sheetSubtitle}>Choose a template to auto-fill Subject & Body</Text>
              </View>
              <TouchableOpacity style={styles.closeHeaderBtn} activeOpacity={0.7} onPress={() => setTemplateDropdownVisible(false)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 360, marginTop: 6 }} showsVerticalScrollIndicator={false}>
              {EMAIL_TEMPLATES.map((tmpl, idx) => {
                const isSelected = selectedTemplateLabel === tmpl.label;
                return (
                  <React.Fragment key={tmpl.key}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={[
                        styles.cleanIosDropdownOptionRow,
                        isSelected && styles.cleanIosDropdownOptionRowSelected,
                      ]}
                      onPress={() => {
                        const cName = safeValue(selectedApplicant?.user?.name);
                        setEmailSubject(tmpl.subject(jobTitle));
                        setEmailMessage(tmpl.message(cName, jobTitle));
                        setSelectedTemplateLabel(tmpl.label);
                        setTemplateDropdownVisible(false);
                      }}
                    >
                      <View style={styles.dropdownIconBadge}>
                        <FileText size={16} color={isSelected ? COLORS.primary : '#475569'} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text
                          style={[
                            styles.cleanStatusOptionText,
                            isSelected && styles.cleanStatusOptionTextSelected,
                          ]}
                        >
                          {tmpl.label}
                        </Text>
                        <Text style={styles.cleanStatusOptionDesc}>{tmpl.desc}</Text>
                      </View>
                      {isSelected ? (
                        <Check size={18} color={COLORS.primary} />
                      ) : (
                        <ChevronRight size={16} color="#CBD5E1" />
                      )}
                    </TouchableOpacity>
                    {idx < EMAIL_TEMPLATES.length - 1 ? <View style={styles.rowDivider} /> : null}
                  </React.Fragment>
                );
              })}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Radial Clock Time Picker Modal */}
      <ClockTimePickerModal
        visible={timePickerVisible}
        onClose={() => setTimePickerVisible(false)}
        onSelectTime={(timeStr) => setInterviewTime(timeStr)}
        initialTime={interviewTime}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchBarWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2,
    borderBottomColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
    paddingVertical: 0,
  },
  /* Industry Grade LinkedIn / iPhone Underline Status Filter Bar */
  tabsBarWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingTop: 4,
    paddingBottom: 0,
  },
  tabsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 18,
  },
  industryTabPill: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
    paddingHorizontal: 2,
    marginBottom: -1,
  },
  industryTabPillActive: {
    backgroundColor: 'transparent',
    borderBottomColor: COLORS.primary,
  },
  industryTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  industryTabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tabCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabCountBadgeActive: {
    backgroundColor: '#EFF6FF',
  },
  tabCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  tabCountTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 130,
  },
  candidateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 1,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerTextCol: {
    flex: 1,
    marginLeft: 10,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  candidateName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  candidateTrade: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#475569',
    marginTop: 1,
  },
  metaPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  miniPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: '48%',
  },
  inlineIconTextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '48%',
  },
  candidateMetaTextInline: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  dotSeparator: {
    color: COLORS.primary,
    fontWeight: '800',
  },

  /* Modal Overlay & Card */
  fullScreenPageContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  fullPageHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  fullPageHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  modalAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  modalCandidateName: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCandidateHeadline: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
  },
  menuTabBarWrapperInline: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginTop: 4,
  },
  menuTabBarWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginTop: 6,
  },
  menuTabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 4,
  },
  menuTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 2,
    paddingVertical: 10,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  menuTabItemActive: {
    backgroundColor: 'transparent',
    borderBottomColor: COLORS.primary,
  },
  menuTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  menuTabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  /* Modal Body Scroll */
  modalBodyScroll: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
    paddingBottom: 36,
  },
  modalSectionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionSeparator: {
    height: 8,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  specRowsContainer: {
    marginTop: 6,
  },
  specRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  specIconBadge: {
    width: 24,
    height: 24,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specTextCol: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  specGridLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  specGridValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  borderlessSkillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 3,
    marginRight: 12,
    marginBottom: 6,
    gap: 6,
  },
  skillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.primary,
  },
  borderlessSkillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  inlineViewResumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  inlineViewResumeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  resumeCardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    padding: 12,
    marginTop: 6,
  },
  resumeCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 10,
  },
  pdfIconBox: {
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeFileName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  resumeSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  openPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  openPdfBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalStickyCallBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  contactActionBarInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  contactActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  contactPillBtn: {
    flex: 1,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 0,
    paddingHorizontal: 4,
  },
  contactPillText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  sectionHeadingTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoSectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  infoSectionBody: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
  },
  skillsWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  skillTag: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  skillTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  infoGridTwoCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  gridBox: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  gridVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  jobTitleLarge: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  jobCompanySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  /* Minimal Industry Status Section */
  minimalStatusBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  minimalStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  minimalStatusSub: {
    fontSize: 11.5,
    color: '#64748B',
  },
  statusButtonList: {
    gap: 8,
    marginTop: 6,
  },
  minimalStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 8,
  },
  minimalStatusBtnSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: COLORS.primary,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },
  minimalStatusBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  cleanStatusOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 0,
  },
  cleanStatusOptionRowSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: COLORS.primary,
  },
  cleanStatusOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  cleanStatusOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  cleanStatusOptionDesc: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  radioDotOutline: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
  },
  templatePillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  cleanTemplatePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 0,
  },
  cleanTemplatePillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  templatePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2,
    borderBottomColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  templatePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  modePillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  cleanModePillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 0,
  },
  cleanModePillBtnSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.primary,
    borderWidth: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  cleanModePillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  cleanModePillTextSelected: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  cleanDatePickerTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 0,
    marginTop: 4,
  },
  cleanDatePickerTriggerText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 8,
  },
  cleanTimeSlotGridBtn: {
    width: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 0,
  },
  cleanTimeSlotGridBtnSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  cleanTimeSlotGridText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  cleanTimeSlotGridTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  modePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    paddingHorizontal: 11,
    paddingVertical: 6.5,
    borderRadius: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modePillBtnSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
    borderBottomColor: COLORS.primary,
    borderWidth: 1.5,
  },
  modePillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  modePillTextSelected: {
    color: COLORS.primary,
    fontWeight: '800',
  },

  /* Dropdown Modal Styles */
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    padding: 16,
  },
  dropdownModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  dropdownHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
  },
  dropdownOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 4,
  },
  dropdownOptionSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  dropdownOptionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  dropdownOptionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },

  /* Date Picker Custom Styles */
  inputLabelStyle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  datePickerTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  datePickerTriggerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sheetOverlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  cleanIosSheetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,
    width: '100%',
  },
  sheetGrabHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  cleanIosDropdownOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  cleanIosDropdownOptionRowSelected: {
    backgroundColor: '#F8FAFC',
  },
  dropdownIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 0,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    width: '100%',
    maxWidth: 360,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sheetSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  closeHeaderBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 4,
    borderBottomColor: '#CBD5E1',
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  calendarNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarMonthTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  calendarWeekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  calendarWeekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
  },
  calendarGridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayCellEmpty: {
    width: '14.28%',
    height: 36,
  },
  calendarDayCell: {
    width: '14.28%',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  calendarDayCellSelected: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderBottomWidth: 2.5,
    borderBottomColor: COLORS.primary,
  },
  calendarDayCellPast: {
    opacity: 0.35,
  },
  calendarDayText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  calendarDayTextPast: {
    color: '#94A3B8',
  },
  calendarCloseBtn: {
    marginTop: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2,
    borderBottomColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  calendarCloseBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#334155',
  },
});
