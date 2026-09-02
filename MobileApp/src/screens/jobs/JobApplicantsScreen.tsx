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
  FlatList,
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Search,
  CheckCircle2,
  ChevronDown,
  X,
} from 'lucide-react-native';
import { applicantsApi } from '../../api/applicantsApi';
import { jobsApi } from '../../api/jobsApi';
import { isValidId } from '../../api/client';
import { ResumePdfViewerModal } from '../../components/common/ResumePdfViewerModal';
import { ClockTimePickerModal } from '../../components/common/ClockTimePickerModal';
import { JobApplication, ApplicationStatus, Job } from '../../types';
import { Header } from '../../components/common/Header';
import { FocusAwareStatusBar } from '../../components/common/FocusAwareStatusBar';
import { extractCandidateResume } from '../../utils/fileUtils';
import { JobCardSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { COLORS, SPACING } from '../../constants/theme';
import { safeValue, APPLICANT_SEARCH_SUGGESTIONS } from './components/JobApplicantsUtils';
import { JobApplicantsCard } from './components/JobApplicantsCard';
import { JobApplicantsDetailModal, ModalTabType } from './components/JobApplicantsDetailModal';

interface Props {
  route: any;
  navigation: any;
}

type TabType = 'ALL' | 'applied' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected';

export const JobApplicantsScreen: React.FC<Props> = ({ route, navigation }) => {
  const jobId = route?.params?.jobId;
  const jobTitle = route?.params?.jobTitle || 'Job Applicants';

  const [applicants, setApplicants] = useState<JobApplication[]>([]);
  const [jobDetails, setJobDetails] = useState<Job | null>(null);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(jobId || 'ALL');
  const [jobDropdownVisible, setJobDropdownVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('#FFFFFF', true);
        StatusBar.setBarStyle('dark-content', true);
        StatusBar.setTranslucent(false);
      }
    }, [])
  );

  useEffect(() => {
    if (jobId) {
      setSelectedJobId(jobId);
    }
  }, [jobId]);

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
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [interviewLocation, setInterviewLocation] = useState('');
  const [interviewMapsLink, setInterviewMapsLink] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');

  // Email Form States
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [selectedTemplateLabel, setSelectedTemplateLabel] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const mapApplicantItem = (item: any, activeJobId?: string, parentJob?: any): JobApplication => {
    const rawResume =
      item.resume ||
      item.resume_url ||
      item.resumeUrl ||
      item.user?.resume_url ||
      item.user?.resumeUrl ||
      item.user?.resume ||
      item.candidate?.resume_url ||
      item.candidate?.resumeUrl ||
      item.candidate?.resume;

    let extractedResumeUrl = '';
    if (typeof rawResume === 'string' && rawResume.trim()) {
      extractedResumeUrl = rawResume.trim();
    } else if (rawResume && typeof rawResume === 'object') {
      extractedResumeUrl = rawResume.url || rawResume.fileUrl || rawResume.uri || rawResume.path || '';
    }

    const finalJobId = item.jobId || item.job_id || activeJobId || parentJob?.id || '';

    return {
      id: item.id || `app-${item.userId || item.user_id}-${finalJobId}`,
      user_id: item.userId || item.user_id,
      job_id: finalJobId,
      status: (item.status || 'applied').toLowerCase() as any,
      applied_at: item.appliedAt || item.applied_at || item.createdAt || new Date().toISOString(),
      job: parentJob || item.job,
      user: {
        id: item.userId || item.user_id,
        name: item.name || item.user?.name || item.candidate?.name || 'Candidate',
        email: item.email || item.user?.email || item.candidate?.email || '',
        phone: item.phone || item.user?.phone || item.candidate?.phone || '',
        role: 'candidate' as const,
        headline: item.headline || item.tradeSpecialization || item.trade_specialization || item.user?.headline || 'Candidate',
        location: item.location || item.user?.location || 'Not Specified',
        experience: item.experience || item.user?.experience || 'Not Specified',
        skills: Array.isArray(item.skills) ? item.skills : (Array.isArray(item.user?.skills) ? item.user.skills : []),
        profilePictureUrl: item.profilePictureUrl || item.profile_picture_url || item.user?.profilePictureUrl || item.user?.profile_picture_url,
        aadhaar_verified: !!item.aadhaarVerified || !!item.aadhaar_verified || !!item.user?.aadhaar_verified,
        education: item.education || item.user?.education || 'Not Specified',
        resume_url: extractedResumeUrl,
        resumeUrl: extractedResumeUrl,
        resume: typeof rawResume === 'object' ? rawResume : (extractedResumeUrl ? { url: extractedResumeUrl, name: 'Candidate_Resume.pdf' } : null),
      },
    };
  };

  const fetchApplicants = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const myJobsRes = await jobsApi.getMyJobs();
      let jobsList: Job[] = [];
      if (myJobsRes.success && Array.isArray(myJobsRes.data)) {
        jobsList = myJobsRes.data;
        setMyJobs(jobsList);
      }

      const activeTargetId = selectedJobId !== 'ALL' ? selectedJobId : (isValidId(jobId) ? jobId : null);

      if (activeTargetId && activeTargetId !== 'ALL') {
        const foundJob = jobsList.find((j) => j.id === activeTargetId);
        if (foundJob) {
          setJobDetails(foundJob);
        } else {
          try {
            const singleJobRes = await jobsApi.getJobById(activeTargetId);
            if (singleJobRes.success && singleJobRes.data) {
              setJobDetails(singleJobRes.data);
            }
          } catch (_) {}
        }

        try {
          const res = await applicantsApi.getApplicantsForJob(activeTargetId);
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            const mapped = res.data.map((item: any) => mapApplicantItem(item, activeTargetId, foundJob));
            setApplicants(mapped);
            return;
          }
        } catch (apiErr) {
          // If direct endpoint is restricted, continue to fallback
        }

        if (foundJob && Array.isArray((foundJob as any).applicants) && (foundJob as any).applicants.length > 0) {
          const mapped = (foundJob as any).applicants.map((item: any) => mapApplicantItem(item, activeTargetId, foundJob));
          setApplicants(mapped);
          return;
        }

        setApplicants([]);
        return;
      }

      // If 'ALL' is selected, fetch all applicants via dedicated endpoint with embedded fallback
      try {
        const allAppsRes = await applicantsApi.getAllApplicants();
        if (allAppsRes.success && Array.isArray(allAppsRes.data) && allAppsRes.data.length > 0) {
          const mapped = allAppsRes.data.map((item: any) => {
            const matchedJob = jobsList.find((j) => j.id === item.jobId || j.id === item.job_id);
            return mapApplicantItem(item, item.jobId || item.job_id, matchedJob);
          });
          setApplicants(mapped);
          return;
        }
      } catch (_) {}

      // Fallback: aggregate all applicants across all employer's jobs
      const allApps: JobApplication[] = [];
      jobsList.forEach((j: any) => {
        const rawApps = Array.isArray((j as any).applicants) ? (j as any).applicants : [];
        rawApps.forEach((item: any) => {
          if (item && typeof item === 'object') {
            allApps.push(mapApplicantItem(item, j.id, j));
          }
        });
      });

      setApplicants(allApps);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applicants');
      setApplicants([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [jobId, selectedJobId]);

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
      Alert.alert('Required Field', 'Please select the interview date.');
      return;
    }
    if (!interviewLocation || !interviewLocation.trim()) {
      Alert.alert('Required Field', 'Please enter the Venue Address for the interview.');
      return;
    }
    if (!interviewMapsLink || !interviewMapsLink.trim()) {
      Alert.alert('Required Field', 'Please enter the Google Maps Location link for the candidate.');
      return;
    }
    const targetJobId = selectedApplicant?.job_id || (selectedApplicant as any)?.jobId || jobId;
    if (!targetJobId) {
      Alert.alert('Error', 'Target job ID is required to schedule interview.');
      return;
    }

    setModalLoading(true);
    try {
      const venue = interviewLocation.trim();
      const targetUserId =
        selectedApplicant.user_id ||
        (selectedApplicant as any).userId ||
        (selectedApplicant.user as any)?.id ||
        (selectedApplicant as any).id;

      const res = await applicantsApi.scheduleInterview(targetJobId, targetUserId, {
        interviewDate,
        interviewTime: interviewTime || '10:00 AM',
        venueAddress: venue,
        interviewLocation: venue,
        mapsLink: interviewMapsLink.trim(),
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
    navigation.navigate('ApplicantDetail', {
      applicant,
      jobId: applicant.job_id || jobId,
      jobTitle: (applicant.job as any)?.title || jobTitle,
    });
  };

  const filteredApplicants = applicants.filter((app) => {
    if (selectedJobId !== 'ALL' && app.job_id && app.job_id !== selectedJobId) {
      return false;
    }

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

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      <Header
        searchPlaceholder={APPLICANT_SEARCH_SUGGESTIONS[suggestionIndex] || 'Search applicants...'}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        showBack={false}
      />

      {/* Filter Tabs Bar */}
      <View style={styles.tabsBarWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setJobDropdownVisible(true)}
            style={[
              styles.jobSelectPill,
              selectedJobId !== 'ALL' && styles.jobSelectPillActive,
            ]}
          >
            <Text
              style={[
                styles.jobSelectPillText,
                selectedJobId !== 'ALL' && styles.jobSelectPillTextActive,
              ]}
              numberOfLines={1}
            >
              {selectedJobId === 'ALL'
                ? 'All Jobs'
                : (myJobs.find((j) => j.id === selectedJobId)?.title?.replace(/^job-[\d]+$/i, 'Selected Job') || 'Selected Job')}
            </Text>
            <ChevronDown size={13} color={selectedJobId !== 'ALL' ? '#1764E8' : '#657796'} />
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
          renderItem={({ item }) => <JobApplicantsCard item={item} onPress={openApplicantModal} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={15}
          removeClippedSubviews={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        />
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  searchBarWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E7EBF2',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#102A5C',
  },
  /* Filter Tabs Bar with Underline Active State */
  tabsBarWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7EBF2',
    paddingTop: 4,
    paddingBottom: 0,
  },
  tabsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 14,
  },
  jobSelectPill: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 9,
    borderRadius: 6,
    marginRight: 2,
  },
  jobSelectPillActive: {
    backgroundColor: '#EEF4FF',
    borderColor: '#DBEAFE',
  },
  jobSelectPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#657796',
    maxWidth: 130,
  },
  jobSelectPillTextActive: {
    color: '#1764E8',
    fontWeight: '700',
  },
  industryTabPill: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    paddingHorizontal: 2,
    marginBottom: -1,
  },
  industryTabPillActive: {
    backgroundColor: 'transparent',
    borderBottomColor: '#1764E8',
  },
  industryTabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#657796',
  },
  industryTabTextActive: {
    color: '#1764E8',
    fontWeight: '700',
  },
  tabCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabCountBadgeActive: {
    backgroundColor: '#EEF4FF',
  },
  tabCountText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#657796',
  },
  tabCountTextActive: {
    color: '#1764E8',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 130,
  },
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
    borderColor: '#E7EBF2',
    padding: 14,
  },
  dropdownHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E7EBF2',
  },
  dropdownTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#657796',
    letterSpacing: 0.5,
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
    backgroundColor: '#EEF4FF',
    borderColor: '#DBEAFE',
  },
  dropdownOptionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#102A5C',
  },
  dropdownOptionSub: {
    fontSize: 11,
    color: '#657796',
    marginTop: 1,
  },
});
