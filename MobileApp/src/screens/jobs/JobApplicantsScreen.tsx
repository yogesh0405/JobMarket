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
import {
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
  DollarSign,
} from 'lucide-react-native';
import { applicantsApi } from '../../api/applicantsApi';
import { jobsApi } from '../../api/jobsApi';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon';
import { ResumePdfViewerModal } from '../../components/common/ResumePdfViewerModal';
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

const safeValue = (val?: string | null | object): string => {
  if (!val) return 'Not Provided';
  if (typeof val === 'string') return val.trim().length > 0 ? val : 'Not Provided';
  if (typeof val === 'object') {
    const parts = Object.values(val).filter(Boolean).map(String);
    return parts.length > 0 ? parts.join(' - ') : 'Not Provided';
  }
  return String(val);
};

const SEEDED_APPLICANTS: JobApplication[] = [
  {
    id: 'app-wireman-1',
    user_id: 'u-anil-1',
    job_id: 'j-wireman',
    status: 'applied' as ApplicationStatus,
    applied_at: new Date().toISOString(),
    user: {
      id: 'u-anil-1',
      name: 'Anil Gavhane',
      email: 'anil.gavhane@jobmarket.local',
      phone: '+91 98230 11223',
      role: 'candidate',
      headline: 'Senior Control Panel Wireman & Electrical Panel Specialist',
      location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
      experience: '6+ Years (2018 - Present)',
      skills: ['Control Panel Wiring', 'PLC Troubleshooting', '3-Phase Circuits', 'Schematic Reading'],
      profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      aadhaar_verified: true,
      education: 'Diploma in Electrical Engineering (Government Polytechnic)',
      bio: 'Experienced control panel wireman specializing in industrial automation panels, PLC harness wiring, relay testing, and heavy electrical switchgear assembly.',
      notice_period: 'Immediate',
      preferred_shift: 'Day Shift',
    },
  },
  {
    id: 'app-wireman-2',
    user_id: 'u-suresh-2',
    job_id: 'j-wireman',
    status: 'shortlisted' as ApplicationStatus,
    applied_at: new Date(Date.now() - 86400000).toISOString(),
    user: {
      id: 'u-suresh-2',
      name: 'Suresh Deshmukh',
      email: 'suresh.deshmukh@jobmarket.local',
      phone: '+91 98230 44556',
      role: 'candidate',
      headline: 'Control Panel Wireman & Industrial Switchgear Technician',
      location: 'Railway Station MIDC, Chhatrapati Sambhajinagar',
      experience: '4+ Years (2020 - Present)',
      skills: ['Panel Wiring', 'Busbar Bending', 'Relay Testing', 'Electrical Panel Assembly'],
      profilePictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      aadhaar_verified: true,
      education: 'NCVT ITI Electrician & Wireman Trade Certificate',
      bio: 'Certified ITI wireman with expertise in control panel wiring, VFD installation, cable lug crimping, and high-voltage panel safety inspection.',
      notice_period: '7 Days',
      preferred_shift: 'Rotational / Day Shift',
    },
  },
];

const APPLICANT_SEARCH_SUGGESTIONS = [
  'Search by Trade Type (e.g. VMC Operator, Fitter)...',
  'Search by Role (e.g. Quality Inspector, Turner)...',
  'Search Locality (e.g. Waluj MIDC, Chitegaon)...',
  'Search by Shift (e.g. Day Shift, Rotational)...',
  'Search by Industry (e.g. Automotive, Electronics)...',
  'Search by Skills (e.g. CNC, Vernier, AutoCAD)...',
  'Search Candidates by Name or Phone...',
];

export const JobApplicantsScreen: React.FC<Props> = ({ route, navigation }) => {
  const jobId = route?.params?.jobId;
  const jobTitle = route?.params?.jobTitle || 'Job Applicants';

  const [applicants, setApplicants] = useState<JobApplication[]>(SEEDED_APPLICANTS);
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
  const [interviewLocation, setInterviewLocation] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');

  // Email Form States
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
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
            status: item.status || 'applied',
            applied_at: item.appliedAt || item.applied_at || new Date().toISOString(),
            user: {
              id: item.userId || item.user_id,
              name: item.name || 'Candidate',
              email: item.email || '',
              phone: item.phone || '',
                    role: 'candidate' as const,
              headline: item.headline || item.tradeSpecialization || 'Candidate',
              location: item.location || 'Not Specified',
              experience: item.experience || 'Not Specified',
              skills: Array.isArray(item.skills) ? item.skills : [],
              profilePictureUrl: item.profilePictureUrl || item.profile_picture_url,
              aadhaar_verified: !!item.aadhaarVerified,
              education: item.education || 'Not Specified',
            }
          }));
          setApplicants(mapped);
          return;
        }
      } else {
        const myJobsRes = await jobsApi.getMyJobs();
        if (myJobsRes.success && Array.isArray(myJobsRes.data)) {
          const allApps: any[] = [];
          myJobsRes.data.forEach((j: any) => {
            if (Array.isArray(j.applicants)) {
              j.applicants.forEach((item: any) => {
                allApps.push({
                  id: item.id || `app-${item.userId || item.user_id}-${j.id}`,
                  user_id: item.userId || item.user_id,
                  job_id: j.id,
                  status: item.status || 'applied',
                  applied_at: item.appliedAt || item.applied_at || new Date().toISOString(),
                  job: j,
                  user: {
                    id: item.userId || item.user_id,
                    name: item.name || 'Candidate',
                    email: item.email || '',
                    phone: item.phone || '',
                          role: 'candidate' as const,
                    headline: item.headline || item.tradeSpecialization || 'Candidate',
                    location: item.location || 'Not Specified',
                    experience: item.experience || 'Not Specified',
                    skills: Array.isArray(item.skills) ? item.skills : [],
                    profilePictureUrl: item.profilePictureUrl || item.profile_picture_url,
                    aadhaar_verified: !!item.aadhaarVerified,
                    education: item.education || 'Not Specified',
                  }
                });
              });
            }
          });
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
    fetchApplicants();
  };

  const handleUpdateStatus = async (userId: string, newStatus: ApplicationStatus) => {
    try {
      if (jobId) {
        await applicantsApi.updateApplicantStatus(jobId, userId, newStatus);
      }
      setApplicants((prev) =>
        prev.map((app) => (app.user_id === userId ? { ...app, status: newStatus } : app))
      );
      if (selectedApplicant && selectedApplicant.user_id === userId) {
        setSelectedApplicant((prev) => (prev ? { ...prev, status: newStatus } : prev));
      }
      Alert.alert('Status Updated', `Candidate status changed to "${newStatus.toUpperCase()}".`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update candidate status.');
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedApplicant) return;
    if (!interviewDate) {
      Alert.alert('Validation Error', 'Please enter the interview date.');
      return;
    }
    setModalLoading(true);
    try {
      if (jobId) {
        await applicantsApi.scheduleInterview(jobId, selectedApplicant.user_id, {
          interviewDate,
          interviewTime,
          interviewMode,
          interviewLocation,
          notes: interviewNotes,
        });
      }
      await handleUpdateStatus(selectedApplicant.user_id, 'interviewed');
      Alert.alert('Interview Scheduled', 'Interview invite successfully recorded and sent to candidate.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to schedule interview.');
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
    const matchesTab = activeTab === 'ALL' || (app.status || '').toLowerCase() === activeTab;
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
              <View style={styles.miniPill}>
                <MapPin size={11} color={COLORS.slate500} />
                <Text style={styles.miniPillText} numberOfLines={1}>
                  {candidateLocation}
                </Text>
              </View>

              <View style={styles.miniPill}>
                <Briefcase size={11} color={COLORS.primary} />
                <Text style={styles.miniPillText} numberOfLines={1}>
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
      <Header title={jobTitle} subtitle="Candidate Applications" onBack={() => navigation.goBack()} />

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
            <ChevronDown size={14} color={selectedJobId !== 'ALL' ? '#FFFFFF' : '#64748B'} />
          </TouchableOpacity>

          {[
            { key: 'applied', label: 'Applied' },
            { key: 'shortlisted', label: 'Shortlisted' },
            { key: 'interviewed', label: 'Interviewed' },
            { key: 'hired', label: 'Hired' },
            { key: 'rejected', label: 'Rejected' },
          ].map((tab) => {
            const isSelected = activeTab === tab.key;
            const count = applicants.filter((a) => (a.status || '').toLowerCase() === tab.key).length;
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        />
      )}

      {/* Comprehensive Candidate Detail Modal with 5-Tab Menu */}
      <Modal visible={detailModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.fullModalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalAvatarBox}>
                {selectedApplicant?.user?.profilePictureUrl || selectedApplicant?.user?.profile_picture_url ? (
                  <Image
                    source={{ uri: selectedApplicant.user.profilePictureUrl || selectedApplicant.user.profile_picture_url }}
                    style={styles.avatarImg}
                  />
                ) : (
                  <UserIcon size={24} color={COLORS.primary} />
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
                <X size={18} color={COLORS.slate600} />
              </TouchableOpacity>
            </View>

            {/* 5-Tab Industry-Standard Segmented Control */}
            <View style={styles.menuTabBarWrapper}>
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
                  <Briefcase size={14} color={modalTab === 'JOB' ? '#2563EB' : '#64748B'} />
                  <Text style={[styles.menuTabText, modalTab === 'JOB' && styles.menuTabTextActive]}>
                    Job Info
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setModalTab('CANDIDATE')}
                  style={[styles.menuTabItem, modalTab === 'CANDIDATE' && styles.menuTabItemActive]}
                >
                  <UserIcon size={14} color={modalTab === 'CANDIDATE' ? '#2563EB' : '#64748B'} />
                  <Text style={[styles.menuTabText, modalTab === 'CANDIDATE' && styles.menuTabTextActive]}>
                    Candidate Info
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setModalTab('STATUS')}
                  style={[styles.menuTabItem, modalTab === 'STATUS' && styles.menuTabItemActive]}
                >
                  <Zap size={14} color={modalTab === 'STATUS' ? '#2563EB' : '#64748B'} />
                  <Text style={[styles.menuTabText, modalTab === 'STATUS' && styles.menuTabTextActive]}>
                    Status
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setModalTab('INTERVIEW')}
                  style={[styles.menuTabItem, modalTab === 'INTERVIEW' && styles.menuTabItemActive]}
                >
                  <Calendar size={14} color={modalTab === 'INTERVIEW' ? '#2563EB' : '#64748B'} />
                  <Text style={[styles.menuTabText, modalTab === 'INTERVIEW' && styles.menuTabTextActive]}>
                    Interview
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setModalTab('EMAIL')}
                  style={[styles.menuTabItem, modalTab === 'EMAIL' && styles.menuTabItemActive]}
                >
                  <Mail size={14} color={modalTab === 'EMAIL' ? '#2563EB' : '#64748B'} />
                  <Text style={[styles.menuTabText, modalTab === 'EMAIL' && styles.menuTabTextActive]}>
                    Send Email
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Modal Body Content depending on Active Tab */}
            <ScrollView style={styles.modalBodyScroll} showsVerticalScrollIndicator={false}>
              {/* TAB 1: JOB INFO (Applied Job Summary in Short) */}
              {modalTab === 'JOB' ? (
                <View>
                  <View style={styles.minimalStatusBox}>
                    <Text style={styles.infoSectionTitle}>APPLIED JOB SUMMARY</Text>
                    <Text style={styles.jobTitleLarge}>{jobDetails?.title || jobTitle}</Text>
                    <Text style={styles.jobCompanySub}>
                      {safeValue(jobDetails?.company || 'Industrial Enterprise')} • {safeValue(jobDetails?.industry || 'Industrial Trade')}
                    </Text>
                  </View>

                  <View style={styles.infoGridTwoCol}>
                    <View style={styles.gridBox}>
                      <Text style={styles.gridLabel}>Salary Offer</Text>
                      <Text style={styles.gridVal}>
                        {jobDetails?.salary_min
                          ? `₹${jobDetails.salary_min.toLocaleString()} - ₹${jobDetails.salary_max?.toLocaleString()} / mo`
                          : '₹25,000 - ₹35,000 / mo'}
                      </Text>
                    </View>

                    <View style={styles.gridBox}>
                      <Text style={styles.gridLabel}>Openings</Text>
                      <Text style={styles.gridVal}>{jobDetails?.openings || 1} Openings</Text>
                    </View>

                    <View style={styles.gridBox}>
                      <Text style={styles.gridLabel}>Location</Text>
                      <Text style={styles.gridVal}>{safeValue(jobDetails?.location || 'Waluj MIDC')}</Text>
                    </View>

                    <View style={styles.gridBox}>
                      <Text style={styles.gridLabel}>Work Mode</Text>
                      <Text style={styles.gridVal}>
                        {jobDetails?.work_mode || 'On-site'} ({jobDetails?.job_type || 'Full-time'})
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null}

              {/* TAB 2: CANDIDATE INFO */}
              {modalTab === 'CANDIDATE' ? (
                <View>
                  {/* Quick Action Contact Row - Logos Only + Resume Button on Right */}
                  <View style={styles.contactActionRow}>
                    {/* 1. Phone Call Logo */}
                    <TouchableOpacity
                      style={[styles.iconOnlyContactBtn, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
                      activeOpacity={0.8}
                      onPress={() => {
                        const phone = selectedApplicant?.user?.phone;
                        if (phone) Linking.openURL(`tel:${phone}`);
                        else Alert.alert('Notice', 'Phone number not provided.');
                      }}
                    >
                      <Phone size={16} color="#2563EB" />
                    </TouchableOpacity>

                    {/* 2. WhatsApp Logo */}
                    <TouchableOpacity
                      style={[styles.iconOnlyContactBtn, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}
                      activeOpacity={0.8}
                      onPress={() => {
                        const phone = selectedApplicant?.user?.phone?.replace(/[^0-9]/g, '');
                        if (phone) Linking.openURL(`https://wa.me/${phone}`);
                        else Alert.alert('Notice', 'WhatsApp number not provided.');
                      }}
                    >
                      <WhatsAppIcon size={18} color="#16A34A" />
                    </TouchableOpacity>

                    {/* 3. Email Logo */}
                    <TouchableOpacity
                      style={[styles.iconOnlyContactBtn, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}
                      activeOpacity={0.8}
                      onPress={() => {
                        const email = selectedApplicant?.user?.email;
                        if (email) Linking.openURL(`mailto:${email}`);
                        else setModalTab('EMAIL');
                      }}
                    >
                      <Mail size={16} color="#D97706" />
                    </TouchableOpacity>

                    {/* 4. Resume Button on Right */}
                    <TouchableOpacity
                      style={styles.resumeActionBtn}
                      activeOpacity={0.8}
                      onPress={() => setPdfModalVisible(true)}
                    >
                      <FileText size={15} color="#FFFFFF" />
                      <Text style={styles.resumeActionText}>View Resume</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Summary / Bio */}
                  <View style={styles.infoSection}>
                    <Text style={styles.infoSectionTitle}>ABOUT CANDIDATE</Text>
                    <Text style={styles.infoSectionBody}>
                      {safeValue(selectedApplicant?.user?.bio)}
                    </Text>
                  </View>

                  {/* Skills Badges */}
                  <View style={styles.infoSection}>
                    <Text style={styles.infoSectionTitle}>TECHNICAL SKILLS</Text>
                    <View style={styles.skillsWrapRow}>
                      {selectedApplicant?.user?.skills && selectedApplicant.user.skills.length > 0 ? (
                        selectedApplicant.user.skills.map((skill, i) => (
                          <View key={i} style={styles.skillTag}>
                            <Text style={styles.skillTagText}>{skill}</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.infoSectionBody}>Not Provided</Text>
                      )}
                    </View>
                  </View>

                  {/* WORK & AVAILABILITY - 3 Row Layout */}
                  <View style={styles.infoSection}>
                    <Text style={styles.infoSectionTitle}>WORK & AVAILABILITY</Text>
                    <View style={{ gap: 8, marginTop: 4 }}>
                      {/* Row 1: Experience in One Row */}
                      <View style={styles.fullWidthSpecCard}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                          <Briefcase size={12} color="#2563EB" />
                          <Text style={styles.gridLabel}>Work Experience</Text>
                        </View>
                        <Text style={styles.gridVal}>{safeValue(selectedApplicant?.user?.experience)}</Text>
                      </View>

                      {/* Row 2: Education in One Row */}
                      <View style={styles.fullWidthSpecCard}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                          <Award size={12} color="#16A34A" />
                          <Text style={styles.gridLabel}>Education / Trade</Text>
                        </View>
                        <Text style={styles.gridVal}>{safeValue(selectedApplicant?.user?.education)}</Text>
                      </View>

                      {/* Row 3: Notice Period and Preferred Shift in One Row */}
                      <View style={styles.twoColRow}>
                        <View style={styles.halfWidthSpecCard}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                            <Calendar size={12} color="#D97706" />
                            <Text style={styles.gridLabel}>Notice Period</Text>
                          </View>
                          <Text style={styles.gridVal} numberOfLines={1}>{safeValue(selectedApplicant?.user?.notice_period)}</Text>
                        </View>

                        <View style={styles.halfWidthSpecCard}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                            <UserCheck size={12} color="#0284C7" />
                            <Text style={styles.gridLabel}>Preferred Shift</Text>
                          </View>
                          <Text style={styles.gridVal} numberOfLines={1}>{safeValue(selectedApplicant?.user?.preferred_shift)}</Text>
                        </View>
                      </View>

                      {/* MIDC Location & Phone */}
                      <View style={styles.twoColRow}>
                        <View style={styles.halfWidthSpecCard}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                            <MapPin size={12} color="#64748B" />
                            <Text style={styles.gridLabel}>MIDC Location</Text>
                          </View>
                          <Text style={styles.gridVal} numberOfLines={1}>{safeValue(selectedApplicant?.user?.location)}</Text>
                        </View>

                        <View style={styles.halfWidthSpecCard}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                            <Phone size={12} color="#2563EB" />
                            <Text style={styles.gridLabel}>Phone Number</Text>
                          </View>
                          <Text style={styles.gridVal} numberOfLines={1}>{safeValue(selectedApplicant?.user?.phone)}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ) : null}

              {/* TAB 3: STATUS & WORKFLOW - Minimal Industry Design */}
              {modalTab === 'STATUS' ? (
                <View>
                  <View style={styles.minimalStatusBox}>
                    <Text style={styles.infoSectionTitle}>CURRENT APPLICATION STATUS</Text>
                    <View style={styles.minimalStatusRow}>
                      <Badge status={selectedApplicant?.status || 'applied'} />
                      <Text style={styles.minimalStatusSub}>
                        Applied on {new Date(selectedApplicant?.applied_at || Date.now()).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoSection}>
                    <Text style={styles.infoSectionTitle}>SELECT CANDIDATE WORKFLOW STATUS</Text>
                    <View style={styles.statusButtonList}>
                      {[
                        { key: 'applied', label: 'Mark as Applied' },
                        { key: 'shortlisted', label: 'Shortlist Candidate' },
                        { key: 'interviewed', label: 'Mark as Interviewed' },
                        { key: 'hired', label: 'Hire Candidate / Send Offer' },
                        { key: 'rejected', label: 'Reject Candidate' },
                      ].map((item) => {
                        const isSelected = selectedApplicant?.status === item.key;
                        return (
                          <TouchableOpacity
                            key={item.key}
                            activeOpacity={0.8}
                            style={[
                              styles.minimalStatusBtn,
                              isSelected && styles.minimalStatusBtnSelected,
                            ]}
                            onPress={() => {
                              if (selectedApplicant) {
                                handleUpdateStatus(selectedApplicant.user_id, item.key as ApplicationStatus);
                              }
                            }}
                          >
                            <Text
                              style={[
                                styles.minimalStatusBtnText,
                                isSelected && styles.minimalStatusBtnTextSelected,
                              ]}
                            >
                              {item.label}
                            </Text>
                            {isSelected ? (
                              <CheckCircle2 size={16} color="#2563EB" />
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

              {/* TAB 4: SCHEDULE INTERVIEW - Industry-Grade Suite */}
              {modalTab === 'INTERVIEW' ? (
                <View>
                  <View style={styles.minimalStatusBox}>
                    <Text style={styles.infoSectionTitle}>SCHEDULE INTERVIEW INVITE</Text>
                    <Text style={styles.infoSectionBody}>
                      Invite <Text style={{ fontWeight: '800', color: '#0F172A' }}>{safeValue(selectedApplicant?.user?.name)}</Text> to an official technical interview.
                    </Text>
                  </View>

                  {/* 1. Interview Mode Selector Pills */}
                  <View style={styles.infoSection}>
                    <Text style={styles.infoSectionTitle}>1. SELECT INTERVIEW MODE</Text>
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
                            style={[styles.modePillBtn, isSelected && styles.modePillBtnSelected]}
                            onPress={() => setInterviewMode(item.key)}
                          >
                            <IconComp size={13} color={isSelected ? '#2563EB' : '#64748B'} />
                            <Text style={[styles.modePillText, isSelected && styles.modePillTextSelected]}>
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* 2. Quick Date Shortcuts */}
                  <View style={styles.infoSection}>
                    <Text style={styles.infoSectionTitle}>2. QUICK DATE SELECTION</Text>
                    <View style={styles.modePillRow}>
                      {[
                        { label: 'Tomorrow', days: 1 },
                        { label: 'In 2 Days', days: 2 },
                        { label: 'In 3 Days', days: 3 },
                      ].map((item) => {
                        const dateStr = new Date(Date.now() + item.days * 86400000).toISOString().split('T')[0];
                        const isSelected = interviewDate === dateStr;
                        return (
                          <TouchableOpacity
                            key={item.days}
                            activeOpacity={0.8}
                            style={[styles.modePillBtn, isSelected && styles.modePillBtnSelected]}
                            onPress={() => setInterviewDate(dateStr)}
                          >
                            <Calendar size={12} color={isSelected ? '#2563EB' : '#64748B'} />
                            <Text style={[styles.modePillText, isSelected && styles.modePillTextSelected]}>
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* 3. Quick Time Slot Pills */}
                  <View style={styles.infoSection}>
                    <Text style={styles.infoSectionTitle}>3. SELECT TIME SLOT</Text>
                    <View style={styles.modePillRow}>
                      {['10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM'].map((slot) => {
                        const isSelected = interviewTime === slot;
                        return (
                          <TouchableOpacity
                            key={slot}
                            activeOpacity={0.8}
                            style={[styles.modePillBtn, isSelected && styles.modePillBtnSelected]}
                            onPress={() => setInterviewTime(slot)}
                          >
                            <Clock size={12} color={isSelected ? '#2563EB' : '#64748B'} />
                            <Text style={[styles.modePillText, isSelected && styles.modePillTextSelected]}>
                              {slot}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <Input
                    label="Interview Date"
                    required
                    placeholder="YYYY-MM-DD"
                    value={interviewDate}
                    onChangeText={setInterviewDate}
                  />

                  <Input
                    label="Interview Time"
                    placeholder="10:30 AM"
                    value={interviewTime}
                    onChangeText={setInterviewTime}
                  />

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
                    style={{ marginTop: 12, marginBottom: 20 }}
                  />
                </View>
              ) : null}

              {/* TAB 5: SEND CUSTOM EMAIL */}
              {modalTab === 'EMAIL' ? (
                <View>
                  <View style={styles.infoSection}>
                    <Text style={styles.infoSectionTitle}>SEND CUSTOM EMAIL TO CANDIDATE</Text>
                    <Text style={styles.infoSectionBody}>
                      Recipient: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{safeValue(selectedApplicant?.user?.name)}</Text> ({safeValue(selectedApplicant?.user?.email)})
                    </Text>
                  </View>

                  {/* Template Quick Selection Pills */}
                  <View style={styles.infoSection}>
                    <Text style={styles.infoSectionTitle}>QUICK EMAIL TEMPLATES</Text>
                    <View style={styles.templatePillRow}>
                      <TouchableOpacity
                        style={styles.templatePillBtn}
                        onPress={() => applyEmailTemplate('INTERVIEW')}
                      >
                        <Calendar size={12} color="#2563EB" />
                        <Text style={styles.templatePillText}>Interview Invite</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.templatePillBtn}
                        onPress={() => applyEmailTemplate('DOCUMENT')}
                      >
                        <FileText size={12} color="#0284C7" />
                        <Text style={styles.templatePillText}>Document Request</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.templatePillBtn}
                        onPress={() => applyEmailTemplate('OFFER')}
                      >
                        <Zap size={12} color="#16A34A" />
                        <Text style={styles.templatePillText}>Offer Letter</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

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
                    numberOfLines={6}
                    style={{ minHeight: 110, textAlignVertical: 'top' }}
                  />

                  <Button
                    title="Send Custom Email"
                    onPress={handleSendCustomEmail}
                    loading={modalLoading}
                    icon={<Send size={16} color="#FFFFFF" />}
                    style={{ marginTop: 12, marginBottom: 20 }}
                  />
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchBarWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
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
  /* Industry Grade Status Filter Bar */
  tabsBarWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  tabsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  industryTabPill: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  industryTabPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
    borderBottomWidth: 3,
    borderBottomColor: '#1E40AF',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  industryTabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  industryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  tabCountBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabCountBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  tabCountText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
  },
  tabCountTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 24,
  },
  candidateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
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
  miniPillText: {
    fontSize: 10.5,
    color: '#64748B',
  },

  /* Modal Overlay & Card */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  fullModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  verifiedBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803D',
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
  },

  /* 5-Tab Industry-Standard Segmented Control Bar */
  menuTabBarWrapper: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 3,
    marginVertical: 10,
  },
  menuTabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  menuTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  menuTabItemActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#93C5FD',
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  menuTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  menuTabTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },

  /* Modal Body Scroll */
  modalBodyScroll: {
    maxHeight: 450,
  },
  contactActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 10,
  },
  iconOnlyContactBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderBottomWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeActionBtn: {
    flex: 1,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1D4ED8',
    borderBottomWidth: 2.5,
    borderBottomColor: '#1E40AF',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  resumeActionText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  fullWidthSpecCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  twoColRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  halfWidthSpecCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 9,
    justifyContent: 'center',
  },
  infoSection: {
    marginBottom: 12,
  },
  infoSectionTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 4,
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
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  skillTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  infoGridTwoCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  gridBox: {
    width: '48.5%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
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
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
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
    borderColor: '#2563EB',
    borderBottomWidth: 3,
    borderBottomColor: '#1D4ED8',
  },
  minimalStatusBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  minimalStatusBtnTextSelected: {
    color: '#2563EB',
    fontWeight: '900',
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
  templatePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  templatePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  modePillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  modePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2,
    borderBottomColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  modePillBtnSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
    borderBottomColor: '#2563EB',
    borderWidth: 1.5,
  },
  modePillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  modePillTextSelected: {
    color: '#2563EB',
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
});
