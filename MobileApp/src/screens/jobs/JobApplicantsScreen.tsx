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
} from 'react-native';
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
  const [interviewNotes, setInterviewNotes] = useState('');

  // Email Form States
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [selectedTemplateLabel, setSelectedTemplateLabel] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const fetchApplicants = useCallback(async () => {
    setError(null);
    try {
      if (isValidId(jobId)) {
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

      {/* Filter Tabs Bar */}
      <View style={styles.tabsBarWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
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
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={true}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        />
      )}

      {/* Comprehensive Candidate Full Screen View Modal */}
      <JobApplicantsDetailModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        selectedApplicant={selectedApplicant}
        jobTitle={jobTitle}
        jobId={jobId}
        jobDetails={jobDetails}
        myJobs={myJobs}
        modalTab={modalTab}
        setModalTab={setModalTab}
        onUpdateStatus={handleUpdateStatus}
        interviewDate={interviewDate}
        setInterviewDate={setInterviewDate}
        interviewTime={interviewTime}
        setInterviewTime={setInterviewTime}
        interviewMode={interviewMode}
        setInterviewMode={setInterviewMode}
        interviewLocation={interviewLocation}
        setInterviewLocation={setInterviewLocation}
        interviewNotes={interviewNotes}
        setInterviewNotes={setInterviewNotes}
        onScheduleInterview={handleScheduleInterview}
        setTimePickerVisible={setTimePickerVisible}
        emailSubject={emailSubject}
        setEmailSubject={setEmailSubject}
        emailMessage={emailMessage}
        setEmailMessage={setEmailMessage}
        selectedTemplateLabel={selectedTemplateLabel}
        setSelectedTemplateLabel={setSelectedTemplateLabel}
        onSendCustomEmail={handleSendCustomEmail}
        onOpenPdfModal={() => setPdfModalVisible(true)}
        modalLoading={modalLoading}
      />

      {/* Resume PDF Viewer Modal */}
      {selectedApplicant ? (
        <ResumePdfViewerModal
          visible={pdfModalVisible}
          onClose={() => setPdfModalVisible(false)}
          candidateName={selectedApplicant.user?.name || 'Applicant'}
          candidateRole={jobTitle}
          pdfUrl={selectedApplicant.resume_url || (selectedApplicant as any).resumeUrl || (selectedApplicant.user as any)?.resume_url || (selectedApplicant.user as any)?.resumeUrl}
        />
      ) : null}

      {/* Clock Time Picker Modal */}
      <ClockTimePickerModal
        visible={timePickerVisible}
        onClose={() => setTimePickerVisible(false)}
        initialTime={interviewTime || '10:00 AM'}
        onSelectTime={(formattedTime) => {
          setInterviewTime(formattedTime);
          setTimePickerVisible(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  searchBarWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  tabsBarWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  tabsScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  industryTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  industryTabPillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: COLORS.primary,
  },
  industryTabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  industryTabTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  tabCountBadge: {
    backgroundColor: '#CBD5E1',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabCountBadgeActive: {
    backgroundColor: COLORS.primary,
  },
  tabCountText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabCountTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
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
    borderColor: '#CBD5E1',
    padding: 14,
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
